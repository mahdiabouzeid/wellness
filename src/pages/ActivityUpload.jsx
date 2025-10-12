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
    dimension_id: "",
    suggested_grade: 0,
    weight_percentage: 0,
    school_id: "",
    file: null,
  });
  const [dimensions, setDimensions] = useState([]);
  const [schools, setSchools] = useState([]);
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

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

  const handleSliderChange = (name, newValue) => {
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);
    setMessage("");

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
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
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} color="primary" mb={1}>
            Upload Monthly Activity
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Fill in all fields before submitting.
          </Typography>

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <Typography color="primary" fontWeight={600} mb={1}>
              Basic Information
            </Typography>

            <TextField
              fullWidth
              label="Activity Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
            />

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

            <Typography color="primary" fontWeight={600} mt={3}>
              Details
            </Typography>

            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Dimension"
                  name="dimension_id"
                  value={formData.dimension_id}
                  onChange={handleChange}
                  required
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
                  label="School"
                  name="school_id"
                  value={formData.school_id}
                  onChange={handleChange}
                  required
                >
                  {schools.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  type="number"
                  fullWidth
                  label="Suggested Grade"
                  name="suggested_grade"
                  value={formData.suggested_grade}
                  onChange={handleChange}
                  inputProps={{ min: 0, max: 12 }}
                />
              </Grid>
            </Grid>

            <Typography mt={3} fontWeight={500}>
              Weight / Contribution (%)
            </Typography>
            <Slider
              value={formData.weight_percentage}
              onChange={(e, v) => handleSliderChange("weight_percentage", v)}
              step={10}
              marks
              min={0}
              max={100}
              valueLabelDisplay="auto"
              sx={{ color: "primary.main" }}
            />

            <Button variant="outlined" component="label" sx={{ mt: 3 }}>
              Upload File / Image
              <input type="file" hidden name="file" onChange={handleChange} />
            </Button>

            {formData.file && (
              <Typography mt={1} variant="body2" color="text.secondary">
                ✅ File selected: {formData.file.name}
              </Typography>
            )}

            {uploading && (
              <Box mt={2}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" align="center" mt={1}>
                  Uploading... {uploadProgress}%
                </Typography>
              </Box>
            )}

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
