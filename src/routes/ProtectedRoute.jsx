import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, initializing, isAuthenticated } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (roles?.length && !roles.includes(user?.role)) {
    const fallback = user?.role === "admin" ? "/admin-dashboard" : "/school-dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
