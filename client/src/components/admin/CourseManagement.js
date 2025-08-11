import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CourseManagement = ({ defaultShowForm = false }) => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(defaultShowForm);
  const [editingCourse, setEditingCourse] = useState(null);
  const [filters, setFilters] = useState({
    semester: '',
    year: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, [filters, pagination.page]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await axios.get(`/api/courses?${params}`);
      setCourses(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      }));
    } catch (error) {
      setError('Failed to fetch courses');
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('/api/users?role=teacher&limit=100');
      setTeachers(response.data.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setShowForm(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await axios.delete(`/api/courses/${courseId}`);
      fetchCourses(); // Refresh the list
    } catch (error) {
      setError('Failed to delete course');
      console.error('Error deleting course:', error);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCourse(null);
    fetchCourses();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCourse(null);
  };

  if (showForm) {
    return (
      <CourseForm
        course={editingCourse}
        teachers={teachers}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
          <p className="text-gray-600">Create and manage courses</p>
        </div>
        <button onClick={handleAddCourse} className="btn-primary">
          Add New Course
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="form-label" htmlFor="semesterFilter">
              Semester
            </label>
            <select
              id="semesterFilter"
              name="semester"
              value={filters.semester}
              onChange={handleFilterChange}
              className="form-input"
            >
              <option value="">All Semesters</option>
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="yearFilter">
              Year
            </label>
            <select
              id="yearFilter"
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="form-input"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="form-label" htmlFor="searchFilter">
              Search
            </label>
            <input
              type="text"
              id="searchFilter"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by course name or subject code..."
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Courses Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Courses ({pagination.total} total)
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {course.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {course.credits} credits
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.subjectCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.teacherId?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.semester} {course.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.enrolledStudents?.length || 0}/{course.maxStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {course.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {courses.length === 0 && !loading && (
          <p className="text-gray-500 text-center py-8">No courses found.</p>
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

const CourseForm = ({ course, teachers, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: course?.name || '',
    subjectCode: course?.subjectCode || '',
    description: course?.description || '',
    teacherId: course?.teacherId?._id || '',
    credits: course?.credits || 3,
    semester: course?.semester || 'Fall',
    year: course?.year || new Date().getFullYear(),
    maxStudents: course?.maxStudents || 50,
    gradingSchema: course?.gradingSchema || 'letter',
    isActive: course?.isActive !== undefined ? course.isActive : true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        credits: parseInt(formData.credits),
        year: parseInt(formData.year),
        maxStudents: parseInt(formData.maxStudents)
      };

      if (course) {
        await axios.put(`/api/courses/${course._id}`, submitData);
      } else {
        await axios.post('/api/courses', submitData);
      }

      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="card max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {course ? 'Edit Course' : 'Add New Course'}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="form-label" htmlFor="name">
              Course Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label" htmlFor="subjectCode">
              Subject Code *
            </label>
            <input
              type="text"
              id="subjectCode"
              name="subjectCode"
              value={formData.subjectCode}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., CS101"
              required
            />
          </div>
        </div>

        <div>
          <label className="form-label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-input"
            rows="3"
            maxLength="500"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="form-label" htmlFor="teacherId">
              Assigned Teacher *
            </label>
            <select
              id="teacherId"
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select a teacher</option>
              {teachers.map(teacher => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name} ({teacher.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="credits">
              Credits *
            </label>
            <input
              type="number"
              id="credits"
              name="credits"
              value={formData.credits}
              onChange={handleChange}
              className="form-input"
              min="1"
              max="10"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="form-label" htmlFor="semester">
              Semester *
            </label>
            <select
              id="semester"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="year">
              Year *
            </label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="form-input"
              required
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="maxStudents">
              Max Students *
            </label>
            <input
              type="number"
              id="maxStudents"
              name="maxStudents"
              value={formData.maxStudents}
              onChange={handleChange}
              className="form-input"
              min="1"
              max="200"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="form-label" htmlFor="gradingSchema">
              Grading Schema
            </label>
            <select
              id="gradingSchema"
              name="gradingSchema"
              value={formData.gradingSchema}
              onChange={handleChange}
              className="form-input"
            >
              <option value="letter">Letter Grade (A, B, C, D, F)</option>
              <option value="percentage">Percentage (0-100%)</option>
              <option value="gpa">GPA (0.0-4.0)</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active Course
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (course ? 'Update Course' : 'Create Course')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseManagement;
