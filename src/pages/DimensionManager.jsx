import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Chip,
} from "@mui/material";
import { HexColorPicker } from "react-colorful";

export default function DimensionsManager() {
  const [dimensions, setDimensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState({});
  const [updating, setUpdating] = useState(null);

  // Fetch all dimensions
  useEffect(() => {
    fetch("/get_dimensions.php")
      .then((res) => res.json())
      .then((data) => {
        setDimensions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleColorChange = (id, color) => {
    setSelectedColor((prev) => ({ ...prev, [id]: color }));
  };

  const handleSaveColor = async (id) => {
    const color = selectedColor[id];
    if (!color) return;

    setUpdating(id);
    try {
      const res = await fetch(
        "/update_dimension_color.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, color }),
        }
      );
      const result = await res.json();
      if (result.success) {
        setDimensions((prev) =>
          prev.map((dim) =>
            dim.id === id.toString() ? { ...dim, color } : dim
          )
        );
      } else {
        alert(result.message || "Update failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating color.");
    } finally {
      setUpdating(null);
    }
  };

  if (loading)
    return <CircularProgress sx={{ display: "block", mx: "auto", mt: 5 }} />;

  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: "auto",
        px: { xs: 2, sm: 3 },
        py: 4,
      }}
    >
      {/* Title */}
      <Typography
        variant="h4"
        fontWeight={700}
        mb={3}
        color="primary"
        textAlign="center"
      >
        Manage Dimensions
      </Typography>

      {/* 🔹 Preview All Colors Bar */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 1.5,
          p: 2,
          mb: 4,
          borderRadius: 3,
          boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
          backgroundColor: "#fafafa",
        }}
      >
        {dimensions.map((dim) => (
          <Chip
            key={dim.id}
            label={dim.name}
            sx={{
              backgroundColor: selectedColor[dim.id] || dim.color,
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.9rem",
              px: 1.5,
              "&:hover": {
                transform: "scale(1.05)",
                transition: "0.2s",
              },
            }}
          />
        ))}
      </Box>

      {/* Dimension Cards */}
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="stretch"
      >
        {dimensions.map((dim) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={dim.id}
            sx={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Card
              sx={{
                width: "100%",
                maxWidth: 320,
                borderRadius: 4,
                boxShadow:
                  "0 4px 20px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.05)",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow:
                    "0 8px 24px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)",
                },
                textAlign: "center",
                p: 1.5,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  gutterBottom
                  sx={{ color: dim.color }}
                >
                  {dim.name}
                </Typography>

                <Box
                  sx={{
                    width: "100%",
                    height: 40,
                    borderRadius: 2,
                    backgroundColor: selectedColor[dim.id] || dim.color,
                    mb: 2,
                    border: "1px solid #ddd",
                    transition: "background-color 0.3s ease",
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <HexColorPicker
                    color={selectedColor[dim.id] || dim.color}
                    onChange={(color) => handleColorChange(dim.id, color)}
                    style={{
                      width: "100%",
                      maxWidth: 220,
                      height: 150,
                      borderRadius: "12px",
                      boxShadow: "0 0 8px rgba(0,0,0,0.05)",
                    }}
                  />
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    mt: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                    py: 1,
                    boxShadow: "none",
                  }}
                  fullWidth
                  disabled={updating === dim.id}
                  onClick={() => handleSaveColor(dim.id)}
                >
                  {updating === dim.id ? "Updating..." : "Save Color"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
