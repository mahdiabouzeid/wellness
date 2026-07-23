import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  LinearProgress,
  MenuItem,
  Slider,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import {
  API_BASE_URL,
  authFetch,
  getAccessToken,
  getStoredUser,
} from "../auth/authService";

const initialFormData = {
  title: "",
  description: "",
  dimension_id: [],
  suggested_grade: 0,
  weight_percentage: 0,
  school_id: [],
  month: "",
  file: null,
};

const gradeOptions = [...Array(13).keys()].map((grade) => ({
  value: grade,
  label: grade === 0 ? "Kindergarten" : `Grade ${grade}`,
}));

const getValidationErrors = (values) => {
  const errors = {};

  if (!values.title.trim()) errors.title = "Activity title is required.";
  if (!values.month) errors.month = "Select month and year.";
  if (!values.dimension_id.length) {
    errors.dimension_id = "Select at least one dimension.";
  }
  if (!values.school_id.length) errors.school_id = "Select at least one school.";
  if (values.suggested_grade < 0 || values.suggested_grade > 12) {
    errors.suggested_grade = "Select a valid grade.";
  }

  return errors;
};

export default function ActivityUpload() {
  const [formData, setFormData] = useState(initialFormData);
  const [dimensions, setDimensions] = useState([]);
  const [schools, setSchools] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const validationErrors = getValidationErrors(formData);
  const isFormValid = Object.keys(validationErrors).length === 0;
  const displayedErrors = submitAttempted ? errors : {};

  useEffect(() => {
    authFetch(`${API_BASE_URL}/get_dimensions.php`)
      .then((res) => res.json())
      .then(setDimensions)
      .catch(console.error);

    authFetch(`${API_BASE_URL}/get_schools.php`)
      .then((res) => res.json())
      .then(setSchools)
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const nextValue = files ? files[0] : value;

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: nextValue,
      };
      if (submitAttempted) setErrors(getValidationErrors(next));
      return next;
    });
  };

  const handleMultiSelectChange = (name, selectedValues) => {
    const values = Array.isArray(selectedValues) ? selectedValues : [selectedValues];

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: [...new Set(values)],
      };
      if (submitAttempted) setErrors(getValidationErrors(next));
      return next;
    });
  };

  const handleSliderChange = (name, newValue) => {
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (uploading) return;

    setSubmitAttempted(true);
    const nextErrors = getValidationErrors(formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstInvalidField = e.currentTarget.querySelector("[aria-invalid='true']");
      firstInvalidField?.focus();
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value === null) return;
      if (Array.isArray(value)) {
        value.forEach((v) => data.append(`${key}[]`, v));
      } else {
        data.append(key, value);
      }
    });

    const storedUser = getStoredUser();
    if (storedUser?.id) data.append("created_by", storedUser.id);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/upload_activity.php`, true);
    const token = getAccessToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      setUploading(false);
      try {
        const result = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && result.success) {
          setSnackbar({
            open: true,
            message: "Your activity has been successfully uploaded",
            severity: "success",
          });
          setErrors({});
          setSubmitAttempted(false);
        } else {
          setSnackbar({
            open: true,
            message: result.message || "Upload failed. Please try again.",
            severity: "error",
          });
        }
      } catch {
        setSnackbar({
          open: true,
          message: "Upload completed, but response was invalid.",
          severity: "error",
        });
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setSnackbar({
        open: true,
        message: "Upload failed. Please try again.",
        severity: "error",
      });
    };

    xhr.send(data);
  };

  return (
    <Box maxWidth={700} mx="auto" p={2}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} color="primary" mb={1}>
            Upload monthly activities
          </Typography>

          <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
            <TextField
              fullWidth
              label="Activity Title"
              name="title"
              placeholder="Enter the activity title."
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
              error={Boolean(displayedErrors.title)}
              helperText={displayedErrors.title || " "}
              inputProps={{
                "aria-describedby": "activity-title-helper-text",
              }}
              FormHelperTextProps={{ id: "activity-title-helper-text" }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              name="description"
              placeholder="Provide a brief description of the activity."
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              helperText=" "
              inputProps={{
                "aria-describedby": "activity-description-helper-text",
              }}
              FormHelperTextProps={{ id: "activity-description-helper-text" }}
            />

            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Grades"
                  name="suggested_grade"
                  value={formData.suggested_grade}
                  onChange={handleChange}
                  error={Boolean(displayedErrors.suggested_grade)}
                  helperText={
                    displayedErrors.suggested_grade ||
                    "Select the grade for this activity."
                  }
                >
                  {gradeOptions.map((grade) => (
                    <MenuItem key={grade.value} value={grade.value}>
                      {grade.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="month"
                  label="Select month and year"
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  error={Boolean(displayedErrors.month)}
                  helperText={
                    displayedErrors.month ||
                    "Choose the month this activity applies to."
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  SelectProps={{
                    multiple: true,
                    value: formData.dimension_id,
                    onChange: (e) =>
                      handleMultiSelectChange("dimension_id", e.target.value),
                  }}
                  label="Dimension"
                  required
                  error={Boolean(displayedErrors.dimension_id)}
                  helperText={displayedErrors.dimension_id || " "}
                >
                  {dimensions.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  SelectProps={{
                    multiple: true,
                    value: formData.school_id,
                    onChange: (e) =>
                      handleMultiSelectChange("school_id", e.target.value),
                  }}
                  label="School"
                  required
                  error={Boolean(displayedErrors.school_id)}
                  helperText={displayedErrors.school_id || " "}
                >
                  {schools.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Typography mt={3} fontWeight={500}>
              Weight / Contribution (%)
            </Typography>
            <Slider
              value={formData.weight_percentage}
              onChange={(e, v) => handleSliderChange("weight_percentage", v)}
              step={5}
              marks
              min={0}
              max={100}
              valueLabelDisplay="auto"
            />

            <Button variant="outlined" component="label" sx={{ mt: 3 }}>
              {formData.file ? formData.file.name : "Upload File / Image"}
              <input
                type="file"
                hidden
                name="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleChange}
              />
            </Button>

            {uploading && (
              <Box mt={2}>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 4 }}
              disabled={!isFormValid || uploading}
              startIcon={
                uploading ? <CircularProgress color="inherit" size={18} /> : null
              }
            >
              {uploading ? "Submitting..." : "Submit Activity"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
