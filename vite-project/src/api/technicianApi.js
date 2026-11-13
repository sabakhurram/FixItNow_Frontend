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

// Feature 1, 3, 6: Fetch assigned services with filtering & sorting
export const fetchAssignedServices = async (params = {}) => {
  const headers = await getAuthHeaders();
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${getApiBaseUrl()}/technician/assigned-services?${query}`, {
    method: "GET",
    headers
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to fetch assigned services.");
  }
  return data.services || [];
};

// Feature 3: Update assigned service status (In Progress, Completed with notes)
export const updateAssignedServiceStatus = async (type, id, payload) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/technician/services/${type}/${id}/status`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to update service status.");
  }
  return data;
};

// Feature 2: Fetch technician's own customer directory
export const fetchTechnicianCustomers = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/technician/customers`, {
    method: "GET",
    headers
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to fetch customers.");
  }
  return data.customers || [];
};

// Feature 4: Send reminder email to customer via Brevo
export const sendServiceReminder = async (reminderData) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/technician/reminders/send`, {
    method: "POST",
    headers,
    body: JSON.stringify(reminderData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to send reminder email.");
  }
  return data;
};

// Feature 5: Fetch dashboard metrics & completion history
export const fetchTechnicianDashboardStats = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/technician/dashboard-stats`, {
    method: "GET",
    headers
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to fetch dashboard metrics.");
  }
  return data.stats || {};
};

// Feature 7: Fetch reviews received by the technician
export const fetchTechnicianReviews = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/technician/my-reviews`, {
    method: "GET",
    headers
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to fetch reviews.");
  }
  return data.reviews || [];
};

// Feature 1: Admin assigns a technician to a service ticket
export const assignTechnicianToService = async (serviceType, serviceId, technicianId) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/services/${serviceType}/${serviceId}/assign`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ technician_id: technicianId })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to assign technician.");
  }
  return data;
};

// Fetch active technicians list (for admin dropdown)
export const fetchAllTechnicians = async () => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getApiBaseUrl()}/users/technicians`, {
    method: "GET",
    headers
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch technicians list.");
  }
  return data.technicians || [];
};

