import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const TeacherReports = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/grades?limit=1000');
        setGrades(res.data.data);
      } catch (e) {
        setError('Failed to load grades');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const [filters, setFilters] = useState({ courseId: '', assignmentType: '' });

  const applyFilters = async () => {
    try {
      setLoading(true);
      const qp = new URLSearchParams();
      if (filters.courseId) qp.set('courseId', filters.courseId);
      if (filters.assignmentType) qp.set('assignmentType', filters.assignmentType);
      qp.set('limit', '1000');
      const res = await axios.get(`/api/grades?${qp.toString()}`);
      setGrades(res.data.data);
    } catch (e) {
      setError('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const m = computeMetrics(grades);
    const rows = [['Course','Subject Code','Avg %','Grades Count'], ...m.byCourse.map(c => [c.name, c.subjectCode, c.avg, c.count])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'teacher_reports.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const metrics = useMemo(() => computeMetrics(grades), [grades]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Reports</h1>
        <p className="text-gray-600">Class and individual performance summaries</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <MetricCard title="Courses Graded" value={metrics.courses} />
        <MetricCard title="Students Graded" value={metrics.students} />
        <MetricCard title="Average Grade" value={`${metrics.avg}%`} />
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">By Course</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grades</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.byCourse.map((c) => (
                <tr key={c.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name} ({c.subjectCode})</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{c.avg}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{c.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function computeMetrics(grades) {
  const byCourse = new Map();
  const students = new Set();
  grades.forEach(g => {
    students.add(g.studentId?._id || g.studentId);
    const id = g.courseId?._id || g.courseId;
    if (!byCourse.has(id)) byCourse.set(id, { id, name: g.courseId?.name || 'N/A', subjectCode: g.courseId?.subjectCode || '', sum: 0, count: 0 });
    byCourse.get(id).sum += (g.earnedPoints / g.maxPoints) * 100;
    byCourse.get(id).count += 1;
  });
  const list = Array.from(byCourse.values()).map(c => ({
    ...c,
    avg: c.count ? Math.round((c.sum / c.count) * 10) / 10 : 0
  }));
  const avg = list.length ? Math.round((list.reduce((s, x) => s + x.avg, 0) / list.length) * 10) / 10 : 0;
  return {
    courses: list.length,
    students: students.size,
    avg,
      // Filters and Export 
      // <div className="card">
      //   <div className="flex flex-wrap items-end gap-3">
      //     <div>
      //       <label className="form-label">Course ID</label>
      //       <input className="form-input" placeholder="Optional" value={filters.courseId} onChange={(e)=>setFilters({...filters, courseId:e.target.value})} />
      //     </div>
      //     <div>
      //       <label className="form-label">Assignment Type</label>
      //       <select className="form-input" value={filters.assignmentType} onChange={(e)=>setFilters({...filters, assignmentType:e.target.value})}>
      //         <option value="">All</option>
      //         <option value="exam">Exam</option>
      //         <option value="quiz">Quiz</option>
      //         <option value="assignment">Assignment</option>
      //         <option value="project">Project</option>
      //         <option value="participation">Participation</option>
      //         <option value="final">Final</option>
      //       </select>
      //     </div>
      //     <button className="btn-secondary" onClick={applyFilters}>Apply Filters</button>
      //     <button className="btn-primary" onClick={exportCSV}>Export CSV</button>
      //   </div>
      // </div>

    byCourse: list
  };
}

const MetricCard = ({ title, value }) => (
  <div className="card">
    <p className="text-sm text-gray-600">{title}</p>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default TeacherReports;
