import React, { useState } from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "../components/layout/Sidebar";
import StatCard from "../components/layout/StatCard";
import WellnessBarChart from "../components/charts/WellnessBarChart";
import WellnessCircularChart from "../components/charts/WellnessCircularChart";
import RecommendationCard from "../components/ui/RecommendationCard";
import Notification from "../components/ui/notifications"

const AdminDashboard = () => {
  const [stats] = useState({
    totalSchools: 12,
    totalActivities: 85,
    avgCompletion: 78,
    pendingReports: 3,
  });

  const [selectedSchool, setSelectedSchool] = useState("Greenfield High School");
  const [mobileOpen, setMobileOpen] = useState(false);

  const schools = [
    "Greenfield High School",
    "Sunrise Academy",
    "Horizon International",
    "Mountainview School",
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#F5F6FA" }}>
      {/* Sidebar for desktop */}
      <Notification />
      <Box
        component="nav"
        sx={{
          width: { md: 240 },
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
        ModalProps={{
          keepMounted: true,
        }}
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
          backgroundColor: "#4F46E5",
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

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          mt: { xs: 7, md: 0 }, // adds space for mobile appbar
          display: "flex",
          flexDirection: "column",
          gap: 3,
          width: "100%",
        }}
      >
        {/* === Header with School Dropdown === */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            mb: 1,
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "#1E293B", mb: { xs: 2, md: 0 } }}
          >
            Admin Dashboard
          </Typography>

          <FormControl sx={{ width: { xs: "100%", sm: 250, md: 280 } }}>
            <InputLabel>Select School</InputLabel>
            <Select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              label="Select School"
              sx={{
                borderRadius: 2,
                backgroundColor: "#fff",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#6366F1",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#4338CA",
                },
              }}
            >
              {schools.map((school, index) => (
                <MenuItem key={index} value={school}>
                  {school}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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

        {/* === Charts Section === */}
        <Grid container spacing={4} alignItems="stretch">
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
                height: "100%",
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
              <WellnessBarChart />
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
                height: "100%",
                backgroundColor: "#fff",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.01)" },
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: 600, color: "#1E293B" }}
              >
                Wellness Balance
              </Typography>
              <WellnessCircularChart schoolId={1} month={"2025-10-01"}/>
            </Paper>
          </Grid>
        </Grid>

        {/* === Recommendations === */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <RecommendationCard />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
