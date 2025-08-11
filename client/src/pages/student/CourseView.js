import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const StudentCourseView = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const cRes = await axios.get(`/api/courses/${id}`);
        const aRes = await axios.get(`/api/courses/${id}/attendance`);
        setCourse({ ...cRes.data.data, attendance: aRes.data.attendance });
      } catch (e) {
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!course) return <div className="p-4">Course not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
        <p className="text-gray-600">{course.subjectCode} • {course.semester} {course.year}</p>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Attachments</h3>
        {(course.attachments || []).length === 0 ? (
          <p className="text-gray-500">No attachments.</p>
        ) : (
          <ul className="space-y-2">
            {course.attachments.map((url, idx) => (
              <li key={idx}>
                <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">{url}</a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Assignments</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(course.assignments || []).map((a, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-3 text-sm">{a.title}</td>
                  <td className="px-6 py-3 text-sm">{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-3 text-sm">{a.fileURL ? <a href={a.fileURL} className="text-blue-600 underline" target="_blank" rel="noreferrer">Download</a> : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">My Attendance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(course.attendance || []).slice().reverse().slice(0,50).map((a, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-3 text-sm">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-sm">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentCourseView;

