import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;