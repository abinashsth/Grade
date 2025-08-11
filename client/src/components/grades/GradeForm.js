import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GradeForm = ({ gradeId = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    assignmentName: '',
    assignmentType: 'assignment',
    gradeType: 'percentage',
    maxPoints: '',
    earnedPoints: '',
    weight: '1',
    remarks: '',
    feedback: '',
    dueDate: ''
  });
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchCourses();
    if (gradeId) {
      setIsEdit(true);
      fetchGrade(gradeId);
    }
  }, [gradeId]);

  useEffect(() => {
    if (formData.courseId) {
      fetchStudentsForCourse(formData.courseId);
    }
  }, [formData.courseId]);

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

  const fetchGrade = async (id) => {
    try {
      const response = await axios.get(`/api/grades/${id}`);
      const grade = response.data.data;
      
      setFormData({
        studentId: grade.studentId._id,
        courseId: grade.courseId._id,
        assignmentName: grade.assignmentName,
        assignmentType: grade.assignmentType,
        gradeType: grade.gradeType,
        maxPoints: grade.maxPoints.toString(),
        earnedPoints: grade.earnedPoints.toString(),
        weight: grade.weight.toString(),
        remarks: grade.remarks || '',
        feedback: grade.feedback || '',
        dueDate: grade.dueDate ? new Date(grade.dueDate).toISOString().split('T')[0] : ''
      });
    } catch (error) {
      console.error('Error fetching grade:', error);
      setError('Failed to load grade data');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate earned points don't exceed max points
      if (parseFloat(formData.earnedPoints) > parseFloat(formData.maxPoints)) {
        setError('Earned points cannot exceed maximum points');
        setLoading(false);
        return;
      }

      const submitData = {
        ...formData,
        maxPoints: parseFloat(formData.maxPoints),
        earnedPoints: parseFloat(formData.earnedPoints),
        weight: parseFloat(formData.weight),
        dueDate: formData.dueDate || undefined
      };

      if (isEdit) {
        await axios.put(`/api/grades/${gradeId}`, submitData);
      } else {
        await axios.post('/api/grades', submitData);
      }

      onSuccess && onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save grade');
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = () => {
    if (formData.maxPoints && formData.earnedPoints) {
      return Math.round((parseFloat(formData.earnedPoints) / parseFloat(formData.maxPoints)) * 100);
    }
    return 0;
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {isEdit ? 'Edit Grade' : 'Add New Grade'}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="form-label" htmlFor="courseId">
              Course *
            </label>
            <select
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className="form-input"
              required
              disabled={isEdit}
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.name} ({course.subjectCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="studentId">
              Student *
            </label>
            <select
              id="studentId"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className="form-input"
              required
              disabled={isEdit || !formData.courseId}
            >
              <option value="">Select a student</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="form-label" htmlFor="assignmentName">
              Assignment Name *
            </label>
            <input
              type="text"
              id="assignmentName"
              name="assignmentName"
              value={formData.assignmentName}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label" htmlFor="assignmentType">
              Assignment Type *
            </label>
            <select
              id="assignmentType"
              name="assignmentType"
              value={formData.assignmentType}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="assignment">Assignment</option>
              <option value="quiz">Quiz</option>
              <option value="exam">Exam</option>
              <option value="project">Project</option>
              <option value="participation">Participation</option>
              <option value="final">Final</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="form-label" htmlFor="maxPoints">
              Maximum Points *
            </label>
            <input
              type="number"
              id="maxPoints"
              name="maxPoints"
              value={formData.maxPoints}
              onChange={handleChange}
              className="form-input"
              min="1"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="form-label" htmlFor="earnedPoints">
              Earned Points *
            </label>
            <input
              type="number"
              id="earnedPoints"
              name="earnedPoints"
              value={formData.earnedPoints}
              onChange={handleChange}
              className="form-input"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="form-label" htmlFor="weight">
              Weight
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="form-input"
              min="0"
              step="0.1"
            />
          </div>
        </div>

        {formData.maxPoints && formData.earnedPoints && (
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-blue-800 font-semibold">
              Calculated Percentage: {calculatePercentage()}%
            </p>
          </div>
        )}

        <div>
          <label className="form-label" htmlFor="dueDate">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="remarks">
            Remarks
          </label>
          <textarea
            id="remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="form-input"
            rows="3"
            maxLength="500"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="feedback">
            Feedback
          </label>
          <textarea
            id="feedback"
            name="feedback"
            value={formData.feedback}
            onChange={handleChange}
            className="form-input"
            rows="4"
            maxLength="1000"
          />
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
            {loading ? 'Saving...' : (isEdit ? 'Update Grade' : 'Add Grade')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GradeForm;
