import React from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

// Palette
const palette = {
  primary: { main: "#4F46E5" },   // Indigo / Purple
  secondary: { main: "#22C55E" }, // Green
  background: {
    default: "#FFFFFF", // ✅ same as paper
    paper: "#FFFFFF",
  },
  warning: { main: "#FACC15" },   // Yellow alerts
  error: { main: "#EF4444" },     // Red alerts
  success: { main: "#22C55E" },   // Green success
  text: {
    primary: "#111827",
    secondary: "#6B7280",
  },
};

// Typography
const typography = {
  fontFamily: "'Poppins', 'Inter', sans-serif",
  h1: { fontWeight: 700 },
  h2: { fontWeight: 600 },
  h3: { fontWeight: 500 },
  body1: { fontWeight: 400 },
  body2: { fontWeight: 400 },
  button: { textTransform: "none", fontWeight: 600 },
};

const theme = createTheme({ palette, typography });

export default function CustomThemeProvider({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Resets browser defaults and applies theme */}
      {children}
    </ThemeProvider>
  );
}
