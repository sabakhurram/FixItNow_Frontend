import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const TechnicianProtectedRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!currentUser) {
    return <Navigate to="/technician/login" replace />;
  }

  if (!userRole) {
    return <p>Checking account permissions...</p>;
  }

  if (userRole === "technician") {
    return children;
  }

  if (userRole === "user") {
    return <Navigate to="/dashboard" replace />;
  }

  if (userRole === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
};

export default TechnicianProtectedRoute;

