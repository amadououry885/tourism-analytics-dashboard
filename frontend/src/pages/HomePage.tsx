import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  MapPin, 
  Utensils, 
  Hotel, 
  Calendar, 
  BarChart3, 
  Menu, 
  X,
  Home 
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle Mobile Menu
  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* INTERNAL CSS FOR RESPONSIVENESS */}
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
          .nav-mobile-btn { display: block; cursor: pointer; color: #1e3a8a; } /* Deep Blue */
          
          /* Show mobile menu when open */
          .mobile-menu-dropdown.open {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            background-color: white;
            border-bottom: 1px solid #e5e7eb;
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

      {/* Header - Trip.com Style: White BG, Blue Text, Orange Accents */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-md border-b border-gray-200 h-[70px] flex items-center shadow-sm">
        <div className="w-full max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo - Dark Blue */}
            <Link to="/" className="text-2xl font-extrabold text-blue-900 hover:text-blue-700 transition-colors no-underline tracking-tight flex items-center gap-2">
              <span className="bg-blue-600 text-white px-2 py-1 rounded-lg text-lg">K</span> Kedah Tourism
            </Link>

            {/* Desktop Navigation */}
            <nav className="nav-desktop">
              <Link to="/" className="text-blue-900 hover:text-orange-500 text-[16px] font-bold no-underline flex items-center gap-2 transition-colors">
                <Home size={18} /> Home
              </Link>
              <Link to="/places" className="text-blue-900 hover:text-orange-500 text-[16px] font-bold no-underline flex items-center gap-2 transition-colors">
                <MapPin size={18} /> Places
              </Link>
              <Link to="/food" className="text-blue-900 hover:text-orange-500 text-[16px] font-bold no-underline flex items-center gap-2 transition-colors">
                <Utensils size={18} /> Food
              </Link>
              <Link to="/stays" className="text-blue-900 hover:text-orange-500 text-[16px] font-bold no-underline flex items-center gap-2 transition-colors">
                <Hotel size={18} /> Stay
              </Link>
              <Link to="/events" className="text-blue-900 hover:text-orange-500 text-[16px] font-bold no-underline flex items-center gap-2 transition-colors">
                <Calendar size={18} /> Events
              </Link>
              <Link to="/analytics" className="text-blue-900 hover:text-orange-500 text-[16px] font-bold no-underline flex items-center gap-2 transition-colors">
                <BarChart3 size={18} /> Analytics
              </Link>
              
              {/* Sign In - Blue Button */}
              <Link to="/sign-in" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-bold no-underline shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
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
        <Link to="/" onClick={toggleMenu} className="text-blue-900 font-medium text-lg no-underline flex items-center gap-3 border-b border-gray-100 pb-2">
          <Home size={20} className="text-blue-600" /> Home
        </Link>
        <Link to="/places" onClick={toggleMenu} className="text-blue-900 font-medium text-lg no-underline flex items-center gap-3 border-b border-gray-100 pb-2">
          <MapPin size={20} className="text-blue-600" /> Places
        </Link>
        <Link to="/food" onClick={toggleMenu} className="text-blue-900 font-medium text-lg no-underline flex items-center gap-3 border-b border-gray-100 pb-2">
          <Utensils size={20} className="text-blue-600" /> Food
        </Link>
        <Link to="/stays" onClick={toggleMenu} className="text-blue-900 font-medium text-lg no-underline flex items-center gap-3 border-b border-gray-100 pb-2">
          <Hotel size={20} className="text-blue-600" /> Stay
        </Link>
        <Link to="/events" onClick={toggleMenu} className="text-blue-900 font-medium text-lg no-underline flex items-center gap-3 border-b border-gray-100 pb-2">
          <Calendar size={20} className="text-blue-600" /> Events
        </Link>
        <Link to="/analytics" onClick={toggleMenu} className="text-blue-900 font-medium text-lg no-underline flex items-center gap-3 border-b border-gray-100 pb-2">
          <BarChart3 size={20} className="text-blue-600" /> Analytics
        </Link>
        <Link to="/sign-in" onClick={toggleMenu} className="bg-blue-600 text-white w-full py-3 rounded-lg text-base font-bold no-underline text-center mt-2 shadow-md">
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
        {/* Blue Gradient Overlay - Professional Travel Look */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/40 via-blue-900/20 to-black/60" />
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-[800px] mt-16">
          <span className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-4 inline-block shadow-lg">
            Visit Malaysia 2026
          </span>
          <h1 className="hero-title font-bold text-white mb-6 leading-tight drop-shadow-xl">
            Kedah Tourism
          </h1>
          <p className="hero-subtitle text-white/95 mb-10 leading-relaxed drop-shadow-lg font-medium">
            Discover the Rice Bowl of Malaysia. <br/> From ancient history to modern thrills.
          </p>
          
          {/* ORANGE CTA BUTTON - The "Sofascore" Mix */}
          <button
            onClick={() => {
              const grid = document.getElementById('discovery-grid');
              if (grid) grid.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full text-lg font-bold border-none cursor-pointer inline-flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 hover:scale-105"
          >
            Start Exploring <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* DISCOVERY GRID */}
      <section 
        id="discovery-grid" 
        className="py-20 px-6 bg-gray-50"
      >
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[32px] font-bold text-blue-900">
              Popular Categories
            </h2>
            <div className="h-1 w-20 bg-orange-500 mx-auto mt-4 rounded-full"></div>
          </div>
          
          {/* Responsive Grid Container */}
          <div className="discovery-grid">
            
            {/* Places Card */}
            <div
              onClick={() => navigate('/places')}
              className="group relative h-[280px] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white"
            >
              <img src="https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80" alt="Places" className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="p-3 bg-blue-600/90 backdrop-blur-md rounded-xl shadow-lg group-hover:bg-orange-500 transition-colors duration-300">
                   <MapPin size={24} className="text-white" />
                </div>
                <span className="text-[28px] font-bold text-white drop-shadow-md">Places</span>
              </div>
            </div>

            {/* Food Card */}
            <div
              onClick={() => navigate('/food')}
              className="group relative h-[280px] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white"
            >
              <img src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80" alt="Food" className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="p-3 bg-orange-500/90 backdrop-blur-md rounded-xl shadow-lg">
                  <Utensils size={24} className="text-white" />
                </div>
                <span className="text-[28px] font-bold text-white drop-shadow-md">Food</span>
              </div>
            </div>

            {/* Stay Card */}
            <div
              onClick={() => navigate('/stays')}
              className="group relative h-[280px] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white"
            >
              <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80" alt="Stay" className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="p-3 bg-blue-600/90 backdrop-blur-md rounded-xl shadow-lg group-hover:bg-orange-500 transition-colors duration-300">
                  <Hotel size={24} className="text-white" />
                </div>
                <span className="text-[28px] font-bold text-white drop-shadow-md">Stay</span>
              </div>
            </div>

            {/* Events Card */}
            <div
              onClick={() => navigate('/events')}
              className="group relative h-[280px] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white"
            >
              <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80" alt="Events" className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="p-3 bg-blue-600/90 backdrop-blur-md rounded-xl shadow-lg group-hover:bg-orange-500 transition-colors duration-300">
                  <Calendar size={24} className="text-white" />
                </div>
                <span className="text-[28px] font-bold text-white drop-shadow-md">Events</span>
              </div>
            </div>
          </div>

          {/* Analytics Banner - Brand Blue with Orange Accent */}
          <div
            onClick={() => navigate('/analytics')}
            className="mt-6 relative h-[160px] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group bg-blue-600"
          >
            {/* Decorative background circle */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl"></div>
            
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4=')] bg-repeat" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-6 text-center w-full justify-center px-4">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-full group-hover:bg-orange-500 transition-colors duration-500">
                 <BarChart3 size={32} className="text-white" />
              </div>
              <div className="text-left">
                <span className="text-[clamp(20px,4vw,32px)] font-bold text-white block">
                  Tourism Analytics
                </span>
                <span className="text-[clamp(12px,3vw,14px)] text-blue-100 block mt-1 font-medium">
                  View real-time visitor insights & trends
                </span>
              </div>
              <div className="hidden md:block bg-white text-blue-600 px-4 py-2 rounded-full font-bold text-sm">
                View Dashboard
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-6 text-center">
        <div className="max-w-[1200px] mx-auto text-gray-500 text-sm leading-relaxed">
          <p className="m-0 text-gray-900 font-bold">© 2026 Kedah Tourism Analytics Dashboard</p>
          <p className="mt-1">School of Computing & Informatics, Albukhary International University</p>
        </div>
      </footer>
    </div>
  );
}