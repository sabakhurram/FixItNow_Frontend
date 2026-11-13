/**
 * Centralized API Base URL configuration.
 * Dynamically switches between localhost (port 5000) and Railway production.
 */
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.startsWith("192.168."))
  ) {
    return "http://localhost:5000/api";
  }
  return "https://fixitnowbackend-production.up.railway.app/api";
};

export const API_BASE_URL = getApiBaseUrl();
export default getApiBaseUrl;

