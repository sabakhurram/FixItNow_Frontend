import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { userLoggedIn, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080b13",
          color: "#ffffff",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <p>Loading session...</p>
      </div>
    );
  }

  // Not logged in
  if (!userLoggedIn) {
    return (
      <Navigate
        to="/signin"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // User is logged in, but role is still being retrieved
  if (!userRole) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080b13",
          color: "#ffffff",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <p>Checking account permissions...</p>
      </div>
    );
  }

  // Customer only
  if (userRole === "user") {
    return children;
  }

  // Admin trying to access customer dashboard
  if (userRole === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Technician trying to access customer dashboard
  if (userRole === "technician") {
    return <Navigate to="/technician/dashboard" replace />;
  }

  // Unknown role
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;