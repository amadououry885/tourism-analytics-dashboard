import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Eye, EyeOff, LogIn, Sparkles, Lock, User } from 'lucide-react';
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
      
      // Check if there's a redirect URL stored (e.g., from reservation flow)
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
        return;
      }
      
      // Navigate based on user role
      const role = user.role;
      console.log('Navigating based on role:', role);
      
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'vendor') {
        navigate('/vendor/dashboard');
      } else if (role === 'stay_owner') {
        navigate('/stay-owner/dashboard');
      } else if (role === 'place_owner') {
        navigate('/place-owner/dashboard');
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
    // Overlay - Dark with subtle blur
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 999999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onClick={() => { onClose(); resetModal(); }}
    >
      {/* Modal Card - Dark theme with purple accent */}
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%',
          maxWidth: '440px',
          position: 'relative',
          zIndex: 1000000
        }}
      >
        {/* Gradient glow effect behind card */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-50 blur-xl"
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #3b82f6 100%)',
            transform: 'scale(1.02)'
          }}
        />
        
        {/* Main card */}
        <div 
          className="relative rounded-2xl overflow-hidden"
          style={{
            backgroundColor: '#1e293b',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Header with gradient */}
          <div 
            className="px-8 pt-8 pb-6"
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'
            }}
          >
            {/* Close button */}
            <button
              onClick={() => { onClose(); resetModal(); }}
              className="absolute top-4 right-4 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon and title */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                {mode === 'signin' ? (
                  <LogIn className="w-8 h-8 text-white" />
                ) : (
                  <Sparkles className="w-8 h-8 text-white" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {mode === 'signin' ? 'Welcome Back' : 'Join Kedah Tourism'}
              </h2>
              <p className="text-white/80 text-sm">
                {mode === 'signin' 
                  ? 'Sign in to access your dashboard' 
                  : 'Create your account to get started'}
              </p>
            </div>
          </div>

          {/* Form content */}
          <div className="px-8 py-6">
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-5">
                {/* Username/Email field */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <User className="w-4 h-4 text-purple-400" />
                    Username or Email
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 transition-all"
                    style={{
                      backgroundColor: '#0f172a',
                      border: '2px solid #334155',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                    placeholder="Enter your username or email"
                  />
                </div>

                {/* Password field */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <Lock className="w-4 h-4 text-purple-400" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 pr-12 rounded-lg text-white placeholder-gray-500 transition-all"
                      style={{
                        backgroundColor: '#0f172a',
                        border: '2px solid #334155',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                      onBlur={(e) => e.target.style.borderColor = '#334155'}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-purple-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Forgot password link */}
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    background: isLoading 
                      ? '#6b7280' 
                      : 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                    boxShadow: isLoading 
                      ? 'none' 
                      : '0 4px 15px rgba(168, 85, 247, 0.4)'
                  }}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 text-gray-500" style={{ backgroundColor: '#1e293b' }}>
                      New to Kedah Tourism?
                    </span>
                  </div>
                </div>

                {/* Sign up link */}
                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate('/register');
                      }}
                      className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              /* Sign Up - Message directing to business portal */
              <div className="text-center py-4">
                <div 
                  className="p-4 rounded-lg mb-6"
                  style={{ backgroundColor: '#0f172a' }}
                >
                  <p className="text-gray-300">
                    To create a business account (Restaurant or Hotel), please use the{' '}
                    <span className="text-purple-400 font-semibold">"For Business"</span>{' '}
                    button in the main navigation.
                  </p>
                </div>
                <button
                  onClick={() => setMode('signin')}
                  className="text-purple-400 hover:text-purple-300 font-semibold transition-colors flex items-center gap-2 mx-auto"
                >
                  <span>←</span> Back to Sign In
                </button>
              </div>
            )}
          </div>

          {/* Footer decoration */}
          <div 
            className="h-1"
            style={{
              background: 'linear-gradient(90deg, #a855f7 0%, #6366f1 50%, #3b82f6 100%)'
            }}
          />
        </div>
      </div>
    </div>
  );

  // Render modal in a Portal at document.body
  return ReactDOM.createPortal(modalContent, document.body);
};

export default AuthModal;
