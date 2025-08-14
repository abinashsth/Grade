import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const GradeReport = () => {
  const { user } = useAuth();
  const [evaluationuations, setevaluationuations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [evaluationuationsRes, coursesRes] = await Promise.all([
        axios.get('/api/evaluationuations'),
        axios.get('/api/courses/enrolled')
      ]);
      
      setevaluationuations(evaluationuationsRes.data.data);
      setCourses(coursesRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredevaluationuations = selectedCourse === 'all' 
  ? evaluationuations 
  : evaluationuations.filter(evaluationuation => evaluationuation.courseId._id === selectedCourse);

  const calculateOverallGPA = () => {
    if (evaluationuations.length === 0) return 0;
    const totalGPA = evaluationuations.reduce((sum, evaluationuation) => sum + evaluationuation.finalGrade.gpa, 0);
    return (totalGPA / evaluationuations.length).toFixed(2);
  };

  const getGradeColor = (letterGrade) => {
    if (['A+', 'A', 'A-'].includes(letterGrade)) return 'text-green-600';
    if (['B+', 'B', 'B-'].includes(letterGrade)) return 'text-blue-600';
    if (['C+', 'C', 'C-'].includes(letterGrade)) return 'text-yellow-600';
    if (['D+', 'D'].includes(letterGrade)) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading grade report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Grade Report</h1>
          <p className="text-gray-600 mt-2">
            View your academic performance across all courses
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{calculateOverallGPA()}</div>
            <div className="text-sm text-gray-600">Overall GPA</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{courses.length}</div>
            <div className="text-sm text-gray-600">Enrolled Courses</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{evaluationuations.length}</div>
            <div className="text-sm text-gray-600">Completed evaluationuations</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">
              {evaluationuations.length > 0 
                ? Math.round(evaluationuations.reduce((sum, evaluationuation) => sum + evaluationuation.finalGrade.percentage, 0) / evaluationuations.length)
                : 0}%
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
        </div>

        {/* Course Filter */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Filter by Course</h3>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="form-input w-64"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.name} ({course.subjectCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grade Reports */}
        {filteredevaluationuations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No evaluationuations available</h3>
            <p className="text-gray-500">
              {selectedCourse === 'all' 
                ? 'Your instructors haven\'t published any evaluationuations yet.'
                : 'No evaluationuations available for the selected course.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredevaluationuations.map((evaluationuation) => (
              <div key={evaluationuation._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Course Header */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {evaluationuation.courseId.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {evaluationuation.courseId.subjectCode} • {evaluationuation.semester} {evaluationuation.year}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getGradeColor(evaluationuation.finalGrade.letterGrade)}`}>
                        {evaluationuation.finalGrade.letterGrade}
                      </div>
                      <div className="text-sm text-gray-600">
                        {evaluationuation.finalGrade.percentage}% • GPA: {evaluationuation.finalGrade.gpa}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Component Breakdown */}
                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {evaluationuation.components.assignments.percentage}%
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Assignments</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Weight: {evaluationuation.components.assignments.weight}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {evaluationuation.components.assignments.totalEarned}/{evaluationuation.components.assignments.totalPossible} points
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">
                          {evaluationuation.components.attendance.percentage}%
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Attendance</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Weight: {evaluationuation.components.attendance.weight}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {evaluationuation.components.attendance.attendedClasses}/{evaluationuation.components.attendance.totalClasses} classes
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-600">
                          {evaluationuation.components.exams.percentage}%
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Exams</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Weight: {evaluationuation.components.exams.weight}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {evaluationuation.components.exams.totalEarned}/{evaluationuation.components.exams.totalPossible} points
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instructor Feedback */}
                  {evaluationuation.feedback && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Instructor Feedback</h4>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        {evaluationuation.feedback.strengths && (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h5 className="font-medium text-green-800 mb-2">Strengths</h5>
                            <p className="text-green-700 text-sm">{evaluationuation.feedback.strengths}</p>
                          </div>
                        )}
                        
                        {evaluationuation.feedback.areasForImprovement && (
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <h5 className="font-medium text-yellow-800 mb-2">Areas for Improvement</h5>
                            <p className="text-yellow-700 text-sm">{evaluationuation.feedback.areasForImprovement}</p>
                          </div>
                        )}
                      </div>
                      
                      {evaluationuation.feedback.overallComments && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-medium text-blue-800 mb-2">Overall Comments</h5>
                          <p className="text-blue-700 text-sm">{evaluationuation.feedback.overallComments}</p>
                        </div>
                      )}
                      
                      {evaluationuation.feedback.recommendations && (
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h5 className="font-medium text-purple-800 mb-2">Recommendations</h5>
                          <p className="text-purple-700 text-sm">{evaluationuation.feedback.recommendations}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* evaluationuation Date */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(evaluationuation.lastCalculated).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Export Options */}
        {evaluationuations.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Export Options</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  printWindow.document.write(`
                    <html>
                      <head><title>Grade Report - ${user.name}</title></head>
                      <body>
                        <h1>Grade Report for ${user.name}</h1>
                        <p>Overall GPA: ${calculateOverallGPA()}</p>
                        ${filteredevaluationuations.map(evaluationuation => `
                          <div style="margin-bottom: 20px; border: 1px solid #ccc; padding: 10px;">
                            <h2>${evaluation.courseId.name} (${evaluation.courseId.subjectCode})</h2>
                            <p>Final Grade: ${evaluation.finalGrade.letterGrade} (${evaluation.finalGrade.percentage}%)</p>
                            <p>GPA: ${evaluation.finalGrade.gpa}</p>
                          </div>
                        `).join('')}
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.print();
                }}
                className="btn-secondary"
              >
                📄 Print Report
              </button>
              
              <button
                onClick={() => {
                  const csvContent = [
                    'Course,Subject Code,Semester,Year,Final Grade,Percentage,GPA,Assignments %,Attendance %,Exams %',
                    ...filteredevaluationuations.map(evaluation => 
                      `"${evaluation.courseId.name}","${evaluation.courseId.subjectCode}","${evaluation.semester}","${evaluation.year}","${evaluation.finalGrade.letterGrade}","${evaluation.finalGrade.percentage}","${evaluation.finalGrade.gpa}","${evaluation.components.assignments.percentage}","${evaluation.components.attendance.percentage}","${evaluation.components.exams.percentage}"`
                    )
                  ].join('\n');
                  
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `grade_report_${user.name.replace(/\s+/g, '_')}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                className="btn-secondary"
              >
                📊 Export CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeReport;
