import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "../components/layout/Sidebar";
import StatCard from "../components/layout/StatCard";
import WellnessBarChart from "../components/charts/WellnessBarChart";
import WellnessCircularChart from "../components/charts/WellnessCircularChart";
import RecommendationCard from "../components/ui/RecommendationCard";
import Notification from "../components/ui/notifications";

const AdminDashboard = () => {
  const [stats] = useState({
    totalSchools: 12,
    totalActivities: 85,
    avgCompletion: 78,
    pendingReports: 3,
  });

  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [month, setMonth] = useState("");
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // === Fetch schools from backend ===
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetch("http://localhost/wellness-backend/get_schools.php");
        const data = await res.json();
        setSchools(data);
        if (data.length > 0) setSelectedSchool(data[0].id);
      } catch (err) {
        console.error("Error fetching schools:", err);
      } finally {
        setLoadingSchools(false);
      }
    };
    fetchSchools();
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F5F6FA" }}>
      <Notification />

      {/* Sidebar for desktop */}
      <Box
        component="nav"
        sx={{
          width: { md: 260 },
          flexShrink: { md: 0 },
          display: { xs: "none", md: "block" },
        }}
      >
        <Sidebar />
      </Box>

      {/* Sidebar Drawer for mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box" },
        }}
      >
        <Sidebar />
      </Drawer>

      {/* Top App Bar (Mobile only) */}
      <AppBar
        position="fixed"
        sx={{
          display: { xs: "flex", md: "none" },
          bgcolor: "#4F46E5",
          boxShadow: "none",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* === MAIN CONTENT === */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          mt: { xs: 7, md: 0 },
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {/* === Header + Filters === */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "#1E293B", mb: 2 }}
          >
            Admin Dashboard
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Select School</InputLabel>
                {loadingSchools ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 56,
                    }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <Select
                    value={selectedSchool}
                    label="Select School"
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    sx={{
                      bgcolor: "#fff",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6366F1",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#4338CA",
                      },
                    }}
                  >
                    {schools.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Select Month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#6366F1",
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* === Stats Row === */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Schools Registered"
              value={stats.totalSchools}
              color="#4F46E5"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Activities Uploaded"
              value={stats.totalActivities}
              color="#22C55E"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg Completion"
              value={`${stats.avgCompletion}%`}
              color="#F59E0B"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Reports"
              value={stats.pendingReports}
              color="#EF4444"
            />
          </Grid>
        </Grid>

        {/* === Charts === */}
        {selectedSchool && month ? (
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
                  backgroundColor: "#fff",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.01)" },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontWeight: 600, color: "#1E293B" }}
                >
                  Wellness Completion by Dimension
                </Typography>
                <WellnessBarChart schoolId={selectedSchool} month={month} />
              </Paper>
            </Grid>

            {/* Circular Chart (Bigger Container) */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  width:"110%",
                  ml:'-5%',
                  p: 3,
                  borderRadius: 3,
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
                  backgroundColor: "#fff",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.01)" },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 400, // ⬅ increased height
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontWeight: 600, color: "#1E293B" }}
                >
                  Wellness Balance
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    height: 380, // ⬅ enlarged chart area
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <WellnessCircularChart
                    schoolId={selectedSchool}
                    month={month}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Typography
            align="center"
            sx={{ mt: 4, color: "text.secondary", fontWeight: 500 }}
          >
            Please select a school and a month to view analytics.
          </Typography>
        )}

        {/* === Recommendations === */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <RecommendationCard />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
