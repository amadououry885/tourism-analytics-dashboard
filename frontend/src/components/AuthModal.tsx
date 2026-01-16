import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  // Update mode when initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login(formData.username, formData.password);
      
      console.log('Login successful! User:', user);
      
      toast.success(`Welcome back, ${user.first_name || user.username}!`);
      onClose();
      
      // Navigate based on user role
      const role = user.role;
      console.log('Navigating based on role:', role);
      
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'vendor') {
        navigate('/vendor/dashboard');
      } else if (role === 'stay_owner') {
        navigate('/stay-owner/dashboard');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
    });
    setShowPassword(false);
  };

  console.log('AuthModal render - isOpen:', isOpen, 'mode:', mode);

  if (!isOpen) return null;

  const modalContent = (
    // Overlay - Lighter with blur, keeps page visible
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 999999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onClick={() => { onClose(); resetModal(); }}
    >
      {/* Modal Card - Strongly elevated, clearly floating */}
      <div 
        className="bg-white rounded-2xl relative"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: '420px',
          padding: '32px',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.35)',
          position: 'relative',
          zIndex: 1000000
        }}
      >
        <button
          onClick={() => { onClose(); resetModal(); }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {mode === 'signin' ? 'Welcome Back' : 'Join Kedah Tourism'}
            </h2>
            <p className="text-gray-600 text-sm">
              {mode === 'signin' 
                ? 'Please sign in to continue' 
                : 'Create your account to get started'}
            </p>
          </div>

          {/* Sign In Form */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username or Email
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your username or email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* Sign Up - Simple message directing to business portal */
            <div className="text-center py-4">
              <p className="text-gray-700 mb-6">
                To create a business account (Restaurant or Hotel), please use the <strong>"For Business"</strong> button in the main navigation.
              </p>
              <button
                onClick={() => setMode('signin')}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                ← Back to Sign In
              </button>
            </div>
          )}
      </div>
    </div>
  );

  // Render modal in a Portal at document.body
  return ReactDOM.createPortal(modalContent, document.body);
};

export default AuthModal;
