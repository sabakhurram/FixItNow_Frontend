import { auth } from "../firebase/firebase";
import { getApiBaseUrl } from "../config/apiConfig";

const getAuthHeaders = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Authentication required. Please sign in.");
  }
  const token = await currentUser.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
};

// Feature 8: Fetch user & global notifications
export const fetchNotifications = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/notifications`, {
    method: "GET",
    headers
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch notifications.");
  }
  return data.notifications || [];
};

// Mark single notification as read
export const markNotificationAsRead = async (id) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/notifications/${id}/read`, {
    method: "PATCH",
    headers
  });
  const data = await res.json();
  return data;
};

// Mark all as read
export const markAllNotificationsAsRead = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/notifications/mark-all-read`, {
    method: "PATCH",
    headers
  });
  const data = await res.json();
  return data;
};

// Admin: Broadcast a notification to all or target role
export const broadcastGlobalNotification = async (payload) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/notifications/broadcast`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to broadcast notification.");
  }
  return data;
};

