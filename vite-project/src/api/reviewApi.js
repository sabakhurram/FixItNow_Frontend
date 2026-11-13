import { getAuth } from "firebase/auth";
import { getApiBaseUrl } from "../config/apiConfig";

const getReviewsUrl = () => `${getApiBaseUrl()}/reviews`;

export const getSiteReviews = async () => {
  const res = await fetch(`${getReviewsUrl()}/site`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch site reviews");
  return data.reviews || [];
};

export const getProductReviews = async (productId) => {
  const res = await fetch(`${getReviewsUrl()}/product/${productId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch product reviews");
  return data.reviews || [];
};

export const submitReview = async (reviewData) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const headers = { "Content-Type": "application/json" };
  if (currentUser) {
    const token = await currentUser.getIdToken();
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(getReviewsUrl(), {
    method: "POST",
    headers,
    body: JSON.stringify(reviewData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to submit review");
  return data.review;
};

export const getAllReviewsAdmin = async () => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not logged in");
  const token = await currentUser.getIdToken();

  const res = await fetch(`${getReviewsUrl()}/admin`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch admin reviews");
  return data.reviews || [];
};

export const updateReviewAdmin = async (id, updateFields) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not logged in");
  const token = await currentUser.getIdToken();

  const res = await fetch(`${getReviewsUrl()}/admin/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(updateFields)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update review");
  return data.review;
};

export const deleteReviewAdmin = async (id) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("User not logged in");
  const token = await currentUser.getIdToken();

  const res = await fetch(`${getReviewsUrl()}/admin/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete review");
  return data;
};

// Feature 7: Submit rating & review for an assigned technician
export const submitTechnicianReview = async (reviewData) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Please sign in to rate your technician.");
  const token = await currentUser.getIdToken();

  const res = await fetch(`${getReviewsUrl()}/technician`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(reviewData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to submit technician review");
  return data;
};
