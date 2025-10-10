import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import MyCourses from './pages/MyCourses';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import useAuthStore from './store/authStore';
import { onAuthStateChange } from './services/authService';

function App() {
    const { setUser, setLoading } = useAuthStore();

    useEffect(() => {
        // Listen for auth state changes
        setLoading(true);
        const unsubscribe = onAuthStateChange((user) => {
            if (user) {
                setUser({
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName
                });
            } else {
                setUser(null);
            }
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, [setUser, setLoading]);

    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/my-courses" element={<MyCourses />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;