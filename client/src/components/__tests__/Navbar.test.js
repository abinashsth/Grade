import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Navbar from '../layout/Navbar';

// Mock the useAuth hook
jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    logout: jest.fn()
  })
}));

const MockedNavbar = ({ authState }) => {
  const { useAuth } = require('../../context/AuthContext');
  
  // Override the mock for this test
  useAuth.mockReturnValue(authState);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders GradePro brand name', () => {
    render(
      <MockedNavbar 
        authState={{
          isAuthenticated: false,
          user: null,
          logout: jest.fn()
        }}
      />
    );

    expect(screen.getByText('GradePro')).toBeInTheDocument();
  });

  it('shows login and register links when not authenticated', () => {
    render(
      <MockedNavbar 
        authState={{
          isAuthenticated: false,
          user: null,
          logout: jest.fn()
        }}
      />
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('shows dashboard and logout when authenticated as student', () => {
    const mockLogout = jest.fn();
    
    render(
      <MockedNavbar 
        authState={{
          isAuthenticated: true,
          user: { name: 'John Doe', role: 'student' },
          logout: mockLogout
        }}
      />
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Grades')).toBeInTheDocument();
    expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument();
    expect(screen.getByText('student')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('shows admin link when authenticated as admin', () => {
    const mockLogout = jest.fn();
    
    render(
      <MockedNavbar 
        authState={{
          isAuthenticated: true,
          user: { name: 'Admin User', role: 'admin' },
          logout: mockLogout
        }}
      />
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Grades')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Welcome, Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('does not show admin link for teacher role', () => {
    const mockLogout = jest.fn();
    
    render(
      <MockedNavbar 
        authState={{
          isAuthenticated: true,
          user: { name: 'Teacher User', role: 'teacher' },
          logout: mockLogout
        }}
      />
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Grades')).toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    expect(screen.getByText('Welcome, Teacher User')).toBeInTheDocument();
    expect(screen.getByText('teacher')).toBeInTheDocument();
  });

  it('calls logout function when logout button is clicked', () => {
    const mockLogout = jest.fn();
    
    render(
      <MockedNavbar 
        authState={{
          isAuthenticated: true,
          user: { name: 'John Doe', role: 'student' },
          logout: mockLogout
        }}
      />
    );

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('has correct navigation links', () => {
    render(
      <MockedNavbar 
        authState={{
          isAuthenticated: true,
          user: { name: 'John Doe', role: 'student' },
          logout: jest.fn()
        }}
      />
    );

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const gradesLink = screen.getByText('Grades').closest('a');

    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(gradesLink).toHaveAttribute('href', '/grades');
  });

  it('displays user role with correct styling', () => {
    render(
      <MockedNavbar 
        authState={{
          isAuthenticated: true,
          user: { name: 'John Doe', role: 'student' },
          logout: jest.fn()
        }}
      />
    );

    const roleElement = screen.getByText('student');
    expect(roleElement).toHaveClass('text-xs', 'bg-blue-500', 'px-2', 'py-1', 'rounded');
  });
});
