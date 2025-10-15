import React from "react";
import { Box, Typography, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { Home, BarChart, CheckLine,Upload, Bell, Settings,Pen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { text: "Home", icon: <Home size={18} />, path: "/admin-dashboard" },
  { text: "Reports", icon: <BarChart size={18} />, path: "/reports" },
  {text: "Activities", icon: <CheckLine size={18} />, path: "/display-activities"},
  { text: "Upload Activities", icon: <Upload size={18} />, path: "/activity-upload" },
  { text: "Notifications", icon: <Bell size={18} />, path: "/notifications" },
  { text: "Settings", icon: <Settings size={18} />, path: "/settings" },
  {text:"Dimension Manager", icon: <Pen size={18} />, path: "/dimension-manager"},
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <Box
      sx={{
        width: 220,
        backgroundColor: "#4F46E5",
        color: "#fff",
        minHeight: "100vh",
        p: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, textAlign: "center" }}>
        Admin Panel
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              sx={{
                color: location.pathname === item.path ? "#FFF" : "#E0E7FF",
                backgroundColor:
                  location.pathname === item.path ? "rgba(255,255,255,0.2)" : "transparent",
                borderRadius: 2,
                mb: 1,
              }}
            >
              {item.icon}
              <ListItemText primary={item.text} sx={{ ml: 2 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
