import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Button,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL, authFetch, openProtectedFile } from "../auth/authService";

function getCurrentMonthValue() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthValue) {
  if (!monthValue) return "No month selected";

  const [year, month] = monthValue.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
}

export default function SchoolActivity() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    location.state?.month || getCurrentMonthValue()
  );

  const schoolId = localStorage.getItem("school_id");

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);

      try {
        const response = await authFetch(
          `${API_BASE_URL}/get_school_activities.php?school_id=${schoolId}&month=${selectedMonth}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }

        const data = await response.json();
        setActivities(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching activities:", error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [schoolId, selectedMonth]);

  const selectedMonthLabel = formatMonthLabel(selectedMonth);

  return (
    <Box className="school-dashboard page-shell">
      <Box
        className="school-dashboard__header"
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 1 }}>
            Back
          </Button>

          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>
            School activities
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Activities assigned for {selectedMonthLabel}.
          </Typography>
        </Box>

        <TextField
          label="Reporting Month"
          type="month"
          size="small"
          value={selectedMonth}
          onChange={(event) => {
            if (event.target.value) {
              setSelectedMonth(event.target.value);
            }
          }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 190, backgroundColor: "#fff" }}
        />
      </Box>

      {loading ? (
        <CircularProgress />
      ) : activities.length === 0 ? (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              No activities assigned
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              There are no school activities for {selectedMonthLabel}.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        activities.map((activity) => (
          <Card
            key={activity.school_activity_id}
            sx={{
              mb: 2,
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 24px 50px rgba(16, 42, 39, 0.12)",
              },
            }}
            onClick={() => navigate("/evidence-upload", { state: { activity } })}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} mb={1}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {activity.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Open to upload or review evidence
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={activity.completed ? "Completed" : "Pending"}
                    color={activity.completed ? "success" : "warning"}
                    size="small"
                  />
                  <ArrowForwardIcon fontSize="small" color="action" />
                </Box>
              </Box>

              <Typography variant="body2" sx={{ mb: 1 }}>
                {activity.description}
              </Typography>

              {activity.dimension_names && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Dimensions:</strong>{" "}
                    <span style={{ marginLeft: 6 }}>{activity.dimension_names}</span>
                  </Typography>
                </Box>
              )}

              {activity.suggested_grade && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Grade:</strong> {activity.suggested_grade}
                </Typography>
              )}

              {activity.file_url && (
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  <a href={activity.file_url} onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    openProtectedFile(activity.file_url).catch((error) => console.error(error));
                  }}>
                    View attached file
                  </a>
                </Typography>
              )}

              {activity.evidence_url && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Evidence:</strong>{" "}
                  <a href={activity.evidence_url} onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    openProtectedFile(activity.evidence_url).catch((error) => console.error(error));
                  }}>
                    View evidence
                  </a>
                </Typography>
              )}

              {activity.notes && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Notes:</strong> {activity.notes}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}
