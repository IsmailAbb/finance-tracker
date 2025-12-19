import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

export const setAuthToken = (token?: string | null) => {
    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common["Authorization"];
    }
};

// initialize from localStorage if available
try {
    const stored = localStorage.getItem("token");
    if (stored) setAuthToken(stored);
} catch (err) {
    // ignore (server or restricted environments)
}