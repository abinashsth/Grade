import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import CourseInfo from './CourseInfo';
import AssignmentsTab from './AssignmentsTab';
import AttendanceTab from './AttendanceTab';
import EvaluationsTab from './EvaluationsTab';
import EnrollmentTab from './EnrollmentTab';

const CourseDetailsTabs = ({ course, onCourseUpdate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info');

  const tabs = [
    { id: 'info', label: 'Course Info', icon: '📚' },
    { id: 'assignments', label: 'Assignments', icon: '📝' },
    { id: 'attendance', label: 'Attendance', icon: '📅' },
    { id: 'evaluations', label: 'Evaluations', icon: '📊' },
    ...(user?.role === 'teacher' || user?.role === 'admin' 
      ? [{ id: 'enrollment', label: 'Enrollment', icon: '👥' }] 
      : [])
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <CourseInfo course={course} onUpdate={onCourseUpdate} />;
      case 'assignments':
        return <AssignmentsTab course={course} />;
      case 'attendance':
        return <AttendanceTab course={course} onUpdate={onCourseUpdate} />;
      case 'evaluations':
        return <EvaluationsTab course={course} />;
      case 'enrollment':
        return <EnrollmentTab course={course} onUpdate={onCourseUpdate} />;
      default:
        return <CourseInfo course={course} onUpdate={onCourseUpdate} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
            <p className="text-gray-600 mt-1">
              {course.subjectCode} • {course.semester} {course.year} • {course.credits} Credits
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Instructor: {course.teacherId?.name} • {course.enrolledStudents?.length || 0} Students Enrolled
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              course.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {course.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {course.gradingSchema.charAt(0).toUpperCase() + course.gradingSchema.slice(1)} Grading
            </span>
          </div>
        </div>
        
        {course.description && (
          <p className="text-gray-700 mt-4">{course.description}</p>
        )}

        {/* Schedule Information */}
        {course.schedule && (course.schedule.days?.length > 0 || course.schedule.startTime) && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Schedule</h3>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {course.schedule.days?.length > 0 && (
                <span>📅 {course.schedule.days.join(', ')}</span>
              )}
              {course.schedule.startTime && course.schedule.endTime && (
                <span>🕐 {course.schedule.startTime} - {course.schedule.endTime}</span>
              )}
              {course.schedule.room && (
                <span>🏫 Room {course.schedule.room}</span>
              )}
            </div>
          </div>
        )}

        {/* Evaluation Weights */}
        {course.evaluationWeights && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Evaluation Breakdown</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-blue-700">
                📝 Assignments: {course.evaluationWeights.assignments}%
              </span>
              <span className="text-green-700">
                📅 Attendance: {course.evaluationWeights.attendance}%
              </span>
              <span className="text-purple-700">
                📊 Exams: {course.evaluationWeights.exams}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsTabs;
