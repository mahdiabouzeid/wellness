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
} from "@mui/material";

export default function ActivityUpload() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dimension_id: "",
    suggested_grade: 0,
    weight_percentage: 0,
    file: null,
  });
  const [dimensions, setDimensions] = useState([]);
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Fetch dimensions from backend
  useEffect(() => {
    fetch("http://localhost/wellness-backend/get_dimensions.php")
      .then((res) => res.json())
      .then(setDimensions)
      .catch((e) => console.log(e));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);
    setMessage("");

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      data.append(key, value)
    );
    data.append("created_by", 1); // Example admin ID

    // Use XMLHttpRequest to track progress
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost/wellness-backend/upload_activity.php", true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
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
    <Box maxWidth={600} mx="auto" mt={4}>
      <Card>
        <CardContent>
          <Typography variant="h5" mb={2} fontWeight={600}>
            Upload Monthly Activity
          </Typography>

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Activity Title */}
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

            {/* Dimension Dropdown */}
            <TextField
              select
              fullWidth
              label="Dimension"
              name="dimension_id"
              value={formData.dimension_id}
              onChange={handleChange}
              margin="normal"
              required
            >
              {dimensions.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Suggested Grade / Stage Slider */}
            <Typography mt={3} fontWeight={500}>
              Suggested Grade / Stage
            </Typography>
            <TextField
  type="number"
  fullWidth
  label="Suggested Grade / Stage"
  name="suggested_grade"
  value={formData.suggested_grade}
  onChange={handleChange}
  inputProps={{ min: 0, max: 12 }}
  margin="normal"
  sx={{
    "& .MuiInputBase-input": {
      color: "primary.main", // text color
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "primary.main", // default border
      },
      "&:hover fieldset": {
        borderColor: "primary.dark", // hover border
      },
      "&.Mui-focused fieldset": {
        borderColor: "primary.main", // focused border
      },
    },
  }}
/>


            {/* Weight / Contribution Slider */}
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
              sx={{
                color:"primary.main"
              }
              }
            />
            <Box display="flex" justifyContent="space-between" px={1}>
              <Typography variant="caption">Low Impact</Typography>
              <Typography variant="caption">High Impact</Typography>
            </Box>

            {/* File Upload */}
            <Button variant="outlined" component="label" sx={{ mt: 3 }}>
              Upload File / Image
              <input type="file" hidden name="file" onChange={handleChange} />
            </Button>

            {/* Show selected file name */}
            {formData.file && (
              <Typography mt={1} variant="body2" color="text.secondary">
                ✅ File selected: {formData.file.name}
              </Typography>
            )}

            {/* Progress Bar */}
            {uploading && (
              <Box mt={2}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" align="center" mt={1}>
                  Uploading... {uploadProgress}%
                </Typography>
              </Box>
            )}

            {/* Submit Button */}
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
          </form>

          {/* Response Message */}
          {message && (
            <Typography mt={2} color="secondary">
              {message}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
