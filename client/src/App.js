import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Documentation from './pages/Documentation';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Grades from './pages/Grades';
import Admin from './pages/Admin';
import StudentCourses from './pages/student/Courses';
import StudentReports from './pages/student/Reports';
import StudentGradeReport from './pages/student/GradeReport';
import TeacherCourses from './pages/teacher/Courses';
import TeacherReports from './pages/teacher/Reports';
import TeacherCourseView from './pages/teacher/CourseView';
import StudentCourseView from './pages/student/CourseView';

import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/home" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/grades"
                element={
                  <ProtectedRoute>
                    <Grades />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/courses"
                element={
                  <ProtectedRoute roles={['student']}>
                    <StudentCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/reports"
                element={
                  <ProtectedRoute roles={['student']}>
                    <StudentReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/grade-report"
                element={
                  <ProtectedRoute roles={['student']}>
                    <StudentGradeReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/courses"
                element={
                  <ProtectedRoute roles={['teacher']}>
                    <TeacherCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/reports"
                element={
                  <ProtectedRoute roles={['teacher']}>
                    <TeacherReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/course/:id"
                element={
                  <ProtectedRoute roles={['student']}>
                    <StudentCourseView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/course/:id"
                element={
                  <ProtectedRoute roles={['teacher']}>
                    <TeacherCourseView />
                  </ProtectedRoute>
                }
              />



            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
