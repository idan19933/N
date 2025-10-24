import React from 'react';
import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';

const PremiumGate = ({ children, feature }) => {
    const navigate = useNavigate();
    const isPremium = useAuthStore(state => state.isPremium);

    if (isPremium) {
        return <>{children}</>;
    }

    return (
        <div className="relative">
            <div className="filter blur-sm pointer-events-none opacity-50">
                {children}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
                <div className="text-center p-8">
                    <div className="inline-flex p-4 bg-white/20 rounded-full mb-4">
                        <Crown className="w-12 h-12 text-yellow-400" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">
                        תכונה בפרימיום
                    </h3>
                    <p className="text-white/80 mb-6">
                        {feature || 'תכונה זו זמינה רק למשתמשי Premium'}
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/plans')}
                        className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-purple-900 rounded-xl font-black hover:shadow-lg transition-all"
                    >
                        שדרג לפרימיום
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default PremiumGate;