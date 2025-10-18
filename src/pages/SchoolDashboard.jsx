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
  { key: "emotional", label: "Emotional", color: "#FB7185" },
  { key: "physical", label: "Physical", color: "#F97316" },
  { key: "social", label: "Social", color: "#FACC15" },
  { key: "intellectual", label: "Intellectual", color: "#60A5FA" },
  { key: "spiritual", label: "Spiritual", color: "#A78BFA" },
  { key: "financial", label: "Financial", color: "#10B981" },
  { key: "environmental", label: "Environmental", color: "#34D399" },
  { key: "vocational", label: "Vocational", color: "#4F46E5" },
];

function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(",")]
    .concat(
      rows.map((r) =>
        keys.map((k) => `"${String(r[k] ?? "")}"`).join(",")
      )
    )
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
    <Card elevation={2} sx={{ borderRadius: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: "transparent" }}>{icon}</Avatar>
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

  // ✅ Get school_id from localStorage
  const schoolId = localStorage.getItem("school_id");

  useEffect(() => {
    if (!schoolId) {
      console.error("No school_id found");
      navigate("/login");
      return;
    }

    // ✅ Fetch wellness data and activities
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch wellness data for the last 5 months
        const months = [];
        const today = new Date();
        
        for (let i = 4; i >= 0; i--) {
          const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          months.push({
            monthStr,
            label: d.toLocaleString('default', { month: 'short' })
          });
        }

        const wellnessPromises = months.map(({ monthStr }) =>
          fetch(`/get_wellness_percentage.php?school_id=${schoolId}&month=${monthStr}`)
            .then(res => res.json())
        );

        const results = await Promise.all(wellnessPromises);
        
        // ✅ Transform API data to match chart format with all 8 dimensions
        const transformedData = results.map((data, idx) => {
          const monthData = { month: months[idx].label };
          
          // Initialize all dimensions to 0
          DIMENSIONS.forEach(dim => {
            monthData[dim.key] = 0;
          });

          // Fill in actual data from API
          data.forEach(dim => {
            const dimension = DIMENSIONS.find(d => d.label === dim.dimension_name);
            if (dimension) {
              monthData[dimension.key] = Math.round(dim.wellness_percentage || 0);
            }
          });

          return monthData;
        });

        setMonthStats(transformedData);
        setSelectedMonthIndex(transformedData.length - 1);

        // ✅ Fetch activities for current month
        const activitiesRes = await fetch(
          `/get_school_activities.php?school_id=${schoolId}`
        );
        const activitiesData = await activitiesRes.json();
        
        // Get last 3 pending (not completed) activities
        const pending = activitiesData
          .filter(act => !act.completed)
          .slice(-3)
          .reverse();
        
        setTopActivities(pending);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId, navigate]);

  const makePieData = (latestObj) =>
    DIMENSIONS.map((d) => ({
      name: d.label,
      value: latestObj?.[d.key] || 0,
      color: d.color,
    }));

  const pieData = useMemo(
    () => monthStats.length > 0 ? makePieData(monthStats[selectedMonthIndex]) : [],
    [monthStats, selectedMonthIndex]
  );

  const overallCompletion = useMemo(() => {
    if (pieData.length === 0) return 0;
    const values = pieData.map((d) => d.value);
    const avg = Math.round(
      values.reduce((a, b) => a + b, 0) / values.length
    );
    return avg;
  }, [pieData]);

  const weakest = useMemo(() => {
    if (pieData.length === 0) return { name: "N/A", value: 0 };
    return pieData.reduce((a, b) => (a.value < b.value ? a : b));
  }, [pieData]);

  const csvRows = monthStats.map((m) => ({
    month: m.month,
    ...DIMENSIONS.reduce(
      (acc, d) => ({ ...acc, [d.label]: m[d.key] }),
      {}
    ),
  }));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, md: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            School Wellness Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overview of your school's monthly wellness across 8 dimensions
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => exportToCSV("wellness-monthly.csv", csvRows)}
          >
            Export CSV
          </Button>
          <Button variant="contained" startIcon={<AssessmentIcon />}>
            Generate PDF
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <StatCard
                title="Overall Wellness"
                value={`${overallCompletion}%`}
                subtitle={monthStats.length > 0 ? `As of ${monthStats[selectedMonthIndex]?.month}` : ""}
                icon={<PieChartIcon />}
              />
            </Grid>

            <Grid item xs={12}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1}
                  >
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Weakest Dimension
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
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
                          innerRadius={60}
                          outerRadius={90}
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
                    {pieData.map((d) => (
                      <Box
                        key={d.name}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        sx={{ minWidth: 130 }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            bgcolor: d.color,
                            borderRadius: 0.5,
                          }}
                        />
                        <Typography variant="body2" noWrap>
                          {d.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {d.value}%
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      Recommendation
                    </Typography>
                    <InfoOutlinedIcon fontSize="small" color="disabled" />
                  </Box>

                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {`${weakest.name} is at ${weakest.value}%. Suggested focus: run 3 targeted activities next month.`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Monthly Trend
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Progress by Dimension
                      </Typography>
                    </Box>
                    <Box>
                      <Button
                        size="small"
                        onClick={() =>
                          setSelectedMonthIndex((i) => Math.max(0, i - 1))
                        }
                        sx={{ mr: 1 }}
                        disabled={selectedMonthIndex === 0}
                      >
                        Prev
                      </Button>
                      <Button
                        size="small"
                        onClick={() =>
                          setSelectedMonthIndex((i) =>
                            Math.min(monthStats.length - 1, i + 1)
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
                      <LineChart
                        data={monthStats}
                        margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ReTooltip />
                        {DIMENSIONS.map((d) => (
                          <Line
                            key={d.key}
                            type="monotone"
                            dataKey={d.key}
                            stroke={d.color}
                            strokeWidth={2}
                            dot={false}
                            name={d.label}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card
                    elevation={2}
                    sx={{
                      borderRadius: 2,
                      height: "100%",
                      cursor: "pointer",
                      transition: "0.2s",
                      "&:hover": { boxShadow: 6, transform: "scale(1.01)" },
                    }}
                    onClick={() => navigate("/school-activity")}
                  >
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Top Activities (This Month)
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, mb: 2 }}
                      >
                        Pending activities
                      </Typography>

                      <Box display="flex" flexDirection="column" gap={1}>
                        {topActivities.length > 0 ? (
                          topActivities.map((activity, index) => (
                            <Box
                              key={activity.school_activity_id}
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography noWrap sx={{ maxWidth: '70%' }}>
                                {activity.title}
                              </Typography>
                              <Chip 
                                label="Pending" 
                                size="small" 
                                color="warning"
                              />
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
                  <Card elevation={2} sx={{ borderRadius: 2, height: "100%" }}>
                    <CardContent>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Activity Completion
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            By Dimension
                          </Typography>
                        </Box>
                        <IconButton>
                          <DownloadIcon />
                        </IconButton>
                      </Box>

                      <Box mt={2}>
                        {pieData.map((d) => (
                          <Box
                            key={d.name}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            mb={1}
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box
                                sx={{ width: 10, height: 10, bgcolor: d.color }}
                              />
                              <Typography variant="body2">{d.name}</Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700 }}
                            >
                              {d.value}%
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