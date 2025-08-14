import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const AttendanceTab = ({ course, onUpdate }) => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [newAttendance, setNewAttendance] = useState({
    studentId: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'Present'
  });

  const canManage = user?.role === 'admin' || 
    (user?.role === 'teacher' && course.teacherId?._id === user.id);

  useEffect(() => {
    fetchAttendanceData();
  }, [course._id]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/courses/${course._id}/attendance`);
      setAttendanceData(response.data.attendance || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async () => {
    if (!newAttendance.studentId) {
      alert('Please select a student');
      return;
    }

    try {
      setMarkingAttendance(true);
      await axios.post(`/api/courses/${course._id}/attendance`, newAttendance);
      
      setNewAttendance({
        studentId: '',
        date: new Date().toISOString().slice(0, 10),
        status: 'Present'
      });
      
      fetchAttendanceData();
      onUpdate && onUpdate();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarkingAttendance(false);
    }
  };

  const calculateAttendancePercentage = (studentId) => {
    const studentAttendance = attendanceData.filter(
      record => record.studentId === studentId || record.studentId._id === studentId
    );
    
    if (studentAttendance.length === 0) return 0;
    
    const presentCount = studentAttendance.filter(
      record => record.status === 'Present' || record.status === 'Late'
    ).length;
    
    return Math.round((presentCount / studentAttendance.length) * 100);
  };

  const getAttendanceStats = () => {
    const totalClasses = new Set(attendanceData.map(record => record.date)).size;
    const totalStudents = course.enrolledStudents?.length || 0;
    
    return {
      totalClasses,
      totalStudents,
      totalRecords: attendanceData.length
    };
  };

  const getStudentAttendanceData = () => {
    const studentData = {};
    
    course.enrolledStudents?.forEach(student => {
      const studentAttendance = attendanceData.filter(
        record => (record.studentId === student._id || record.studentId._id === student._id)
      );
      
      studentData[student._id] = {
        student,
        attendance: studentAttendance,
        percentage: calculateAttendancePercentage(student._id),
        present: studentAttendance.filter(r => r.status === 'Present').length,
        late: studentAttendance.filter(r => r.status === 'Late').length,
        absent: studentAttendance.filter(r => r.status === 'Absent').length
      };
    });
    
    return studentData;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const stats = getAttendanceStats();
  const studentAttendanceData = getStudentAttendanceData();

  if (loading) {
    return <div className="text-center py-8">Loading attendance data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalClasses}</div>
          <div className="text-sm text-gray-600">Total Classes</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{stats.totalStudents}</div>
          <div className="text-sm text-gray-600">Enrolled Students</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.totalRecords}</div>
          <div className="text-sm text-gray-600">Attendance Records</div>
        </div>
      </div>

      {/* Mark Attendance Form (Teacher/Admin only) */}
      {canManage && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h4 className="text-lg font-medium mb-4">Mark Attendance</h4>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="form-label">Student</label>
              <select
                value={newAttendance.studentId}
                onChange={(e) => setNewAttendance({...newAttendance, studentId: e.target.value})}
                className="form-input"
              >
                <option value="">Select Student</option>
                {course.enrolledStudents?.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Date</label>
              <input
                type="date"
                value={newAttendance.date}
                onChange={(e) => setNewAttendance({...newAttendance, date: e.target.value})}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select
                value={newAttendance.status}
                onChange={(e) => setNewAttendance({...newAttendance, status: e.target.value})}
                className="form-input"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={markAttendance}
                disabled={markingAttendance || !newAttendance.studentId}
                className="btn-primary w-full"
              >
                {markingAttendance ? 'Marking...' : 'Mark Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student View - Personal Attendance */}
      {user?.role === 'student' && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-medium mb-4">My Attendance</h4>
          {studentAttendanceData[user.id] ? (
            <div>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getAttendanceColor(studentAttendanceData[user.id].percentage)}`}>
                    {studentAttendanceData[user.id].percentage}%
                  </div>
                  <div className="text-sm text-gray-600">Overall</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {studentAttendanceData[user.id].present}
                  </div>
                  <div className="text-sm text-gray-600">Present</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {studentAttendanceData[user.id].late}
                  </div>
                  <div className="text-sm text-gray-600">Late</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {studentAttendanceData[user.id].absent}
                  </div>
                  <div className="text-sm text-gray-600">Absent</div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium text-gray-900">Recent Attendance</h5>
                {studentAttendanceData[user.id].attendance
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 10)
                  .map((record, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">{formatDate(record.date)}</span>
                      <span className={`text-sm font-medium ${
                        record.status === 'Present' ? 'text-green-600' :
                        record.status === 'Late' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No attendance records found.</p>
          )}
        </div>
      )}

      {/* Teacher/Admin View - All Students */}
      {canManage && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-medium">Student Attendance Summary</h4>
          </div>
          
          {Object.keys(studentAttendanceData).length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records</h3>
              <p className="text-gray-500">Start marking attendance to see student data here.</p>
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
                      Attendance %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Present
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Late
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Absent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Classes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.values(studentAttendanceData)
                    .sort((a, b) => b.percentage - a.percentage)
                    .map((data) => (
                      <tr key={data.student._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {data.student.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {data.student.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getAttendanceColor(data.percentage)}`}>
                            {data.percentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {data.present}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                          {data.late}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {data.absent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {data.attendance.length}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Recent Attendance Records */}
      {canManage && attendanceData.length > 0 && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-medium">Recent Attendance Records</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 20)
                  .map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.studentId?.name || 'Unknown Student'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.status === 'Present' ? 'bg-green-100 text-green-800' :
                          record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTab;
