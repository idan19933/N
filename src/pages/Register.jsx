// src/pages/Register.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Rocket, Sparkles, CheckCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Register = () => {
    console.log('📝 Register component rendering');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const register = useAuthStore(state => state.register);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            console.log('📝 Already authenticated in Register - redirecting to dashboard');
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('📝 Registration form submitted:', formData.email);

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        const result = await register(formData.email, formData.password, formData.name);
        console.log('📝 Registration result:', result);

        if (result.success) {
            toast.success('Account created! 🎉 Setting up your profile...');
            console.log('📝 Registration successful - about to navigate');

            // Small delay to ensure state updates
            setTimeout(() => {
                console.log('🚀 Navigating to /dashboard (will redirect to onboarding for new users)');
                navigate('/dashboard', { replace: true });
            }, 100);
        } else {
            toast.error(result.error || 'Registration failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
                    transition={{ duration: 25, repeat: Infinity }}
                    className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Logo */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/50">
                        <Rocket className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Start Learning</h1>
                    <p className="text-gray-400 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                        Join thousands of AI-powered learners
                    </p>
                </motion.div>

                {/* Register Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 shadow-2xl"
                >
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="John Doe"
                                    required
                                    disabled={loading}
                                    autoComplete="name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="you@example.com"
                                    required
                                    disabled={loading}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                    minLength={6}
                                    autoComplete="new-password"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                            <div className="relative">
                                <CheckCircle className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                    minLength={6}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 transition-all disabled:opacity-50 font-semibold flex items-center justify-center mt-6"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <Rocket className="w-5 h-5 mr-2" />
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Already have an account?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className="text-indigo-400 hover:text-indigo-300 font-semibold"
                            >
                                Login →
                            </button>
                        </p>
                    </div>
                </motion.div>

                {/* Benefits */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 bg-gray-900/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-800"
                >
                    <h3 className="text-white font-semibold mb-4 text-center">What you'll get:</h3>
                    <div className="space-y-3">
                        <div className="flex items-center text-gray-300">
                            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            </div>
                            <span className="text-sm">AI-powered personalized learning</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                                <CheckCircle className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="text-sm">Real-time feedback & guidance</span>
                        </div>
                        <div className="flex items-center text-gray-300">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                                <CheckCircle className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="text-sm">Track progress & achievements</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Register;