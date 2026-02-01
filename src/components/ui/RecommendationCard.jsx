import React from "react";
import {
  Grid,
  Paper,
  Typography,
  TextField,
  Box,
  Button,
} from "@mui/material";

const RecommendationCard = ({
  selectedSchool,
  month,
  recommendation,
  setRecommendation,
  handleSaveRecommendation,
  saving,
}) => {
  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Monthly Recommendation
          </Typography>

          {selectedSchool && month ? (
            <>
              <TextField
                multiline
                rows={4}
                fullWidth
                placeholder="Write recommendation for this school..."
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
              />

              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  onClick={handleSaveRecommendation}
                  disabled={saving}
                  sx={{
                    bgcolor: "#4F46E5",
                    "&:hover": { bgcolor: "#4338CA" },
                  }}
                >
                  {saving ? "Saving..." : "Save Recommendation"}
                </Button>
              </Box>
            </>
          ) : (
            <Typography color="text.secondary">
              Select school and month first.
            </Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default RecommendationCard;
