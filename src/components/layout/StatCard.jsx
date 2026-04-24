import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

const StatCard = ({ title, value, color }) => {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        border: "1px solid rgba(16, 42, 39, 0.08)",
        boxShadow: "0 18px 40px rgba(16, 42, 39, 0.08)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(244,251,250,0.92) 100%)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 24px 50px rgba(16, 42, 39, 0.12)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            width: 42,
            height: 8,
            borderRadius: 999,
            background: color || "#0F766E",
            mb: 2,
          }}
        />
        <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>
          {title}
        </Typography>
        <Typography
          variant="h4"
          sx={{ color: color || "#0F766E", fontWeight: 800, lineHeight: 1.1 }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatCard;
