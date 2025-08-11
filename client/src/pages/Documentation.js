import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
    { id: 'user-roles', title: 'User Roles', icon: '👥' },
    { id: 'course-management', title: 'Course Management', icon: '📚' },
    { id: 'grade-management', title: 'Grade Management', icon: '📝' },
    { id: 'reports', title: 'Reports & Analytics', icon: '📊' },
    { id: 'api', title: 'API Reference', icon: '🔧' },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: '🔍' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return <GettingStartedContent />;
      case 'user-roles':
        return <UserRolesContent />;
      case 'course-management':
        return <CourseManagementContent />;
      case 'grade-management':
        return <GradeManagementContent />;
      case 'reports':
        return <ReportsContent />;
      case 'api':
        return <APIContent />;
      case 'troubleshooting':
        return <TroubleshootingContent />;
      default:
        return <GettingStartedContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-blue-100">
            Everything you need to know about using GradePro effectively
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contents</h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center space-x-3 ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{section.icon}</span>
                    <span>{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GettingStartedContent = () => (
  <div>
    <h2 className="text-3xl font-bold text-gray-900 mb-6">Getting Started with GradePro</h2>
    
    <div className="space-y-8">
      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">1. Account Registration</h3>
        <p className="text-gray-600 mb-4">
          To begin using GradePro, you'll need to create an account. Visit the registration page and select your role:
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
          <li><strong>Admin:</strong> Full system access for school administrators</li>
          <li><strong>Teacher:</strong> Grade management and course oversight</li>
          <li><strong>Student:</strong> View grades and track academic progress</li>
        </ul>
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">2. First Login</h3>
        <p className="text-gray-600 mb-4">
          After registration, log in with your credentials. You'll be directed to a role-specific dashboard:
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
          <p className="text-blue-700">
            <strong>Tip:</strong> Bookmark your dashboard for quick access to frequently used features.
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">3. Navigation</h3>
        <p className="text-gray-600 mb-4">
          Use the navigation bar to access different sections of the application:
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
          <li><strong>Dashboard:</strong> Overview and quick actions</li>
          <li><strong>Grades:</strong> Grade management and viewing</li>
          <li><strong>Admin:</strong> System administration (admin only)</li>
        </ul>
      </section>
    </div>
  </div>
);

const UserRolesContent = () => (
  <div>
    <h2 className="text-3xl font-bold text-gray-900 mb-6">User Roles & Permissions</h2>
    
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-red-800 mb-4">👑 Admin</h3>
          <ul className="text-red-700 space-y-2 text-sm">
            <li>• Manage all users</li>
            <li>• Create and manage courses</li>
            <li>• View all grades</li>
            <li>• System configuration</li>
            <li>• Generate reports</li>
          </ul>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">👨‍🏫 Teacher</h3>
          <ul className="text-blue-700 space-y-2 text-sm">
            <li>• Manage assigned courses</li>
            <li>• Enter and update grades</li>
            <li>• View enrolled students</li>
            <li>• Generate class reports</li>
            <li>• Provide feedback</li>
          </ul>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-green-800 mb-4">🎓 Student</h3>
          <ul className="text-green-700 space-y-2 text-sm">
            <li>• View personal grades</li>
            <li>• Track academic progress</li>
            <li>• Access course information</li>
            <li>• Download reports</li>
            <li>• View teacher feedback</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const CourseManagementContent = () => (
  <div>
    <h2 className="text-3xl font-bold text-gray-900 mb-6">Course Management</h2>
    
    <div className="space-y-8">
      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Creating Courses (Admin)</h3>
        <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
          <li>Navigate to Admin → Course Management</li>
          <li>Click "Add New Course"</li>
          <li>Fill in course details (name, subject code, description)</li>
          <li>Assign a teacher</li>
          <li>Set semester, year, and maximum students</li>
          <li>Choose grading schema</li>
          <li>Save the course</li>
        </ol>
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Student Enrollment</h3>
        <p className="text-gray-600 mb-4">
          Students can be enrolled in courses through:
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
          <li>Admin enrollment (bulk or individual)</li>
          <li>Self-enrollment (if enabled)</li>
          <li>Teacher recommendations</li>
        </ul>
      </section>
    </div>
  </div>
);

const GradeManagementContent = () => (
  <div>
    <h2 className="text-3xl font-bold text-gray-900 mb-6">Grade Management</h2>
    
    <div className="space-y-8">
      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Adding Grades (Teachers)</h3>
        <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
          <li>Go to Grades → Add New Grade</li>
          <li>Select course and student</li>
          <li>Enter assignment details</li>
          <li>Input points earned and maximum points</li>
          <li>Add feedback and remarks</li>
          <li>Save the grade</li>
        </ol>
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Grade Types</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Assignment Types:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              <li>Exam</li>
              <li>Quiz</li>
              <li>Assignment</li>
              <li>Project</li>
              <li>Participation</li>
              <li>Final</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Grading Schemas:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              <li>Letter grades (A, B, C, D, F)</li>
              <li>Percentage (0-100%)</li>
              <li>GPA scale (0.0-4.0)</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </div>
);

const ReportsContent = () => (
  <div>
    <h2 className="text-3xl font-bold text-gray-900 mb-6">Reports & Analytics</h2>
    
    <div className="space-y-8">
      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Available Reports</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-800 mb-3">Student Reports</h4>
            <ul className="text-gray-600 space-y-2">
              <li>• Individual grade reports</li>
              <li>• Progress tracking</li>
              <li>• Course performance</li>
              <li>• Transcript generation</li>
            </ul>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-800 mb-3">Administrative Reports</h4>
            <ul className="text-gray-600 space-y-2">
              <li>• Class performance analytics</li>
              <li>• Teacher effectiveness</li>
              <li>• System usage statistics</li>
              <li>• Grade distribution analysis</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </div>
);

const APIContent = () => (
  <div>
    <h2 className="text-3xl font-bold text-gray-900 mb-6">API Reference</h2>
    
    <div className="space-y-8">
      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Authentication</h3>
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm">
          <div>POST /api/auth/login</div>
          <div>POST /api/auth/register</div>
          <div>GET /api/auth/me</div>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Core Endpoints</h3>
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm space-y-1">
          <div>GET /api/users - Get all users</div>
          <div>GET /api/courses - Get courses</div>
          <div>GET /api/grades - Get grades</div>
          <div>POST /api/grades - Create grade</div>
        </div>
      </section>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <p className="text-blue-700">
          <strong>Note:</strong> For complete API documentation, see our{' '}
          <Link to="/api-docs" className="underline">detailed API reference</Link>.
        </p>
      </div>
    </div>
  </div>
);

const TroubleshootingContent = () => (
  <div>
    <h2 className="text-3xl font-bold text-gray-900 mb-6">Troubleshooting</h2>
    
    <div className="space-y-8">
      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Common Issues</h3>
        
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-800 mb-2">Login Problems</h4>
            <p className="text-gray-600 mb-3">If you can't log in:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              <li>Check your email and password</li>
              <li>Clear browser cache and cookies</li>
              <li>Try a different browser</li>
              <li>Contact your administrator</li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-800 mb-2">Grade Entry Issues</h4>
            <p className="text-gray-600 mb-3">If you can't enter grades:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              <li>Ensure you're assigned to the course</li>
              <li>Check student enrollment status</li>
              <li>Verify assignment details</li>
              <li>Refresh the page and try again</li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-800 mb-2">Performance Issues</h4>
            <p className="text-gray-600 mb-3">If the system is slow:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              <li>Check your internet connection</li>
              <li>Close unnecessary browser tabs</li>
              <li>Clear browser cache</li>
              <li>Try during off-peak hours</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Getting Help</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-green-800 mb-4">
            If you need additional help, contact our support team:
          </p>
          <ul className="text-green-700 space-y-2">
            <li>📧 Email: support@gradepro.com</li>
            <li>📞 Phone: +1 (555) 123-4567</li>
            <li>💬 Live Chat: Available on our website</li>
          </ul>
        </div>
      </section>
    </div>
  </div>
);

export default Documentation;
