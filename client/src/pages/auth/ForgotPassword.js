import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      
      if (response.data.success) {
        setMessage(response.data.message);
        setIsSubmitted(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <span className="text-2xl">🔐</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don't worry! Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {!isSubmitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="card">
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      'Send Reset Link'
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
        ) : (
          <div className="card">
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
                <span className="text-3xl">✅</span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900">
                Check your email!
              </h3>
              
              {message && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {message}
                </div>
              )}
              
              <p className="text-gray-600">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">What's next?</h4>
                <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the reset link in the email</li>
                  <li>Create a new password</li>
                  <li>Log in with your new password</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                    setMessage('');
                  }}
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  Try a different email address
                </button>
                
                <div>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-500 text-sm"
                  >
                    ← Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="card bg-gray-50">
          <h4 className="font-semibold text-gray-800 mb-3">Need help?</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Make sure to check your spam/junk folder</p>
            <p>• The reset link will expire in 1 hour</p>
            <p>• If you don't receive the email, try again or contact support</p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Still having trouble?{' '}
              <Link to="/contact" className="text-blue-600 hover:text-blue-500 font-medium">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
