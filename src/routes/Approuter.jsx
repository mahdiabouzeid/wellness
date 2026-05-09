import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import AdminLayout from "../components/layout/AdminLayout";

// Import your pages
import LoginPage from "../pages/LoginPage";
import AdminDashboard from "../pages/AdminDashboard";
import SchoolDashboard from "../pages/SchoolDashboard";
import ActivityUpload from "../pages/ActivityUpload";

import ReportsAnalytics from "../pages/ReportsAnalytics";
import Recommendations from "../pages/Recommendations";
import Notifications from "../pages/Notifications";
import ProfileSettings from "../pages/ProfileSettings";
import SchoolActivitiesPage from "../pages/SchoolActivitiesPage";
import DimensionsManager from "../pages/DimensionManager";
import SchoolActivity from "../pages/SchoolActivity";
import UploadEvidence from "../pages/UploadEvidence";
import AdminDisplayActivities from "../pages/AdminDisplayActivities";
import CreateSchool from "../pages/CreateSchool"

const adminPage = (page, title) => (
  <AdminRoute>
    <AdminLayout title={title}>{page}</AdminLayout>
  </AdminRoute>
);

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/school-dashboard" element={<ProtectedRoute roles={["school_leader"]}><SchoolDashboard /></ProtectedRoute>} />
        <Route path="/activity-upload" element={adminPage(<ActivityUpload />, "Upload Activities")} />
    
        <Route path="/reports" element={adminPage(<ReportsAnalytics />, "Reports")} />
        <Route path="/recommendations" element={adminPage(<Recommendations />, "Recommendations")} />
        <Route path="/notifications" element={adminPage(<Notifications />, "Notifications")} />
        <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
        <Route path="/school-activity-page" element={adminPage(<SchoolActivitiesPage />, "School Activities")} />
        <Route path="/dimension-manager"element={adminPage(<DimensionsManager />, "Dimensions")}/>
        <Route path="/school-activity"element={<ProtectedRoute roles={["school_leader"]}><SchoolActivity /></ProtectedRoute>}/>
        <Route path="/evidence-upload" element={<ProtectedRoute roles={["school_leader"]}><UploadEvidence /></ProtectedRoute>}/>
        <Route path="/display-activities"element={adminPage(<AdminDisplayActivities />, "Activities")}/>
        <Route path="/create-school" element={adminPage(<CreateSchool />, "Create School")} />
        {/* Fallback for any unknown route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
