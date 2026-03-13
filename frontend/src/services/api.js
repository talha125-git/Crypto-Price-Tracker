import axios from "axios";

// Uses VITE_API_URL env variable in production, falls back to localhost in dev
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getPrices = () => axios.get(`${API_URL}/prices`);
export const getCoins = () => axios.get(`${API_URL}/coins`);