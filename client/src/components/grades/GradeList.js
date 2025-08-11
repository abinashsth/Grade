import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const GradeList = ({ courseId = null, studentId = null, onEditGrade }) => {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    courseId: courseId || '',
    studentId: studentId || '',
    assignmentType: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchGrades();
    if (user.role === 'admin' || user.role === 'teacher') {
      fetchCourses();
    }
  }, [filters, pagination.page]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await axios.get(`/api/grades?${params}`);
      setGrades(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      }));
    } catch (error) {
      setError('Failed to fetch grades');
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudentsForCourse = async (courseId) => {
    try {
      const response = await axios.get(`/api/courses/${courseId}`);
      setStudents(response.data.data.enrolledStudents || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // Fetch students when course changes
    if (name === 'courseId' && value) {
      fetchStudentsForCourse(value);
    } else if (name === 'courseId' && !value) {
      setStudents([]);
      setFilters(prev => ({ ...prev, studentId: '' }));
    }
  };

  const handleDeleteGrade = async (gradeId) => {
    if (!window.confirm('Are you sure you want to delete this grade?')) {
      return;
    }

    try {
      await axios.delete(`/api/grades/${gradeId}`);
      fetchGrades(); // Refresh the list
    } catch (error) {
      setError('Failed to delete grade');
      console.error('Error deleting grade:', error);
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLetterGrade = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  if (loading && grades.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {(user.role === 'admin' || user.role === 'teacher') && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="form-label" htmlFor="courseFilter">
                Course
              </label>
              <select
                id="courseFilter"
                name="courseId"
                value={filters.courseId}
                onChange={handleFilterChange}
                className="form-input"
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.name} ({course.subjectCode})
                  </option>
                ))}
              </select>
            </div>

            {filters.courseId && (
              <div>
                <label className="form-label" htmlFor="studentFilter">
                  Student
                </label>
                <select
                  id="studentFilter"
                  name="studentId"
                  value={filters.studentId}
                  onChange={handleFilterChange}
                  className="form-input"
                >
                  <option value="">All Students</option>
                  {students.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="form-label" htmlFor="typeFilter">
                Assignment Type
              </label>
              <select
                id="typeFilter"
                name="assignmentType"
                value={filters.assignmentType}
                onChange={handleFilterChange}
                className="form-input"
              >
                <option value="">All Types</option>
                <option value="assignment">Assignment</option>
                <option value="quiz">Quiz</option>
                <option value="exam">Exam</option>
                <option value="project">Project</option>
                <option value="participation">Participation</option>
                <option value="final">Final</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Grades Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Grades ({pagination.total} total)
          </h3>
          {(user.role === 'teacher' || user.role === 'admin') && (
            <button
              onClick={() => onEditGrade && onEditGrade(null)}
              className="btn-primary"
            >
              Add New Grade
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {user.role !== 'student' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                )}
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
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                {(user.role === 'teacher' || user.role === 'admin') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grades.map((grade) => {
                const percentage = Math.round((grade.earnedPoints / grade.maxPoints) * 100);
                return (
                  <tr key={grade._id} className="hover:bg-gray-50">
                    {user.role !== 'student' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {grade.studentId?.name || 'N/A'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                      {grade.earnedPoints}/{grade.maxPoints}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-semibold ${getGradeColor(percentage)}`}>
                        {percentage}% ({getLetterGrade(percentage)})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(grade.createdAt).toLocaleDateString()}
                    </td>
                    {(user.role === 'teacher' || user.role === 'admin') && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => onEditGrade && onEditGrade(grade._id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteGrade(grade._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {grades.length === 0 && !loading && (
          <p className="text-gray-500 text-center py-8">No grades found.</p>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeList;
