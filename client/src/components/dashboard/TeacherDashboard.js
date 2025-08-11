import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalGrades: 0,
    avgGrade: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch teacher's courses
      const coursesResponse = await axios.get('/api/courses');
      const teacherCourses = coursesResponse.data.data;
      setCourses(teacherCourses);

      // Fetch recent grades
      const gradesResponse = await axios.get('/api/grades?limit=10');
      const grades = gradesResponse.data.data;
      setRecentGrades(grades);

      // Calculate stats
      const totalCourses = teacherCourses.length;
      const totalStudents = teacherCourses.reduce((sum, course) => sum + course.enrolledStudents.length, 0);
      const totalGrades = grades.length;
      
      // Calculate average grade (simplified)
      const avgGrade = grades.length > 0 
        ? grades.reduce((sum, grade) => sum + (grade.earnedPoints / grade.maxPoints * 100), 0) / grades.length
        : 0;

      setStats({
        totalCourses,
        totalStudents,
        totalGrades,
        avgGrade: Math.round(avgGrade * 10) / 10
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
      <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h2>
        <p className="text-blue-100">Here's an overview of your teaching activities.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Courses"
          value={stats.totalCourses}
          icon="📚"
          color="bg-blue-500"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon="🎓"
          color="bg-green-500"
        />
        <StatCard
          title="Grades Given"
          value={stats.totalGrades}
          icon="📝"
          color="bg-purple-500"
        />
        <StatCard
          title="Average Grade"
          value={`${stats.avgGrade}%`}
          icon="📊"
          color="bg-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard
          title="My Courses"
          description="View and manage your assigned courses"
          icon="📚"
          actions={[
            { label: "View All Courses", action: () => navigate('/teacher/courses') },
            { label: "Course Analytics", action: () => navigate('/teacher/reports') }
          ]}
        />
        
        <ActionCard
          title="Grade Management"
          description="Enter and update student grades"
          icon="📝"
          actions={[
            { label: "Add New Grade", action: () => navigate('/grades?view=form') },
            { label: "View All Grades", action: () => navigate('/grades') }
          ]}
        />
        
        <ActionCard
          title="Student Reports"
          description="Generate performance reports"
          icon="📊"
          actions={[
            { label: "Class Performance", action: () => navigate('/teacher/reports') },
            { label: "Individual Reports", action: () => navigate('/teacher/reports') }
          ]}
        />
      </div>

      {/* My Courses */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">My Courses</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
        {courses.length === 0 && (
          <p className="text-gray-500 text-center py-8">No courses assigned yet.</p>
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
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
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
              {recentGrades.slice(0, 5).map((grade) => (
                <tr key={grade._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {grade.studentId?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {grade.courseId?.subjectCode || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {grade.assignmentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Math.round((grade.earnedPoints / grade.maxPoints) * 100)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(grade.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recentGrades.length === 0 && (
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

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition duration-200">
      <h4 className="font-semibold text-lg mb-2">{course.name}</h4>
      <p className="text-gray-600 text-sm mb-2">{course.subjectCode}</p>
      <p className="text-gray-500 text-xs mb-3">
        {course.semester} {course.year} • {course.enrolledStudents?.length || 0} students
      </p>
      <button className="btn-primary text-sm w-full" onClick={() => navigate(`/teacher/course/${course._id}`)}>
        View Course
      </button>
    </div>
  );
};

export default TeacherDashboard;
