import { getAuth } from "firebase/auth";
import { getApiBaseUrl } from "../config/apiConfig";

const getOrdersUrl = () => `${getApiBaseUrl()}/orders`;


const getHeaders = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
        throw new Error("Authentication required. Please sign in.");
    }
    const token = await currentUser.getIdToken();
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};

// Create a new order
export const createOrder = async (orderData) => {
    const headers = await getHeaders();
    const response = await fetch(getOrdersUrl(), {
        method: "POST",
        headers,
        body: JSON.stringify(orderData)
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to place order.");
    }
    return data;
};

// Fetch orders placed by the current user
export const fetchUserOrders = async () => {
    const headers = await getHeaders();
    const response = await fetch(getOrdersUrl(), {
        method: "GET",
        headers
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch orders.");
    }
    return data.orders || [];
};

// Admin: Fetch all orders
export const fetchAdminOrders = async () => {
    const headers = await getHeaders();
    const response = await fetch(`${getOrdersUrl()}/admin`, {
        method: "GET",
        headers
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch admin orders.");
    }
    return data.orders || [];
};
// Admin: Fetch sales summary for dashboard
export const fetchSalesSummary = async () => {
    const headers = await getHeaders();

    const response = await fetch(`${getOrdersUrl()}/admin/sales-summary`, {
        method: "GET",
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch sales summary.");
    }

    return data;
};
// Admin: Update order status
export const updateOrderStatus = async (orderId, status) => {
    const headers = await getHeaders();
    const response = await fetch(`${getOrdersUrl()}/admin/${orderId}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to update order status.");
    }
    return data;
};
