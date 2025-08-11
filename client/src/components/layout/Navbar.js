import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-white text-2xl font-bold">
            GradePro
          </Link>

          {/* Mobile hamburger */}
          <button className="md:hidden text-white" onClick={()=>setOpen(o=>!o)} aria-label="Toggle menu">
            <span className="text-2xl">☰</span>
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-white hover:text-blue-200 transition">Dashboard</Link>
                <Link to="/grades" className="text-white hover:text-blue-200 transition">Grades</Link>
                {user?.role === 'teacher' && (
                  <>
                    <Link to="/teacher/courses" className="text-white hover:text-blue-200 transition">My Courses</Link>
                    <Link to="/teacher/reports" className="text-white hover:text-blue-200 transition">Reports</Link>
                  </>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-white hover:text-blue-200 transition">Admin</Link>
                )}
                <span className="text-blue-200">Welcome, {user?.name}</span>
                <span className="text-xs bg-blue-500 px-2 py-1 rounded">{user?.role}</span>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-blue-200 transition">Login</Link>
                <Link to="/register" className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded transition">Register</Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden pb-4 space-y-2">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block text-white">Dashboard</Link>
                <Link to="/grades" className="block text-white">Grades</Link>
                {user?.role === 'teacher' && (
                  <>
                    <Link to="/teacher/courses" className="block text-white">My Courses</Link>
                    <Link to="/teacher/reports" className="block text-white">Reports</Link>
                  </>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="block text-white">Admin</Link>
                )}
                <button onClick={handleLogout} className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-white">Login</Link>
                <Link to="/register" className="block text-white">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
