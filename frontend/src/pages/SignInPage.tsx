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
      {/* Background - show the tourism dashboard behind the modal */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Semi-transparent overlay with blur effect handled by AuthModal */}
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
