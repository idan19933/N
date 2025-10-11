import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createCheckoutSession } from '../../services/paymentService';

const PaymentButton = ({ courseId, courseName, price }) => {
    const [loading, setLoading] = useState(false);
    const { currentUser } = useAuth();

    const handlePurchase = async () => {
        if (!currentUser) {
            alert('Please login to purchase');
            return;
        }

        setLoading(true);
        try {
            await createCheckoutSession(
                courseId,
                courseName,
                price,
                currentUser.uid
            );
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePurchase}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
            {loading ? 'Processing...' : `Purchase for $${price}`}
        </button>
    );
};

export default PaymentButton;