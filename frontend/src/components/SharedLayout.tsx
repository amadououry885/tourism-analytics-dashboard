import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Menu, 
  X,
  Home,
  MapPin,
  Utensils,
  Hotel,
  Calendar
} from 'lucide-react';

interface SharedLayoutProps {
  children: React.ReactNode;
}

export function SharedHeader() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentPath = location.pathname;

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    if (path === '/analytics') return currentPath.includes('tab=overview') || currentPath === '/analytics';
    return currentPath.startsWith(path);
  };

  // Helper class for links to keep code clean
  const getLinkClass = (path: string) => `
    flex items-center gap-2 text-[16px] font-bold no-underline transition-colors duration-200
    ${isActive(path) ? 'text-orange-500' : 'text-blue-900 hover:text-orange-500'}
  `;

  // Helper class for mobile links
  const getMobileLinkClass = (path: string) => `
    flex items-center gap-3 text-lg font-medium no-underline py-2 border-b border-gray-100
    ${isActive(path) ? 'text-orange-500' : 'text-blue-900'}
  `;

  return (
    <>
      {/* INTERNAL CSS FOR RESPONSIVENESS */}
      <style>{`
        /* Desktop/Mobile Utility Classes */
        .nav-desktop { display: flex; align-items: center; gap: 24px; }
        .nav-mobile-btn { display: none; }
        .mobile-menu-dropdown { 
          display: none; 
          flex-direction: column;
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          background-color: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 20px;
          gap: 16px;
          z-index: 49;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .mobile-menu-dropdown.open { display: flex; }

        @media (max-width: 768px) {
          .nav-desktop { display: none; }
          .nav-mobile-btn { display: block; cursor: pointer; color: #1e3a8a; } /* Blue-900 */
        }
      `}</style>

      {/* Header - Trip.com Style: White BG, Blue Text */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 h-[70px] flex items-center shadow-sm">
        <div className="w-full max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="text-2xl font-extrabold text-blue-900 hover:text-blue-700 transition-colors no-underline tracking-tight flex items-center gap-2">
              <span className="bg-blue-600 text-white px-2 py-1 rounded-lg text-lg">K</span> Kedah Tourism
            </Link>

            {/* Desktop Navigation */}
            <nav className="nav-desktop">
              <Link to="/" className={getLinkClass('/')}>
                <Home size={18} /> Home
              </Link>
              <Link to="/places" className={getLinkClass('/places')}>
                <MapPin size={18} /> Places
              </Link>
              <Link to="/food" className={getLinkClass('/food')}>
                <Utensils size={18} /> Food
              </Link>
              <Link to="/stays" className={getLinkClass('/stays')}>
                <Hotel size={18} /> Stay
              </Link>
              <Link to="/events" className={getLinkClass('/events')}>
                <Calendar size={18} /> Events
              </Link>
              <Link to="/analytics" className={getLinkClass('/analytics')}>
                <BarChart3 size={18} /> Analytics
              </Link>
              
              {/* Sign In Button - Blue */}
              <Link to="/sign-in" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-bold no-underline shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 ml-2">
                Sign In
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <div className="nav-mobile-btn" onClick={toggleMenu}>
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      <div className={`mobile-menu-dropdown ${isMobileMenuOpen ? 'open' : ''}`}>
        <Link to="/" onClick={toggleMenu} className={getMobileLinkClass('/')}>
          <Home size={20} className="text-blue-600" /> Home
        </Link>
        <Link to="/places" onClick={toggleMenu} className={getMobileLinkClass('/places')}>
          <MapPin size={20} className="text-blue-600" /> Places
        </Link>
        <Link to="/food" onClick={toggleMenu} className={getMobileLinkClass('/food')}>
          <Utensils size={20} className="text-blue-600" /> Food
        </Link>
        <Link to="/stays" onClick={toggleMenu} className={getMobileLinkClass('/stays')}>
          <Hotel size={20} className="text-blue-600" /> Stay
        </Link>
        <Link to="/events" onClick={toggleMenu} className={getMobileLinkClass('/events')}>
          <Calendar size={20} className="text-blue-600" /> Events
        </Link>
        <Link to="/analytics" onClick={toggleMenu} className={getMobileLinkClass('/analytics')}>
          <BarChart3 size={20} className="text-blue-600" /> Analytics
        </Link>
        
        <Link to="/sign-in" onClick={toggleMenu} className="bg-blue-600 text-white w-full py-3 rounded-lg text-base font-bold no-underline text-center mt-2 shadow-md">
          Sign In
        </Link>
      </div>
    </>
  );
}

export function SharedFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 px-6 text-center">
      <div className="max-w-[1200px] mx-auto text-gray-500 text-sm leading-relaxed">
        <p className="m-0 text-gray-900 font-bold">© 2026 Kedah Tourism Analytics Dashboard</p>
        <p className="mt-1">
          School of Computing & Informatics, Albukhary International University
        </p>
      </div>
    </footer>
  );
}

export function SharedLayout({ children }: SharedLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SharedHeader />
      {/* pt-[70px] pushes content down so it doesn't hide behind the fixed header.
         min-h-[calc...] ensures footer stays at bottom on short pages.
      */}
      <main className="pt-[70px] min-h-[calc(100vh-200px)]">
        {children}
      </main>
      <SharedFooter />
    </div>
  );
}