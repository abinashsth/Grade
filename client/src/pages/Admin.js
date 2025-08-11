import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UserManagement from '../components/admin/UserManagement';
import CourseManagement from '../components/admin/CourseManagement';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import SystemAnalytics from '../components/admin/SystemAnalytics';

const Admin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialTab = params.get('tab') || 'users';
  const action = params.get('action');

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setActiveTab(p.get('tab') || 'users');
  }, [location.search]);

  const tabs = [
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'courses', label: 'Course Management', icon: '📚' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement defaultShowForm={action === 'new'} />;
      case 'courses':
        return <CourseManagement defaultShowForm={action === 'new'} />;
      case 'analytics':
        return <SystemAnalytics />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <ProtectedRoute roles={['admin']}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Manage users, courses, and system settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  const p = new URLSearchParams(location.search);
                  p.set('tab', tab.id);
                  p.delete('action');
                  navigate(`/admin?${p.toString()}`);
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {renderContent()}
        </div>
      </div>
    </ProtectedRoute>
  );
};

const AnalyticsPanel = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Analytics</h2>
        <p className="text-gray-600">View system-wide reports and statistics</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value="Loading..."
          icon="👥"
          color="bg-blue-500"
        />
        <StatCard
          title="Active Courses"
          value="Loading..."
          icon="📚"
          color="bg-green-500"
        />
        <StatCard
          title="Total Grades"
          value="Loading..."
          icon="📝"
          color="bg-purple-500"
        />
        <StatCard
          title="System Health"
          value="Good"
          icon="💚"
          color="bg-green-500"
        />
      </div>

      {/* Charts and Reports */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
          <div className="text-center py-8 text-gray-500">
            Chart component would go here
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Grade Distribution</h3>
          <div className="text-center py-8 text-gray-500">
            Chart component would go here
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
            <div className="text-blue-500">👤</div>
            <div>
              <p className="text-sm font-medium">New user registered</p>
              <p className="text-xs text-gray-500">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
            <div className="text-green-500">📚</div>
            <div>
              <p className="text-sm font-medium">New course created</p>
              <p className="text-xs text-gray-500">15 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
            <div className="text-purple-500">📝</div>
            <div>
              <p className="text-sm font-medium">Grade submitted</p>
              <p className="text-xs text-gray-500">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsPanel = () => {
  const [settings, setSettings] = useState({
    siteName: 'GradePro',
    allowRegistration: true,
    emailNotifications: true,
    maintenanceMode: false,
    maxFileSize: '10',
    sessionTimeout: '24'
  });

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveSettings = () => {
    // Save settings logic would go here
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <p className="text-gray-600">Configure system-wide settings</p>
      </div>

      <div className="card max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">General Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="form-label" htmlFor="siteName">
              Site Name
            </label>
            <input
              type="text"
              id="siteName"
              name="siteName"
              value={settings.siteName}
              onChange={handleSettingChange}
              className="form-input"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowRegistration"
              name="allowRegistration"
              checked={settings.allowRegistration}
              onChange={handleSettingChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="allowRegistration" className="ml-2 block text-sm text-gray-900">
              Allow new user registration
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="emailNotifications"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleSettingChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
              Enable email notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="maintenanceMode"
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleSettingChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
              Maintenance mode
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="form-label" htmlFor="maxFileSize">
                Max File Size (MB)
              </label>
              <input
                type="number"
                id="maxFileSize"
                name="maxFileSize"
                value={settings.maxFileSize}
                onChange={handleSettingChange}
                className="form-input"
                min="1"
                max="100"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="sessionTimeout">
                Session Timeout (hours)
              </label>
              <input
                type="number"
                id="sessionTimeout"
                name="sessionTimeout"
                value={settings.sessionTimeout}
                onChange={handleSettingChange}
                className="form-input"
                min="1"
                max="168"
              />
            </div>
          </div>

          <div className="pt-4">
            <button onClick={handleSaveSettings} className="btn-primary">
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="card max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">System Information</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Version:</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Database Status:</span>
            <span className="text-green-600 font-medium">Connected</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Backup:</span>
            <span className="font-medium">2 hours ago</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Server Uptime:</span>
            <span className="font-medium">5 days, 12 hours</span>
          </div>
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

export default Admin;
