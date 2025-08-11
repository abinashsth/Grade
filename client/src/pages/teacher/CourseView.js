import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const TeacherCourseView = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '' });
  const [attMark, setAttMark] = useState({ studentId: '', date: new Date().toISOString().slice(0,10), status: 'Present' });
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrolling, setEnrolling] = useState(false);


  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [cRes, gRes] = await Promise.all([
          axios.get(`/api/courses/${id}`),
          axios.get(`/api/grades?courseId=${id}&limit=1000`)
        ]);
        setCourse(cRes.data.data);
        setGrades(gRes.data.data);
      } catch (e) {
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const reloadCourse = async () => {
    const cRes = await axios.get(`/api/courses/${id}`);
    setCourse(cRes.data.data);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      await axios.post(`/api/courses/${id}/attachments`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      await reloadCourse();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = async (url) => {
    try {
      await axios.delete(`/api/courses/${id}/attachments`, { data: { url } });
      await reloadCourse();
    } catch (err) {
      alert(err.response?.data?.message || 'Remove failed');
    }
  };

  const createAssignment = async () => {
    setAssigning(true);
    try {
      const form = new FormData();
      form.append('title', newAssignment.title);
      form.append('description', newAssignment.description);
      if (newAssignment.dueDate) form.append('dueDate', newAssignment.dueDate);
      if (newAssignment.file) form.append('file', newAssignment.file);
      await axios.post(`/api/courses/${id}/assignments`, form);
      setNewAssignment({ title: '', description: '', dueDate: '' });
      await reloadCourse();
    } catch (err) {
      alert(err.response?.data?.message || 'Create failed');
    } finally {
      setAssigning(false);
    }
  };

  const deleteAssignment = async (idx) => {
    if (!window.confirm('Delete this assignment?')) return;
    await axios.delete(`/api/courses/${id}/assignments/${idx}`);
    await reloadCourse();
  };

  const markAttendance = async () => {
    try {
      await axios.post(`/api/courses/${id}/attendance`, attMark);
      await reloadCourse();
    } catch (err) {
      alert(err.response?.data?.message || 'Attendance failed');
    }
  };

  const enrollByEmail = async () => {
    if (!enrollEmail) return;
    try {
      setEnrolling(true);
      await axios.post(`/api/courses/${id}/enroll`, { studentEmail: enrollEmail });
      setEnrollEmail('');
      await reloadCourse();
    } catch (err) {
      alert(err.response?.data?.message || 'Enroll failed');
    } finally {
      setEnrolling(false);
    }
  };

  const unenroll = async (studentId) => {
    if (!window.confirm('Unenroll this student?')) return;
    try {
      await axios.delete(`/api/courses/${id}/enroll`, { data: { studentId } });
      await reloadCourse();
    } catch (err) {
      alert(err.response?.data?.message || 'Unenroll failed');
    }
  };

      alert(err.response?.data?.message || 'Attendance failed');
    }
  };

        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!course) return <div className="p-4">Course not found</div>;

  const students = course.enrolledStudents || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
          <p className="text-gray-600">{course.subjectCode} • {course.semester} {course.year}</p>
        </div>
        <Link to={`/grades?view=form`} className="btn-primary">Add Grade</Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Metric title="Enrolled" value={students.length} />
        <Metric title="Grades" value={grades.length} />
        <Metric title="Avg %" value={`${average(grades)}%`} />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Roster & Enrollment</h3>
          <div className="flex gap-2">
            <input className="form-input" style={{minWidth: '220px'}} placeholder="Student email" value={enrollEmail} onChange={(e)=>setEnrollEmail(e.target.value)} />
            <button className="btn-primary" disabled={!enrollEmail || enrolling} onClick={enrollByEmail}>{enrolling ? 'Enrolling...' : 'Enroll'}</button>
          </div>
        </div>
        {students.length === 0 ? (
          <p className="text-gray-500">No students enrolled yet.</p>
        ) : (
          <ul className="space-y-2">
            {students.map((s) => (
              <li key={s._id} className="flex justify-between items-center">
                <span>{s.name} ({s.email})</span>
                <button className="btn-secondary" onClick={() => unenroll(s._id)}>Unenroll</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Attachments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Attachments</h3>
          <label className="btn-primary cursor-pointer">
            <input type="file" className="hidden" onChange={handleUpload} />
            {uploading ? 'Uploading...' : 'Upload'}
          </label>
        </div>
        {(course.attachments || []).length === 0 ? (
          <p className="text-gray-500">No attachments yet.</p>
        ) : (
          <ul className="space-y-2">
            {course.attachments.map((url, idx) => (
              <li key={idx} className="flex items-center justify-between">
                <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">{url}</a>
                <button className="btn-secondary" onClick={()=>removeAttachment(url)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Assignments */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Assignments</h3>
        <div className="grid md:grid-cols-3 gap-3 mb-3">
          <input className="form-input" placeholder="Title" value={newAssignment.title} onChange={(e)=>setNewAssignment({...newAssignment, title:e.target.value})} />
          <input className="form-input" placeholder="Due Date" type="date" value={newAssignment.dueDate} onChange={(e)=>setNewAssignment({...newAssignment, dueDate:e.target.value})} />
          <input className="form-input" placeholder="Attach file (optional)" type="file" onChange={(e)=>setNewAssignment({...newAssignment, file:e.target.files?.[0]})} />
          <textarea className="form-input md:col-span-3" rows={2} placeholder="Description" value={newAssignment.description} onChange={(e)=>setNewAssignment({...newAssignment, description:e.target.value})}></textarea>
        </div>
        <div className="flex justify-end mb-4">
          <button className="btn-primary" disabled={assigning || !newAssignment.title} onClick={createAssignment}>{assigning ? 'Creating...' : 'Create Assignment'}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(course.assignments || []).map((a, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-3 text-sm">{a.title}</td>
                  <td className="px-6 py-3 text-sm">{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-3 text-sm">{a.fileURL ? <a href={a.fileURL} className="text-blue-600 underline" target="_blank" rel="noreferrer">Download</a> : '-'}</td>
                  <td className="px-6 py-3 text-sm text-right">
                    <button className="btn-secondary" onClick={()=>deleteAssignment(idx)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Attendance</h3>
        <div className="grid md:grid-cols-4 gap-3 mb-4">
          <select className="form-input" value={attMark.studentId} onChange={(e)=>setAttMark({...attMark, studentId:e.target.value})}>
            <option value="">Select Student</option>
            {students.map(s => (
              <option value={s._id} key={s._id}>{s.name}</option>
            ))}
          </select>
          <input type="date" className="form-input" value={attMark.date} onChange={(e)=>setAttMark({...attMark, date:e.target.value})} />
          <select className="form-input" value={attMark.status} onChange={(e)=>setAttMark({...attMark, status:e.target.value})}>
            <option>Present</option>
            <option>Absent</option>
            <option>Late</option>
          </select>
          <button className="btn-primary" onClick={markAttendance} disabled={!attMark.studentId}>Mark</button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(course.attendance || []).slice().reverse().slice(0,50).map((a, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-3 text-sm">{students.find(s=>s._id===a.studentId)?.name || a.studentId}</td>
                  <td className="px-6 py-3 text-sm">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-sm">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Gradebook (recent)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grades.slice(0, 25).map((g) => (
                <tr key={g._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{g.studentId?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{g.assignmentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{g.assignmentType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{Math.round((g.earnedPoints/g.maxPoints)*100)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(g.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Metric = ({ title, value }) => (
  <div className="card">
    <p className="text-sm text-gray-600">{title}</p>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

function average(grades){
  if (!grades.length) return 0;
  const pct = grades.reduce((s,g)=> s + (g.earnedPoints/g.maxPoints)*100, 0) / grades.length;
  return Math.round(pct*10)/10;
}

export default TeacherCourseView;
