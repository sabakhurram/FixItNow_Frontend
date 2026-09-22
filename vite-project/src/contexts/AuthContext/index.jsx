import React, {
  useContext,
  useState,
  useEffect
} from "react";

import { auth } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

export const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  // Automatically syncs the authenticated user with the backend
  const syncUserWithBackend = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();

      const response = await fetch(
        "https://fixitnowbackend-production.up.railway.app/api/users/sync",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
          `Sync failed with status: ${response.status}. Details: ${
            errorData.details ||
            errorData.error ||
            "Unknown error"
          }`
        );
      }

      const data = await response.json();

      console.log("Backend user sync successful:", data);

    } catch (error) {
      console.error("Error syncing user with backend:", error);
    }
  };


  // Gets the user's actual role from the backend
  const getUserRole = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();

      const response = await fetch(
        "https://fixitnowbackend-production.up.railway.app/api/users/profile",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to get user profile: ${response.status}`
        );
      }

      const data = await response.json();

      const role = data.user?.role;

      console.log("User role:", role);

      setUserRole(role || null);

    } catch (error) {
      console.error("Failed to get user role:", error);
      setUserRole(null);
    }
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      initializeUser
    );

    return unsubscribe;
  }, []);


  async function initializeUser(user) {
    if (user) {

      setCurrentUser(user);
      setUserLoggedIn(true);

      // First make sure the user exists in Supabase
      await syncUserWithBackend(user);

      // Then retrieve the user's role
      await getUserRole(user);

    } else {

      setCurrentUser(null);
      setUserLoggedIn(false);
      setUserRole(null);

    }

    setLoading(false);
  }


  const value = {
    currentUser,
    userLoggedIn,
    loading,
    userRole,

    // Keep isAdmin available so existing components
    // using it don't immediately break.
    isAdmin: userRole === "admin",
  };


  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}