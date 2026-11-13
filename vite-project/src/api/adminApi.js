import { getApiBaseUrl } from "../config/apiConfig";

const getApiUrl = () => `${getApiBaseUrl()}/users`;

export const checkAdminStatus = async (token) => {
    const response = await fetch(
        `${getApiUrl()}/admin-check`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();
    return data;
};