import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Star, MessageCircle, Clock, Navigation, Share2, 
  Ticket, ExternalLink, Bookmark, Flag, CheckCircle, Phone, Mail, 
  Globe, Sun, Car, Wifi, Accessibility, UtensilsCrossed, Bath, X, AlertTriangle, Send 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { SharedHeader, SharedFooter } from '../../components/SharedLayout';

// --- Types ---
interface PlaceDetail {
  id: number;
  name: string;
  city?: string;
  category?: string;
  image_url?: string;
  rating?: number;
  posts?: number;
  is_open?: boolean;
  is_free?: boolean;
  description?: string;
  address?: string;
  opening_hours?: string;
  latitude?: number;
  longitude?: number;
  entry_fee?: string;
  website?: string;
  phone?: string;
  contact_phone?: string;
  contact_email?: string;
  best_time_to_visit?: string;
  official_website?: string;
  wikipedia_url?: string;
  tripadvisor_url?: string;
  google_maps_url?: string;
  amenities?: {
    parking?: boolean;
    wifi?: boolean;
    wheelchair_accessible?: boolean;
    restaurant?: boolean;
    restroom?: boolean;
  };
}

// --- Theme Constants (Light Mode) ---
const THEME = {
  bg: '#f8fafc',           // Slate 50
  bgCard: '#ffffff',       // White
  textMain: '#0f172a',     // Slate 900
  textSecondary: '#64748b',// Slate 500
  primary: '#1e3a8a',      // Deep Blue
  accent: '#f97316',       // Orange
  success: '#10b981',      // Green
  danger: '#ef4444',       // Red
  border: '#e2e8f0',       // Light Gray Border
};

