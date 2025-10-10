import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const RecommendationCard = () => {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recommendations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Emotional wellness is at 40% — focus here next month.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
