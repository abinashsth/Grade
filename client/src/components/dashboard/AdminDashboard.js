import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalTeachers: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch users for stats
      const usersResponse = await axios.get('/api/users?limit=100');
      const users = usersResponse.data.data;
      
      // Fetch courses for stats
      const coursesResponse = await axios.get('/api/courses?limit=100');
      const courses = coursesResponse.data.data;

      // Calculate stats
      const totalUsers = users.length;
      const totalStudents = users.filter(user => user.role === 'student').length;
      const totalTeachers = users.filter(user => user.role === 'teacher').length;
      const totalCourses = courses.length;

      setStats({
        totalUsers,
        totalCourses,
        totalStudents,
        totalTeachers
      });

      // Get recent users (last 5)
      setRecentUsers(users.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          color="bg-blue-500"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon="🎓"
          color="bg-green-500"
        />
        <StatCard
          title="Total Teachers"
          value={stats.totalTeachers}
          icon="👨‍🏫"
          color="bg-purple-500"
        />
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon="📚"
          color="bg-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard
          title="User Management"
          description="Manage teachers and students"
          icon="👥"
          actions={[
            { label: "View All Users", href: "/admin?tab=users" },
            { label: "Add New User", href: "/admin?tab=users&action=new" }
          ]}
        />
        
        <ActionCard
          title="Course Management"
          description="Create and manage courses"
          icon="📚"
          actions={[
            { label: "View All Courses", href: "/admin?tab=courses" },
            { label: "Create New Course", href: "/admin?tab=courses&action=new" }
          ]}
        />
        
        <ActionCard
          title="System Analytics"
          description="View system-wide reports"
          icon="📊"
          actions={[
            { label: "View Reports", href: "/admin?tab=analytics" },
            { label: "Grade Analytics", href: "/admin?tab=analytics" }
          ]}
        />
      </div>

      {/* Recent Users */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Recent Users</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentUsers.map((user) => (
                <tr key={user._id || user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="card">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${color} text-white text-2xl mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const ActionCard = ({ title, description, icon, actions }) => {
  const navigate = useNavigate();
  return (
    <div className="card">
      <div className="flex items-center mb-4">
        <div className="text-2xl mr-3">{icon}</div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
      <div className="space-y-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.href)}
            className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition duration-200"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
