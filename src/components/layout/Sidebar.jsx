import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import {
  Home,
  BarChart,
  CheckLine,
  Upload,
  Pen,
  UserPlus,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { text: "Home", icon: <Home size={18} />, path: "/admin-dashboard" },
  { text: "Reports", icon: <BarChart size={18} />, path: "/reports" },
  { text: "Activities", icon: <CheckLine size={18} />, path: "/display-activities" },
  { text: "Upload Activities", icon: <Upload size={18} />, path: "/activity-upload" },
  { text: "Create School", icon: <UserPlus size={18} />, path: "/create-school" },
  { text: "Dimensions", icon: <Pen size={18} />, path: "/dimension-manager" },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <Box
      sx={{
        width: { xs: 240, md: 280 },
        maxWidth: "100%",
        minHeight: "100vh",
        p: 2,
        background:
          "linear-gradient(180deg, #0F3D39 0%, #0F766E 58%, #14B8A6 100%)",
        color: "#F4FFFD",
        borderTopRightRadius: { xs: 0, md: 28 },
        borderBottomRightRadius: { xs: 0, md: 28 },
        boxShadow: "18px 0 40px rgba(15, 61, 57, 0.16)",
        position: { md: "sticky" },
        top: 0,
      }}
    >
      <Box
        sx={{
          p: 2.5,
          mb: 2,
          borderRadius: 4,
          backgroundColor: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Typography variant="overline" sx={{ color: "rgba(244,255,253,0.7)" }}>
          Wellness Tracker
        </Typography>
        <Typography variant="h5" sx={{ mt: 0.5, color: "#fff" }}>
          Admin Panel
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: "rgba(244,255,253,0.78)" }}>
          Manage schools, analytics, and recommendations from one workspace.
        </Typography>
      </Box>

      <List sx={{ display: "grid", gap: 0.75 }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  gap: 1.5,
                  py: 1.35,
                  px: 1.5,
                  borderRadius: 3,
                  color: active ? "#0F3D39" : "#E8FFFB",
                  backgroundColor: active
                    ? "rgba(255,255,255,0.96)"
                    : "rgba(255,255,255,0.05)",
                  border: active
                    ? "1px solid rgba(255,255,255,0.92)"
                    : "1px solid transparent",
                  "&:hover": {
                    backgroundColor: active
                      ? "rgba(255,255,255,0.96)"
                      : "rgba(255,255,255,0.11)",
                  },
                }}
              >
                {item.icon}
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar;
