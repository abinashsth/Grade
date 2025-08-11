import React, { useState } from 'react';
import axios from 'axios';

const TestPasswordReset = () => {
  const [email, setEmail] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const testForgotPassword = async () => {
    setLoading(true);
    try {
      const result = await axios.post('/api/auth/forgot-password', { email });
      setResponse(result.data);
    } catch (error) {
      setResponse(error.response?.data || { success: false, message: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧪 Password Reset Testing
          </h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email to test password reset"
              />
            </div>
            
            <button
              onClick={testForgotPassword}
              disabled={loading || !email}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Forgot Password'}
            </button>
            
            {response && (
              <div className={`p-4 rounded-lg ${
                response.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  response.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  Response:
                </h3>
                <pre className={`text-sm ${
                  response.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {JSON.stringify(response, null, 2)}
                </pre>
                
                {response.success && response.resetUrl && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-blue-800 font-semibold mb-2">
                      🔗 Development Reset Link:
                    </p>
                    <a
                      href={response.resetUrl}
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {response.resetUrl}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">
              📝 Testing Instructions:
            </h3>
            <ol className="text-yellow-700 text-sm space-y-1 list-decimal list-inside">
              <li>Enter an email address of a registered user</li>
              <li>Click "Test Forgot Password"</li>
              <li>Check the server console for the reset URL</li>
              <li>Use the reset URL to test the password reset flow</li>
              <li>In production, this would send an actual email</li>
            </ol>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">
              🔧 Development Features:
            </h3>
            <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
              <li>Reset URLs are logged to server console</li>
              <li>Reset tokens are included in development responses</li>
              <li>Email content is logged instead of sent</li>
              <li>All security features are still active</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPasswordReset;
