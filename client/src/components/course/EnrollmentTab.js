import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const EnrollmentTab = ({ course, onUpdate }) => {
  const { user } = useAuth();
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const canManage = user?.role === 'admin' || 
    (user?.role === 'teacher' && course.teacherId?._id === user.id);

  const enrollByEmail = async () => {
    if (!enrollEmail.trim()) {
      alert('Please enter a student email');
      return;
    }

    try {
      setEnrolling(true);
      await axios.post(`/api/courses/${course._id}/enroll`, { 
        studentEmail: enrollEmail.trim() 
      });
      
      setEnrollEmail('');
      onUpdate && onUpdate();
    } catch (error) {
      alert(error.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const unenrollStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to unenroll this student?')) {
      return;
    }

    try {
      await axios.delete(`/api/courses/${course._id}/enroll`, { 
        data: { studentId } 
      });
      
      onUpdate && onUpdate();
    } catch (error) {
      alert(error.response?.data?.message || 'Unenrollment failed');
    }
  };

  const filteredStudents = course.enrolledStudents?.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const enrollmentStats = {
    enrolled: course.enrolledStudents?.length || 0,
    capacity: course.maxStudents || 0,
    available: (course.maxStudents || 0) - (course.enrolledStudents?.length || 0)
  };

  if (!canManage) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔒</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-500">Only instructors and administrators can manage course enrollment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enrollment Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{enrollmentStats.enrolled}</div>
          <div className="text-sm text-gray-600">Enrolled Students</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{enrollmentStats.capacity}</div>
          <div className="text-sm text-gray-600">Total Capacity</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{enrollmentStats.available}</div>
          <div className="text-sm text-gray-600">Available Spots</div>
        </div>
      </div>

      {/* Enrollment Form */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h4 className="text-lg font-medium mb-4">Enroll New Student</h4>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="email"
              placeholder="Enter student email address"
              value={enrollEmail}
              onChange={(e) => setEnrollEmail(e.target.value)}
              className="form-input w-full"
              onKeyPress={(e) => e.key === 'Enter' && enrollByEmail()}
            />
          </div>
          <button
            onClick={enrollByEmail}
            disabled={enrolling || !enrollEmail.trim() || enrollmentStats.available <= 0}
            className="btn-primary whitespace-nowrap"
          >
            {enrolling ? 'Enrolling...' : 'Enroll Student'}
          </button>
        </div>
        
        {enrollmentStats.available <= 0 && (
          <p className="text-red-600 text-sm mt-2">
            ⚠️ Course is at full capacity. Cannot enroll more students.
          </p>
        )}
        
        <p className="text-gray-500 text-sm mt-2">
          Enter the email address of a registered student to enroll them in this course.
        </p>
      </div>

      {/* Enrolled Students */}
      <div className="bg-white border rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium">Enrolled Students ({enrollmentStats.enrolled})</h4>
            <div className="w-64">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input w-full text-sm"
              />
            </div>
          </div>
        </div>

        {enrollmentStats.enrolled === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students enrolled</h3>
            <p className="text-gray-500">Use the form above to enroll your first student.</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500">No students match your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student, index) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Student ID: {student._id.slice(-6).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.enrolledAt ? 
                          new Date(student.enrolledAt).toLocaleDateString() : 
                          'N/A'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => unenrollStudent(student._id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Unenroll
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enrollment Guidelines */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-blue-900 mb-3">Enrollment Guidelines</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start">
            <span className="mr-2">•</span>
            <span>Students must have a registered account with a valid email address</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">•</span>
            <span>Course capacity is limited to {course.maxStudents} students</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">•</span>
            <span>Students will receive email notifications about course activities</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">•</span>
            <span>Unenrolled students will lose access to course materials and grades</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-medium mb-4">Quick Actions</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              const emails = course.enrolledStudents?.map(s => s.email).join(', ');
              navigator.clipboard.writeText(emails);
              alert('Student emails copied to clipboard!');
            }}
            className="btn-secondary flex items-center justify-center"
            disabled={enrollmentStats.enrolled === 0}
          >
            📋 Copy All Student Emails
          </button>
          <button
            onClick={() => {
              const csvContent = [
                'Name,Email,Student ID',
                ...course.enrolledStudents?.map(s => 
                  `"${s.name}","${s.email}","${s._id}"`
                ) || []
              ].join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${course.subjectCode}_enrollment.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="btn-secondary flex items-center justify-center"
            disabled={enrollmentStats.enrolled === 0}
          >
            📊 Export Enrollment List
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentTab;
