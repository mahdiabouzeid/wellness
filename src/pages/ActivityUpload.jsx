import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Typography,
  Slider,
  LinearProgress,
  Grid,
} from "@mui/material";

export default function ActivityUpload() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dimension_id: [],
    suggested_grade: 0,
    weight_percentage: 0,
    school_id: [],
    month: "",
    file: null,
  });

  const [dimensions, setDimensions] = useState([]);
  const [schools, setSchools] = useState([]);
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // ✅ Fetch dropdown data
  useEffect(() => {
    fetch("http://localhost/wellness-backend/get_dimensions.php")
      .then((res) => res.json())
      .then(setDimensions)
      .catch(console.error);

    fetch("http://localhost/wellness-backend/get_schools.php")
      .then((res) => res.json())
      .then(setSchools)
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleMultiSelectChange = (name, selectedValues) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedValues,
    }));
  };

  const handleSliderChange = (name, newValue) => {
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);
    setMessage("");

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => data.append(`${key}[]`, v));
      } else {
        data.append(key, value);
      }
    });
    data.append("created_by", 1);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost/wellness-backend/upload_activity.php", true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      setUploading(false);
      try {
        const result = JSON.parse(xhr.responseText);
        setMessage(result.message);
      } catch {
        setMessage("Upload completed, but response was invalid.");
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setMessage("Upload failed. Please try again.");
    };

    xhr.send(data);
  };

  return (
    <Box maxWidth={700} mx="auto" p={2}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} color="primary" mb={1}>
            Upload Monthly Activity
          </Typography>

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Title */}
            <TextField
              fullWidth
              label="Activity Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
            />

            {/* Description */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
            />

            {/* Grade + Month + Dimensions + Schools */}
            <Grid container spacing={2} mt={1}>
              {/* ✅ Grade Selector */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Suggested Grade"
                  name="suggested_grade"
                  value={formData.suggested_grade}
                  onChange={handleChange}
                >
                  {[...Array(13).keys()].map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {grade === 0 ? "Kindergarten" : `Grade ${grade}`}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* ✅ Month Selector */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="month"
                  label="Select Month"
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  helperText="Choose the month this activity applies to"
                />
              </Grid>

              {/* ✅ Dimension Selector */}
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
                >
                  {dimensions.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* ✅ School Selector */}
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
                >
                  {schools.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {/* ✅ Weight Slider */}
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

            {/* ✅ File Upload */}
            <Button variant="outlined" component="label" sx={{ mt: 3 }}>
              Upload File / Image
              <input type="file" hidden name="file" onChange={handleChange} />
            </Button>

            {/* ✅ Progress Bar */}
            {uploading && (
              <Box mt={2}>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}

            {/* ✅ Submit Button */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 4 }}
              disabled={uploading}
            >
              Submit Activity
            </Button>

            {/* ✅ Message */}
            {message && (
              <Typography mt={2} color="secondary">
                {message}
              </Typography>
            )}
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
