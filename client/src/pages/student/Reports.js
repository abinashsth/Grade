
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StudentReports = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/grades?limit=1000');
        const grades = res.data.data;
        const byCourse = {};
        grades.forEach(g => {
          const key = g.courseId?._id || g.courseId;
          if (!byCourse[key]) byCourse[key] = { name: g.courseId?.name || 'N/A', subjectCode: g.courseId?.subjectCode || '', total: 0, sumPct: 0 };
          const pct = (g.earnedPoints / g.maxPoints) * 100;
          byCourse[key].total += 1;
          byCourse[key].sumPct += pct;
        });
        const items = Object.values(byCourse).map(c => ({
          ...c,
          avg: c.total ? Math.round((c.sumPct / c.total) * 10) / 10 : 0
        }));
        const overall = items.length ? Math.round((items.reduce((s, x) => s + x.avg, 0) / items.length) * 10) / 10 : 0;
        setSummary({ items, overall, count: grades.length });
      } catch (e) {
        setError('Failed to load reports');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Download and view academic reports</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Overall Performance</h3>
          <p className="text-gray-600">Average across all courses</p>
          <p className="text-4xl font-bold mt-4">{summary.overall}%</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Total Grades</h3>
          <p className="text-4xl font-bold mt-4">{summary.count}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Download</h3>
          <button className="btn-primary" onClick={() => exportCSV(summary)}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">By Course</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grades</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summary.items.map((c, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name} ({c.subjectCode})</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{c.avg}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{c.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function exportCSV(summary) {
  const rows = [
    ['Course', 'Subject Code', 'Average %', 'Grades Count'],
    ...summary.items.map(c => [c.name, c.subjectCode, c.avg, c.total])
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'gradepro_report.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default StudentReports;

