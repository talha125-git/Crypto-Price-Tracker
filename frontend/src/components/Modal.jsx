import { useState, useEffect } from "react";

const Modal = ({ isOpen, onClose, onConfirm, coin }) => {
    const [quantity, setQuantity] = useState("");
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setQuantity("");
            setTotal(0);
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const val = e.target.value;
        setQuantity(val);
        setTotal((parseFloat(val) || 0) * (coin?.current_price || 0));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const qty = parseFloat(quantity);
        if (qty > 0) {
            onConfirm(qty);
        }
    };

    if (!isOpen || !coin) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all scale-100 relative overflow-hidden">

                {/* Decorative Glow */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="flex items-center gap-4 mb-6 relative z-10">
                    <img src={coin.image} alt={coin.name} className="w-12 h-12" />
                    <div>
                        <h2 className="text-2xl font-bold text-white">Add {coin.name}</h2>
                        <p className="text-gray-400 text-sm">{coin.symbol?.toUpperCase()}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                    <div>
                        <label className="block text-gray-400 text-xs uppercase tracking-wider font-bold mb-2">
                            Quantity to Buy
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={quantity}
                                onChange={handleChange}
                                step="any"
                                min="0"
                                autoFocus
                                required
                                className="w-full bg-gray-950/50 border pr-16 border-gray-600 text-white text-lg rounded-xl p-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
                                placeholder="0.00"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                                {coin.symbol?.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="bg-gray-700/30 rounded-xl p-4 flex justify-between items-center border border-gray-700">
                        <span className="text-gray-400 font-medium">Estimated Total</span>
                        <span className="text-2xl font-bold text-green-400">
                            ${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 cursor-pointer bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 cursor-pointer bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition duration-200"
                        >
                            Confirm Add
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Modal;
