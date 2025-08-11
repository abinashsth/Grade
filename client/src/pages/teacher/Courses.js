import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CourseForm from '../../components/teacher/CourseForm';

const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/courses'); // for teacher, filtered to own
      setCourses(res.data.data);
    } catch (e) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (course) => {
    try {
      await axios.put(`/api/courses/${course._id}`, { isActive: !course.isActive });
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
          Add New Course
        </button>
      </div>

      {showForm && (
        <CourseForm course={editing} onSuccess={() => { setShowForm(false); setEditing(null); load(); }} onCancel={() => { setShowForm(false); setEditing(null); }} />
      )}


      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600">Create, update and manage your assigned courses</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c) => (
          <div key={c._id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{c.name}</h3>
                <p className="text-gray-600 text-sm">{c.subjectCode}</p>
                <p className="text-gray-500 text-xs">{c.semester} {c.year} • {c.enrolledStudents?.length || 0} students</p>
              </div>
              <button className={`text-xs px-3 py-1 rounded ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => toggleActive(c)}>
                {c.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-700">{c.description}</p>
            <div className="mt-4 flex justify-between">
              <button className="btn-secondary" onClick={() => { setEditing(c); setShowForm(true); }}>Edit</button>
              <button className="btn-secondary" onClick={() => navigate(`/teacher/course/${c._id}`)}>View Course</button>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="card text-center">You have no assigned courses.</div>
      )}
    </div>
  );
};

export default TeacherCourses;
