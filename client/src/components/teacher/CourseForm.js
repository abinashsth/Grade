import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CourseForm = ({ course, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    name: course?.name || '',
    subjectCode: course?.subjectCode || '',
    description: course?.description || '',
    credits: course?.credits || 3,
    semester: course?.semester || 'Fall',
    year: course?.year || new Date().getFullYear(),
    maxStudents: course?.maxStudents || 50,
    gradingSchema: course?.gradingSchema || 'letter'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      name: course?.name || '',
      subjectCode: course?.subjectCode || '',
      description: course?.description || '',
      credits: course?.credits || 3,
      semester: course?.semester || 'Fall',
      year: course?.year || new Date().getFullYear(),
      maxStudents: course?.maxStudents || 50,
      gradingSchema: course?.gradingSchema || 'letter'
    });
  }, [course]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (course?._id) {
        await axios.put(`/api/courses/${course._id}`, form);
      } else {
        await axios.post('/api/courses', { ...form });
      }
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between mb-4">
        <h3 className="text-xl font-semibold">{course?._id ? 'Edit Course' : 'Add Course'}</h3>
        <button className="btn-secondary" onClick={onCancel}>Close</button>
      </div>
      {error && <div className="text-red-600 mb-3">{error}</div>}
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Course Name</label>
          <input className="form-input" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label className="form-label">Subject Code</label>
          <input className="form-input" name="subjectCode" value={form.subjectCode} onChange={handleChange} required />
        </div>
        <div className="md:col-span-2">
          <label className="form-label">Description</label>
          <textarea className="form-input" name="description" value={form.description} onChange={handleChange} rows={3} />
        </div>
        <div>
          <label className="form-label">Credits</label>
          <input type="number" min={1} max={10} className="form-input" name="credits" value={form.credits} onChange={handleChange} />
        </div>
        <div>
          <label className="form-label">Semester</label>
          <select className="form-input" name="semester" value={form.semester} onChange={handleChange}>
            <option>Fall</option>
            <option>Spring</option>
            <option>Summer</option>
          </select>
        </div>
        <div>
          <label className="form-label">Year</label>
          <input type="number" className="form-input" name="year" value={form.year} onChange={handleChange} />
        </div>
        <div>
          <label className="form-label">Max Students</label>
          <input type="number" min={1} className="form-input" name="maxStudents" value={form.maxStudents} onChange={handleChange} />
        </div>
        <div>
          <label className="form-label">Grading Schema</label>
          <select className="form-input" name="gradingSchema" value={form.gradingSchema} onChange={handleChange}>
            <option value="letter">Letter</option>
            <option value="percentage">Percentage</option>
            <option value="gpa">GPA</option>
          </select>
        </div>
        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Course'}</button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
