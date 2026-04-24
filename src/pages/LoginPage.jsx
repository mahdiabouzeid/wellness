import React, { useState } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./login.css";
import leftImage from "../assets/loginImage.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("https://wellness.alwaysdata.net/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.user.school_id) {
          localStorage.setItem("school_id", data.user.school_id);
        }

        if (data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else if (data.user.role === "school_leader") {
          navigate("/school-dashboard");
        } else {
          setError("Unknown user role");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setLoading(false);
      setError("Error connecting to the server");
      console.error(err);
    }
  };

  return (
    <Box className="login-container">
      <Box className="left-section">
        <img src={leftImage} alt="Wellness dashboard illustration" className="left-image" />
      </Box>

      <Paper elevation={0} className="right-section">
        <Chip
          label="Wellness Tracker"
          sx={{
            mb: 2,
            backgroundColor: "rgba(15,118,110,0.08)",
            color: "#0F766E",
          }}
        />
        <Typography variant="h3" sx={{ mb: 1 }}>
          Welcome back
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to review wellness insights, activities, and recommendations.
        </Typography>

        <Box component="form" className="login-form" onSubmit={handleLogin}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3, minHeight: 54 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
