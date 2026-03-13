import axios from "axios";
import { API_URL } from "./api";

const CURRENT_USER_KEY = "crypto_current_user";

export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, {
            username: userData.name, // Mapping 'name' from frontend to 'username' for backend
            email: userData.email,
            password: userData.password
        });

        // After successful registration, we might want to log them in automatically
        // or just return the response. Often it's better to make them login.
        // But for better UX, let's login right away if the backend allowed it.
        const user = {
            id: response.data.id,
            username: userData.name,
            email: userData.email
        };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return user;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Registration failed");
    }
};

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            email,
            password
        });

        const user = response.data;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return user;
    } catch (error) {
        throw new Error(error.response?.data?.detail || "Invalid email or password");
    }
};

export const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
};
