// src/components/ui/notifications.jsx
import React, { useEffect, useState } from "react";
import { IconButton, Box, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./notifications.css";

const Notification = ({ message }) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 1.25));
    }, 90);
    const timer = setTimeout(() => setVisible(false), 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <Box className="notification">
      <Typography variant="body1" className="notification-text">
        {message}
      </Typography>
      <IconButton className="close-btn" onClick={() => setVisible(false)}>
        <CloseIcon style={{ color: "white" }} />
      </IconButton>
      <Box className="progress-bar" style={{ width: `${progress}%` }} />
    </Box>
  );
};

export default Notification;
