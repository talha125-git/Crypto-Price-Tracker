import { useEffect, useState } from "react";
import { getCoins } from "../services/api";
import { addToFavorites, getFavorites } from "../services/favorites";
import { addToWatchlist, removeFromWatchlist, getWatchlist } from "../services/watchlist";
import Modal from "../components/Modal";
import { getCurrentUser } from "../services/auth";

const Home = () => {
    const [coins, setCoins] = useState([]);
    const [filteredCoins, setFilteredCoins] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [favorites, setFavorites] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const user = getCurrentUser();
                if (user) {
                    const favs = await getFavorites();
                    const watch = await getWatchlist();
                    setFavorites(favs);
                    setWatchlist(watch);
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
            }

            try {
                const response = await getCoins();
                if (response && Array.isArray(response.data)) {
                    setCoins(response.data);
                    setFilteredCoins(response.data);
                } else {
                    setError("Unexpected response from server");
                }
            } catch (err) {
                console.error("Failed to fetch coins:", err);
                setError("Failed to fetch top coins. Is the backend running?");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    // ✅ Search/filter logic
    useEffect(() => {
        const query = search.toLowerCase().trim();
        if (!query) {
            setFilteredCoins(coins);
        } else {
            setFilteredCoins(
                coins.filter(
                    (coin) =>
                        coin.name.toLowerCase().includes(query) ||
                        coin.symbol.toLowerCase().includes(query)
                )
            );
        }
    }, [search, coins]);

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

            {/* ✅ Search Bar */}
            <div className="relative mb-6 max-w-md ml-auto">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or symbol... (e.g. Bitcoin, BTC)"
                    className="w-full bg-gray-900 border border-gray-700 focus:border-blue-500 text-white rounded-xl pl-11 pr-10 py-3 focus:outline-none transition-all placeholder-gray-500"
                />
                {/* Clear button */}
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* No results message */}
            {filteredCoins.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    <div className="text-5xl mb-4">🪙</div>
                    <p className="text-xl font-bold text-white">No coins found for "{search}"</p>
                    <p className="text-gray-500 mt-2">Try searching by full name or ticker symbol</p>
                    <button
                        onClick={() => setSearch("")}
                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold transition"
                    >
                        Clear Search
                    </button>
                </div>
            )}

            {filteredCoins.length > 0 && (
                <div className="overflow-x-auto shadow-2xl rounded-2xl bg-gray-900 border border-gray-800">
                    {/* Results count */}
                    {search && (
                        <div className="px-6 py-3 border-b border-gray-800 text-sm text-gray-400">
                            Found <span className="text-white font-bold">{filteredCoins.length}</span> result{filteredCoins.length !== 1 ? 's' : ''} for "<span className="text-blue-400">{search}</span>"
                        </div>
                    )}
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
                            {filteredCoins.map((coin) => {
                                const change = coin.price_change_percentage_24h ?? 0;
                                const price = coin.current_price ?? 0;
                                const marketCap = coin.market_cap ?? 0;

                                return (
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
                                            ${price.toLocaleString()}
                                        </td>
                                        <td className={`py-4 px-6 text-right font-bold ${change > 0 ? "text-green-500" : "text-red-500"}`}>
                                            {change > 0 ? '+' : ''}{change.toFixed(2)}%
                                        </td>
                                        <td className="py-4 px-6 text-right text-gray-400">
                                            ${marketCap.toLocaleString()}
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
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Home;