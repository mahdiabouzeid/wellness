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
  saveDisabled,
  saveButtonColor,
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
              loading
                ? "Loading recommendation..."
                : "Enter your monthly recommendation based on wellness activities and tracking. Use wellness data to suggest improvements for this month"
            }
            helperText="Enter your monthly recommendation based on wellness activities and tracking. Use wellness data to suggest improvements for this month"
            value={activeContext ? recommendation : ""}
            onChange={(e) => setRecommendation(e.target.value)}
            disabled={loading}
          />

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={handleSaveRecommendation}
              disabled={saveDisabled || saving || loading}
              sx={{
                backgroundColor: saveButtonColor,
                color: "#102A27",
                "&:hover": {
                  backgroundColor: saveButtonColor,
                  filter: "brightness(0.96)",
                },
                "&:focus-visible": {
                  outline: `3px solid ${saveButtonColor}`,
                  outlineOffset: 3,
                },
                "&.Mui-disabled": {
                  backgroundColor: "rgba(251, 113, 133, 0.36)",
                  color: "rgba(16, 42, 39, 0.54)",
                },
              }}
            >
              {saving ? "Saving..." : "Ready to save"}
            </Button>
          </Box>
        </>
      ) : (
        <Typography color="text.secondary">
          Enter your monthly recommendation based on wellness activities and tracking. Use wellness data to suggest improvements for this month
        </Typography>
      )}
    </Paper>
  );
};

export default RecommendationCard;
