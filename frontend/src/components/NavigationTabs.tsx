import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, LogIn } from 'lucide-react';

interface TabItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  active?: boolean;
}

interface NavigationTabsProps {
  className?: string;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ className = '' }) => {
  const location = useLocation();

  const tabs: TabItem[] = [
    {
      label: 'For Business',
      path: '/business',
      icon: <Building2 className="w-4 h-4" />,
      active: location.pathname.includes('/business')
    },
    {
      label: 'Sign In',
      path: '/login',
      icon: <LogIn className="w-4 h-4" />,
      active: location.pathname.includes('/login')
    }
  ];

  return (
    <div className={`bg-gray-50/80 backdrop-blur-sm rounded-xl p-1.5 flex items-center gap-1 shadow-lg border border-gray-200/60 ${className}`}>
      {tabs.map((tab, index) => (
        <Link
          key={tab.path}
          to={tab.path}
          className={`
            px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 relative overflow-hidden group flex items-center gap-2 min-w-0
            ${tab.active 
              ? 'bg-white text-indigo-600 shadow-md border border-white/40' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }
          `}
        >
          {/* Background gradient effect */}
          <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${tab.active ? 'opacity-100' : ''}`}></div>
          
          {/* Content */}
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon}
            <span>{tab.label}</span>
          </span>
          
          {/* Active indicator */}
          {tab.active && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
          )}
        </Link>
      ))}
    </div>
  );
};
