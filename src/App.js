import React from "react";
import AppRouter from "./routes/Approuter";
import CustomThemeProvider from "./theme/ThemeProvider";
import "./App.css";
export default function App() {
  return (
    <CustomThemeProvider>
      <AppRouter />
    </CustomThemeProvider>
  );
}
