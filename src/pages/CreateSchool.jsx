import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { API_BASE_URL, authFetch } from "../auth/authService";

const CreateSchool = () => {
  const [form, setForm] = useState({
    school_name: "",
    email: "",
    address: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await authFetch(`${API_BASE_URL}/create_school.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create school");
      }

      setResult(data);
      setForm({ school_name: "", email: "", address: "" });
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)", // keeps it centered under header/sidebar
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        pt: 6,
        px: 2,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 520 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Create School Account
        </Typography>

        <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
          <TextField
            fullWidth
            label="School Name"
            name="school_name"
            value={form.school_name}
            onChange={handleChange}
            sx={{ mb: 2.5 }}
          />

          <TextField
            fullWidth
            label="School Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            sx={{ mb: 2.5 }}
          />

          <TextField
            fullWidth
            label="Address (optional)"
            name="address"
            value={form.address}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ py: 1.2 }}
          >
            {loading ? "Creating..." : "Create School"}
          </Button>

          {/* Success */}
          {result?.success && (
            <Alert severity="success" sx={{ mt: 3 }}>
              <strong>School created successfully</strong>
              <br />
              Email: {result.email}
              <br />
              Temporary Password: <strong>{result.password}</strong>
              <br />
              <em>Copy this password now – it will not be shown again.</em>
            </Alert>
          )}

          {/* Error */}
          {result?.error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {result.error}
            </Alert>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default CreateSchool;
