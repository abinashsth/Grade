import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await axios.get(`/api/auth/verify-reset-token/${token}`);
        if (response.data.success) {
          setIsValidToken(true);
        }
      } catch (error) {
        setIsValidToken(false);
        setError('Invalid or expired reset token');
      }
    };
    verify();
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`/api/auth/reset-password/${token}`, {
        password: formData.password
      });

      if (response.data.success) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying reset token...</p>
        </div>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="card text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 mb-4">
              <span className="text-3xl">❌</span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Invalid Reset Link
            </h2>
            
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            
            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="btn-primary w-full"
              >
                Request New Reset Link
              </Link>
              
              <Link
                to="/login"
                className="btn-secondary w-full"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="card text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <span className="text-3xl">✅</span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Password Reset Successful!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700 text-sm">
                Redirecting to login page in 3 seconds...
              </p>
            </div>
            
            <Link
              to="/login"
              className="btn-primary w-full"
            >
              Go to Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <span className="text-2xl">🔑</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="card">
            <div className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="password" className="form-label">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your new password"
                  minLength="6"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Confirm your new password"
                />
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-600">Password strength:</div>
                  <div className="flex space-x-1">
                    <div className={`h-2 w-1/4 rounded ${formData.password.length >= 6 ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                    <div className={`h-2 w-1/4 rounded ${formData.password.length >= 8 ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                    <div className={`h-2 w-1/4 rounded ${/[A-Z]/.test(formData.password) ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                    <div className={`h-2 w-1/4 rounded ${/[0-9]/.test(formData.password) ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Include uppercase letters and numbers for a stronger password
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading || formData.password !== formData.confirmPassword}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Resetting Password...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  ← Back to Login
                </Link>
              </div>
            </div>
          </div>
        </form>

        {/* Security Notice */}
        <div className="card bg-blue-50">
          <h4 className="font-semibold text-blue-800 mb-2">🔒 Security Notice</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Choose a strong, unique password</li>
            <li>• Don't reuse passwords from other accounts</li>
            <li>• This reset link will expire after use</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
