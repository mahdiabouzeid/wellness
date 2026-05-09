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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "../components/layout/Sidebar";
import StatCard from "../components/layout/StatCard";
import WellnessBarChart from "../components/charts/WellnessBarChart";
import WellnessCircularChart from "../components/charts/WellnessCircularChart";
import RecommendationCard from "../components/ui/RecommendationCard";
import Notification from "../components/ui/notifications";
import { API_BASE_URL, authFetch } from "../auth/authService";

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
  const [selectedSchool, setSelectedSchool] = useState("");
  const [draftSchool, setDraftSchool] = useState("");
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
  const seenNotificationIds = useRef(new Set());
  const recommendationRequestId = useRef(0);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);
  const recommendationKey = (schoolId, selectedMonth) => `${schoolId || ""}-${selectedMonth || ""}`;
  const activeRecommendationKey = recommendationKey(selectedSchool, month);
  const recommendation = recommendationsByKey[activeRecommendationKey] || "";
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
        setSchools(data);
        if (data.length > 0) {
          setDraftSchool(data[0].id);
        }
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

  const loadRecommendation = async (schoolId, selectedMonth) => {
    const requestId = recommendationRequestId.current + 1;
    recommendationRequestId.current = requestId;

    setRecommendationContext({ schoolId, month: selectedMonth });
    const key = recommendationKey(schoolId, selectedMonth);

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
        (String(data.school_id) !== String(schoolId) || String(data.month) !== String(selectedMonth))
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
    if (!selectedSchool || !month) return;

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
      alert("Recommendation saved successfully");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const selectedSchoolName =
    schools.find((school) => String(school.id) === String(selectedSchool))?.name || "Selected school";

  const handleApplyFilters = () => {
    if (!draftSchool || !draftMonth) return;
    setSelectedSchool(draftSchool);
    setMonth(draftMonth);
    loadRecommendation(draftSchool, draftMonth);
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
        <Notification
          message={`🏫 ${activeNotification.school_name}: ${activeNotification.message}`}
        />
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
              label="Administration workspace"
              sx={{
                mb: 2,
                color: "#0F3D39",
                backgroundColor: "rgba(244,255,253,0.9)",
              }}
            />
            <Typography variant="h3" sx={{ mb: 1.25 }}>
              Monitor school wellness with a cleaner, full-width command center.
            </Typography>
            <Typography sx={{ maxWidth: 620, color: "rgba(245,255,253,0.82)" }}>
              Track performance, review dimension balance, and issue monthly recommendations
              without the layout gaps and cramped cards from the previous screen.
            </Typography>
            <Box
              sx={{
                mt: 3,
                display: "flex",
                flexWrap: "wrap",
                gap: 1.25,
              }}
            >
              <Chip
                label={selectedSchool && month ? selectedSchoolName : "Choose a school"}
                sx={{ backgroundColor: "rgba(255,255,255,0.14)", color: "#fff" }}
              />
              <Chip
                label={month || "Choose a month"}
                sx={{ backgroundColor: "rgba(255,255,255,0.14)", color: "#fff" }}
              />
            </Box>
          </Box>
        </Box>

        <Paper className="surface-card" sx={{ p: { xs: 2, md: 3 } }}>
          <Grid container spacing={2.5} alignItems="center">
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ mb: 0.75 }}>
                Analytics Filters
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Narrow the dashboard to a school and month before reviewing the charts.
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Select School</InputLabel>
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
                    value={draftSchool}
                    label="Select School"
                    onChange={(e) => setDraftSchool(e.target.value)}
                  >
                    {schools.map((school) => (
                      <MenuItem key={school.id} value={school.id}>
                        {school.name}
                      </MenuItem>
                    ))}
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
                disabled={!draftSchool || !draftMonth}
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
                onClick={() => {
                  recommendationRequestId.current += 1;
                  setDraftMonth("");
                  setMonth("");
                  setSelectedSchool("");
                  setRecommendationContext({ schoolId: "", month: "" });
                  setLoadingRecommendation(false);
                }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {statsError && (
            <Grid item xs={12}>
              <Alert severity="error">{statsError}</Alert>
            </Grid>
          )}
          <Grid item xs={12} sm={6} xl={3}>
            <StatCard
              title="Schools Registered"
              value={loadingStats ? "..." : stats.totalSchools}
              color="#0F766E"
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <StatCard
              title="Activities Uploaded"
              value={loadingStats ? "..." : stats.totalActivities}
              color="#EA580C"
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <StatCard
              title="Avg Completion"
              value={loadingStats ? "..." : `${stats.avgCompletion}%`}
              color="#0284C7"
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <StatCard
              title="Pending Reports"
              value={loadingStats ? "..." : stats.pendingReports}
              color="#B45309"
            />
          </Grid>
        </Grid>

        {selectedSchool && month ? (
          <Grid container spacing={3} className="admin-dashboard__charts">
            <Grid item xs={12} xl={7}>
              <Paper className="admin-dashboard__panel" sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>
                  Performance Overview
                </Typography>
                <Typography variant="h5" sx={{ mb: 3 }}>
                  Wellness completion by dimension
                </Typography>
                <WellnessBarChart schoolId={selectedSchool} month={month} />
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
                  <WellnessCircularChart schoolId={selectedSchool} month={month} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Paper
            className="surface-card"
            sx={{
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              Select a school and month to unlock analytics
            </Typography>
            <Typography color="text.secondary">
              The charts will expand here once a school and reporting period are selected.
            </Typography>
          </Paper>
        )}

        <RecommendationCard
          key={`${selectedSchool || "none"}-${month || "none"}`}
          selectedSchool={selectedSchool}
          selectedSchoolName={selectedSchoolName}
          month={month}
          recommendation={recommendation}
          recommendationContext={recommendationContext}
          setRecommendation={setActiveRecommendation}
          handleSaveRecommendation={handleSaveRecommendation}
          saving={saving || loadingRecommendation}
          loading={loadingRecommendation}
        />
      </Box>
    </Box>
  );
};

export default AdminDashboard;
