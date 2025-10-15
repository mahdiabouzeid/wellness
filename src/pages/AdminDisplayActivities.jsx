import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

export default function AdminDisplayActivities() {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ✅ Fetch schools list
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await axios.get("http://localhost/wellness-backend/get_schools.php");
        setSchools(res.data);
      } catch (err) {
        console.error("Error fetching schools:", err);
      }
    };
    fetchSchools();
  }, []);

  // ✅ Fetch activities
  const fetchActivities = async () => {
    if (!selectedSchool || !selectedMonth) return;
    setLoading(true);
    try {
      const res = await axios.get("http://localhost/wellness-backend/display-activities.php", {
        params: { school_id: selectedSchool, month: selectedMonth },
      });
      if (res.data.success) {
        setActivities(res.data.data);
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Admin Confirmation toggle
  const handleConfirmToggle = async (activityId, currentStatus) => {
    try {
      const formData = new FormData();
      formData.append("school_activity_id", activityId);
      formData.append("confirmed", currentStatus ? 0 : 1);

      const res = await axios.post(
        "http://localhost/wellness-backend/confirm_activity.php",
        formData
      );

      if (res.data.success) {
        setActivities((prev) =>
          prev.map((a) =>
            a.school_activity_id === activityId
              ? { ...a, admin_confirmed: currentStatus ? 0 : 1 }
              : a
          )
        );
        setSnackbar({
          open: true,
          message: currentStatus
            ? "Confirmation removed successfully."
            : "Activity confirmed successfully.",
          severity: "success",
        });
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      console.error("Error updating confirmation:", err);
      setSnackbar({
        open: true,
        message: "Error updating confirmation.",
        severity: "error",
      });
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Admin Activity Review
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>School</InputLabel>
            <Select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              label="School"
            >
              {schools.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="Month"
            type="month"
            fullWidth
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ height: "100%" }}
            onClick={fetchActivities}
            disabled={!selectedSchool || !selectedMonth}
          >
            View Activities
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <CircularProgress />
      ) : activities.length === 0 ? (
        <Typography>No activities found for this school/month.</Typography>
      ) : (
        activities.map((a) => (
          <Card key={a.school_activity_id} sx={{ mb: 2, borderRadius: 2 }} elevation={2}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {a.activity.title}
                </Typography>

                <Box display="flex" gap={1}>
                  <Chip
                    label={a.completed ? "Completed" : "Pending"}
                    color={a.completed ? "success" : "warning"}
                    size="small"
                  />
                  <Chip
                    label={a.admin_confirmed ? "Admin Confirmed" : "Not Confirmed"}
                    color={a.admin_confirmed ? "primary" : "default"}
                    size="small"
                  />
                </Box>
              </Box>

              <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                {a.activity.description}
              </Typography>

              {/* ✅ FIXED SECTION: handle multiple dimensions */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} component="div">
                <strong>Dimensions:</strong>{" "}
                {a.dimensions && a.dimensions.length > 0 ? (
                  a.dimensions.map((d) => (
                    <Chip
                      key={d.id}
                      label={d.name}
                      size="small"
                      sx={{
                        backgroundColor: d.color,
                        color: "#fff",
                        mr: 0.5,
                      }}
                    />
                  ))
                ) : (
                  <span>No dimensions</span>
                )}
              </Typography>

              {a.activity.suggested_grade && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Grade:</strong> {a.activity.suggested_grade}
                </Typography>
              )}

              {a.activity.file_url && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <a
                    href={`http://localhost/wellness-backend/uploads/${a.activity.file_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Attached File
                  </a>
                </Typography>
              )}

              {a.evidence_url && (
                <Typography variant="body2" sx={{ mt: 1 }}>
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

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  color={a.admin_confirmed ? "secondary" : "primary"}
                  onClick={() =>
                    handleConfirmToggle(a.school_activity_id, a.admin_confirmed)
                  }
                >
                  {a.admin_confirmed ? "Unconfirm" : "Confirm"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
