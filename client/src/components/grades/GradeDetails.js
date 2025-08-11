import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const GradeDetails = ({ gradeId, onClose, onEdit }) => {
  const { user } = useAuth();
  const [grade, setGrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (gradeId) {
      fetchGrade();
    }
  }, [gradeId]);

  const fetchGrade = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/grades/${gradeId}`);
      setGrade(response.data.data);
    } catch (error) {
      setError('Failed to fetch grade details');
      console.error('Error fetching grade:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 80) return 'text-blue-600 bg-blue-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getLetterGrade = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={onClose} className="btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!grade) {
    return null;
  }

  const percentage = Math.round((grade.earnedPoints / grade.maxPoints) * 100);
  const letterGrade = getLetterGrade(percentage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Grade Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Grade Summary */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${getGradeColor(percentage)}`}>
              {letterGrade}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mt-4">
              {percentage}%
            </h3>
            <p className="text-gray-600">
              {grade.earnedPoints} out of {grade.maxPoints} points
            </p>
          </div>

          {/* Assignment Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Assignment Information</h4>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Assignment Name</label>
                <p className="text-gray-900">{grade.assignmentName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Type</label>
                <p className="text-gray-900">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {grade.assignmentType}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Weight</label>
                <p className="text-gray-900">{grade.weight}</p>
              </div>

              {grade.dueDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <p className="text-gray-900">
                    {new Date(grade.dueDate).toLocaleDateString()}
                    {grade.isLate && (
                      <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Late
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Course & Student</h4>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Course</label>
                <p className="text-gray-900">
                  {grade.courseId?.name} ({grade.courseId?.subjectCode})
                </p>
              </div>

              {user.role !== 'student' && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Student</label>
                  <p className="text-gray-900">
                    {grade.studentId?.name}
                    <br />
                    <span className="text-sm text-gray-500">{grade.studentId?.email}</span>
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Graded By</label>
                <p className="text-gray-900">{grade.gradedBy?.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Date Graded</label>
                <p className="text-gray-900">
                  {new Date(grade.createdAt).toLocaleDateString()} at{' '}
                  {new Date(grade.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Remarks */}
          {grade.remarks && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Remarks</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{grade.remarks}</p>
              </div>
            </div>
          )}

          {/* Feedback */}
          {grade.feedback && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Teacher Feedback</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700">{grade.feedback}</p>
              </div>
            </div>
          )}

          {/* Grade Breakdown */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Grade Breakdown</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Points Earned:</span>
                <span className="font-semibold">{grade.earnedPoints}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Total Points:</span>
                <span className="font-semibold">{grade.maxPoints}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Percentage:</span>
                  <span className="font-bold text-lg">{percentage}%</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      percentage >= 90 ? 'bg-green-500' :
                      percentage >= 80 ? 'bg-blue-500' :
                      percentage >= 70 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          {(user.role === 'teacher' || user.role === 'admin') && onEdit && (
            <button onClick={() => onEdit(grade._id)} className="btn-primary">
              Edit Grade
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeDetails;
