import React from "react";
import { Box, Typography, Avatar, IconButton } from "@mui/material";
import { Bell } from "lucide-react";

const Topbar = ({ title }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton>
          <Bell size={20} />
        </IconButton>
        <Avatar alt="Admin" src="/admin-avatar.png" />
      </Box>
    </Box>
  );
};

export default Topbar;
