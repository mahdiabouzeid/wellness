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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

export default function SchoolActivity() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // For demo: replace with logged-in user's school_id from context or auth
  const schoolId = 1;

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(
          `http://localhost/wellness-backend/get_school_activities.php?school_id=${schoolId}`
        );
        if (!response.ok) throw new Error("Failed to fetch activities");
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [schoolId]);

  return (
    <Box p={4}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
        Back
      </Button>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        This Month’s Activities
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        These are the activities assigned by the admin for your school this month.
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : activities.length === 0 ? (
        <Typography>No activities assigned for this month.</Typography>
      ) : (
        activities.map((a) => (
          <Card key={a.school_activity_id} sx={{ mb: 2, borderRadius: 2 }} elevation={2}   onClick={() => navigate("/evidence-upload", { state: { activity: a } })}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {a.title}
                </Typography>
                <Chip
                  label={a.completed ? "Completed" : "Pending"}
                  color={a.completed ? "success" : "warning"}
                  size="small"
                />
              </Box>

              <Typography variant="body2" sx={{ mb: 1 }}>
                {a.description}
              </Typography>

              {/* ✅ Updated Dimensions Display */}
              {a.dimension_names && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Dimensions:</strong>{" "}
                    <span style={{ marginLeft: 6 }}>{a.dimension_names}</span>
                  </Typography>
                </Box>
              )}

              {a.suggested_grade && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Grade:</strong> {a.suggested_grade}
                </Typography>
              )}

              {/* ✅ Handle File Links Correctly */}
              {a.file_url && (
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  <a
                    href={`http://localhost/wellness-backend/${a.file_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Attached File
                  </a>
                </Typography>
              )}

              {/* ✅ Evidence & Notes Section */}
              {a.evidence_url && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Evidence:</strong>{" "}
                  <a
                    href={`http://localhost/wellness-backend/${a.evidence_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Evidence
                  </a>
                </Typography>
              )}

              {a.notes && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Notes:</strong> {a.notes}
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
