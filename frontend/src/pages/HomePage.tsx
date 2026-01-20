import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Utensils, Hotel, Calendar, BarChart3, Menu, X } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle Mobile Menu
  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* INTERNAL CSS FOR RESPONSIVENESS 
        This handles the media queries that inline styles cannot do.
      */}
      <style>{`
        /* Default Desktop Styles */
        .nav-desktop { display: flex; align-items: center; gap: 24px; }
        .nav-mobile-btn { display: none; }
        .mobile-menu-dropdown { display: none; }
        
        .hero-title { font-size: 64px; }
        .hero-subtitle { font-size: 24px; }
        
        .discovery-grid { 
          display: grid; 
          grid-template-columns: repeat(2, 1fr); 
          gap: 24px; 
        }

        /* Mobile Styles (Max Width 768px) */
        @media (max-width: 768px) {
          .nav-desktop { display: none; }
          .nav-mobile-btn { display: block; cursor: pointer; color: white; }
          
          /* Show mobile menu when open */
          .mobile-menu-dropdown.open {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            background-color: #0f172a;
            border-bottom: 1px solid #334155;
            padding: 20px;
            gap: 20px;
            z-index: 49;
            box-shadow: 0 10px 20px rgba(0,0,0,0.5);
          }

          .hero-title { font-size: 40px; }
          .hero-subtitle { font-size: 18px; }
          
          .discovery-grid { 
            grid-template-columns: 1fr; /* Stack cards vertically */
          }
        }
      `}</style>

      {/* Header - Fixed at top */}
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
              <Link to="/" style={{ color: '#2dd4bf', fontSize: '17px', fontWeight: '600', textDecoration: 'none' }}>Home</Link>
              <Link to="/places" style={{ color: '#cbd5e1', fontSize: '17px', fontWeight: '600', textDecoration: 'none' }}>Places</Link>
              <Link to="/food" style={{ color: '#cbd5e1', fontSize: '17px', fontWeight: '600', textDecoration: 'none' }}>Food</Link>
              <Link to="/stays" style={{ color: '#cbd5e1', fontSize: '17px', fontWeight: '600', textDecoration: 'none' }}>Stay</Link>
              <Link to="/events" style={{ color: '#cbd5e1', fontSize: '17px', fontWeight: '600', textDecoration: 'none' }}>Events</Link>
              <Link to="/analytics" style={{ color: '#cbd5e1', fontSize: '17px', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BarChart3 size={18} />
                Analytics
              </Link>
              <Link to="/sign-in" style={{ backgroundColor: '#fbef00', color: 'black', padding: '10px 20px', borderRadius: '8px', fontSize: '16px', fontWeight: '600', textDecoration: 'none' }}>
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

      {/* Mobile Menu Dropdown Panel */}
      <div className={`mobile-menu-dropdown ${isMobileMenuOpen ? 'open' : ''}`}>
        <Link to="/" onClick={toggleMenu} style={{ color: '#2dd4bf', fontSize: '18px', fontWeight: '500', textDecoration: 'none' }}>Home</Link>
        <Link to="/places" onClick={toggleMenu} style={{ color: '#cbd5e1', fontSize: '18px', fontWeight: '500', textDecoration: 'none' }}>Places</Link>
        <Link to="/food" onClick={toggleMenu} style={{ color: '#cbd5e1', fontSize: '18px', fontWeight: '500', textDecoration: 'none' }}>Food</Link>
        <Link to="/stays" onClick={toggleMenu} style={{ color: '#cbd5e1', fontSize: '18px', fontWeight: '500', textDecoration: 'none' }}>Stay</Link>
        <Link to="/events" onClick={toggleMenu} style={{ color: '#cbd5e1', fontSize: '18px', fontWeight: '500', textDecoration: 'none' }}>Events</Link>
        <Link to="/analytics" onClick={toggleMenu} style={{ color: '#cbd5e1', fontSize: '18px', fontWeight: '500', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} /> Analytics
        </Link>
        <Link to="/sign-in" onClick={toggleMenu} style={{ backgroundColor: '#fbef00', color: 'black', padding: '12px', borderRadius: '8px', fontSize: '16px', fontWeight: '600', textDecoration: 'none', textAlign: 'center' }}>
          Sign In
        </Link>
      </div>

      {/* HERO SECTION */}
      <section style={{
        position: 'relative',
        height: '100vh',
        minHeight: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Background Image */}
        <img
          src="/images/alor-setar-tower.png"
          alt="Alor Setar Tower"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Dark Overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(71, 223, 162, 0.6)' }} />
        
        {/* Hero Content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: '800px' }}>
          <h1 className="hero-title" style={{ fontWeight: 'bold', color: 'white', marginBottom: '24px', lineHeight: '1.2' }}>
            Kedah Tourism
          </h1>
          <p className="hero-subtitle" style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '40px', lineHeight: '1.6' }}>
            Discover the beauty of Malaysia's Rice Bowl — from iconic landmarks to hidden gems.
          </p>
          <button
            onClick={() => {
              const grid = document.getElementById('discovery-grid');
              if (grid) grid.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              backgroundColor: '#fbef00',
              color: 'black',
              padding: '16px 40px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            Explore Kedah <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* DISCOVERY GRID */}
      <section 
        id="discovery-grid" 
        style={{ padding: '80px 24px', backgroundColor: '#0f172a' }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: '48px' }}>
            What would you like to explore?
          </h2>
          
          {/* Responsive Grid Container (Class handled in <style> tag) */}
          <div className="discovery-grid">
            
            {/* Places Card */}
            <div onClick={() => navigate('/places')} style={{ position: 'relative', height: '280px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
              <img src="https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80" alt="Places" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
              <div style={{ position: 'absolute', bottom: '24px', left: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={24} color="#fbef00" />
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>Places</span>
              </div>
            </div>

            {/* Food Card */}
            <div onClick={() => navigate('/food')} style={{ position: 'relative', height: '280px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
              <img src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80" alt="Food" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
              <div style={{ position: 'absolute', bottom: '24px', left: '24px', display: 'flex', alignItems: 'center', gap: '12px', }}>
                <Utensils size={24} color="#fbef00" />
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>Food</span>
              </div>
            </div>

            {/* Stay Card */}
            <div onClick={() => navigate('/stays')} style={{ position: 'relative', height: '280px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', transition: 'transform 0.3s ease-in-out'}}>
              <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" alt="Stay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
              <div style={{ position: 'absolute', bottom: '24px', left: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Hotel size={24} color="#fbef00" />
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>Stay</span>
              </div>
            </div>

            {/* Events Card */}
            <div onClick={() => navigate('/events')} style={{ position: 'relative', height: '280px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
              <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80" alt="Events" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
              <div style={{ position: 'absolute', bottom: '24px', left: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={24} color="#fbef00" />
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>Events</span>
              </div>
            </div>
          </div>

          {/* Analytics Banner - Full Width */}
          <div
            onClick={() => navigate('/analytics')}
            style={{
              marginTop: '24px',
              position: 'relative',
              height: '160px',
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              background: 'linear-gradient(135deg, #34dbf9 0%, #3bcbff 50%, #000000 100%)'
            }}
          >
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%',
              background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.5
            }} />
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              textAlign: 'center',
              width: '100%',
              justifyContent: 'center',
              padding: '0 10px'
            }}>
              <BarChart3 size={40} color="black" style={{ flexShrink: 0 }} />
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 'bold', color: 'white', display: 'block' }}>
                  Tourism Analytics
                </span>
                <span style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: 'rgba(255,255,255,0.8)', display: 'block', marginTop: '4px' }}>
                  Real-time insights • Visitor sentiment
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#020617',
        borderTop: '1px solid #1e293b',
        padding: '32px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#94a3b8', fontSize: '14px', lineHeight: '1.8' }}>
          <p style={{ margin: 0 }}>© 2026 Kedah Tourism Analytics Dashboard</p>
          <p style={{ margin: '4px 0 0 0' }}>School of Computing & Informatics, Albukhary International University</p>
        </div>
      </footer>
    </div>
  );
}