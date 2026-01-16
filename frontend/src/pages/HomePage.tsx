import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Utensils, Hotel, Calendar } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      {/* Header - Fixed at top */}
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
              <Link to="/" style={{ color: '#2dd4bf', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>Home</Link>
              <Link to="/places" style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>Places</Link>
              <Link to="/food" style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>Food</Link>
              <Link to="/stays" style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>Stay</Link>
              <Link to="/events" style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>Events</Link>
              <Link to="/sign-in" style={{ backgroundColor: '#14b8a6', color: 'white', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', textDecoration: 'none' }}>
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* HERO SECTION - Full viewport */}
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
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        {/* Dark Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.6)'
        }} />
        
        {/* Hero Content */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '0 24px'
        }}>
          <h1 style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '24px'
          }}>
            Kedah Tourism
          </h1>
          <p style={{
            fontSize: '24px',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto 40px auto',
            lineHeight: '1.6'
          }}>
            Discover the beauty of Malaysia's Rice Bowl — from iconic landmarks to hidden gems.
          </p>
          <button
            onClick={() => {
              const grid = document.getElementById('discovery-grid');
              if (grid) grid.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              backgroundColor: '#14b8a6',
              color: 'white',
              padding: '16px 40px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            Explore Kedah <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* DISCOVERY GRID - 4 Cards */}
      <section 
        id="discovery-grid" 
        style={{
          padding: '80px 24px',
          backgroundColor: '#0f172a'
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: '48px'
          }}>
            What would you like to explore?
          </h2>
          
          {/* 2x2 Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px'
          }}>
            {/* Places Card */}
            <div
              onClick={() => navigate('/places')}
              style={{
                position: 'relative',
                height: '280px',
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80"
                alt="Places"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
              <div style={{ position: 'absolute', bottom: '24px', left: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={24} color="#2dd4bf" />
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>Places</span>
              </div>
            </div>

            {/* Food Card */}
            <div
              onClick={() => navigate('/food')}
              style={{
                position: 'relative',
                height: '280px',
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80"
                alt="Food"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
              <div style={{ position: 'absolute', bottom: '24px', left: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Utensils size={24} color="#fb923c" />
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>Food</span>
              </div>
            </div>

            {/* Stay Card */}
            <div
              onClick={() => navigate('/stays')}
              style={{
                position: 'relative',
                height: '280px',
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"
                alt="Stay"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
              <div style={{ position: 'absolute', bottom: '24px', left: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Hotel size={24} color="#60a5fa" />
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>Stay</span>
              </div>
            </div>

            {/* Events Card */}
            <div
              onClick={() => navigate('/events')}
              style={{
                position: 'relative',
                height: '280px',
                borderRadius: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"
                alt="Events"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
              <div style={{ position: 'absolute', bottom: '24px', left: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={24} color="#c084fc" />
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>Events</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#020617',
        borderTop: '1px solid #1e293b',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          color: '#94a3b8',
          fontSize: '14px',
          lineHeight: '1.8'
        }}>
          <p style={{ margin: 0 }}>© 2026 Kedah Tourism Analytics Dashboard</p>
          <p style={{ margin: '4px 0 0 0' }}>
            School of Computing & Informatics, Albukhary International University
          </p>
        </div>
      </footer>
    </div>
  );
}
