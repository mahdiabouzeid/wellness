import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

const StatCard = ({ title, value, color }) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 2,
        backgroundColor: "#fff",
        transition: "transform 0.2s ease",
        "&:hover": { transform: "translateY(-4px)" },
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Typography
            variant="h5"
            sx={{ color: color || "#4F46E5", fontWeight: 700 }}
          >
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
