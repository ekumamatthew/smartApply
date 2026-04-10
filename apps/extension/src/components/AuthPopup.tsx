import React, { useState, useEffect } from 'react';
import { authClient, checkAuthStatus, handleLogin, handleRegistration } from '../auth/auth-client';

interface User {
  id: string;
  email: string;
  name?: string;
}

export default function AuthPopup() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuthStatus().then((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLoginMode) {
        const result = await handleLogin(email, password);
        setUser(result.user);
      } else {
        const result = await handleRegistration(email, password, name);
        setUser(result.user);
      }
    } catch (err) {
      setError(isLoginMode ? 'Login failed. Please check your credentials.' : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      setEmail('');
      setPassword('');
      setName('');
    } catch (err) {
      setError('Sign out failed');
    }
  };

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">SwiftApplyHQ</h2>
            <button
              onClick={handleSignOut}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Sign Out
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{user.name || 'User'}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
              View Applications
            </button>
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
              Add Application
            </button>
            <button className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors">
              Track Emails
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {isLoginMode ? 'Sign In' : 'Sign Up'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {!isLoginMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
                required={!isLoginMode}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLoginMode ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="ml-1 text-blue-500 hover:text-blue-700 font-medium"
            >
              {isLoginMode ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
