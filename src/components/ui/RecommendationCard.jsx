import React from "react";
import { Paper, Typography, TextField, Box, Button, Chip } from "@mui/material";

const RecommendationCard = ({
  selectedSchool,
  month,
  recommendation,
  setRecommendation,
  handleSaveRecommendation,
  saving,
}) => {
  return (
    <Paper className="surface-card" sx={{ p: { xs: 2, md: 3 }, width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>
            Recommendation Studio
          </Typography>
          <Typography variant="h5">Monthly recommendation</Typography>
        </Box>
        <Chip
          label={selectedSchool && month ? "Ready to save" : "Awaiting filters"}
          color={selectedSchool && month ? "success" : "default"}
          variant={selectedSchool && month ? "filled" : "outlined"}
        />
      </Box>

      {selectedSchool && month ? (
        <>
          <TextField
            multiline
            rows={6}
            fullWidth
            placeholder="Write a focused recommendation for this school and month..."
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
          />

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={handleSaveRecommendation}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Recommendation"}
            </Button>
          </Box>
        </>
      ) : (
        <Typography color="text.secondary">
          Select a school and a month first to draft a recommendation.
        </Typography>
      )}
    </Paper>
  );
};

export default RecommendationCard;
