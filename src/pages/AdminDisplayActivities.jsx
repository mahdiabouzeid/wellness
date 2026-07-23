import React, { useEffect, useMemo, useState } from "react";
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
import axios from "../api/axios";
import { openProtectedFile } from "../auth/authService";
import { ACTIVITY_REVIEW_COLORS, ACTIVITY_STATUS_FILTERS } from "../constants/activityReview";

export default function AdminDisplayActivities() {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ✅ Fetch schools list
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await axios.get("/get_schools.php");
        setSchools(res.data);
      } catch (err) {
        console.error("Error fetching schools:", err);
        setSnackbar({
          open: true,
          message: "Error loading schools.",
          severity: "error",
        });
      }
    };
    fetchSchools();
  }, []);

  const filteredActivities = useMemo(() => {
    if (selectedStatus === "all") return activities;

    return activities.filter((activity) => {
      if (selectedStatus === "completed") return Boolean(activity.completed);
      if (selectedStatus === "pending") return !activity.completed;
      if (selectedStatus === "unconfirmed") return !activity.admin_confirmed;
      return true;
    });
  }, [activities, selectedStatus]);

  // ✅ Fetch activities
  const fetchActivities = async () => {
    if (!selectedSchool || !selectedMonth) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/display-activities.php", {
        params: { school_id: selectedSchool, month: selectedMonth },
      });
      if (res.data.success) {
        setActivities(Array.isArray(res.data.data) ? res.data.data : []);
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error(err);
      setActivities([]);
      setError("Error loading activities.");
      setSnackbar({
        open: true,
        message: "Error loading activities.",
        severity: "error",
      });
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
        "/confirm_activity.php",
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
        <Grid item xs={12} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Month"
            type="month"
            fullWidth
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Activity Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="Activity Status"
            >
              {ACTIVITY_STATUS_FILTERS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
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
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : activities.length === 0 ? (
        <Typography>No activities found for this school/month.</Typography>
      ) : filteredActivities.length === 0 ? (
        <Typography>No activities match the selected status.</Typography>
      ) : (
        filteredActivities.map((a) => (
          <Card key={a.school_activity_id} sx={{ mb: 2, borderRadius: 2 }} elevation={2}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {a.activity.title}
                </Typography>

                <Box display="flex" gap={1}>
                  <Chip
                    label={a.completed ? "Completed" : "Pending"}
                    color={a.completed ? "default" : "warning"}
                    size="small"
                    sx={
                      a.completed
                        ? {
                            backgroundColor: ACTIVITY_REVIEW_COLORS.completed,
                            color: "#102A27",
                          }
                        : undefined
                    }
                  />
                  <Chip
                    label={a.admin_confirmed ? "Admin Confirmed" : "Not Confirmed"}
                    color="default"
                    size="small"
                    sx={
                      a.admin_confirmed
                        ? {
                            backgroundColor: ACTIVITY_REVIEW_COLORS.confirmed,
                            color: "#102A27",
                          }
                        : undefined
                    }
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
                  <a href={a.activity.file_url} onClick={(event) => {
                    event.preventDefault();
                    openProtectedFile(a.activity.file_url).catch((error) => {
                      setSnackbar({ open: true, message: error.message, severity: "error" });
                    });
                  }}>
                    View activity document
                  </a>
                </Typography>
              )}

              {a.evidence_url && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <a href={a.evidence_url} onClick={(event) => {
                    event.preventDefault();
                    openProtectedFile(a.evidence_url).catch((error) => {
                      setSnackbar({ open: true, message: error.message, severity: "error" });
                    });
                  }}>
                    View supporting evidence
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
                  sx={
                    a.admin_confirmed
                      ? {
                          borderColor: ACTIVITY_REVIEW_COLORS.unconfirm,
                          color: ACTIVITY_REVIEW_COLORS.unconfirmText,
                          "&:hover": {
                            borderColor: ACTIVITY_REVIEW_COLORS.unconfirm,
                            backgroundColor: "rgba(249, 115, 22, 0.08)",
                          },
                          "&:focus-visible": {
                            outline: `3px solid ${ACTIVITY_REVIEW_COLORS.unconfirm}`,
                            outlineOffset: 3,
                          },
                        }
                      : {
                          borderColor: ACTIVITY_REVIEW_COLORS.confirmed,
                          color: "#0F3D39",
                          "&:hover": {
                            borderColor: ACTIVITY_REVIEW_COLORS.confirmed,
                            backgroundColor: "rgba(20, 184, 166, 0.08)",
                          },
                          "&:focus-visible": {
                            outline: `3px solid ${ACTIVITY_REVIEW_COLORS.confirmed}`,
                            outlineOffset: 3,
                          },
                        }
                  }
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
