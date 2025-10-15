import React, { useState, useMemo } from "react";
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
import { useNavigate } from "react-router-dom"; // ✅ Added for navigation
import CustomThemeProvider from "../theme/ThemeProvider";

// --------- Dummy data (replace with real API data) ---------
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

const monthStats = [
  {
    month: "Jan",
    emotional: 60,
    physical: 70,
    social: 55,
    intellectual: 65,
    spiritual: 50,
    financial: 45,
    environmental: 72,
    vocational: 58,
  },
  {
    month: "Feb",
    emotional: 62,
    physical: 68,
    social: 60,
    intellectual: 66,
    spiritual: 52,
    financial: 50,
    environmental: 70,
    vocational: 60,
  },
  {
    month: "Mar",
    emotional: 55,
    physical: 74,
    social: 58,
    intellectual: 67,
    spiritual: 57,
    financial: 54,
    environmental: 75,
    vocational: 65,
  },
  {
    month: "Apr",
    emotional: 70,
    physical: 78,
    social: 65,
    intellectual: 72,
    spiritual: 60,
    financial: 62,
    environmental: 80,
    vocational: 72,
  },
  {
    month: "May",
    emotional: 68,
    physical: 75,
    social: 70,
    intellectual: 74,
    spiritual: 63,
    financial: 66,
    environmental: 78,
    vocational: 75,
  },
];

const makePieData = (latestObj) =>
  DIMENSIONS.map((d) => ({
    name: d.label,
    value: latestObj[d.key],
    color: d.color,
  }));

// --------- Utility: CSV export ---------
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
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(
    monthStats.length - 1
  );
  const navigate = useNavigate(); // ✅ For navigation

  const pieData = useMemo(
    () => makePieData(monthStats[selectedMonthIndex]),
    [selectedMonthIndex]
  );

  const overallCompletion = useMemo(() => {
    const values = pieData.map((d) => d.value);
    const avg = Math.round(
      values.reduce((a, b) => a + b, 0) / values.length
    );
    return avg;
  }, [pieData]);

  const weakest = useMemo(() => {
    return pieData.reduce((a, b) => (a.value < b.value ? a : b));
  }, [pieData]);

  const csvRows = monthStats.map((m) => ({
    month: m.month,
    ...DIMENSIONS.reduce(
      (acc, d) => ({ ...acc, [d.label]: m[d.key] }),
      {}
    ),
  }));

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
        {/* LEFT COLUMN */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <StatCard
                title="Overall Wellness"
                value={`${overallCompletion}%`}
                subtitle={`As of ${monthStats[selectedMonthIndex].month}`}
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

        {/* RIGHT COLUMN */}
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
                        {DIMENSIONS.slice(0, 4).map((d) => (
                          <Line
                            key={d.key}
                            type="monotone"
                            dataKey={d.key}
                            stroke={d.color}
                            strokeWidth={2}
                            dot={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* ✅ Clickable Top Activities Card */}
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
                    onClick={() => navigate("/school-activity")} // ✅ Navigation added
                  >
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Top Activities (This Month)
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, mb: 2 }}
                      >
                        Completed by your school
                      </Typography>

                      <Box display="flex" flexDirection="column" gap={1}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography>Peer Support Circles</Typography>
                          <Chip label="Completed" size="small" />
                        </Box>

                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography>Weekly Sports Sessions</Typography>
                          <Chip label="Completed" size="small" />
                        </Box>

                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography>Career Awareness Workshops</Typography>
                          <Chip
                            label="Needs Evidence"
                            size="small"
                            color="warning"
                          />
                        </Box>
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
