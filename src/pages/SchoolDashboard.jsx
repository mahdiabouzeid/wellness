import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Chip,
  Divider,
  Tooltip,
  CircularProgress,
  TextField,
  LinearProgress,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PieChartIcon from "@mui/icons-material/PieChart";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, authFetch } from "../auth/authService";

const DIMENSIONS = [
  { key: "emotional", label: "Emotional", color: "#F97316" },
  { key: "physical", label: "Physical", color: "#FB7185" },
  { key: "social", label: "Social", color: "#EAB308" },
  { key: "intellectual", label: "Intellectual", color: "#38BDF8" },
  { key: "spiritual", label: "Spiritual", color: "#8B5CF6" },
  { key: "financial", label: "Financial", color: "#22C55E" },
  { key: "environmental", label: "Environmental", color: "#14B8A6" },
  { key: "vocational", label: "Vocational", color: "#0F766E" },
];

function getCurrentMonthValue() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthValue) {
  if (!monthValue) return "No month selected";

  const [year, month] = monthValue.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString("default", {
    month: "short",
    year: "numeric",
  });
}

function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(",")]
    .concat(rows.map((row) => keys.map((key) => `"${String(row[key] ?? "")}"`).join(",")))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function StatCard({ title, value, subtitle, icon }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: "rgba(15,118,110,0.12)",
              color: "#0F766E",
              width: 52,
              height: 52,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function SchoolDashboard() {
  const navigate = useNavigate();
  const hasLoadedRef = useRef(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthStats, setMonthStats] = useState([]);
  const [topActivities, setTopActivities] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue);

  const schoolId = localStorage.getItem("school_id");

  useEffect(() => {
    if (!schoolId) {
      console.error("No school_id found");
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      if (hasLoadedRef.current) {
        setRefreshing(true);
      } else {
        setInitialLoading(true);
      }

      try {
        const months = [];
        const [selectedYear, selectedMonthNumber] = selectedMonth.split("-").map(Number);
        const selectedDate = new Date(selectedYear, selectedMonthNumber - 1, 1);

        for (let i = 4; i >= 0; i -= 1) {
          const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - i, 1);
          const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          months.push({
            monthStr,
            label: date.toLocaleString("default", { month: "short" }),
          });
        }

        const wellnessPromises = months.map(({ monthStr }) =>
          authFetch(
            `${API_BASE_URL}/get_wellness_percentage.php?school_id=${schoolId}&month=${monthStr}`
          ).then((res) => res.json())
        );

        const results = await Promise.all(wellnessPromises);

        const transformedData = results.map((data, index) => {
          const monthData = { month: months[index].label };

          DIMENSIONS.forEach((dimension) => {
            monthData[dimension.key] = 0;
          });

          const dimensions = Array.isArray(data) ? data : [];

          dimensions.forEach((dimension) => {
            const match = DIMENSIONS.find((item) => item.label === dimension.dimension_name);
            if (match) {
              monthData[match.key] = Math.round(dimension.wellness_percentage || 0);
            }
          });

          return monthData;
        });

        setMonthStats(transformedData);

        const activitiesRes = await authFetch(
          `${API_BASE_URL}/get_school_activities.php?school_id=${schoolId}&month=${selectedMonth}`
        );
        const activitiesData = await activitiesRes.json();

        const pending = (Array.isArray(activitiesData) ? activitiesData : [])
          .filter((activity) => !activity.completed)
          .slice(-3)
          .reverse();
        setTopActivities(pending);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        hasLoadedRef.current = true;
        setInitialLoading(false);
        setRefreshing(false);
      }
    };

    fetchData();
  }, [schoolId, navigate, selectedMonth]);

  const latestMonth = monthStats[monthStats.length - 1];
  const selectedMonthLabel = formatMonthLabel(selectedMonth);

  const pieData = useMemo(
    () =>
      monthStats.length > 0
        ? DIMENSIONS.map((dimension) => ({
            name: dimension.label,
            value: latestMonth?.[dimension.key] || 0,
            color: dimension.color,
          }))
        : [],
    [monthStats, latestMonth]
  );

  const overallCompletion = useMemo(() => {
    if (pieData.length === 0) return 0;
    const values = pieData.map((item) => item.value);
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  }, [pieData]);

  const weakest = useMemo(() => {
    if (pieData.length === 0) return { name: "N/A", value: 0 };
    return pieData.reduce((a, b) => (a.value < b.value ? a : b));
  }, [pieData]);

  const csvRows = monthStats.map((month) => ({
    month: month.month,
    ...DIMENSIONS.reduce((acc, dimension) => ({ ...acc, [dimension.label]: month[dimension.key] }), {}),
  }));

  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="school-dashboard page-shell">
      <Box className="page-shell__hero">
        <Box className="page-shell__hero-copy">
          <Chip
            label="School dashboard"
            sx={{ mb: 2, color: "#0F3D39", backgroundColor: "rgba(244,255,253,0.9)" }}
          />
          <Typography variant="h3" sx={{ mb: 1 }}>
            School wellness snapshot
          </Typography>
          <Typography sx={{ color: "rgba(245,255,253,0.82)", maxWidth: 640 }}>
            Review the latest monthly results, compare recent movement across all eight
            wellness dimensions, and prioritize the next activities from one clean view.
          </Typography>
        </Box>
      </Box>

      <Box
        className="school-dashboard__header"
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          mt: 3,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            School Wellness Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Showing results for {selectedMonthLabel}
          </Typography>
        </Box>

        <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
          <TextField
            label="Reporting Month"
            type="month"
            size="small"
            value={selectedMonth}
            onChange={(event) => {
              if (event.target.value) {
                setSelectedMonth(event.target.value);
              }
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 190, backgroundColor: "#fff" }}
          />
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => exportToCSV("wellness-monthly.csv", csvRows)}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {refreshing && (
        <LinearProgress
          sx={{
            mt: -2,
            mb: 3,
            borderRadius: 999,
            backgroundColor: "rgba(15, 118, 110, 0.1)",
          }}
        />
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <StatCard
                title="Overall Wellness"
                value={refreshing ? "..." : `${overallCompletion}%`}
                subtitle={`For ${selectedMonthLabel}`}
                icon={<PieChartIcon />}
              />
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Weakest Dimension
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 1 }}>
                        {refreshing ? "Loading..." : weakest.name}
                      </Typography>
                    </Box>
                    <Tooltip title={`Current: ${weakest.value}%`}>
                      <Chip label={`${weakest.value}%`} variant="outlined" />
                    </Tooltip>
                  </Box>

                  <Box height={260}>
                    {refreshing ? (
                      <Box height="100%" display="flex" alignItems="center" justifyContent="center">
                        <CircularProgress size={28} />
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <ReTooltip />
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={58}
                            outerRadius={92}
                            paddingAngle={2}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {pieData.map((item) => (
                      <Box
                        key={item.name}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        sx={{ minWidth: 130 }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            bgcolor: item.color,
                            borderRadius: 1,
                          }}
                        />
                        <Typography variant="body2" noWrap>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.value}%
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle2" color="text.secondary">
                      Recommendation
                    </Typography>
                    <InfoOutlinedIcon fontSize="small" color="disabled" />
                  </Box>

                  <Typography variant="body1" sx={{ mt: 1.5 }}>
                    {`${weakest.name} is currently at ${weakest.value}%. Plan three targeted activities next month to strengthen that dimension.`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Five-month trend
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 1 }}>
                        Progress by wellness dimension
                      </Typography>
                    </Box>
                    <Chip label="Read-only trend" size="small" variant="outlined" />
                  </Box>

                  <Box height={320} mt={2}>
                    {refreshing ? (
                      <Box height="100%" display="flex" alignItems="center" justifyContent="center">
                        <CircularProgress size={28} />
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthStats} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                          <CartesianGrid stroke="rgba(16,42,39,0.08)" strokeDasharray="4 4" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                          <ReTooltip />
                          {DIMENSIONS.map((dimension) => (
                            <Line
                              key={dimension.key}
                              type="monotone"
                              dataKey={dimension.key}
                              stroke={dimension.color}
                              strokeWidth={2.4}
                              dot={false}
                              name={dimension.label}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      height: "100%",
                      cursor: "pointer",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 24px 50px rgba(16, 42, 39, 0.12)",
                      },
                    }}
                    onClick={() => navigate("/school-activity", { state: { month: selectedMonth } })}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        display="flex"
                        alignItems="flex-start"
                        justifyContent="space-between"
                        gap={2}
                        mb={2}
                      >
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Activities
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, mt: 1 }}>
                            Pending for {selectedMonthLabel}
                          </Typography>
                        </Box>
                        <Chip
                          icon={<ArrowForwardIcon />}
                          label="Open"
                          color="primary"
                          variant="outlined"
                          sx={{ cursor: "pointer" }}
                        />
                      </Box>

                      <Box display="flex" flexDirection="column" gap={1.25}>
                        {refreshing ? (
                          <Box py={2}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : topActivities.length > 0 ? (
                          topActivities.map((activity) => (
                            <Box
                              key={activity.school_activity_id}
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                              gap={1}
                            >
                              <Typography noWrap sx={{ maxWidth: "70%" }}>
                                {activity.title}
                              </Typography>
                              <Chip label="Pending" size="small" color="warning" />
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No pending activities for this month
                          </Typography>
                        )}
                      </Box>
                      <Button
                        endIcon={<ArrowForwardIcon />}
                        sx={{ mt: 2, px: 0 }}
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate("/school-activity", { state: { month: selectedMonth } });
                        }}
                      >
                        View all school activities
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Activity Completion
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, mt: 1 }}>
                            By dimension
                          </Typography>
                        </Box>
                      </Box>

                      <Box mt={2}>
                        {pieData.map((item) => (
                          <Box
                            key={item.name}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            mb={1}
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: 1,
                                  bgcolor: item.color,
                                }}
                              />
                              <Typography variant="body2">{item.name}</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {item.value}%
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
