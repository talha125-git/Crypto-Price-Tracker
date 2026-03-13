import { useEffect, useState } from "react";
import { getCoins } from "../services/api";
import { addToFavorites, getFavorites } from "../services/favorites";
import { addToWatchlist, removeFromWatchlist, getWatchlist } from "../services/watchlist";
import Modal from "../components/Modal";
import { getCurrentUser } from "../services/auth";

const Home = () => {
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [favorites, setFavorites] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState(null);

    useEffect(() => {
        const load = async () => {
            console.log("Home component mounted, fetching data...");
            try {
                // Fetch User Data
                const user = getCurrentUser();
                if (user) {
                    console.log("User logged in, fetching favorites and watchlist");
                    const favs = await getFavorites();
                    const watch = await getWatchlist();
                    setFavorites(favs);
                    setWatchlist(watch);
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
            }

            try {
                console.log("Fetching coins from API...");
                const response = await getCoins();
                console.log("API response received:", response);
                if (response && Array.isArray(response.data)) {
                    setCoins(response.data);
                } else {
                    console.error("Unexpected response format:", response);
                    setError("Unexpected response from server");
                }
            } catch (err) {
                console.error("Failed to fetch coins:", err);
                setError("Failed to fetch top coins. Is the backend running?");
            } finally {
                console.log("Setting loading to false");
                setLoading(false);
            }
        };

        load();
    }, []);

    const onAddClick = (coin) => {
        const user = getCurrentUser();
        if (!user) {
            alert("Please log in to add coins to your dashboard.");
            return;
        }
        setSelectedCoin(coin);
        setModalOpen(true);
    };

    const handleConfirmAdd = async (quantity) => {
        if (selectedCoin) {
            await addToFavorites(selectedCoin, quantity);
            const favs = await getFavorites();
            setFavorites(favs);
            setModalOpen(false);
            setSelectedCoin(null);
        }
    };

    const toggleWatchlist = async (coin) => {
        const user = getCurrentUser();
        if (!user) {
            alert("Please log in to add coins to your watchlist.");
            return;
        }

        if (isWatchlist(coin.id)) {
            await removeFromWatchlist(coin.id);
        } else {
            await addToWatchlist(coin);
        }
        const watch = await getWatchlist();
        setWatchlist(watch);
    };

    const isWatchlist = (id) => watchlist.some((w) => w.id === id);

    if (loading) return <div className="text-white text-center mt-10">Loading...</div>;
    if (error && coins.length === 0) return <div className="text-red-500 text-center mt-10">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirmAdd}
                coin={selectedCoin}
            />
            <h1 className="text-3xl font-bold text-white mb-6 text-center">Market Overview</h1>
            <div className="overflow-x-auto shadow-2xl rounded-2xl bg-gray-900 border border-gray-800">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-800 text-gray-400 text-xs uppercase font-medium">
                        <tr>
                            <th className="py-4 px-6 text-center w-16">★</th>
                            <th className="py-4 px-6">Coin</th>
                            <th className="py-4 px-6 text-right">Price</th>
                            <th className="py-4 px-6 text-right">24h Change</th>
                            <th className="py-4 px-6 text-right">Market Cap</th>
                            <th className="py-4 px-6 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {Array.isArray(coins) && coins.map((coin) => (
                            <tr key={coin.id} className="hover:bg-gray-800 transition-colors group">
                                <td className="py-4 px-6 text-center">
                                    <button
                                        onClick={() => toggleWatchlist(coin)}
                                        className={`text-2xl transition transform hover:scale-125 ${isWatchlist(coin.id) ? 'text-yellow-400' : 'text-gray-600'}`}
                                    >
                                        ★
                                    </button>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <span className="font-bold text-white block">{coin.name}</span>
                                            <span className="text-xs text-gray-500 uppercase">{coin.symbol}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-right text-white font-medium">
                                    ${coin.current_price.toLocaleString()}
                                </td>
                                <td
                                    className={`py-4 px-6 text-right font-bold ${coin.price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"}`}
                                >
                                    {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                                </td>
                                <td className="py-4 px-6 text-right text-gray-400">
                                    ${coin.market_cap.toLocaleString()}
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <button
                                        onClick={() => onAddClick(coin)}
                                        className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition shadow-lg shadow-blue-900/20"
                                    >
                                        Add to Dashboard
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Home;
