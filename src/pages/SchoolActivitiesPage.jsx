import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Card,
  CardContent,
  Button,
  CircularProgress,
} from "@mui/material";

export default function SchoolActivitiesPage() {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost/wellness-backend/get_schools.php")
      .then((res) => res.json())
      .then((data) => setSchools(data))
      .catch((err) => console.error("Error fetching schools:", err));
  }, []);

  const fetchActivities = () => {
    if (!selectedSchool) return;
    setLoading(true);

    fetch(`http://localhost/wellness-backend/get_school_activities.php?school_id=${selectedSchool}`)
      .then((res) => res.json())
      .then((data) => setActivities(data))
      .catch((err) => console.error("Error fetching activities:", err))
      .finally(() => setLoading(false));
  };

  const confirmActivity = (id) => {
    fetch("http://localhost/wellness-backend/confirm_activity.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    })
      .then((res) => res.json())
      .then(() => fetchActivities())
      .catch((err) => console.error("Error confirming activity:", err));
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        View School Activities
      </Typography>

      <Select
        value={selectedSchool}
        onChange={(e) => setSelectedSchool(e.target.value)}
        displayEmpty
        sx={{ mb: 2, minWidth: 300 }}
      >
        <MenuItem value="">Select School</MenuItem>
        {schools.map((school) => (
          <MenuItem key={school.id} value={school.id}>
            {school.name}
          </MenuItem>
        ))}
      </Select>

      <Button
        variant="contained"
        onClick={fetchActivities}
        disabled={!selectedSchool || loading}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Load Activities"
        )}
      </Button>

      <Box mt={3}>
        {activities.map((act) => (
          <Card key={act.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{act.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {act.description}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Month:</strong> {act.month}
              </Typography>
              <Typography>
                <strong>Completed:</strong>{" "}
                {act.completed ? "✅ Yes" : "❌ No"}
              </Typography>
              <Typography>
                <strong>Admin Confirmed:</strong>{" "}
                {act.admin_confirmed ? "✅ Confirmed" : "❌ Pending"}
              </Typography>

              {act.evidence_url && (
                <Typography>
                  <a
                    href={act.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Evidence
                  </a>
                </Typography>
              )}

              {!act.admin_confirmed && act.completed && (
                <Button
                  variant="outlined"
                  color="success"
                  sx={{ mt: 1 }}
                  onClick={() => confirmActivity(act.id)}
                >
                  Confirm Completion
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
