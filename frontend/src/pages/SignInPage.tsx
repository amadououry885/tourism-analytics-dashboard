import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal';

/**
 * SignInPage - Renders the AuthModal on top of a blurred background
 * This replaces the old portal-selector SignIn page with the original modal-based login
 */
const SignInPage: React.FC = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    // Go back to home when modal is closed
    navigate('/');
  };

  return (
    <>
      {/* Background - dark themed to match the app */}
      <div className="min-h-screen" style={{ backgroundColor: '#0f172a' }}>
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}
          />
        </div>
      </div>
      
      {/* Auth Modal - always open on this page */}
      <AuthModal 
        isOpen={true} 
        onClose={handleClose}
        initialMode="signin"
      />
    </>
  );
};

export default SignInPage;
