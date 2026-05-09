import React from "react";
import { Paper, Typography, TextField, Box, Button, Chip } from "@mui/material";

const RecommendationCard = ({
  selectedSchool,
  selectedSchoolName,
  month,
  recommendation,
  recommendationContext,
  setRecommendation,
  handleSaveRecommendation,
  saving,
  loading,
}) => {
  const hasSelection = Boolean(selectedSchool && month);
  const activeContext =
    recommendationContext?.schoolId === selectedSchool && recommendationContext?.month === month;

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
          label={hasSelection ? `${selectedSchoolName} - ${month}` : "Awaiting filters"}
          color={hasSelection ? "success" : "default"}
          variant={hasSelection ? "filled" : "outlined"}
        />
      </Box>

      {hasSelection ? (
        <>
          <TextField
            multiline
            rows={6}
            fullWidth
            placeholder={
              loading ? "Loading recommendation..." : "Write a focused recommendation for this school and month..."
            }
            value={activeContext ? recommendation : ""}
            onChange={(e) => setRecommendation(e.target.value)}
            disabled={loading}
          />

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={handleSaveRecommendation}
              disabled={saving || loading}
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
