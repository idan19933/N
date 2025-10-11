import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyPaymentAndCompletePurchase } from '../services/paymentService';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            setStatus('error');
            setMessage('Invalid payment session');
            return;
        }

        verifyPayment(sessionId);
    }, [searchParams]);

    const verifyPayment = async (sessionId) => {
        try {
            const result = await verifyPaymentAndCompletePurchase(sessionId);

            if (result.success) {
                setStatus('success');
                setMessage('Payment successful! Redirecting to your courses...');

                // Redirect to My Courses after 3 seconds
                setTimeout(() => {
                    navigate('/my-courses');
                }, 3000);
            } else {
                setStatus('error');
                setMessage('Payment verification failed');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            setStatus('error');
            setMessage('Failed to verify payment. Please contact support.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                {status === 'verifying' && (
                    <>
                        <div className="flex justify-center mb-4">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Verifying Payment
                        </h1>
                        <p className="text-gray-600">
                            Please wait while we confirm your payment...
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="flex justify-center mb-4">
                            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Payment Successful!
                        </h1>
                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>
                        <button
                            onClick={() => navigate('/my-courses')}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Go to My Courses
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="flex justify-center mb-4">
                            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Payment Error
                        </h1>
                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>
                        <button
                            onClick={() => navigate('/courses')}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Back to Courses
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;