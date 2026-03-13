import axios from "axios";
import { API_URL } from "./api";
import { getCurrentUser } from "./auth";

export const addToFavorites = async (coin, quantity = 0) => {
    const user = getCurrentUser();
    if (!user) throw new Error("Please login to save favorites");

    try {
        await axios.post(`${API_URL}/favorites`, {
            user_id: user.id,
            coin_id: coin.id,
            coin_data: {
                ...coin,
                quantity: parseFloat(quantity),
                totalValue: coin.current_price * parseFloat(quantity)
            }
        });
    } catch (error) {
        console.error("Error adding favorite:", error);
    }
};

export const removeFromFavorites = async (coinId) => {
    const user = getCurrentUser();
    if (!user) return;

    try {
        await axios.delete(`${API_URL}/favorites/${user.id}/${coinId}`);
    } catch (error) {
        console.error("Error removing favorite:", error);
    }
};

export const getFavorites = async () => {
    const user = getCurrentUser();
    if (!user) return [];

    try {
        const response = await axios.get(`${API_URL}/favorites/${user.id}`);
        return response.data.map(item => item.coin_data);
    } catch (error) {
        console.error("Error getting favorites:", error);
        return [];
    }
};
