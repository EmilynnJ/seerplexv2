import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signup } = useAuth();

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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const result = await signup(formData.email, formData.password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner text="Creating your account..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="card-mystical">
          <div className="text-center mb-8">
            <h2 className="font-alex-brush text-4xl text-mystical-pink mb-2">
              Join SoulSeer
            </h2>
            <p className="font-playfair text-gray-300">
              Create your account to connect with gifted psychics
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
                placeholder="Create a password"
                required
              />
            </div>

            <div>
              <label className="font-playfair text-white text-sm font-medium mb-2 block">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-mystical w-full"
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-mystical w-full"
              disabled={loading}
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-playfair text-gray-300">
              Already have an account?{' '}
              <Link to="/login" className="text-mystical-pink hover:text-pink-300 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;