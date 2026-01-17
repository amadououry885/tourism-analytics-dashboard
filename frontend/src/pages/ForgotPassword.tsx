import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/password-reset/', { 
        email,
        frontend_url: window.location.origin 
      });
      
      setIsSubmitted(true);
      toast.success('Password reset instructions sent!');
    } catch (error: any) {
      // Still show success to prevent email enumeration
      setIsSubmitted(true);
      toast.success('If your email exists, you will receive reset instructions.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h2>
          
          <p className="text-gray-600 mb-6">
            If an account exists for <strong>{email}</strong>, you will receive password reset instructions shortly.
          </p>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Didn't receive the email?</strong>
              <br />
              Check your spam folder, or wait a few minutes and try again.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Try Another Email
            </button>
            
            <Link
              to="/sign-in"
              className="block w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Back Link */}
        <Link to="/sign-in" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Link>
        
        {/* Icon */}
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Forgot Password?</h2>
        <p className="text-gray-600 text-center mb-8">
          No worries! Enter your email and we'll send you reset instructions.
        </p>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 disabled:bg-gray-400"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        {/* Register Link */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
