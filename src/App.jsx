import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import MyCourses from './pages/MyCourses';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ManageCurriculum from './pages/ManageCurriculum';
import AddEditLesson from './pages/AddEditLesson';
import CourseDetail from './pages/CourseDetail';
import useAuthStore from './store/authStore';
import { onAuthStateChange } from './services/authService';

function App() {
    const { setUser, setLoading } = useAuthStore();

    useEffect(() => {
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

        return () => unsubscribe();
    }, [setUser, setLoading]);

    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/course/:courseId" element={<CourseDetail />} />
                    <Route path="/my-courses" element={<MyCourses />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/course/:courseId/curriculum" element={<ManageCurriculum />} />
                    <Route path="/admin/course/:courseId/section/:sectionId/add-lesson" element={<AddEditLesson />} />
                    <Route path="/admin/course/:courseId/section/:sectionId/lesson/:lessonId/edit" element={<AddEditLesson />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;