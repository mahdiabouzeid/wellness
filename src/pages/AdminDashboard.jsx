import React, { useEffect, useRef, useState } from "react";
import {
  Grid,
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Drawer,
  AppBar,
  Toolbar,
  TextField,
  CircularProgress,
  Chip,
  Button,
  Alert,
  Checkbox,
  ListItemText,
  Snackbar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import Sidebar from "../components/layout/Sidebar";
import StatCard from "../components/layout/StatCard";
import WellnessBarChart from "../components/charts/WellnessBarChart";
import WellnessCircularChart from "../components/charts/WellnessCircularChart";
import RecommendationCard from "../components/ui/RecommendationCard";
import Notification from "../components/ui/notifications";
import { API_BASE_URL, authFetch } from "../auth/authService";
import { METRIC_CARD_CONFIG, RECOMMENDATION_SAVE_BUTTON_COLOR } from "../constants/adminDashboard";
import {
  getWellnessDimensionColor,
  normalizeWellnessDimension,
  sortByWellnessDimensionOrder,
} from "../constants/wellnessDimensions";

const SELECT_ALL_SCHOOLS = "__all_schools__";

const buildRecommendationKey = (schoolId, selectedMonth) =>
  `${schoolId || ""}-${selectedMonth || ""}`;

const toSchoolId = (school) => String(school.id);

const aggregateAnalyticsRows = (responses) => {
  const totalsByDimension = new Map();

  responses.forEach((rows) => {
    rows.forEach((item) => {
      const name = item.dimension_name || item.dimension || "";
      const key = normalizeWellnessDimension(name);
      if (!key) return;

      const current = totalsByDimension.get(key) || {
        name,
        total: 0,
        count: 0,
        fallbackColor: item.color,
      };

      current.total += parseFloat(item.wellness_percentage) || 0;
      current.count += 1;
      totalsByDimension.set(key, current);
    });
  });

  return sortByWellnessDimensionOrder(
    Array.from(totalsByDimension.values()).map((item) => ({
      dimension: item.name,
      completion: Math.round(item.total / item.count),
      color: getWellnessDimensionColor(item.name, item.fallbackColor || "#0F766E"),
    })),
    (item) => item.dimension
  );
};

const AnalyticsState = ({ type }) => {
  const stateCopy = {
    initial: {
      title: "Select a school and month to unlock analytics.",
      body: "The charts will display here once a school and month are selected.",
    },
    partial: {
      title: "Select a school and month to unlock analytics.",
      body: "The charts will display here once a school and month are selected.",
    },
    empty: {
      title: "No data available for this month.",
      body: "Please ensure activities are being tracked and uploaded for this period.",
    },
  }[type];

  return (
    <Paper
      className="surface-card"
      sx={{
        p: { xs: 3, md: 5 },
        minHeight: 240,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <Box sx={{ maxWidth: 620 }}>
        <QueryStatsOutlinedIcon
          sx={{
            fontSize: 46,
            color: type === "empty" ? "rgba(15, 118, 110, 0.48)" : "rgba(85, 112, 108, 0.56)",
            mb: 1.5,
          }}
        />
        <Typography variant="h6" sx={{ mb: 0.75, whiteSpace: { sm: "nowrap" } }}>
          {stateCopy.title}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ fontSize: type === "empty" ? "0.95rem" : "1rem" }}
        >
          {stateCopy.body}
        </Typography>
      </Box>
    </Paper>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalActivities: 0,
    avgCompletion: 0,
    pendingReports: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [schools, setSchools] = useState([]);
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [draftSchools, setDraftSchools] = useState([]);
  const [month, setMonth] = useState("");
  const [draftMonth, setDraftMonth] = useState("");
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState(null);
  const [recommendationsByKey, setRecommendationsByKey] = useState({});
  const [recommendationContext, setRecommendationContext] = useState({
    schoolId: "",
    month: "",
  });
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [analyticsData, setAnalyticsData] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  const seenNotificationIds = useRef(new Set());
  const recommendationRequestId = useRef(0);

  const selectedSchool = selectedSchools.length === 1 ? selectedSchools[0] : "";
  const activeRecommendationKey = buildRecommendationKey(selectedSchool, month);
  const recommendation = recommendationsByKey[activeRecommendationKey] || "";
  const selectedSchoolName =
    schools.find((school) => toSchoolId(school) === selectedSchool)?.name || "Selected school";
  const selectedSchoolNames = selectedSchools
    .map((schoolId) => schools.find((school) => toSchoolId(school) === schoolId)?.name)
    .filter(Boolean);
  const allSchoolIds = schools.map(toSchoolId);
  const allSchoolsSelected = allSchoolIds.length > 0 && draftSchools.length === allSchoolIds.length;
  const filtersReady = selectedSchools.length > 0 && Boolean(month);
  const draftHasPartialSelection =
    (draftSchools.length > 0 && !draftMonth) || (!draftSchools.length && Boolean(draftMonth));
  const canSaveRecommendation =
    Boolean(selectedSchool && month && recommendation.trim()) && !saving && !loadingRecommendation;

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  const setActiveRecommendation = (value) => {
    setRecommendationsByKey((prev) => ({
      ...prev,
      [activeRecommendationKey]: value,
    }));
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await authFetch(`${API_BASE_URL}/get_admin_dashboard_stats.php`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load dashboard stats.");
        }

        setStats(data.data);
        setStatsError("");
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setStatsError("Dashboard stats could not be loaded.");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await authFetch(`${API_BASE_URL}/get_schools.php`);
        const data = await res.json();
        setSchools(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching schools:", err);
      } finally {
        setLoadingSchools(false);
      }
    };

    fetchSchools();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await authFetch(`${API_BASE_URL}/get_notifications.php`);
        const data = await res.json();

        const fresh = data.filter(
          (item) => !seenNotificationIds.current.has(item.id) && !item.isread
        );

        if (fresh.length > 0) {
          const newest = fresh[0];
          setActiveNotification(newest);
          fresh.forEach((item) => seenNotificationIds.current.add(item.id));

          authFetch(`${API_BASE_URL}/mark_notification_read.php`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id=${newest.id}`,
          }).catch((error) => console.error("Error marking notification:", error));
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!filtersReady) {
      setAnalyticsData([]);
      setAnalyticsError("");
      setAnalyticsLoading(false);
      return;
    }

    let isCurrent = true;

    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError("");

      try {
        const formattedMonth = month.slice(0, 7);
        const responses = await Promise.all(
          selectedSchools.map(async (schoolId) => {
            const params = new URLSearchParams({ school_id: schoolId, month: formattedMonth });
            const response = await authFetch(
              `${API_BASE_URL}/get_wellness_percentage.php?${params.toString()}`
            );

            if (!response.ok) {
              throw new Error(`Analytics request failed with status ${response.status}.`);
            }

            const result = await response.json();
            return Array.isArray(result) ? result : result?.data || [];
          })
        );

        if (isCurrent) {
          setAnalyticsData(aggregateAnalyticsRows(responses));
        }
      } catch (error) {
        if (isCurrent) {
          console.error("Error fetching analytics:", error);
          setAnalyticsData([]);
          setAnalyticsError("Analytics data could not be loaded. Please try again.");
        }
      } finally {
        if (isCurrent) {
          setAnalyticsLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      isCurrent = false;
    };
  }, [filtersReady, month, selectedSchools]);

  const loadRecommendation = async (schoolId, selectedMonth) => {
    const requestId = recommendationRequestId.current + 1;
    recommendationRequestId.current = requestId;

    setRecommendationContext({ schoolId, month: selectedMonth });
    const key = buildRecommendationKey(schoolId, selectedMonth);

    if (!schoolId || !selectedMonth) {
      setLoadingRecommendation(false);
      return;
    }

    setLoadingRecommendation(true);
    try {
      const params = new URLSearchParams({
        school_id: schoolId,
        month: selectedMonth,
      });
      const res = await authFetch(`${API_BASE_URL}/get_recommendation.php?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to load recommendation.");
      }

      if (
        data.school_id &&
        (String(data.school_id) !== String(schoolId) ||
          String(data.month) !== String(selectedMonth))
      ) {
        throw new Error("Recommendation response did not match the selected school and month.");
      }

      if (recommendationRequestId.current === requestId) {
        setRecommendationsByKey((prev) => ({
          ...prev,
          [key]: data.recommendation_text || "",
        }));
      }
    } catch (err) {
      if (recommendationRequestId.current === requestId) {
        console.error("Error fetching recommendation:", err);
        setRecommendationsByKey((prev) => ({
          ...prev,
          [key]: "",
        }));
      }
    } finally {
      if (recommendationRequestId.current === requestId) {
        setLoadingRecommendation(false);
      }
    }
  };

  const handleSaveRecommendation = async () => {
    if (!canSaveRecommendation) return;

    setSaving(true);

    try {
      const body = new URLSearchParams({
        school_id: selectedSchool,
        month,
        recommendation_text: recommendation,
      });

      const res = await authFetch(`${API_BASE_URL}/save_recommendation.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save recommendation.");
      }

      setRecommendationsByKey((prev) => ({
        ...prev,
        [activeRecommendationKey]: recommendation,
      }));
      setToast({
        open: true,
        message: "Recommendation saved successfully",
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      setToast({
        open: true,
        message: err.message || "Failed to save recommendation.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDraftSchoolsChange = (event) => {
    const value = typeof event.target.value === "string" ? event.target.value.split(",") : event.target.value;

    if (value.includes(SELECT_ALL_SCHOOLS)) {
      setDraftSchools(allSchoolsSelected ? [] : allSchoolIds);
      return;
    }

    setDraftSchools(value.map(String));
  };

  const handleRemoveDraftSchool = (schoolId) => {
    setDraftSchools((prev) => prev.filter((id) => id !== schoolId));
  };

  const handleApplyFilters = () => {
    if (!draftSchools.length || !draftMonth) return;

    recommendationRequestId.current += 1;
    setSelectedSchools(draftSchools);
    setMonth(draftMonth);

    if (draftSchools.length === 1) {
      loadRecommendation(draftSchools[0], draftMonth);
    } else {
      setRecommendationContext({ schoolId: "", month: "" });
      setLoadingRecommendation(false);
    }
  };

  const handleReset = () => {
    recommendationRequestId.current += 1;
    setDraftSchools([]);
    setDraftMonth("");
    setSelectedSchools([]);
    setMonth("");
    setAnalyticsData([]);
    setAnalyticsError("");
    setAnalyticsLoading(false);
    setRecommendationContext({ schoolId: "", month: "" });
    setLoadingRecommendation(false);
  };

  const renderAnalyticsContent = () => {
    if (analyticsLoading) {
      return (
        <Paper className="surface-card" sx={{ p: 5, textAlign: "center" }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }} color="text.secondary">
            Loading analytics data...
          </Typography>
        </Paper>
      );
    }

    if (analyticsError) {
      return <Alert severity="error">{analyticsError}</Alert>;
    }

    if (filtersReady && !analyticsData.length) {
      return <AnalyticsState type="empty" />;
    }

    if (filtersReady && analyticsData.length) {
      const circularData = analyticsData.map((item) => ({
        name: item.dimension,
        value: item.completion,
        color: item.color,
      }));

      return (
        <Grid container spacing={3} className="admin-dashboard__charts">
          <Grid item xs={12} xl={7}>
            <Paper className="admin-dashboard__panel" sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>
                Performance Overview
              </Typography>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Wellness completion by dimension
              </Typography>
              <WellnessBarChart data={analyticsData} />
            </Paper>
          </Grid>

          <Grid item xs={12} xl={5}>
            <Paper
              className="admin-dashboard__panel"
              sx={{
                p: { xs: 2, md: 3 },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>
                Balance Snapshot
              </Typography>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Dimension balance
              </Typography>
              <Box
                className="admin-dashboard__chart admin-dashboard__chart--circular"
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <WellnessCircularChart data={circularData} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      );
    }

    return <AnalyticsState type={draftHasPartialSelection ? "partial" : "initial"} />;
  };

  return (
    <Box
      className="admin-dashboard"
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {activeNotification && (
        <Notification message={`${activeNotification.school_name}: ${activeNotification.message}`} />
      )}

      <Box
        component="nav"
        sx={{
          width: { md: 280 },
          flexBasis: { md: 280 },
          flexShrink: { md: 0 },
          display: { xs: "none", md: "block" },
        }}
      >
        <Sidebar />
      </Box>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            border: 0,
            background: "transparent",
            boxShadow: "none",
          },
        }}
      >
        <Sidebar />
      </Drawer>

      <AppBar
        position="fixed"
        sx={{
          display: { xs: "flex", md: "none" },
          bgcolor: "rgba(15,61,57,0.92)",
          boxShadow: "0 10px 30px rgba(16, 42, 39, 0.12)",
          backdropFilter: "blur(14px)",
        }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        className="admin-dashboard__main page-shell"
        sx={{
          flex: 1,
          minWidth: 0,
          mt: { xs: 7, md: 0 },
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Box className="page-shell__hero">
          <Box className="page-shell__hero-copy">
            <Chip
              label="Admin Workspace"
              sx={{
                mb: 2,
                color: "#0F3D39",
                backgroundColor: "rgba(244,255,253,0.9)",
              }}
            />
            <Typography
              variant="h3"
              sx={{
                mb: 1.25,
                color: "#fff",
                fontSize: { xs: "2rem", sm: "2.45rem", lg: "2.7rem", xl: "3rem" },
                lineHeight: 1.12,
                maxWidth: { lg: "none" },
              }}
            >
              Create Healthier, Happier Students: Wellness Tracking for Schools.
            </Typography>
            <Typography sx={{ maxWidth: 740, color: "rgba(245,255,253,0.82)" }}>
              Upload wellness activities, track progress, and provide recommendations for happier
              students and healthier schools.
            </Typography>
          </Box>
        </Box>

        <Paper className="surface-card" sx={{ p: { xs: 2, md: 3 } }}>
          <Grid container spacing={2.5} alignItems="center">
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ mb: 0.75 }}>
                Analytics Filters
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Narrow the dashboard by selecting a school and month before reviewing the charts.
              </Typography>
            </Grid>

            <Grid item xs={12} md={5}>
              <FormControl fullWidth>
                <InputLabel>Select Schools</InputLabel>
                {loadingSchools ? (
                  <Box
                    sx={{
                      minHeight: 56,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <Select
                    multiple
                    value={draftSchools}
                    label="Select Schools"
                    onChange={handleDraftSchoolsChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                        {selected.map((schoolId) => {
                          const school = schools.find((item) => toSchoolId(item) === schoolId);
                          return (
                            <Chip
                              key={schoolId}
                              label={school?.name || schoolId}
                              onMouseDown={(event) => event.stopPropagation()}
                              onDelete={() => handleRemoveDraftSchool(schoolId)}
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    <MenuItem value={SELECT_ALL_SCHOOLS}>
                      <Checkbox checked={allSchoolsSelected} indeterminate={draftSchools.length > 0 && !allSchoolsSelected} />
                      <ListItemText primary="Select All" />
                    </MenuItem>
                    {schools.map((school) => {
                      const schoolId = toSchoolId(school);
                      return (
                        <MenuItem key={schoolId} value={schoolId}>
                          <Checkbox checked={draftSchools.includes(schoolId)} />
                          <ListItemText primary={school.name} />
                        </MenuItem>
                      );
                    })}
                  </Select>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Select Month"
                type="month"
                value={draftMonth}
                onChange={(e) => setDraftMonth(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={1}>
              <Button
                variant="contained"
                fullWidth
                sx={{ minHeight: 56 }}
                onClick={handleApplyFilters}
                disabled={!draftSchools.length || !draftMonth}
              >
                View
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={1}>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                sx={{ minHeight: 56 }}
                onClick={handleReset}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
          {selectedSchoolNames.length > 1 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
              Analytics are combined from supported per-school API requests for:{" "}
              {selectedSchoolNames.join(", ")}.
            </Typography>
          )}
        </Paper>

        <Grid container spacing={3}>
          {statsError && (
            <Grid item xs={12}>
              <Alert severity="error">{statsError}</Alert>
            </Grid>
          )}
          <Grid item xs={12} sm={6} xl={3}>
            <StatCard
              title="Schools registered"
              value={loadingStats ? "..." : stats.totalSchools}
              color={METRIC_CARD_CONFIG.schoolsRegistered.color}
              tooltip={METRIC_CARD_CONFIG.schoolsRegistered.tooltip}
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <StatCard
              title="Activities uploaded"
              value={loadingStats ? "..." : stats.totalActivities}
              color={METRIC_CARD_CONFIG.activitiesUploaded.color}
              tooltip={METRIC_CARD_CONFIG.activitiesUploaded.tooltip}
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <StatCard
              title="Average completion"
              value={loadingStats ? "..." : `${stats.avgCompletion}%`}
              color={METRIC_CARD_CONFIG.averageCompletion.color}
              tooltip={METRIC_CARD_CONFIG.averageCompletion.tooltip}
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <StatCard
              title="Pending reports"
              value={loadingStats ? "..." : stats.pendingReports}
              color={METRIC_CARD_CONFIG.pendingReports.color}
              tooltip={METRIC_CARD_CONFIG.pendingReports.tooltip}
            />
          </Grid>
        </Grid>

        {renderAnalyticsContent()}

        <RecommendationCard
          key={`${selectedSchool || "none"}-${month || "none"}`}
          selectedSchool={selectedSchool}
          selectedSchoolName={selectedSchoolName}
          month={month}
          recommendation={recommendation}
          recommendationContext={recommendationContext}
          setRecommendation={setActiveRecommendation}
          handleSaveRecommendation={handleSaveRecommendation}
          saving={saving}
          loading={loadingRecommendation}
          saveDisabled={!canSaveRecommendation}
          saveButtonColor={RECOMMENDATION_SAVE_BUTTON_COLOR}
        />

        <Snackbar
          open={toast.open}
          autoHideDuration={5000}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            severity={toast.severity}
            variant="filled"
            onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
