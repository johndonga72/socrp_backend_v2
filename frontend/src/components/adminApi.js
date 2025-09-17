// src/api/adminApi.js
import axios from "axios";
const apiBase = process.env.REACT_APP_API_URL;

// 1️⃣ Create Axios instance
const API = axios.create({
    baseURL: "${apiBase}/api", // Django backend URL (no trailing slash)
});

// 2️⃣ Add JWT token automatically if present in localStorage
API.interceptors.request.use((req) => {
    const token = localStorage.getItem("admin_access_token"); // use admin token
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// 3️⃣ Admin APIs
export const fetchDashboard = () => API.get("/admin/stats/");
export const fetchUsers = () => API.get("/admin/users/");
export const fetchUserDetail = (id) => API.get(`/admin/users/${id}/`);
export const blockUnblockUser = (id) => API.post(`/admin/users/${id}/block/`);
export const editUser = (id, data) => API.put(`/admin/users/${id}/edit/`, data);

// 4️⃣ Optional: Catch errors centrally (like 403)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403) {
            console.error("Access denied: 403 - Check admin token or permissions");
        }
        return Promise.reject(error);
    }
);

export default API;

