import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Button,
  Chip,
  Divider,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PieChartIcon from "@mui/icons-material/PieChart";
import AssessmentIcon from "@mui/icons-material/Assessment";
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
  const [loading, setLoading] = useState(true);
  const [monthStats, setMonthStats] = useState([]);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const [topActivities, setTopActivities] = useState([]);

  const schoolId = localStorage.getItem("school_id");

  useEffect(() => {
    if (!schoolId) {
      console.error("No school_id found");
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      try {
        const months = [];
        const today = new Date();

        for (let i = 4; i >= 0; i -= 1) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          months.push({
            monthStr,
            label: date.toLocaleString("default", { month: "short" }),
          });
        }

        const wellnessPromises = months.map(({ monthStr }) =>
          fetch(`/get_wellness_percentage.php?school_id=${schoolId}&month=${monthStr}`).then((res) =>
            res.json()
          )
        );

        const results = await Promise.all(wellnessPromises);

        const transformedData = results.map((data, index) => {
          const monthData = { month: months[index].label };

          DIMENSIONS.forEach((dimension) => {
            monthData[dimension.key] = 0;
          });

          data.forEach((dimension) => {
            const match = DIMENSIONS.find((item) => item.label === dimension.dimension_name);
            if (match) {
              monthData[match.key] = Math.round(dimension.wellness_percentage || 0);
            }
          });

          return monthData;
        });

        setMonthStats(transformedData);
        setSelectedMonthIndex(transformedData.length - 1);

        const activitiesRes = await fetch(`/get_school_activities.php?school_id=${schoolId}`);
        const activitiesData = await activitiesRes.json();

        const pending = activitiesData.filter((activity) => !activity.completed).slice(-3).reverse();
        setTopActivities(pending);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId, navigate]);

  const pieData = useMemo(
    () =>
      monthStats.length > 0
        ? DIMENSIONS.map((dimension) => ({
            name: dimension.label,
            value: monthStats[selectedMonthIndex]?.[dimension.key] || 0,
            color: dimension.color,
          }))
        : [],
    [monthStats, selectedMonthIndex]
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="page-shell">
      <Box className="page-shell__hero">
        <Box className="page-shell__hero-copy">
          <Chip
            label="School dashboard"
            sx={{ mb: 2, color: "#0F3D39", backgroundColor: "rgba(244,255,253,0.9)" }}
          />
          <Typography variant="h3" sx={{ mb: 1 }}>
            Your wellness snapshot, refined into a cleaner dashboard.
          </Typography>
          <Typography sx={{ color: "rgba(245,255,253,0.82)", maxWidth: 640 }}>
            Review monthly movement across eight dimensions, export what you need, and focus
            next actions on your weakest area.
          </Typography>
        </Box>
      </Box>

      <Box
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
            Overview of monthly wellness across all eight tracked dimensions.
          </Typography>
        </Box>

        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => exportToCSV("wellness-monthly.csv", csvRows)}
          >
            Export CSV
          </Button>
          <Button variant="contained" color="secondary" startIcon={<AssessmentIcon />}>
            Generate PDF
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <StatCard
                title="Overall Wellness"
                value={`${overallCompletion}%`}
                subtitle={monthStats.length > 0 ? `As of ${monthStats[selectedMonthIndex]?.month}` : ""}
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
                        {weakest.name}
                      </Typography>
                    </Box>
                    <Tooltip title={`Current: ${weakest.value}%`}>
                      <Chip label={`${weakest.value}%`} variant="outlined" />
                    </Tooltip>
                  </Box>

                  <Box height={260}>
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
                        Monthly Trend
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 1 }}>
                        Progress by dimension
                      </Typography>
                    </Box>
                    <Box>
                      <Button
                        size="small"
                        onClick={() => setSelectedMonthIndex((index) => Math.max(0, index - 1))}
                        sx={{ mr: 1 }}
                        disabled={selectedMonthIndex === 0}
                      >
                        Prev
                      </Button>
                      <Button
                        size="small"
                        onClick={() =>
                          setSelectedMonthIndex((index) =>
                            Math.min(monthStats.length - 1, index + 1)
                          )
                        }
                        disabled={selectedMonthIndex === monthStats.length - 1}
                      >
                        Next
                      </Button>
                    </Box>
                  </Box>

                  <Box height={320} mt={2}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthStats} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(16,42,39,0.08)" strokeDasharray="4 4" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
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
                    onClick={() => navigate("/school-activity")}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Top Activities
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, mb: 2 }}>
                        Pending activities
                      </Typography>

                      <Box display="flex" flexDirection="column" gap={1.25}>
                        {topActivities.length > 0 ? (
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
                            No pending activities
                          </Typography>
                        )}
                      </Box>
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
                        <IconButton>
                          <DownloadIcon />
                        </IconButton>
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
