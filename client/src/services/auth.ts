import { api, setAuthToken } from "./api";

export const register = async (data: { email: String; password: String; name?: String }) => {
    const res = await api.post("/auth/register", data);
    const { token } = res.data || {};
    if (token) {
        try {
            localStorage.setItem("token", token);
        } catch (err) {
            
        }
        setAuthToken(token);
    }
    return res.data;
};

export const login = async (data: { email: String; password: String }) => {
    const res = await api.post("/auth/login", data);
    const { token } = res.data || {};
    if (token) {
        try {
            localStorage.setItem("token", token);
        } catch (err) {
            // ignore storage errors
        }
        setAuthToken(token);
    }
    return res.data;
};

export const logout = () => {
    try {
        localStorage.removeItem("token");
    } catch (err) {
        // ignore
    }
    setAuthToken(null);
};