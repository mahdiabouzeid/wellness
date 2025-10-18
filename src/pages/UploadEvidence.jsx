import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useNavigate, useLocation } from "react-router-dom";

export default function UploadEvidence() {
  const navigate = useNavigate();
  const location = useLocation();
  const activity = location.state?.activity;

  const [completed, setCompleted] = useState(activity?.completed || false);
  const [notes, setNotes] = useState(activity?.notes || "");
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activity) return;

    const formData = new FormData();
    formData.append("school_activity_id", activity.school_activity_id);
    formData.append("completed", completed ? 1 : 0);
    formData.append("notes", notes);
    if (evidence) formData.append("evidence", evidence);

    try {
      setLoading(true);
      const response = await fetch("/upload-school-activity.php", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setMessage(data.message || "Updated successfully!");
    } catch (error) {
        console.log(error)
      console.error("Error:", error);
      setMessage("Error uploading evidence. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!activity) {
    return (
      <Box p={4}>
        <Typography>No activity selected.</Typography>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
        Back
      </Button>

      <Card sx={{ mt: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            {activity.title}
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            {activity.description}
          </Typography>

          <form onSubmit={handleSubmit}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={completed}
                  onChange={(e) => setCompleted(e.target.checked)}
                />
              }
              label="Mark as Completed"
            />

            <TextField
              label="Notes"
              multiline
              rows={3}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ mt: 2 }}
            />

            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              sx={{ mt: 2 }}
            >
              {evidence ? evidence.name : "Upload Evidence File"}
              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setEvidence(e.target.files[0])}
              />
            </Button>

            <Box sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Submit"}
              </Button>
            </Box>

            {message && (
              <Typography sx={{ mt: 2 }} color="text.secondary">
                {message}
              </Typography>
            )}
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
