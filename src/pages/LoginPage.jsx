import React, { useState } from "react";
import { TextField, Button, Paper, Typography, Box, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./login.css";
import leftImage from "../assets/loginImage.png"; // your left-side image

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
      const response = await fetch("/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        // Store token and user in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
           // ✅ Store school_id if user is a school_leader
           if (data.user.school_id) {
            localStorage.setItem("school_id", data.user.school_id);
          }
        // Navigate based on role
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
      {/* Left Side Image */}
      <Box className="left-section">
        <img src={leftImage} alt="Illustration" className="left-image" />
      </Box>

      {/* Right Side Login Form */}
      <Paper elevation={3} className="right-section">
        <Typography variant="h5" color="primary" gutterBottom>
          Welcome Back!
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
            color="primary"
            fullWidth
            sx={{ borderRadius: 5, marginTop: 2 }}
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