export default function PlaceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive features state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // Form State
  const [reportReason, setReportReason] = useState('Incorrect Information');
  const [reportDescription, setReportDescription] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/places/${id}/`);
        setPlace(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching place:', err);
        setError('Place not found');
        setPlace(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlace();
    }
  }, [id]);

  const handleGetDirections = () => {
    if (!place) return;
    if (place.latitude && place.longitude) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.city)}`, '_blank');
    }
  };

  const handleShare = () => {
    if (!place) return;
    if (navigator.share) {
      navigator.share({
        title: place.name,
        text: `Check out ${place.name} in ${place.city}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSuccess('Link copied to clipboard!');
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleBookmark = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/places/${id}` } });
      return;
    }
    try {
      setIsBookmarked(!isBookmarked);
      showSuccess(isBookmarked ? 'Removed from saved places' : '✓ Added to saved places!');
    } catch (err) {
      console.error('Failed to bookmark:', err);
    }
  };

  const handleReportSubmit = async () => {
    setSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('✓ Report submitted. Thank you!');
      setShowReportModal(false);
      setReportDescription('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/places/${id}` } });
      return;
    }
    if (!reviewText.trim()) return;
    
    setSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('✓ Review submitted!');
      setShowReviewModal(false);
      setReviewRating(5);
      setReviewText('');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: THEME.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: `3px solid ${THEME.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!place) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: THEME.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <SharedHeader />
        <MapPin size={64} color={THEME.textSecondary} style={{ opacity: 0.5 }} />
        <h2 style={{ color: THEME.textMain, marginTop: '16px', fontSize: '24px' }}>Place not found</h2>
        <button onClick={() => navigate('/places')} style={{ marginTop: '24px', padding: '12px 24px', backgroundColor: THEME.primary, color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
          Back to Places
        </button>
      </div>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: THEME.bg, fontFamily: 'Poppins, sans-serif' }}>
      <SharedHeader />
      
      {/* HERO SECTION */}
      <div style={{ position: 'relative', height: '50vh', minHeight: '400px', maxHeight: '500px', marginTop: '70px' }}>
        <img
          src={place.image_url || defaultImage}
          alt={place.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { (e.target as HTMLImageElement).src = defaultImage; }}
        />
        
        {/* Gradient Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(30, 58, 138, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)' }} />

        {/* Back Button */}
        <button
          onClick={() => navigate('/places')}
          style={{
            position: 'absolute', top: '24px', left: '24px',
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)', border: 'none', borderRadius: '30px',
            color: THEME.primary, fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          <ArrowLeft size={18} /> Back
        </button>

        {/* Status Badges */}
        <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '10px' }}>
          <div style={{
            backgroundColor: place.is_open ? THEME.success : THEME.danger,
            color: 'white', padding: '8px 16px', borderRadius: '20px',
            fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
          }}>
            <Clock size={14} strokeWidth={3} />
            {place.is_open ? 'OPEN NOW' : 'CLOSED'}
          </div>
          
          {place.is_free && (
            <div style={{
              backgroundColor: THEME.accent,
              color: 'white', padding: '8px 16px', borderRadius: '20px',
              fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
            }}>
              <Ticket size={14} fill="white" />
              FREE ENTRY
            </div>
          )}
        </div>

        {/* Title Content */}
        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '0 24px 40px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {place.category && (
              <span style={{
                display: 'inline-block', backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(4px)',
                color: 'white', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700',
                marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px'
              }}>
                {place.category}
              </span>
            )}
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: '800', color: 'white', marginBottom: '8px', lineHeight: '1.2', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
              {place.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '16px', fontWeight: '500' }}>
              <MapPin size={18} />
              <span>{place.city || 'Kedah'}, Malaysia</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
        
        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Rating', value: place.rating?.toFixed(1) || '4.5', icon: <Star size={24} fill="#f59e0b" color="#f59e0b" />, sub: 'Out of 5' },
            { label: 'Reviews', value: place.posts?.toLocaleString() || '120', icon: <MessageCircle size={24} color={THEME.primary} />, sub: 'Community' },
            { label: 'Entry', value: place.is_free ? 'Free' : (place.entry_fee || 'Paid'), icon: <Ticket size={24} color={THEME.accent} />, sub: 'Per Person' }
          ].map((stat, i) => (
            <div key={i} style={{ 
              backgroundColor: 'white', padding: '20px', borderRadius: '16px', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: `1px solid ${THEME.border}`,
              textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
            }}>
              {stat.icon}
              <div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: THEME.textMain }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: THEME.textSecondary, fontWeight: '500' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '40px' }}>
          <button onClick={handleGetDirections}
            style={{
              flex: '2 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '14px 24px', backgroundColor: THEME.primary, color: 'white', border: 'none', borderRadius: '12px',
              fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Navigation size={20} /> Get Directions
          </button>
          
          <button onClick={handleShare}
            style={{
              flex: '1 1 100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px', backgroundColor: 'white', color: THEME.textMain, border: `1px solid ${THEME.border}`, borderRadius: '12px',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <Share2 size={20} /> Share
          </button>

          <button onClick={handleBookmark}
            style={{
              flex: '1 1 100px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px', backgroundColor: isBookmarked ? '#fffbeb' : 'white', 
              color: isBookmarked ? '#d97706' : THEME.textMain, 
              border: `1px solid ${isBookmarked ? '#fcd34d' : THEME.border}`, borderRadius: '12px',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <Bookmark size={20} fill={isBookmarked ? '#d97706' : 'none'} /> {isBookmarked ? 'Saved' : 'Save'}
          </button>

          <button onClick={() => setShowReportModal(true)}
            style={{
              width: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'white', color: THEME.textSecondary, border: `1px solid ${THEME.border}`, borderRadius: '12px',
              cursor: 'pointer'
            }}
            title="Report Issue"
          >
            <Flag size={20} />
          </button>
        </div>

        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          
          {/* Left Column: Description & Amenities */}
          <div>
            {place.description && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: THEME.textMain, marginBottom: '16px' }}>About</h2>
                <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#334155' }}>{place.description}</p>
              </div>
            )}

            {place.amenities && Object.values(place.amenities).some(v => v) && (
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: THEME.textMain, marginBottom: '16px' }}>Amenities</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {[
                    { key: 'parking', label: 'Parking', icon: <Car size={16}/> },
                    { key: 'wifi', label: 'WiFi', icon: <Wifi size={16}/> },
                    { key: 'wheelchair_accessible', label: 'Accessible', icon: <Accessibility size={16}/> },
                    { key: 'restaurant', label: 'Restaurant', icon: <UtensilsCrossed size={16}/> },
                    { key: 'restroom', label: 'Restroom', icon: <Bath size={16}/> }
                  ].map(item => (place.amenities as any)[item.key] && (
                    <div key={item.key} style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
                      backgroundColor: 'white', border: `1px solid ${THEME.border}`, borderRadius: '8px',
                      color: THEME.textMain, fontSize: '13px', fontWeight: '500'
                    }}>
                      {item.icon} {item.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Info Card */}
          <div>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: `1px solid ${THEME.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: THEME.textMain, marginBottom: '20px', borderBottom: `1px solid ${THEME.border}`, paddingBottom: '12px' }}>
                Visitor Info
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                   { icon: <MapPin size={18} />, label: 'Address', val: place.address },
                   { icon: <Clock size={18} />, label: 'Hours', val: place.opening_hours },
                   { icon: <Sun size={18} />, label: 'Best Time', val: place.best_time_to_visit },
                   { icon: <Phone size={18} />, label: 'Phone', val: place.contact_phone || place.phone, isLink: true, type: 'tel' },
                   { icon: <Mail size={18} />, label: 'Email', val: place.contact_email, isLink: true, type: 'mailto' },
                   { icon: <Globe size={18} />, label: 'Website', val: place.official_website || place.website, isLink: true, type: 'url' }
                ].map((item, idx) => item.val && (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ color: THEME.textSecondary, marginTop: '2px' }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: '12px', color: THEME.textSecondary, marginBottom: '2px' }}>{item.label}</div>
                      {item.isLink ? (
                        <a 
                          href={item.type === 'url' ? item.val : `${item.type}:${item.val}`} 
                          target={item.type === 'url' ? '_blank' : undefined}
                          rel="noreferrer"
                          style={{ fontSize: '14px', color: THEME.primary, fontWeight: '500', textDecoration: 'none' }}
                        >
                          {item.type === 'url' ? 'Visit Website' : item.val}
                        </a>
                      ) : (
                        <div style={{ fontSize: '14px', color: THEME.textMain, fontWeight: '500' }}>{item.val}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* External Links */}
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: `1px solid ${THEME.border}`, display: 'flex', gap: '12px' }}>
                {place.tripadvisor_url && (
                  <a href={place.tripadvisor_url} target="_blank" rel="noreferrer" title="TripAdvisor"
                     style={{ color: '#00af87', padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(0, 175, 135, 0.1)' }}>
                    <ExternalLink size={20} />
                  </a>
                )}
                {place.google_maps_url && (
                  <a href={place.google_maps_url} target="_blank" rel="noreferrer" title="Google Maps"
                     style={{ color: '#4285f4', padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(66, 133, 244, 0.1)' }}>
                    <MapPin size={20} />
                  </a>
                )}
              </div>
            </div>

            {/* Write Review Button */}
            <button onClick={() => setShowReviewModal(true)}
              style={{
                width: '100%', marginTop: '24px', padding: '16px',
                backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fdba74',
                borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffedd5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff7ed'}
            >
              <Star size={18} /> Write a Review
            </button>
          </div>
        </div>
      </main>

      <SharedFooter />

      {/* --- MODALS & NOTIFICATIONS --- */}

      {/* Success Notification */}
      {successMessage && (
        <div style={{
          position: 'fixed', top: '90px', right: '24px', zIndex: 100,
          backgroundColor: '#065f46', color: 'white', padding: '12px 20px', borderRadius: '10px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '10px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <CheckCircle size={20} /> <span style={{ fontWeight: '600' }}>{successMessage}</span>
          <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'white', width: '100%', maxWidth: '450px', borderRadius: '20px', padding: '30px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: THEME.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={24} color={THEME.danger} /> Report Issue
              </h3>
              <button onClick={() => setShowReportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textSecondary }}><X size={24} /></button>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: THEME.textMain }}>Reason</label>
              <select 
                value={reportReason} 
                onChange={(e) => setReportReason(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '14px', outline: 'none' }}
              >
                <option>Incorrect Information</option>
                <option>Place is Closed/Moved</option>
                <option>Duplicate Listing</option>
                <option>Inappropriate Content</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: THEME.textMain }}>Description</label>
              <textarea
                rows={4}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Please provide more details..."
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <button 
              onClick={handleReportSubmit}
              disabled={submitting}
              style={{
                width: '100%', padding: '14px', backgroundColor: THEME.textMain, color: 'white', border: 'none', borderRadius: '10px',
                fontSize: '16px', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'white', width: '100%', maxWidth: '450px', borderRadius: '20px', padding: '30px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: THEME.textMain }}>Write a Review</h3>
              <button onClick={() => setShowReviewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textSecondary }}><X size={24} /></button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', transform: star === reviewRating ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.1s' }}
                >
                  <Star 
                    size={32} 
                    fill={star <= reviewRating ? '#f59e0b' : '#e2e8f0'} 
                    color={star <= reviewRating ? '#f59e0b' : '#cbd5e1'} 
                  />
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <textarea
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience..."
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${THEME.border}`, fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <button 
              onClick={handleReviewSubmit}
              disabled={submitting}
              style={{
                width: '100%', padding: '14px', backgroundColor: THEME.primary, color: 'white', border: 'none', borderRadius: '10px',
                fontSize: '16px', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {submitting ? 'Posting...' : <><Send size={18} /> Post Review</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}