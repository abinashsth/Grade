import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const CourseInfo = ({ course, onUpdate }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [editingWeights, setEditingWeights] = useState(false);
  const [weights, setWeights] = useState({
    assignments: course.evaluationWeights?.assignments || 40,
    attendance: course.evaluationWeights?.attendance || 20,
    exams: course.evaluationWeights?.exams || 40
  });

  const canEdit = user?.role === 'admin' || 
    (user?.role === 'teacher' && course.teacherId?._id === user.id);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await axios.post(`/api/courses/${course._id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      onUpdate && onUpdate();
    } catch (error) {
      alert(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = async (url) => {
    try {
      await axios.delete(`/api/courses/${course._id}/attachments`, { 
        data: { url } 
      });
      onUpdate && onUpdate();
    } catch (error) {
      alert(error.response?.data?.message || 'Remove failed');
    }
  };

  const updateWeights = async () => {
    const total = weights.assignments + weights.attendance + weights.exams;
    if (total !== 100) {
      alert('Evaluation weights must sum to 100%');
      return;
    }

    try {
      await axios.put(`/api/courses/${course._id}`, {
        evaluationWeights: weights
      });
      setEditingWeights(false);
      onUpdate && onUpdate();
    } catch (error) {
      alert(error.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Course Name</label>
            <p className="mt-1 text-sm text-gray-900">{course.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject Code</label>
            <p className="mt-1 text-sm text-gray-900">{course.subjectCode}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Credits</label>
            <p className="mt-1 text-sm text-gray-900">{course.credits}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Semester & Year</label>
            <p className="mt-1 text-sm text-gray-900">{course.semester} {course.year}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Instructor</label>
            <p className="mt-1 text-sm text-gray-900">
              {course.teacherId?.name} ({course.teacherId?.email})
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Students</label>
            <p className="mt-1 text-sm text-gray-900">{course.maxStudents}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Grading Schema</label>
            <p className="mt-1 text-sm text-gray-900 capitalize">{course.gradingSchema}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              course.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {course.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {course.description && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">{course.description}</p>
        </div>
      )}

      {/* Evaluation Weights */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Evaluation Weights</h3>
          {canEdit && (
            <button
              onClick={() => setEditingWeights(!editingWeights)}
              className="btn-secondary text-sm"
            >
              {editingWeights ? 'Cancel' : 'Edit Weights'}
            </button>
          )}
        </div>

        {editingWeights ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Assignments (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights.assignments}
                  onChange={(e) => setWeights({...weights, assignments: parseInt(e.target.value) || 0})}
                  className="form-input mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Attendance (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights.attendance}
                  onChange={(e) => setWeights({...weights, attendance: parseInt(e.target.value) || 0})}
                  className="form-input mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Exams (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weights.exams}
                  onChange={(e) => setWeights({...weights, exams: parseInt(e.target.value) || 0})}
                  className="form-input mt-1"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Total: {weights.assignments + weights.attendance + weights.exams}% 
                {weights.assignments + weights.attendance + weights.exams !== 100 && (
                  <span className="text-red-600 ml-2">Must equal 100%</span>
                )}
              </p>
              <button
                onClick={updateWeights}
                disabled={weights.assignments + weights.attendance + weights.exams !== 100}
                className="btn-primary"
              >
                Save Weights
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {course.evaluationWeights?.assignments || 40}%
              </div>
              <div className="text-sm text-gray-600">Assignments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {course.evaluationWeights?.attendance || 20}%
              </div>
              <div className="text-sm text-gray-600">Attendance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {course.evaluationWeights?.exams || 40}%
              </div>
              <div className="text-sm text-gray-600">Exams</div>
            </div>
          </div>
        )}
      </div>

      {/* Course Materials */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Course Materials</h3>
          {canEdit && (
            <label className="btn-primary cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              {uploading ? 'Uploading...' : 'Upload File'}
            </label>
          )}
        </div>

        {course.attachments && course.attachments.length > 0 ? (
          <div className="space-y-2">
            {course.attachments.map((url, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline flex-1 truncate"
                >
                  {url.split('/').pop()}
                </a>
                {canEdit && (
                  <button
                    onClick={() => removeAttachment(url)}
                    className="ml-2 text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No course materials uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default CourseInfo;
