import React, { useEffect, useState } from "react";
import { IconButton, Box, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./notifications.css";

const Notification = () => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.11;
      });
    }, 100);

    const startTimer = setTimeout(() => {
      // start progress after 1s
      clearInterval(progressInterval);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1.25; 
        });
      }, 90);
    }, 1000);

    const timer = setTimeout(() => setVisible(false), 10000);

    return () => {
      clearTimeout(timer);
      clearTimeout(startTimer);
      clearInterval(progressInterval);
    };
  }, []);

  if (!visible) return null;

  return (
    <Box className="notification">
      <Typography variant="body1" className="notification-text">
        this is how the notifications are
      </Typography>
      <IconButton className="close-btn" onClick={() => setVisible(false)}>
        <CloseIcon style={{ color: "white" }} />
      </IconButton>
      <Box className="progress-bar" style={{ width: `${progress}%` }} />
    </Box>
  );
};

export default Notification;
