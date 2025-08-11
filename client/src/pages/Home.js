import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to GradePro
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Role-Based Academic Performance Grading and Evaluation System
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="card">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">For Admins</h3>
            <ul className="text-left text-gray-600 space-y-2">
              <li>• Manage all users</li>
              <li>• Assign teachers to courses</li>
              <li>• Create and manage courses</li>
              <li>• View system-wide analytics</li>
            </ul>
          </div>
          
          <div className="card">
            <h3 className="text-xl font-semibold mb-4 text-green-600">For Teachers</h3>
            <ul className="text-left text-gray-600 space-y-2">
              <li>• View assigned students</li>
              <li>• Create and manage grades</li>
              <li>• Generate performance reports</li>
              <li>• Provide student feedback</li>
            </ul>
          </div>
          
          <div className="card">
            <h3 className="text-xl font-semibold mb-4 text-purple-600">For Students</h3>
            <ul className="text-left text-gray-600 space-y-2">
              <li>• View personal dashboard</li>
              <li>• Check grades and courses</li>
              <li>• Download grade reports</li>
              <li>• View teacher feedback</li>
            </ul>
          </div>
        </div>
        
        {!isAuthenticated && (
          <div className="space-x-4">
            <Link
              to="/register"
              className="btn-primary inline-block"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="btn-secondary inline-block"
            >
              Login
            </Link>
          </div>
        )}
        
        {isAuthenticated && (
          <Link
            to="/dashboard"
            className="btn-primary inline-block"
          >
            Go to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home;
