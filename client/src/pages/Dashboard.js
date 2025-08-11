import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import TeacherDashboard from '../components/dashboard/TeacherDashboard';
import StudentDashboard from '../components/dashboard/StudentDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      case 'student':
        return <StudentDashboard />;
      default:
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid User Role</h2>
            <p className="text-gray-600">Please contact an administrator for assistance.</p>
          </div>
        );
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Role: <span className="font-semibold capitalize">{user?.role}</span>
        </p>
      </div>

      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
