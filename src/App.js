import React from "react";
import AppRouter from "./routes/Approuter";
import CustomThemeProvider from "./theme/ThemeProvider";
import { AuthProvider } from "./auth/AuthContext";
import "./App.css";
export default function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </CustomThemeProvider>
  );
}
