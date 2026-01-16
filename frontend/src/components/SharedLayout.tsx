import { Link, useLocation } from 'react-router-dom';

interface SharedLayoutProps {
  children: React.ReactNode;
}

export function SharedHeader() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const linkStyle = (path: string) => ({
    color: isActive(path) ? '#2dd4bf' : '#cbd5e1',
    fontSize: '14px',
    fontWeight: '500' as const,
    textDecoration: 'none',
    transition: 'color 0.2s',
  });

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', textDecoration: 'none' }}>
            Kedah Tourism
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link to="/" style={linkStyle('/')}>Home</Link>
            <Link to="/places" style={linkStyle('/places')}>Places</Link>
            <Link to="/food" style={linkStyle('/food')}>Food</Link>
            <Link to="/stays" style={linkStyle('/stays')}>Stay</Link>
            <Link to="/events" style={linkStyle('/events')}>Events</Link>
            <Link to="/sign-in" style={{ 
              backgroundColor: '#14b8a6', 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              fontSize: '14px', 
              fontWeight: '500', 
              textDecoration: 'none' 
            }}>
              Sign In
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export function SharedFooter() {
  return (
    <footer style={{
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '24px',
      textAlign: 'center',
    }}>
      <p style={{ color: '#94a3b8', fontSize: '14px' }}>
        © 2026 Kedah Tourism Analytics Dashboard
      </p>
      <p style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
        School of Computing & Informatics, Albukhary International University
      </p>
    </footer>
  );
}

export function SharedLayout({ children }: SharedLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <SharedHeader />
      <main style={{ paddingTop: '73px' }}>
        {children}
      </main>
      <SharedFooter />
    </div>
  );
}
