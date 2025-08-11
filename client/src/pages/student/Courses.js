
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/courses'); // enrolled for students
      setCourses(res.data.data);
    } catch (e) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const unenroll = async (courseId) => {
    if (!window.confirm('Unenroll from this course?')) return;
    try {
      await axios.delete(`/api/courses/${courseId}/enroll`);
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to unenroll');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600">View your enrolled courses and details</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c) => (
          <div key={c._id} className="card">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-semibold">{c.name}</h3>
                <p className="text-gray-600 text-sm">{c.subjectCode}</p>
                <p className="text-gray-500 text-xs">{c.semester} {c.year} • {c.credits} credits</p>
              </div>
              <button className="text-red-600 hover:text-red-700" onClick={() => unenroll(c._id)}>
                Unenroll
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-700">{c.description}</p>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="card text-center">You are not enrolled in any courses yet.</div>
      )}
    </div>
  );
};

export default StudentCourses;


