import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AdminProtectedRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!userRole) {
    return <p>Checking account permissions...</p>;
  }

  if (userRole !== "admin") {
    if (userRole === "user") {
      return <Navigate to="/dashboard" replace />;
    }

    if (userRole === "technician") {
      return <Navigate to="/technician/dashboard" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminProtectedRoute;