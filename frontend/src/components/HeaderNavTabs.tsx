import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, LogIn } from 'lucide-react';

export const HeaderNavTabs: React.FC = () => {
  const location = useLocation();
  const isBusinessActive = location.pathname.includes('/business');
  const isSignInActive = location.pathname.includes('/sign-in');

  return (
    <div className="flex items-center gap-3">
      <Link
        to="/business"
        className={`
          px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm border flex items-center gap-2
          ${isBusinessActive 
            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }
        `}
      >
        <Building2 className="w-4 h-4" />
        <span>For Business</span>
      </Link>
      
      <Link
        to="/sign-in"
        className={`
          px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm border flex items-center gap-2
          ${isSignInActive 
            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }
        `}
      >
        <LogIn className="w-4 h-4" />
        <span>Sign In</span>
      </Link>
    </div>
  );
};
