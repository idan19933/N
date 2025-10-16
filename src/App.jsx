// src/App.jsx - COMPLETE WITH PRACTICE ROUTE AND PROBLEM UPLOADER
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

function App() {
    const initAuth = useAuthStore(state => state.initAuth);
    const loading = useAuthStore(state => state.loading);

    useEffect(() => {
        console.log('🚀 App: Initializing auth...');
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

    console.log('🎯 App: Rendering routes');

    return (
        <Router>
            <Toaster position="top-center" />

            <Routes>
                {/* ✅ ONBOARDING - Outside Layout (fullscreen) */}
                <Route
                    path="/onboarding"
                    element={
                        <PrivateRoute>
                            <OnboardingFlow />
                        </PrivateRoute>
                    }
                />

                {/* Regular Routes with Layout */}
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="courses" element={<Courses />} />
                    <Route path="courses/:id" element={<CourseDetail />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="payment-success" element={<PaymentSuccess />} />
                    <Route path="payment-cancel" element={<PaymentCancel />} />

                    {/* ✅ PROTECTED ROUTES */}
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

                    {/* ✅ AI PRACTICE CENTER */}
                    <Route
                        path="practice"
                        element={
                            <PrivateRoute>
                                <Practice />
                            </PrivateRoute>
                        }
                    />

                    {/* ✅ SMART DASHBOARD */}
                    <Route
                        path="dashboard"
                        element={
                            <PrivateRoute>
                                <SmartDashboard />
                            </PrivateRoute>
                        }
                    />

                    {/* ✅ DIRECT ACCESS TO USER DASHBOARD (for backwards compatibility) */}
                    <Route
                        path="user-dashboard"
                        element={
                            <PrivateRoute>
                                <UserDashboard />
                            </PrivateRoute>
                        }
                    />

                    {/* ✅ ADMIN ROUTES */}
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

                    {/* ✅ NEW: PROBLEM UPLOADER ROUTE */}
                    <Route
                        path="admin/problems"
                        element={
                            <AdminRoute>
                                <AdminProblemUploader />
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

// ============================================
// ✅ SMART DASHBOARD - Routes to correct page
// ============================================
function SmartDashboard() {
    console.log('╔═══════════════════════════════════════╗');
    console.log('║  🎯 SMARTDASHBOARD RENDERING!!!      ║');
    console.log('╚═══════════════════════════════════════╝');

    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const needsOnboarding = useAuthStore(state => state.needsOnboarding);
    const studentProfile = useAuthStore(state => state.studentProfile);
    const isAdmin = useAuthStore(state => state.isAdmin);

    console.log('📊 SmartDashboard state:', {
        userEmail: user?.email,
        isAdmin,
        needsOnboarding,
        hasProfile: !!studentProfile,
        profileOnboardingComplete: studentProfile?.onboardingCompleted
    });

    // Handle redirects with useEffect
    useEffect(() => {
        console.log('🔄 SmartDashboard useEffect triggered');

        if (isAdmin) {
            console.log('👑 Admin detected - navigating to /admin');
            navigate('/admin', { replace: true });
            return;
        }

        if (needsOnboarding) {
            console.log('🎓 Needs onboarding - navigating to /onboarding');
            navigate('/onboarding', { replace: true });
            return;
        }

        console.log('📍 Staying on dashboard - no redirect needed');
    }, [isAdmin, needsOnboarding, navigate]);

    // Show loading while redirect is happening
    if (needsOnboarding) {
        console.log('⏳ Showing loading state (redirecting to onboarding)');
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
        console.log('⏳ Showing loading state (redirecting to admin)');
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-300">מעביר לניהול...</p>
                </div>
            </div>
        );
    }

    // Show personalized dashboard if has profile
    if (studentProfile && studentProfile.onboardingCompleted) {
        console.log('✨ Rendering PersonalizedDashboard');
        return <PersonalizedDashboard />;
    }

    // Default: existing dashboard
    console.log('📚 Rendering UserDashboard (default)');
    return <UserDashboard />;
}

export default App;