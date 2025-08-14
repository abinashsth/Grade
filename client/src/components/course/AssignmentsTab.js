import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const AssignmentsTab = ({ course }) => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    totalMarks: 100,
    assignmentType: 'assignment',
    instructions: '',
    allowLateSubmission: true,
    lateSubmissionPenalty: 10
  });

  const canManage = user?.role === 'admin' || 
    (user?.role === 'teacher' && course.teacherId?._id === user.id);

  useEffect(() => {
    fetchAssignments();
  }, [course._id]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/assignments?courseId=${course._id}&limit=100`);
      setAssignments(response.data.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });
      formDataToSend.append('courseId', course._id);

      // Handle file attachments
      const fileInputs = e.target.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        if (input.files.length > 0) {
          Array.from(input.files).forEach(file => {
            formDataToSend.append('attachments', file);
          });
        }
      });

      if (editingAssignment) {
        await axios.put(`/api/assignments/${editingAssignment._id}`, formDataToSend);
      } else {
        await axios.post('/api/assignments', formDataToSend);
      }

      setShowForm(false);
      setEditingAssignment(null);
      resetForm();
      fetchAssignments();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : '',
      totalMarks: assignment.totalMarks,
      assignmentType: assignment.assignmentType,
      instructions: assignment.instructions || '',
      allowLateSubmission: assignment.allowLateSubmission,
      lateSubmissionPenalty: assignment.lateSubmissionPenalty
    });
    setShowForm(true);
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      await axios.delete(`/api/assignments/${assignmentId}`);
      fetchAssignments();
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      totalMarks: 100,
      assignmentType: 'assignment',
      instructions: '',
      allowLateSubmission: true,
      lateSubmissionPenalty: 10
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (now > dueDate) return 'bg-red-100 text-red-800';
    if (now > new Date(dueDate.getTime() - 24 * 60 * 60 * 1000)) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (now > dueDate) return 'Overdue';
    if (now > new Date(dueDate.getTime() - 24 * 60 * 60 * 1000)) return 'Due Soon';
    return 'Active';
  };

  if (loading) {
    return <div className="text-center py-8">Loading assignments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Assignments ({assignments.length})
        </h3>
        {canManage && (
          <button
            onClick={() => {
              setEditingAssignment(null);
              resetForm();
              setShowForm(true);
            }}
            className="btn-primary"
          >
            Create Assignment
          </button>
        )}
      </div>

      {/* Assignment Form */}
      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h4 className="text-lg font-medium mb-4">
            {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Type</label>
                <select
                  value={formData.assignmentType}
                  onChange={(e) => setFormData({...formData, assignmentType: e.target.value})}
                  className="form-input"
                >
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                  <option value="quiz">Quiz</option>
                  <option value="exam">Exam</option>
                  <option value="final">Final Exam</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Due Date *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Total Marks *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({...formData, totalMarks: parseInt(e.target.value)})}
                  className="form-input"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Instructions</label>
              <textarea
                rows="4"
                value={formData.instructions}
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                className="form-input"
                placeholder="Detailed instructions for students..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowLateSubmission"
                  checked={formData.allowLateSubmission}
                  onChange={(e) => setFormData({...formData, allowLateSubmission: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="allowLateSubmission" className="text-sm text-gray-700">
                  Allow Late Submission
                </label>
              </div>
              {formData.allowLateSubmission && (
                <div>
                  <label className="form-label">Late Penalty (% per day)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.lateSubmissionPenalty}
                    onChange={(e) => setFormData({...formData, lateSubmissionPenalty: parseInt(e.target.value)})}
                    className="form-input"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Attachments</label>
              <input
                type="file"
                multiple
                className="form-input"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can upload multiple files (PDF, DOC, images)
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingAssignment(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
          <p className="text-gray-500">
            {canManage 
              ? 'Create your first assignment to get started.' 
              : 'Your instructor hasn\'t created any assignments yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment._id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{assignment.title}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment)}`}>
                      {getStatusText(assignment)}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                      {assignment.assignmentType}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📅 Due: {formatDate(assignment.dueDate)}</p>
                    <p>📊 Total Marks: {assignment.totalMarks}</p>
                    {assignment.description && (
                      <p className="text-gray-700 mt-2">{assignment.description}</p>
                    )}
                  </div>

                  {assignment.attachments && assignment.attachments.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Attachments:</p>
                      <div className="flex flex-wrap gap-2">
                        {assignment.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment.fileURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-blue-600"
                          >
                            📎 {attachment.originalName}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {canManage && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(assignment)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(assignment._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Student Submission Status */}
              {user?.role === 'student' && assignment.submission && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ Submitted on {formatDate(assignment.submission.submittedAt)}
                    {assignment.submission.isLate && (
                      <span className="text-orange-600 ml-2">(Late)</span>
                    )}
                  </p>
                  {assignment.submission.grade?.earnedPoints !== undefined && (
                    <p className="text-sm text-green-800 mt-1">
                      Grade: {assignment.submission.grade.earnedPoints}/{assignment.totalMarks} 
                      ({Math.round((assignment.submission.grade.earnedPoints / assignment.totalMarks) * 100)}%)
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentsTab;
