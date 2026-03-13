import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/auth";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await login(formData.email, formData.password);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6">
            <div className="bg-gray-900 border border-gray-800 p-10 rounded-3xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Welcome Back</h2>
                    <p className="text-gray-500 font-medium">Log in to track your assets in real-time</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm font-bold text-center">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-500 ml-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="name@company.com"
                            className="w-full bg-gray-800 border border-transparent focus:border-blue-500 text-white rounded-2xl p-4 focus:outline-none transition-all placeholder-gray-600"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-500 ml-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="••••••••"
                            className="w-full bg-gray-800 border border-transparent focus:border-blue-500 text-white rounded-2xl p-4 focus:outline-none transition-all placeholder-gray-600"
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition shadow-xl shadow-blue-900/30 transform active:scale-95"
                    >
                        Access Account
                    </button>
                </form>

                <p className="text-gray-500 text-center mt-8 font-medium">
                    New here? <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-bold transition">Create an Account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
