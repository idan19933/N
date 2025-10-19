// src/App.jsx - UPDATED WITH PERSONALITY UPLOADER
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';

// Pages
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import MyCourses from './pages/MyCourses';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import Notifications from './pages/Notifications';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

// AI & Practice
import Practice from './pages/Practice';
import MathTutor from './components/ai/MathTutor';

// Onboarding & Personalized
import OnboardingFlow from './pages/OnboardingFlow';
import PersonalizedDashboard from './pages/PersonalizedDashboard';

// Admin
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminGoals from './pages/AdminGoals';
import AdminCodes from './pages/AdminCodes';
import ManageCurriculum from './pages/ManageCurriculum';
import AddLesson from './pages/AddLesson';
import AdminNotifications from './pages/AdminNotifications';
import AdminProblemUploader from './pages/AdminProblemUploader';
import PersonalityUploader from './pages/PersonalityUploader';  // ✅ NEW: AI Personality Uploader

function App() {
    const initAuth = useAuthStore(state => state.initAuth);
    const loading = useAuthStore(state => state.loading);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-400">טוען...</p>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <Toaster position="top-center" />

            <Routes>
                {/* ONBOARDING - Fullscreen */}
                <Route
                    path="/onboarding"
                    element={
                        <PrivateRoute>
                            <OnboardingFlow />
                        </PrivateRoute>
                    }
                />

                {/* Routes with Layout */}
                <Route path="/" element={<Layout />}>
                    {/* Public Routes */}
                    <Route index element={<Home />} />
                    <Route path="courses" element={<Courses />} />
                    <Route path="courses/:id" element={<CourseDetail />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="payment-success" element={<PaymentSuccess />} />
                    <Route path="payment-cancel" element={<PaymentCancel />} />

                    {/* Protected User Routes */}
                    <Route
                        path="notifications"
                        element={
                            <PrivateRoute>
                                <Notifications />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="my-courses"
                        element={
                            <PrivateRoute>
                                <MyCourses />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="practice"
                        element={
                            <PrivateRoute>
                                <Practice />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="math-tutor"
                        element={
                            <PrivateRoute>
                                <MathTutor />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="dashboard"
                        element={
                            <PrivateRoute>
                                <SmartDashboard />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="user-dashboard"
                        element={
                            <PrivateRoute>
                                <UserDashboard />
                            </PrivateRoute>
                        }
                    />

                    {/* Admin Routes */}
                    <Route
                        path="admin"
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="admin/goals"
                        element={
                            <AdminRoute>
                                <AdminGoals />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="admin/codes"
                        element={
                            <AdminRoute>
                                <AdminCodes />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="admin/users"
                        element={
                            <AdminRoute>
                                <AdminUsers />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="admin/notifications"
                        element={
                            <AdminRoute>
                                <AdminNotifications />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="admin/problems"
                        element={
                            <AdminRoute>
                                <AdminProblemUploader />
                            </AdminRoute>
                        }
                    />

                    {/* ✅ NEW: AI PERSONALITY UPLOADER ROUTE */}
                    <Route
                        path="admin/ai-upload"
                        element={
                            <AdminRoute>
                                <PersonalityUploader />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="admin/course/:courseId/curriculum"
                        element={
                            <AdminRoute>
                                <ManageCurriculum />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="admin/course/:courseId/section/:sectionId/add-lesson"
                        element={
                            <AdminRoute>
                                <AddLesson />
                            </AdminRoute>
                        }
                    />
                </Route>
            </Routes>
        </Router>
    );
}

// Smart Dashboard Component
function SmartDashboard() {
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const needsOnboarding = useAuthStore(state => state.needsOnboarding);
    const studentProfile = useAuthStore(state => state.studentProfile);
    const isAdmin = useAuthStore(state => state.isAdmin);

    useEffect(() => {
        if (isAdmin) {
            navigate('/admin', { replace: true });
            return;
        }

        if (needsOnboarding) {
            navigate('/onboarding', { replace: true });
            return;
        }
    }, [isAdmin, needsOnboarding, navigate]);

    if (needsOnboarding) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-300">מעביר לטופס הכנה...</p>
                </div>
            </div>
        );
    }

    if (isAdmin) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-300">מעביר לניהול...</p>
                </div>
            </div>
        );
    }

    if (studentProfile && studentProfile.onboardingCompleted) {
        return <PersonalizedDashboard />;
    }

    return <UserDashboard />;
}

export default App;