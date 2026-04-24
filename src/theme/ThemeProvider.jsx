import React from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

const palette = {
  primary: { main: "#0F766E" },
  secondary: { main: "#F97316" },
  background: {
    default: "#F3F7F6",
    paper: "#FFFFFF",
  },
  warning: { main: "#D97706" },
  error: { main: "#DC2626" },
  success: { main: "#15803D" },
  text: {
    primary: "#102A27",
    secondary: "#55706C",
  },
  divider: "rgba(16, 42, 39, 0.08)",
};

const typography = {
  fontFamily: "'Manrope', 'Segoe UI', sans-serif",
  h1: { fontWeight: 800, letterSpacing: "-0.04em" },
  h2: { fontWeight: 800, letterSpacing: "-0.04em" },
  h3: { fontWeight: 700, letterSpacing: "-0.03em" },
  h4: { fontWeight: 700, letterSpacing: "-0.03em" },
  h5: { fontWeight: 700, letterSpacing: "-0.02em" },
  h6: { fontWeight: 700, letterSpacing: "-0.02em" },
  subtitle1: { fontWeight: 600 },
  subtitle2: { fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" },
  body1: { fontWeight: 500, lineHeight: 1.7 },
  body2: { fontWeight: 500, lineHeight: 1.6 },
  button: { textTransform: "none", fontWeight: 700 },
};

const theme = createTheme({
  palette,
  typography,
  shape: {
    borderRadius: 20,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            "radial-gradient(circle at top left, rgba(15,118,110,0.14), transparent 28%), radial-gradient(circle at top right, rgba(249,115,22,0.12), transparent 24%), linear-gradient(180deg, #f7fbfa 0%, #edf5f3 100%)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          border: "1px solid rgba(16, 42, 39, 0.08)",
          boxShadow: "0 18px 50px rgba(16, 42, 39, 0.08)",
          backgroundColor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(14px)",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 18,
          paddingBlock: 10,
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)",
          color: "#fff",
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #EA580C 0%, #FB923C 100%)",
          color: "#fff",
        },
        outlined: {
          borderColor: "rgba(15,118,110,0.2)",
          backgroundColor: "rgba(255,255,255,0.68)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: "rgba(255,255,255,0.9)",
        },
        notchedOutline: {
          borderColor: "rgba(16, 42, 39, 0.12)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
        },
      },
    },
  },
});

export default function CustomThemeProvider({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
