import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import GradeList from '../components/grades/GradeList';
import GradeForm from '../components/grades/GradeForm';
import GradeDetails from '../components/grades/GradeDetails';

const Grades = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('list'); // 'list', 'form', 'details'
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'form') {
      setCurrentView('form');
    }
  }, []);

  const [selectedGradeId, setSelectedGradeId] = useState(null);

  const handleAddGrade = () => {
    setSelectedGradeId(null);
    setCurrentView('form');
  };

  const handleEditGrade = (gradeId) => {
    setSelectedGradeId(gradeId);
    if (gradeId) {
      setCurrentView('form');
    } else {
      setCurrentView('form'); // Add new grade
    }
  };

  const handleViewGrade = (gradeId) => {
    setSelectedGradeId(gradeId);
    setCurrentView('details');
  };

  const handleFormSuccess = () => {
    setCurrentView('list');
    setSelectedGradeId(null);
  };

  const handleFormCancel = () => {
    setCurrentView('list');
    setSelectedGradeId(null);
  };

  const handleCloseDetails = () => {
    setCurrentView('list');
    setSelectedGradeId(null);
  };

  const getPageTitle = () => {
    switch (user?.role) {
      case 'admin':
        return 'Grade Management';
      case 'teacher':
        return 'My Grades';
      case 'student':
        return 'My Grades';
      default:
        return 'Grades';
    }
  };

  const getPageDescription = () => {
    switch (user?.role) {
      case 'admin':
        return 'Manage all grades across the system';
      case 'teacher':
        return 'View and manage grades for your courses';
      case 'student':
        return 'View your grades and academic progress';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-gray-600 mt-2">{getPageDescription()}</p>
        </div>

        {currentView === 'list' && (user.role === 'teacher' || user.role === 'admin') && (
          <button onClick={handleAddGrade} className="btn-primary">
            Add New Grade
          </button>
        )}

        {currentView !== 'list' && (
          <button onClick={() => setCurrentView('list')} className="btn-secondary">
            Back to List
          </button>
        )}
      </div>

      {/* Content */}
      {currentView === 'list' && (
        <GradeList
          onEditGrade={handleEditGrade}
          onViewGrade={handleViewGrade}
        />
      )}

      {currentView === 'form' && (
        <GradeForm
          gradeId={selectedGradeId}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {currentView === 'details' && selectedGradeId && (
        <GradeDetails
          gradeId={selectedGradeId}
          onClose={handleCloseDetails}
          onEdit={handleEditGrade}
        />
      )}
    </div>
  );
};

export default Grades;
