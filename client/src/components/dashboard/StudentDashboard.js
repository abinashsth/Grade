
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalGrades: 0,
    avgGrade: 0,
    gpa: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch student's courses
      const coursesResponse = await axios.get('/api/courses');
      const studentCourses = coursesResponse.data.data;
      setCourses(studentCourses);

      // Fetch student's grades
      const gradesResponse = await axios.get('/api/grades');
      const studentGrades = gradesResponse.data.data;
      setGrades(studentGrades);

      // Calculate stats
      const totalCourses = studentCourses.length;
      const totalGrades = studentGrades.length;
      
      // Calculate average grade
      const avgGrade = studentGrades.length > 0 
        ? studentGrades.reduce((sum, grade) => sum + (grade.earnedPoints / grade.maxPoints * 100), 0) / studentGrades.length
        : 0;

      // Calculate GPA (simplified conversion)
      const gpa = avgGrade >= 90 ? 4.0 : 
                  avgGrade >= 80 ? 3.0 : 
                  avgGrade >= 70 ? 2.0 : 
                  avgGrade >= 60 ? 1.0 : 0.0;

      setStats({
        totalCourses,
        totalGrades,
        avgGrade: Math.round(avgGrade * 10) / 10,
        gpa: Math.round(gpa * 100) / 100
      });

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
      {/* Welcome Message */}
      <div className="card bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
        <p className="text-green-100">Track your academic progress and view your grades.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Enrolled Courses"
          value={stats.totalCourses}
          icon="📚"
          color="bg-blue-500"
        />
        <StatCard
          title="Total Grades"
          value={stats.totalGrades}
          icon="📝"
          color="bg-green-500"
        />
        <StatCard
          title="Average Grade"
          value={`${stats.avgGrade}%`}
          icon="📊"
          color="bg-purple-500"
        />
        <StatCard
          title="Current GPA"
          value={stats.gpa}
          icon="🎯"
          color="bg-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard
          title="My Grades"
          description="View your current grades and progress"
          icon="📝"
          actions={[
            { label: "View All Grades", action: () => navigate('/grades') },
            { label: "Grade History", action: () => navigate('/grades') }
          ]}
        />
        
        <ActionCard
          title="My Courses"
          description="View enrolled courses and details"
          icon="📚"
          actions={[
            { label: "View All Courses", action: () => navigate('/student/courses') },
            { label: "Course Schedule", action: () => navigate('/student/courses') }
          ]}
        />
        
        <ActionCard
          title="Reports"
          description="Download and view academic reports"
          icon="📊"
          actions={[
            { label: "Download Transcript", action: () => {/* implement later */} },
            { label: "Progress Report", action: () => navigate('/student/reports') }
          ]}
        />
      </div>

      {/* Course Progress */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Course Progress</h3>
        <div className="space-y-4">
          {courses.map((course) => (
            <CourseProgressCard key={course._id} course={course} grades={grades} />
          ))}
        </div>
        {courses.length === 0 && (
          <p className="text-gray-500 text-center py-8">No courses enrolled yet.</p>
        )}
      </div>

      {/* Recent Grades */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Recent Grades</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grades.slice(0, 5).map((grade) => (
                <tr key={grade._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {grade.courseId?.subjectCode || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {grade.assignmentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {grade.assignmentType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`font-semibold ${
                      (grade.earnedPoints / grade.maxPoints * 100) >= 90 ? 'text-green-600' :
                      (grade.earnedPoints / grade.maxPoints * 100) >= 80 ? 'text-blue-600' :
                      (grade.earnedPoints / grade.maxPoints * 100) >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {Math.round((grade.earnedPoints / grade.maxPoints) * 100)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(grade.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {grades.length === 0 && (
          <p className="text-gray-500 text-center py-8">No grades recorded yet.</p>
        )}
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

const ActionCard = ({ title, description, icon, actions }) => (
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
          onClick={action.action}
          className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition duration-200"
        >
          {action.label}
        </button>
      ))}
    </div>
  </div>
);

const CourseProgressCard = ({ course, grades }) => {
  const courseGrades = grades.filter(grade => grade.courseId?._id === course._id);
  const avgGrade = courseGrades.length > 0 
    ? courseGrades.reduce((sum, grade) => sum + (grade.earnedPoints / grade.maxPoints * 100), 0) / courseGrades.length
    : 0;

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-lg">{course.name}</h4>
          <p className="text-gray-600 text-sm">{course.subjectCode}</p>
          <p className="text-gray-500 text-xs">
            {course.semester} {course.year} • {course.credits} credits
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{Math.round(avgGrade)}%</p>
          <p className="text-sm text-gray-500">{courseGrades.length} grades</p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${
            avgGrade >= 90 ? 'bg-green-500' :
            avgGrade >= 80 ? 'bg-blue-500' :
            avgGrade >= 70 ? 'bg-yellow-500' :
            'bg-red-500'
          }`}
          style={{ width: `${Math.min(avgGrade, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StudentDashboard;

