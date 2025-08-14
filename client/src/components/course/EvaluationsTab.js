import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const EvaluationsTab = ({ course }) => {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [evaluationData, setEvaluationData] = useState({
    feedback: {
      strengths: '',
      areasForImprovement: '',
      overallComments: '',
      recommendations: ''
    },
    additionalCriteria: []
  });

  const canManage = user?.role === 'admin' || 
    (user?.role === 'teacher' && course.teacherId?._id === user.id);

  useEffect(() => {
    fetchEvaluations();
  }, [course._id]);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/evaluations?courseId=${course._id}&limit=100`);
      setEvaluations(response.data.data);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateEvaluation = async (studentId) => {
    try {
      await axios.post('/api/evaluations', {
        studentId,
        courseId: course._id,
        feedback: evaluationData.feedback,
        additionalCriteria: evaluationData.additionalCriteria
      });
      
      fetchEvaluations();
      setShowEvaluationForm(false);
      setSelectedStudent(null);
      resetEvaluationForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate evaluation');
    }
  };

  const publishEvaluation = async (evaluationId) => {
    if (!window.confirm('Are you sure you want to publish this evaluation? Students will be able to see it.')) {
      return;
    }

    try {
      await axios.put(`/api/evaluations/${evaluationId}/publish`);
      fetchEvaluations();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to publish evaluation');
    }
  };

  const resetEvaluationForm = () => {
    setEvaluationData({
      feedback: {
        strengths: '',
        areasForImprovement: '',
        overallComments: '',
        recommendations: ''
      },
      additionalCriteria: []
    });
  };

  const getLetterGradeColor = (letterGrade) => {
    if (['A+', 'A', 'A-'].includes(letterGrade)) return 'text-green-600';
    if (['B+', 'B', 'B-'].includes(letterGrade)) return 'text-blue-600';
    if (['C+', 'C', 'C-'].includes(letterGrade)) return 'text-yellow-600';
    if (['D+', 'D'].includes(letterGrade)) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStudentEvaluation = (studentId) => {
    return evaluations.find(evaluation => 
      evaluation.studentId._id === studentId || evaluation.studentId === studentId
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading evaluations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Student Evaluations ({evaluations.length})
        </h3>
        {canManage && (
          <div className="text-sm text-gray-600">
            Evaluation weights: {course.evaluationWeights?.assignments || 40}% Assignments, 
            {course.evaluationWeights?.attendance || 20}% Attendance, 
            {course.evaluationWeights?.exams || 40}% Exams
          </div>
        )}
      </div>

      {/* Student View - Personal Evaluation */}
      {user?.role === 'student' && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-medium mb-4">My Evaluation</h4>
          {(() => {
            const myEvaluation = getStudentEvaluation(user.id);
            
            if (!myEvaluation) {
              return (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No evaluation available</h3>
                  <p className="text-gray-500">Your instructor hasn't published your evaluation yet.</p>
                </div>
              );
            }

            if (!myEvaluation.isPublished) {
              return (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">⏳</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Evaluation in progress</h3>
                  <p className="text-gray-500">Your evaluation is being prepared and will be available soon.</p>
                </div>
              );
            }

            return (
              <div className="space-y-6">
                {/* Final Grade */}
                <div className="text-center bg-gray-50 p-6 rounded-lg">
                  <div className={`text-4xl font-bold mb-2 ${getLetterGradeColor(myEvaluation.finalGrade.letterGrade)}`}>
                    {myEvaluation.finalGrade.letterGrade}
                  </div>
                  <div className="text-xl text-gray-600">
                    {myEvaluation.finalGrade.percentage}% • GPA: {myEvaluation.finalGrade.gpa}
                  </div>
                </div>

                {/* Component Breakdown */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {myEvaluation.components.assignments.percentage}%
                    </div>
                    <div className="text-sm text-gray-600">Assignments</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Weight: {myEvaluation.components.assignments.weight}%
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {myEvaluation.components.attendance.percentage}%
                    </div>
                    <div className="text-sm text-gray-600">Attendance</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Weight: {myEvaluation.components.attendance.weight}%
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {myEvaluation.components.exams.percentage}%
                    </div>
                    <div className="text-sm text-gray-600">Exams</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Weight: {myEvaluation.components.exams.weight}%
                    </div>
                  </div>
                </div>

                {/* Feedback */}
                {myEvaluation.feedback && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">Instructor Feedback</h5>
                    
                    {myEvaluation.feedback.strengths && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h6 className="font-medium text-green-800 mb-2">Strengths</h6>
                        <p className="text-green-700 text-sm">{myEvaluation.feedback.strengths}</p>
                      </div>
                    )}
                    
                    {myEvaluation.feedback.areasForImprovement && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h6 className="font-medium text-yellow-800 mb-2">Areas for Improvement</h6>
                        <p className="text-yellow-700 text-sm">{myEvaluation.feedback.areasForImprovement}</p>
                      </div>
                    )}
                    
                    {myEvaluation.feedback.overallComments && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h6 className="font-medium text-blue-800 mb-2">Overall Comments</h6>
                        <p className="text-blue-700 text-sm">{myEvaluation.feedback.overallComments}</p>
                      </div>
                    )}
                    
                    {myEvaluation.feedback.recommendations && (
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h6 className="font-medium text-purple-800 mb-2">Recommendations</h6>
                        <p className="text-purple-700 text-sm">{myEvaluation.feedback.recommendations}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Teacher/Admin View - All Students */}
      {canManage && (
        <div className="space-y-6">
          {/* Evaluation Form */}
          {showEvaluationForm && selectedStudent && (
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h4 className="text-lg font-medium mb-4">
                Create Evaluation for {selectedStudent.name}
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Strengths</label>
                  <textarea
                    rows="3"
                    value={evaluationData.feedback.strengths}
                    onChange={(e) => setEvaluationData({
                      ...evaluationData,
                      feedback: { ...evaluationData.feedback, strengths: e.target.value }
                    })}
                    className="form-input"
                    placeholder="What are the student's key strengths?"
                  />
                </div>
                
                <div>
                  <label className="form-label">Areas for Improvement</label>
                  <textarea
                    rows="3"
                    value={evaluationData.feedback.areasForImprovement}
                    onChange={(e) => setEvaluationData({
                      ...evaluationData,
                      feedback: { ...evaluationData.feedback, areasForImprovement: e.target.value }
                    })}
                    className="form-input"
                    placeholder="What areas need improvement?"
                  />
                </div>
                
                <div>
                  <label className="form-label">Overall Comments</label>
                  <textarea
                    rows="4"
                    value={evaluationData.feedback.overallComments}
                    onChange={(e) => setEvaluationData({
                      ...evaluationData,
                      feedback: { ...evaluationData.feedback, overallComments: e.target.value }
                    })}
                    className="form-input"
                    placeholder="General comments about the student's performance"
                  />
                </div>
                
                <div>
                  <label className="form-label">Recommendations</label>
                  <textarea
                    rows="3"
                    value={evaluationData.feedback.recommendations}
                    onChange={(e) => setEvaluationData({
                      ...evaluationData,
                      feedback: { ...evaluationData.feedback, recommendations: e.target.value }
                    })}
                    className="form-input"
                    placeholder="Recommendations for future learning"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowEvaluationForm(false);
                      setSelectedStudent(null);
                      resetEvaluationForm();
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => generateEvaluation(selectedStudent._id)}
                    className="btn-primary"
                  >
                    Generate Evaluation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Students List */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-medium">Student Evaluations</h4>
            </div>
            
            {course.enrolledStudents?.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students enrolled</h3>
                <p className="text-gray-500">Students need to be enrolled before evaluations can be created.</p>
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
                        Final Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {course.enrolledStudents?.map((student) => {
                      const evaluation = getStudentEvaluation(student._id);
                      
                      return (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {student.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {evaluation ? (
                              <div>
                                <div className={`text-sm font-medium ${getLetterGradeColor(evaluation.finalGrade.letterGrade)}`}>
                                  {evaluation.finalGrade.letterGrade}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {evaluation.finalGrade.percentage}%
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Not evaluated</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {evaluation ? (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                evaluation.isPublished 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {evaluation.isPublished ? 'Published' : 'Draft'}
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {evaluation ? (
                              <>
                                {!evaluation.isPublished && (
                                  <button
                                    onClick={() => publishEvaluation(evaluation._id)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    Publish
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setEvaluationData({
                                      feedback: evaluation.feedback || {
                                        strengths: '',
                                        areasForImprovement: '',
                                        overallComments: '',
                                        recommendations: ''
                                      },
                                      additionalCriteria: evaluation.additionalCriteria || []
                                    });
                                    setShowEvaluationForm(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Edit
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedStudent(student);
                                  resetEvaluationForm();
                                  setShowEvaluationForm(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Create Evaluation
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationsTab;
