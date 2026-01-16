import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const NavigationButtons: React.FC = () => {
  const location = useLocation();
  
  const isBusinessActive = location.pathname.includes('/business');
  const isSignInPath = location.pathname.includes('/sign-in');

  return (
    <div className="flex items-center gap-3">
      <Link
        to="/business"
        className={`px-4 py-2 rounded-lg transition-colors font-medium shadow-sm ${
          isBusinessActive
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        For Business
      </Link>
      <Link
        to="/sign-in"
        className={`px-4 py-2 rounded-lg transition-colors font-medium shadow-sm ${
          isSignInPath
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
      >
        Sign In
      </Link>
    </div>
  );
};
