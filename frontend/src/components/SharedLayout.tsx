import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Menu, X } from 'lucide-react';

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

  // Base style for desktop links
  const linkStyle = (path: string) => ({
    color: isActive(path) ? '#2dd4bf' : '#cbd5e1', // Teal if active, Slate-300 if not
    fontSize: '17px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    transition: 'color 0.2s',
  });

  // Base style for mobile links
  const mobileLinkStyle = (path: string) => ({
    color: isActive(path) ? '#2dd4bf' : '#cbd5e1',
    fontSize: '18px',
    fontWeight: '500' as const,
    textDecoration: 'none',
    display: 'block',
    padding: '10px 0'
  });

  return (
    <>
      {/* INTERNAL CSS FOR RESPONSIVENESS */}
      <style>{`
        .nav-desktop { display: flex; align-items: center; gap: 24px; }
        .nav-mobile-btn { display: none; }
        .mobile-menu-dropdown { 
          display: none; 
          flex-direction: column;
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          background-color: #0f172a;
          border-bottom: 1px solid #334155;
          padding: 24px;
          gap: 16px;
          z-index: 49;
          box-shadow: 0 10px 20px rgba(0,0,0,0.5);
        }
        .mobile-menu-dropdown.open { display: flex; }

        @media (max-width: 768px) {
          .nav-desktop { display: none; }
          .nav-mobile-btn { display: block; cursor: pointer; color: white; }
        }
      `}</style>

      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
        backdropFilter: 'blur(8px)',
        height: '70px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo */}
            <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', textDecoration: 'none' }}>
              Kedah Tourism
            </Link>

            {/* Desktop Navigation */}
            <nav className="nav-desktop">
              <Link to="/" style={linkStyle('/')}>Home</Link>
              <Link to="/places" style={linkStyle('/places')}>Places</Link>
              <Link to="/food" style={linkStyle('/food')}>Food</Link>
              <Link to="/stays" style={linkStyle('/stays')}>Stay</Link>
              <Link to="/events" style={linkStyle('/events')}>Events</Link>
              <Link to="/analytics" style={{ ...linkStyle('/analytics'), display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BarChart3 size={18} />
                Analytics
              </Link>
              <Link to="/sign-in" style={{ 
                backgroundColor: '#fbef00', // Yellow from Home Page
                color: 'black', 
                padding: '10px 20px', 
                borderRadius: '8px', 
                fontSize: '16px', 
                fontWeight: '600', 
                textDecoration: 'none' 
              }}>
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
        <Link to="/" onClick={toggleMenu} style={mobileLinkStyle('/')}>Home</Link>
        <Link to="/places" onClick={toggleMenu} style={mobileLinkStyle('/places')}>Places</Link>
        <Link to="/food" onClick={toggleMenu} style={mobileLinkStyle('/food')}>Food</Link>
        <Link to="/stays" onClick={toggleMenu} style={mobileLinkStyle('/stays')}>Stay</Link>
        <Link to="/events" onClick={toggleMenu} style={mobileLinkStyle('/events')}>Events</Link>
        <Link to="/analytics" onClick={toggleMenu} style={{ ...mobileLinkStyle('/analytics'), display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} /> Analytics
        </Link>
        <Link to="/sign-in" onClick={toggleMenu} style={{ 
          backgroundColor: '#fbef00', 
          color: 'black', 
          padding: '12px', 
          borderRadius: '8px', 
          fontSize: '16px', 
          fontWeight: '600', 
          textDecoration: 'none',
          textAlign: 'center',
          marginTop: '8px'
        }}>
          Sign In
        </Link>
      </div>
    </>
  );
}

export function SharedFooter() {
  return (
    <footer style={{
      backgroundColor: '#020617', // Darker slate for footer
      borderTop: '1px solid #1e293b',
      padding: '32px 24px',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#94a3b8', fontSize: '14px', lineHeight: '1.8' }}>
        <p style={{ margin: 0 }}>© 2026 Kedah Tourism Analytics Dashboard</p>
        <p style={{ margin: '4px 0 0 0' }}>
          School of Computing & Informatics, Albukhary International University
        </p>
      </div>
    </footer>
  );
}

export function SharedLayout({ children }: SharedLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: 'Poppins, sans-serif' }}>
      <SharedHeader />
      {/* Added paddingTop to compensate for fixed header height (70px) */}
      <main style={{ paddingTop: '70px', minHeight: 'calc(100vh - 200px)' }}>
        {children}
      </main>
      <SharedFooter />
    </div>
  );
}