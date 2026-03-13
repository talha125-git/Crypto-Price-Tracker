import { useEffect, useState } from "react";
import PriceCard from "../components/PriceCard";
import { getWatchlist, removeFromWatchlist } from "../services/watchlist";
import { getCurrentUser } from "../services/auth";
import { Link } from "react-router-dom";

const Watchlist = () => {
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadWatchlist = async () => {
            const currentUser = getCurrentUser();
            setUser(currentUser);
            if (currentUser) {
                const data = await getWatchlist();
                setWatchlist(data);
            }
            setLoading(false);
        };
        loadWatchlist();
    }, []);

    const handleRemove = async (id) => {
        await removeFromWatchlist(id);
        const updated = await getWatchlist();
        setWatchlist(updated);
    };

    if (loading) return <div className="text-white text-center mt-10 animate-pulse font-bold">Scanning Markets...</div>;

    if (!user) {
        return (
            <div className="container mx-auto p-10 text-center">
                <div className="bg-gray-800 p-10 rounded-3xl border border-gray-700 shadow-2xl inline-block max-w-lg">
                    <h1 className="text-4xl font-black text-white mb-4">Watchlist</h1>
                    <p className="text-gray-400 mb-8">Please log in to track your favorite coins in one place.</p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition">Log In</Link>
                        <Link to="/signup" className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-full font-bold transition">Sign Up</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 flex flex-col min-h-screen">
            <h1 className="text-4xl font-black text-white mb-8 text-center italic tracking-widest uppercase">Your Watchlist</h1>

            {watchlist.length === 0 ? (
                <div className="bg-gray-900/50 p-20 rounded-3xl border border-gray-800 text-center">
                    <div className="text-6xl mb-6">🔭</div>
                    <p className="text-2xl font-bold text-white mb-2">No coins under observation.</p>
                    <p className="text-gray-500 mb-8">Star some coins on the market overview to build your watchlist.</p>
                    <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-full transition shadow-lg shadow-blue-900/40">
                        View Live Prices
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {watchlist.map((coin) => (
                        <PriceCard
                            key={coin.id}
                            data={coin}
                            onRemove={handleRemove}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Watchlist;
