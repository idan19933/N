import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import MyCourses from './pages/MyCourses';
import { useAuthStore } from './store/authStore';
import { onAuthStateChange } from './services/authService';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    const { setUser, logout } = useAuthStore();

    useEffect(() => {
        // Listen to auth state changes
        const unsubscribe = onAuthStateChange((user) => {
            if (user) {
                setUser({
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName,
                });
            } else {
                logout();
            }
        });

        return () => unsubscribe();
    }, [setUser, logout]);

    return (
        <Router>
            <Routes>
                {/* Auth routes without layout */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Routes with layout */}
                <Route
                    path="/*"
                    element={
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/courses" element={<Courses />} />
                                <Route
                                    path="/my-courses"
                                    element={
                                        <ProtectedRoute>
                                            <MyCourses />
                                        </ProtectedRoute>
                                    }
                                />
                            </Routes>
                        </Layout>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;