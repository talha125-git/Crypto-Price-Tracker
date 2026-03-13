import axios from "axios";
import { API_URL } from "./api";
import { getCurrentUser } from "./auth";

export const addToWatchlist = async (coin) => {
    const user = getCurrentUser();
    if (!user) throw new Error("Please login to save watchlist");

    try {
        await axios.post(`${API_URL}/watchlist`, {
            user_id: user.id,
            coin_id: coin.id,
            coin_data: coin
        });
    } catch (error) {
        console.error("Error adding to watchlist:", error);
    }
};

export const removeFromWatchlist = async (coinId) => {
    const user = getCurrentUser();
    if (!user) return;

    try {
        await axios.delete(`${API_URL}/watchlist/${user.id}/${coinId}`);
    } catch (error) {
        console.error("Error removing from watchlist:", error);
    }
};

export const getWatchlist = async () => {
    const user = getCurrentUser();
    if (!user) return [];

    try {
        const response = await axios.get(`${API_URL}/watchlist/${user.id}`);
        return response.data.map(item => item.coin_data);
    } catch (error) {
        console.error("Error getting watchlist:", error);
        return [];
    }
};
