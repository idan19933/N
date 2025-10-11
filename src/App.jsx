import  React, { useState, useEffect } from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import MyCourses from './pages/MyCourses';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ManageCurriculum from './pages/ManageCurriculum';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import useAuthStore from './store/authStore';

function App() {
    const initAuth = useAuthStore(state => state.initAuth);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="courses" element={<Courses />} />
                    <Route path="courses/:id" element={<CourseDetail />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="payment-success" element={<PaymentSuccess />} />
                    <Route path="payment-cancel" element={<PaymentCancel />} />

                    <Route path="my-courses" element={
                        <PrivateRoute>
                            <MyCourses />
                        </PrivateRoute>
                    } />

                    <Route path="admin" element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    } />

                    <Route path="admin/course/:courseId/curriculum" element={
                        <AdminRoute>
                            <ManageCurriculum />
                        </AdminRoute>
                    } />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;