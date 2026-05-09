import React, { useState } from "react";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "./Sidebar";

export default function AdminLayout({ children, title = "Admin Dashboard" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  return (
    <Box className="admin-dashboard" sx={{ display: "flex", minHeight: "100vh", width: "100%" }}>
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
            {title}
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
        {children}
      </Box>
    </Box>
  );
}
