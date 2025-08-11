import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SystemAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/analytics/overview');
        setData(res.data.data);
      } catch (err) {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={data.counts.totalUsers} icon="👥" color="bg-blue-500" />
        <StatCard title="Teachers" value={data.counts.totalTeachers} icon="👨‍🏫" color="bg-purple-500" />
        <StatCard title="Students" value={data.counts.totalStudents} icon="🎓" color="bg-green-500" />
        <StatCard title="Courses" value={data.counts.totalCourses} icon="📚" color="bg-orange-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {data.recentActivity.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                <div className="text-xl">{item.icon}</div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-gray-500">{new Date(item.date).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">User Roles</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>Admins: {data.counts.totalAdmins}</li>
            <li>Teachers: {data.counts.totalTeachers}</li>
            <li>Students: {data.counts.totalStudents}</li>
          </ul>
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

export default SystemAnalytics;
