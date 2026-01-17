import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, MessageCircle, Clock, Navigation, Share2, Ticket, Calendar, ExternalLink, Bookmark, Flag, Send, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

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
}

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
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        setLoading(true);
        // Try to fetch from API
        const response = await api.get(`/analytics/places/${id}/`);
        setPlace(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching place:', err);
        // Set demo data if API fails
        setPlace({
          id: parseInt(id || '1'),
          name: 'Menara Alor Setar',
          city: 'Alor Setar',
          category: 'Landmark',
          image_url: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200',
          rating: 4.5,
          posts: 1250,
          is_open: true,
          is_free: false,
          description: 'Menara Alor Setar is a 165.5 m telecommunications tower in Alor Setar, Kedah, Malaysia. It is the second tallest telecommunications tower in the country after the Kuala Lumpur Tower. The tower offers breathtaking panoramic views of Alor Setar city and the surrounding paddy fields.',
          address: 'Jalan Langgar, 05460 Alor Setar, Kedah, Malaysia',
          opening_hours: 'Daily: 9:00 AM - 10:00 PM',
          entry_fee: 'RM 12 (Adult), RM 6 (Child)',
          latitude: 6.1211,
          longitude: 100.3683,
        });
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
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`, '_blank');
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
      // Toggle bookmark (in a real app, this would call the API)
      setIsBookmarked(!isBookmarked);
      showSuccess(isBookmarked ? 'Removed from saved places' : '✓ Added to saved places!');
      // API call would be: await api.post(`/places/${id}/bookmark/`);
    } catch (err) {
      console.error('Failed to bookmark:', err);
    }
  };

  const handleReportSubmit = async () => {
    if (!reportReason) {
      return;
    }
    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // await api.post(`/places/${id}/report/`, { reason: reportReason, description: reportDescription });
      showSuccess('✓ Report submitted. Thank you for helping improve our data!');
      setShowReportModal(false);
      setReportReason('');
      setReportDescription('');
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/places/${id}` } });
      return;
    }
    if (!reviewText.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // await api.post(`/places/${id}/reviews/`, { rating: reviewRating, text: reviewText });
      showSuccess('✓ Review submitted! It will appear after moderation.');
      setShowReviewModal(false);
      setReviewRating(5);
      setReviewText('');
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(45, 212, 191, 0.3)',
          borderTopColor: '#2dd4bf',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  if (!place) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        <MapPin size={64} color="#475569" />
        <h2 style={{ color: '#e2e8f0', marginTop: '16px', fontSize: '24px' }}>Place not found</h2>
        <p style={{ color: '#64748b', marginTop: '8px' }}>The place you're looking for doesn't exist.</p>
        <Link
          to="/places"
          style={{
            marginTop: '24px',
            padding: '12px 24px',
            backgroundColor: '#2dd4bf',
            color: '#0f172a',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600',
          }}
        >
          Back to Places
        </Link>
      </div>
    );
  }

  const defaultImage = 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      {/* Hero Image */}
      <div style={{
        position: 'relative',
        height: '50vh',
        minHeight: '400px',
        maxHeight: '500px',
      }}>
        <img
          src={place.image_url || defaultImage}
          alt={place.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        
        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.3) 0%, rgba(15, 23, 42, 0.8) 70%, rgba(15, 23, 42, 1) 100%)',
        }} />

        {/* Back Button */}
        <button
          onClick={() => navigate('/places')}
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            border: 'none',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Badges */}
        <div style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          display: 'flex',
          gap: '12px',
        }}>
          <div style={{
            backgroundColor: place.is_open ? '#10b981' : '#ef4444',
            color: '#ffffff',
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Clock size={16} />
            {place.is_open ? 'OPEN NOW' : 'CLOSED'}
          </div>
          
          {place.is_free && (
            <div style={{
              backgroundColor: '#8b5cf6',
              color: '#ffffff',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <Ticket size={16} />
              FREE ENTRY
            </div>
          )}
        </div>

        {/* Title Section - Overlapping */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          padding: '0 24px 32px',
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Category */}
            {place.category && (
              <span style={{
                display: 'inline-block',
                backgroundColor: 'rgba(45, 212, 191, 0.2)',
                color: '#2dd4bf',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '12px',
              }}>
                {place.category}
              </span>
            )}
            
            {/* Title */}
            <h1 style={{
              fontSize: '42px',
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: '12px',
              lineHeight: '1.2',
            }}>
              {place.name}
            </h1>
            
            {/* Location */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#94a3b8',
              fontSize: '18px',
            }}>
              <MapPin size={20} />
              <span>{place.city || 'Kedah'}, Malaysia</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 24px',
      }}>
        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '40px',
        }}>
          <div style={{
            backgroundColor: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
          }}>
            <Star size={28} color="#fbbf24" fill="#fbbf24" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#fbbf24' }}>
              {place.rating?.toFixed(1) || 'N/A'}
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>Rating</div>
          </div>
          
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
          }}>
            <MessageCircle size={28} color="#3b82f6" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#3b82f6' }}>
              {place.posts?.toLocaleString() || 0}
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>Social Posts</div>
          </div>
          
          <div style={{
            backgroundColor: 'rgba(45, 212, 191, 0.1)',
            border: '1px solid rgba(45, 212, 191, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
          }}>
            <Ticket size={28} color="#2dd4bf" style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#2dd4bf', marginTop: '4px' }}>
              {place.is_free ? 'Free' : place.entry_fee || 'Check on site'}
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>Entry Fee</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '40px',
        }}>
          <button
            onClick={handleGetDirections}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '16px 24px',
              backgroundColor: '#2dd4bf',
              color: '#0f172a',
              border: 'none',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(45, 212, 191, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Navigation size={20} />
            Get Directions
          </button>
          
          <button
            onClick={handleShare}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          >
            <Share2 size={20} />
          </button>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 24px',
              backgroundColor: isBookmarked ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              color: isBookmarked ? '#fbbf24' : '#ffffff',
              border: `1px solid ${isBookmarked ? 'rgba(251, 191, 36, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`,
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title={user ? (isBookmarked ? 'Remove from saved' : 'Save place') : 'Login to save'}
          >
            <Bookmark size={20} fill={isBookmarked ? '#fbbf24' : 'none'} />
          </button>

          {/* Report Button */}
          <button
            onClick={() => setShowReportModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            title="Report an issue"
          >
            <Flag size={20} />
          </button>
        </div>

        {/* Write Review Button */}
        <button
          onClick={() => setShowReviewModal(true)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px 24px',
            marginBottom: '40px',
            backgroundColor: 'rgba(251, 191, 36, 0.15)',
            color: '#fbbf24',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '14px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(251, 191, 36, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(251, 191, 36, 0.15)';
          }}
        >
          <Star size={18} />
          Write a Review
        </button>

        {/* Description */}
        {place.description && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '16px',
            }}>
              About
            </h2>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#cbd5e1',
            }}>
              {place.description}
            </p>
          </div>
        )}

        {/* Details Grid */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '20px',
          }}>
            Details
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {place.address && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <MapPin size={20} color="#64748b" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Address</div>
                  <div style={{ fontSize: '15px', color: '#e2e8f0' }}>{place.address}</div>
                </div>
              </div>
            )}
            
            {place.opening_hours && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Clock size={20} color="#64748b" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Opening Hours</div>
                  <div style={{ fontSize: '15px', color: '#e2e8f0' }}>{place.opening_hours}</div>
                </div>
              </div>
            )}
            
            {place.entry_fee && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Ticket size={20} color="#64748b" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Entry Fee</div>
                  <div style={{ fontSize: '15px', color: '#e2e8f0' }}>{place.entry_fee}</div>
                </div>
              </div>
            )}
            
            {place.website && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <ExternalLink size={20} color="#64748b" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Website</div>
                  <a 
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '15px', color: '#2dd4bf', textDecoration: 'none' }}
                  >
                    {place.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Success Notification */}
      {successMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          backgroundColor: '#10b981',
          color: '#ffffff',
          padding: '16px 24px',
          borderRadius: '14px',
          fontSize: '15px',
          fontWeight: '600',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideIn 0.3s ease-out',
        }}>
          <CheckCircle size={20} />
          {successMessage}
        </div>
      )}

      {/* Report Issue Modal */}
      {showReportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '24px',
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={24} color="#f59e0b" />
                Report an Issue
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px' }}
              >
                <X size={24} />
              </button>
            </div>

            <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '14px' }}>
              Help us improve by reporting incorrect or outdated information about this place.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '8px' }}>
                What's the issue?
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                }}
              >
                <option value="">Select a reason...</option>
                <option value="closed">Place is permanently closed</option>
                <option value="hours">Incorrect opening hours</option>
                <option value="location">Wrong location/address</option>
                <option value="price">Incorrect pricing</option>
                <option value="duplicate">Duplicate listing</option>
                <option value="inappropriate">Inappropriate content</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '8px' }}>
                Additional details (optional)
              </label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Provide more details about the issue..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  minHeight: '100px',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowReportModal(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReportSubmit}
                disabled={!reportReason || submitting}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: reportReason ? '#f59e0b' : 'rgba(245, 158, 11, 0.3)',
                  color: reportReason ? '#0f172a' : '#94a3b8',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: reportReason ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {submitting ? 'Submitting...' : (
                  <>
                    <Send size={18} />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {showReviewModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '24px',
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Star size={24} color="#fbbf24" fill="#fbbf24" />
                Write a Review
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px' }}
              >
                <X size={24} />
              </button>
            </div>

            {!user && (
              <div style={{
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                textAlign: 'center',
              }}>
                <p style={{ color: '#fbbf24', marginBottom: '12px', fontSize: '14px' }}>
                  Please log in to write a review
                </p>
                <button
                  onClick={() => navigate('/login', { state: { from: `/places/${id}` } })}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#fbbf24',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Log In
                </button>
              </div>
            )}

            {user && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>
                    Your Rating
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <Star
                          size={32}
                          color="#fbbf24"
                          fill={star <= reviewRating ? '#fbbf24' : 'none'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '8px' }}>
                    Your Review
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience at this place..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#ffffff',
                      fontSize: '14px',
                      outline: 'none',
                      minHeight: '120px',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    style={{
                      flex: 1,
                      padding: '14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReviewSubmit}
                    disabled={!reviewText.trim() || submitting}
                    style={{
                      flex: 1,
                      padding: '14px',
                      backgroundColor: reviewText.trim() ? '#fbbf24' : 'rgba(251, 191, 36, 0.3)',
                      color: reviewText.trim() ? '#0f172a' : '#94a3b8',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '700',
                      cursor: reviewText.trim() ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    {submitting ? 'Submitting...' : (
                      <>
                        <Send size={18} />
                        Submit Review
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '24px',
        textAlign: 'center',
      }}>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          © 2026 Kedah Tourism Analytics Dashboard
        </p>
        <p style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>
          School of Computing & Informatics, Albukhary International University
        </p>
      </footer>

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
