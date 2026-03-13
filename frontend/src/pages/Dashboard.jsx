import { useEffect, useState } from "react";
import PriceCard from "../components/PriceCard";
import { getFavorites, removeFromFavorites } from "../services/favorites";
import { generatePDF } from "../services/pdfGenerator";
import { getCurrentUser } from "../services/auth";
import { Link } from "react-router-dom";

const Dashboard = () => {
    const [favorites, setFavorites] = useState([]);
    const [grandTotal, setGrandTotal] = useState(0);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            const currentUser = getCurrentUser();
            setUser(currentUser);
            if (currentUser) {
                const items = await getFavorites();
                setFavorites(items);
                const total = items.reduce((acc, curr) => acc + (curr.totalValue || 0), 0);
                setGrandTotal(total);
            }
            setLoading(false);
        };
        loadDashboard();
    }, []);

    const handleRemove = async (id) => {
        await removeFromFavorites(id);
        const updatedFavs = await getFavorites();
        setFavorites(updatedFavs);
        const total = updatedFavs.reduce((acc, curr) => acc + (curr.totalValue || 0), 0);
        setGrandTotal(total);
    };

    if (loading) return <div className="text-white text-center mt-10 text-xl font-bold animate-pulse">Loading Your Portfolio...</div>;

    if (!user) {
        return (
            <div className="container mx-auto p-10 text-center">
                <div className="bg-gray-800 p-10 rounded-3xl border border-gray-700 shadow-2xl inline-block max-w-lg">
                    <h1 className="text-4xl font-black text-white mb-4">Portfolio Restricted</h1>
                    <p className="text-gray-400 mb-8">You need to be logged in to access your personal crypto dashboard and track your holdings.</p>
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-xl">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Your Dashboard</h1>
                    <p className="text-gray-400 mt-2 font-medium">Hello, <span className="text-blue-400">{user.username}</span>! Here's your portfolio status.</p>
                </div>
                <div className="mt-6 md:mt-0 text-left md:text-right border-l-4 md:border-l-0 md:border-r-4 border-green-500 pl-4 md:pr-4 md:pl-0">
                    <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold">Total Portfolio Value</h2>
                    <p className="text-4xl font-black text-white">${grandTotal.toLocaleString()}</p>
                </div>
            </div>

            {favorites.length === 0 ? (
                <div className="text-gray-400 text-center py-20 bg-gray-900 rounded-3xl border border-dashed border-gray-800">
                    <div className="text-6xl mb-4">📥</div>
                    <p className="text-2xl font-bold text-white">Your dashboard is empty.</p>
                    <p className="mt-2 text-gray-500">Add coins from the market overview to start tracking.</p>
                    <Link to="/" className="mt-8 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-full transition shadow-lg shadow-blue-900/40">
                        Browse Markets
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {favorites.map((coin) => (
                            <PriceCard
                                key={coin.id}
                                data={coin}
                                onRemove={handleRemove}
                            />
                        ))}
                    </div>
                    <div className="text-center  flex justify-end">
                        <button
                            onClick={() => generatePDF(favorites)}
                            className="group relative inline-flex items-center gap-3  text-gray-400 font-black py-1 px-12 cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export PDF Statement
                        </button>

                    </div>

                    <div className="bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl mb-12">

                        <div className="bg-gray-800/50 p-6 border-b border-gray-800 flex justify-between items-center">
                            <h3 className="text-xl font-black text-white">Holdings Summary</h3>
                            <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full uppercase font-bold tracking-tighter">Live Audit</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="bg-gray-950/50 text-gray-500 text-xs uppercase font-bold tracking-widest">
                                    <tr>
                                        <th className="px-8 py-5">Asset</th>
                                        <th className="px-8 py-5 text-right">Price</th>
                                        <th className="px-8 py-5 text-right">Quantity</th>
                                        <th className="px-8 py-5 text-right">Market Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {favorites.map((coin) => (
                                        <tr key={coin.id} className="hover:bg-gray-800/30 transition-colors">
                                            <td className="px-8 py-5 flex items-center gap-4">
                                                <div className="p-2 bg-gray-800 rounded-xl">
                                                    <img src={coin.image} alt={coin.name} className="w-8 h-8 object-contain" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-white block">{coin.name}</span>
                                                    <span className="text-xs text-gray-500 uppercase">{coin.symbol}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right text-gray-300 font-medium">${coin.current_price.toLocaleString()}</td>
                                            <td className="px-8 py-5 text-right text-white font-bold">{coin.quantity}</td>
                                            <td className="px-8 py-5 text-right text-green-400 font-black">
                                                ${(coin.totalValue || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-800/80 text-white font-bold">
                                    <tr>
                                        <td className="px-8 py-6" colSpan="2">Net Worth</td>
                                        <td className="px-8 py-6 text-right">
                                            {favorites.reduce((acc, c) => acc + (parseFloat(c.quantity) || 0), 0).toFixed(1)}
                                        </td>
                                        <td className="px-8 py-6 text-right text-2xl font-black text-blue-400">
                                            ${grandTotal.toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <div className="text-center pb-20">
                        <button
                            onClick={() => generatePDF(favorites)}
                            className="group relative inline-flex items-center gap-3 cursor-pointer bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-black py-4 px-12 rounded-2xl shadow-2xl shadow-blue-900/30 transition-all transform hover:-translate-y-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export PDF Statement
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
