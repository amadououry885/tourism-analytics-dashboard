import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsVerifying(false);
        setIsTokenValid(false);
        return;
      }

      try {
        const response = await api.post('/auth/password-reset/verify/', { token });
        setIsTokenValid(response.data.valid);
        setUserEmail(response.data.email || '');
      } catch (error) {
        setIsTokenValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !passwordConfirm) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== passwordConfirm) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/password-reset/confirm/', {
        token,
        password,
        password_confirm: passwordConfirm
      });

      setIsSuccess(true);
      toast.success('Password reset successful!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to reset password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while verifying token
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired token
  if (!isTokenValid && !isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid or Expired Link</h2>
          
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or has expired. Reset links are valid for 1 hour.
          </p>
          
          <div className="space-y-3">
            <Link
              to="/forgot-password"
              className="block w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Request New Reset Link
            </Link>
            
            <Link
              to="/sign-in"
              className="block w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Password Reset Successful!</h2>
          
          <p className="text-gray-600 mb-6">
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
          
          <Link
            to="/sign-in"
            className="block w-full py-3 px-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  // Reset form
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
          <Lock className="w-8 h-8 text-blue-600" />
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Reset Your Password</h2>
        <p className="text-gray-600 text-center mb-2">
          Enter a new password for your account
        </p>
        {userEmail && (
          <p className="text-blue-600 text-center text-sm mb-6 font-medium">
            {userEmail}
          </p>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 pr-12"
                placeholder="Enter new password"
                minLength={4}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Must be at least 4 characters</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswordConfirm ? 'text' : 'password'}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 pr-12"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password match indicator */}
          {passwordConfirm && (
            <div className={`flex items-center text-sm ${password === passwordConfirm ? 'text-green-600' : 'text-red-600'}`}>
              {password === passwordConfirm ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Passwords match
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Passwords do not match
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || password !== passwordConfirm}
            className="w-full py-3 px-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 disabled:bg-gray-400"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
