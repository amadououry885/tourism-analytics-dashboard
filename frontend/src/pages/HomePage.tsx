import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Utensils, Hotel, Calendar, BarChart3, Menu, X } from 'lucide-react';
import { Card } from '../components/ui/card';

export default function HomePage() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle Mobile Menu
  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      
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
          .nav-mobile-btn { display: block; cursor: pointer; color: #1F2937; }
          
          /* Show mobile menu when open */
          .mobile-menu-dropdown.open {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            background-color: white;
            border-bottom: 1px solid #E5E7EB;
            padding: 20px;
            gap: 20px;
            z-index: 49;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }

          .hero-title { font-size: 40px; }
          .hero-subtitle { font-size: 18px; }
          
          .discovery-grid { 
            grid-template-columns: 1fr; /* Stack cards vertically */
          }
        }
      `}</style>

      {/* Header - Fixed at top */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 border-b border-gray-200 backdrop-blur-md h-[70px] flex items-center shadow-sm">
        <div className="w-full max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-primary transition-colors no-underline">
              Kedah Tourism
            </Link>

            {/* Desktop Navigation */}
            <nav className="nav-desktop">
              <Link to="/" className="text-primary text-[17px] font-semibold no-underline">Home</Link>
              <Link to="/places" className="text-gray-600 hover:text-primary text-[17px] font-semibold no-underline transition-colors">Places</Link>
              <Link to="/food" className="text-gray-600 hover:text-primary text-[17px] font-semibold no-underline transition-colors">Food</Link>
              <Link to="/stays" className="text-gray-600 hover:text-primary text-[17px] font-semibold no-underline transition-colors">Stay</Link>
              <Link to="/events" className="text-gray-600 hover:text-primary text-[17px] font-semibold no-underline transition-colors">Events</Link>
              <Link to="/analytics" className="text-gray-600 hover:text-primary text-[17px] font-semibold no-underline transition-colors flex items-center gap-1.5">
                <BarChart3 size={18} />
                Analytics
              </Link>
              <Link to="/sign-in" className="bg-accent text-white hover:bg-accent/90 px-5 py-2.5 rounded-lg text-base font-semibold no-underline shadow-sm transition-all">
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
        <Link to="/" onClick={toggleMenu} className="text-primary text-lg font-medium no-underline">Home</Link>
        <Link to="/places" onClick={toggleMenu} className="text-gray-600 text-lg font-medium no-underline">Places</Link>
        <Link to="/food" onClick={toggleMenu} className="text-gray-600 text-lg font-medium no-underline">Food</Link>
        <Link to="/stays" onClick={toggleMenu} className="text-gray-600 text-lg font-medium no-underline">Stay</Link>
        <Link to="/events" onClick={toggleMenu} className="text-gray-600 text-lg font-medium no-underline">Events</Link>
        <Link to="/analytics" onClick={toggleMenu} className="text-gray-600 text-lg font-medium no-underline flex items-center gap-2">
          <BarChart3 size={18} /> Analytics
        </Link>
        <Link to="/sign-in" onClick={toggleMenu} className="bg-accent text-white px-3 py-3 rounded-lg text-base font-semibold no-underline text-center">
          Sign In
        </Link>
      </div>

      {/* HERO SECTION */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <img
          src="/images/alor-setar-tower.png"
          alt="Alor Setar Tower"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        {/* Light/Gradient Overlay - Clean & Bright */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/20 to-black/60" />
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-[800px]">
          <h1 className="hero-title font-bold text-white mb-6 leading-tight drop-shadow-md">
            Kedah Tourism
          </h1>
          <p className="hero-subtitle text-white/90 mb-10 leading-relaxed drop-shadow-sm font-medium">
            Discover the beauty of Malaysia's Rice Bowl — from iconic landmarks to hidden gems.
          </p>
          <button
            onClick={() => {
              const grid = document.getElementById('discovery-grid');
              if (grid) grid.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-accent text-white hover:bg-accent/90 px-10 py-4 rounded-xl text-lg font-semibold border-none cursor-pointer inline-flex items-center gap-3 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            Explore Kedah <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* DISCOVERY GRID */}
      <section 
        id="discovery-grid" 
        className="py-20 px-6 bg-background"
      >
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-[32px] font-bold text-gray-900 text-center mb-12">
            What would you like to explore?
          </h2>
          
          {/* Responsive Grid Container (Class handled in <style> tag) */}
          <div className="discovery-grid">
            
            {/* Places Card - Using the new Card component conceptually, but maintaining custom layout for the image */}
            <div
              onClick={() => navigate('/places')}
              className="group relative h-[280px] rounded-2xl overflow-hidden cursor-pointer shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-100"
            >
              <img src="https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80" alt="Places" className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                   <MapPin size={24} className="text-accent" />
                </div>
                <span className="text-[28px] font-bold text-white drop-shadow-sm">Places</span>
              </div>
            </div>

            {/* Food Card */}
            <div
              onClick={() => navigate('/food')}
              className="group relative h-[280px] rounded-2xl overflow-hidden cursor-pointer shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-100"
            >
              <img src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80" alt="Food" className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Utensils size={24} className="text-accent" />
                </div>
                <span className="text-[28px] font-bold text-white drop-shadow-sm">Food</span>
              </div>
            </div>

            {/* Stay Card */}
            <div
              onClick={() => navigate('/stays')}
              className="group relative h-[280px] rounded-2xl overflow-hidden cursor-pointer shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-100"
            >
              <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" alt="Stay" className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Hotel size={24} className="text-accent" />
                </div>
                <span className="text-[28px] font-bold text-white drop-shadow-sm">Stay</span>
              </div>
            </div>

            {/* Events Card */}
            <div
              onClick={() => navigate('/events')}
              className="group relative h-[280px] rounded-2xl overflow-hidden cursor-pointer shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-100"
            >
              <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80" alt="Events" className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Calendar size={24} className="text-accent" />
                </div>
                <span className="text-[28px] font-bold text-white drop-shadow-sm">Events</span>
              </div>
            </div>
          </div>

          {/* Analytics Banner - Full Width - Bright & Modern */}
          <div
            onClick={() => navigate('/analytics')}
            className="mt-6 relative h-[160px] rounded-2xl overflow-hidden cursor-pointer shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1 group"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4=')] bg-repeat" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4 text-center w-full justify-center px-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl group-hover:bg-white/30 transition-colors">
                 <BarChart3 size={40} className="text-white" style={{ flexShrink: 0 }} />
              </div>
              <div className="text-left">
                <span className="text-[clamp(20px,4vw,32px)] font-bold text-white block">
                  Tourism Analytics
                </span>
                <span className="text-[clamp(12px,3vw,14px)] text-white/90 block mt-1 font-medium">
                  Real-time insights • Visitor sentiment • Trends
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Clean & Professional */}
      <footer className="bg-white border-t border-gray-200 py-8 px-6 text-center">
        <div className="max-w-[1200px] mx-auto text-gray-500 text-sm leading-relaxed">
          <p className="m-0 font-medium text-gray-900">© 2026 Kedah Tourism Analytics Dashboard</p>
          <p className="mt-1">School of Computing & Informatics, Albukhary International University</p>
        </div>
      </footer>
    </div>
  );
}
