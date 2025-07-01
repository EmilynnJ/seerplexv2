import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner text="Signing you in..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="card-mystical">
          <div className="text-center mb-8">
            <h2 className="font-alex-brush text-4xl text-mystical-pink mb-2">
              Welcome Back
            </h2>
            <p className="font-playfair text-gray-300">
              Sign in to your SoulSeer account
            </p>
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4 mb-6">
              <p className="font-playfair text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="font-playfair text-white text-sm font-medium mb-2 block">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-mystical w-full"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="font-playfair text-white text-sm font-medium mb-2 block">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-mystical w-full"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-mystical w-full"
              disabled={loading}
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-playfair text-gray-300">
              Don't have an account?{' '}
              <Link to="/signup" className="text-mystical-pink hover:text-pink-300 transition-colors">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;