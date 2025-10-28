import { api } from "./api";

export const register = async (data: {email:String; password:String; name?:String}) => {
    const res = await api.post("/auth/register", data);
    return res.data;
};

export const login = async (data: {email:String; password:String;}) => {
    const res = await api.post("/auth/login", data);
    return res.data;
};