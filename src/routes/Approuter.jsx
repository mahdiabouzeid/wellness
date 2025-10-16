import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import your pages
import LoginPage from "../pages/LoginPage";
import AdminDashboard from "../pages/AdminDashboard";
import SchoolDashboard from "../pages/SchoolDashboard";
import ActivityUpload from "../pages/ActivityUpload";
import ActivitySelection from "../pages/ActivitySelection";
import ReportsAnalytics from "../pages/ReportsAnalytics";
import Recommendations from "../pages/Recommendations";
import Notifications from "../pages/Notifications";
import ProfileSettings from "../pages/ProfileSettings";
import SchoolActivitiesPage from "../pages/SchoolActivitiesPage";
import ActivityUploading from "../pages/ActivityUpload";
import DimensionsManager from "../pages/DimensionManager";
import SchoolActivity from "../pages/SchoolActivity";
import UploadEvidence from "../pages/UploadEvidence";
import AdminDisplayActivities from "../pages/AdminDisplayActivities";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/school-dashboard" element={<SchoolDashboard />} />
        <Route path="/activity-upload" element={<ActivityUpload />} />
        <Route path="/activity-selection" element={<ActivitySelection />} />
        <Route path="/reports" element={<ReportsAnalytics />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/school-activity-page" element={ <SchoolActivitiesPage />} />
        <Route path="/dimension-manager"element={<DimensionsManager/>}/>
        <Route path="/school-activity"element={<SchoolActivity/>}/>
        <Route path="/evidence-upload" element={<UploadEvidence/>}/>
        <Route path="/display-activities"element={<AdminDisplayActivities/>}/>
       
        {/* Fallback for any unknown route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
