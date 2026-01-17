import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  LogOut, 
  Phone, 
  MapPin,
  Star,
  DollarSign,
  Home,
  Upload,
  Image as ImageIcon,
  X,
  Check,
  TrendingUp,
  MessageCircle,
  Activity,
  Save,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';

interface StayImage {
  id: number;
  image: string;
  image_url: string;
  caption?: string;
  is_primary: boolean;
  order: number;
  uploaded_at: string;
}

interface Stay {
  id: number;
  name: string;
  type: string;
  district: string;
  rating?: number;
  priceNight: number;
  amenities: string[];
  lat?: number;
  lon?: number;
  images?: string[];
  stay_images?: StayImage[];
  main_image?: string;
  main_image_url?: string;
  landmark?: string;
  distanceKm?: number;
  is_active: boolean;
  is_open?: boolean;
  owner?: number;
  owner_username?: string;
  booking_com_url?: string;
  agoda_url?: string;
  booking_provider?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  social_mentions?: number;
  social_engagement?: number;
  estimated_interest?: number;
  trending_percentage?: number;
  is_trending?: boolean;
  social_rating?: number;
}

// Theme colors - Purple for Stays
const theme = {
  primary: '#a855f7',
  primaryDark: '#9333ea',
  primaryLight: '#c084fc',
  background: '#0f172a',
  cardBg: '#1e293b',
  cardBorder: '#334155',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
};

const StayOwnerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { request } = useApi();
  const navigate = useNavigate();
  
  const [stays, setStays] = useState<Stay[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStay, setEditingStay] = useState<Stay | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedStayForImages, setSelectedStayForImages] = useState<Stay | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    district: '',
    priceNight: '',
    amenities: [] as string[],
    landmark: '',
    lat: '',
    lon: '',
    booking_com_url: '',
    agoda_url: '',
    booking_provider: 'booking.com',
    contact_email: '',
    contact_phone: '',
    contact_whatsapp: '',
  });

  const stayTypes = [
    { value: 'Hotel', label: '🏨 Hotel' },
    { value: 'Apartment', label: '🏢 Apartment' },
    { value: 'Guest House', label: '🏚️ Guest House' },
    { value: 'Homestay', label: '🏠 Homestay' },
  ];

  const districts = [
    'Alor Setar', 'Langkawi', 'Kuala Kedah', 'Sungai Petani', 
    'Kulim', 'Baling', 'Yan', 'Pendang', 'Pokok Sena', 'Kubang Pasu'
  ];

  const commonAmenities = [
    'WiFi', 'Parking', 'Pool', 'Gym', 'Breakfast',
    'Air Conditioning', 'Kitchen', 'TV', 'Laundry', 'Pet Friendly',
  ];

  useEffect(() => {
    fetchStays();
  }, []);

  const fetchStays = async () => {
    try {
      const data = await request('/stays/');
      setStays(data.results || data);
    } catch (error) {
      console.error('Failed to fetch stays:', error);
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        priceNight: parseFloat(formData.priceNight),
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lon: formData.lon ? parseFloat(formData.lon) : null,
      };

      if (editingStay) {
        await request(
          `/stays/${editingStay.id}/`,
          { method: 'PUT', body: JSON.stringify(payload) },
          '✅ Property updated successfully!'
        );
      } else {
        await request(
          '/stays/',
          { method: 'POST', body: JSON.stringify(payload) },
          '✅ Property added successfully!'
        );
      }
      
      fetchStays();
      resetForm();
    } catch (error) {
      console.error('Failed to save property:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await request(`/stays/${id}/`, { method: 'DELETE' }, '✅ Property deleted!');
        fetchStays();
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  const handleToggleOpen = async (stay: Stay) => {
    try {
      await request(
        `/stays/${stay.id}/`,
        { method: 'PATCH', body: JSON.stringify({ is_open: !stay.is_open }) },
        `✅ Property ${stay.is_open ? 'closed' : 'opened'}!`
      );
      fetchStays();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleOpenImageModal = (stay: Stay) => {
    setSelectedStayForImages(stay);
    setShowImageModal(true);
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePreview = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadImages = async () => {
    if (!selectedStayForImages || imageFiles.length === 0) return;

    try {
      setUploadingImages(true);
      const formDataObj = new FormData();
      imageFiles.forEach(file => {
        formDataObj.append('images', file);
      });

      const response = await fetch(`/api/stays/stays/${selectedStayForImages.id}/upload_images/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formDataObj,
      });

      if (!response.ok) throw new Error('Upload failed');

      alert('✅ Images uploaded successfully!');
      fetchStays();
      setShowImageModal(false);
      setImageFiles([]);
      setImagePreviews([]);
    } catch (error) {
      console.error('Failed to upload images:', error);
      alert('❌ Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (stayId: number, imageId: number) => {
    if (!window.confirm('Delete this image?')) return;

    try {
      const response = await fetch(`/api/stays/stays/${stayId}/images/${imageId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) throw new Error('Delete failed');
      alert('✅ Image deleted');
      fetchStays();
    } catch (error) {
      console.error('Failed to delete image:', error);
      alert('❌ Failed to delete image');
    }
  };

  const handleSetPrimaryImage = async (stayId: number, imageId: number) => {
    try {
      const response = await fetch(`/api/stays/stays/${stayId}/images/${imageId}/set-primary/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Set primary failed');
      alert('✅ Primary image updated');
      fetchStays();
    } catch (error) {
      console.error('Failed to set primary image:', error);
      alert('❌ Failed to set primary image');
    }
  };

  const handleEdit = (stay: Stay) => {
    setEditingStay(stay);
    setFormData({
      name: stay.name,
      type: stay.type,
      district: stay.district,
      priceNight: stay.priceNight?.toString() || '',
      amenities: stay.amenities || [],
      landmark: stay.landmark || '',
      lat: stay.lat?.toString() || '',
      lon: stay.lon?.toString() || '',
      booking_com_url: stay.booking_com_url || '',
      agoda_url: stay.agoda_url || '',
      booking_provider: stay.booking_provider || 'booking.com',
      contact_email: stay.contact_email || '',
      contact_phone: stay.contact_phone || '',
      contact_whatsapp: stay.contact_whatsapp || '',
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      district: '',
      priceNight: '',
      amenities: [],
      landmark: '',
      lat: '',
      lon: '',
      booking_com_url: '',
      agoda_url: '',
      booking_provider: 'booking.com',
      contact_email: '',
      contact_phone: '',
      contact_whatsapp: '',
    });
    setEditingStay(null);
    setShowAddModal(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/sign-in');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.background }}>
      {/* Header */}
      <header style={{
        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
        borderBottom: `1px solid ${theme.cardBorder}`,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Building2 size={28} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>
                  Stay Owner Portal
                </h1>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                  Welcome back, {user?.username} 👋
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link
                to="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                <Home size={18} />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          <div style={{
            background: theme.cardBg,
            borderRadius: '16px',
            padding: '24px',
            border: `1px solid ${theme.cardBorder}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Building2 size={24} color={theme.primary} />
              <span style={{ color: theme.textMuted, fontSize: '14px' }}>Total Properties</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: theme.text }}>{stays.length}</div>
          </div>
          <div style={{
            background: theme.cardBg,
            borderRadius: '16px',
            padding: '24px',
            border: `1px solid ${theme.cardBorder}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Activity size={24} color={theme.success} />
              <span style={{ color: theme.textMuted, fontSize: '14px' }}>Open Now</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: theme.success }}>
              {stays.filter(s => s.is_open !== false).length}
            </div>
          </div>
          <div style={{
            background: theme.cardBg,
            borderRadius: '16px',
            padding: '24px',
            border: `1px solid ${theme.cardBorder}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <TrendingUp size={24} color={theme.warning} />
              <span style={{ color: theme.textMuted, fontSize: '14px' }}>Trending</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: theme.warning }}>
              {stays.filter(s => s.is_trending).length}
            </div>
          </div>
          <div style={{
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
            borderRadius: '16px',
            padding: '24px',
            cursor: 'pointer',
          }} onClick={() => setShowAddModal(true)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Plus size={24} color="white" />
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>Add New</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>Add Property</div>
          </div>
        </div>

        {/* Properties Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.text, margin: 0 }}>
            Your Properties
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: theme.primary,
              borderRadius: '12px',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            <Plus size={18} />
            Add Property
          </button>
        </div>

        {/* Properties Grid */}
        {stays.length === 0 ? (
          <div style={{
            background: theme.cardBg,
            borderRadius: '20px',
            padding: '60px 40px',
            textAlign: 'center',
            border: `2px dashed ${theme.cardBorder}`,
          }}>
            <Building2 size={64} color={theme.textMuted} style={{ marginBottom: '20px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: theme.text, marginBottom: '12px' }}>
              No Properties Yet
            </h3>
            <p style={{ color: theme.textMuted, marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
              Get started by adding your first hotel, apartment, or homestay. It only takes a few minutes!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                background: theme.primary,
                borderRadius: '12px',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              <Plus size={20} />
              Add Your First Property
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px',
          }}>
            {stays.map((stay) => (
              <div
                key={stay.id}
                style={{
                  background: theme.cardBg,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: `1px solid ${theme.cardBorder}`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                {/* Image Header */}
                <div style={{
                  height: '160px',
                  background: stay.main_image_url 
                    ? `url(${stay.main_image_url}) center/cover`
                    : `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
                  position: 'relative',
                }}>
                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: stay.is_open !== false ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}>
                    {stay.is_open !== false ? '● OPEN' : '● CLOSED'}
                  </div>
                  {/* Type Badge */}
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}>
                    {stay.type}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '20px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: theme.text,
                    marginBottom: '8px',
                  }}>
                    {stay.name}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} color={theme.primary} />
                      <span style={{ color: theme.textMuted, fontSize: '14px' }}>{stay.district}</span>
                    </div>
                    {stay.landmark && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={14} color={theme.textMuted} />
                        <span style={{ color: theme.textMuted, fontSize: '13px' }}>Near {stay.landmark}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <DollarSign size={16} color={theme.success} />
                      <span style={{ color: theme.success, fontSize: '16px', fontWeight: '700' }}>
                        RM {stay.priceNight}/night
                      </span>
                    </div>
                    {stay.rating && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Star size={16} color="#fbbf24" fill="#fbbf24" />
                        <span style={{ color: theme.text, fontSize: '14px', fontWeight: '600' }}>
                          {Number(stay.rating).toFixed(1)}/10
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Amenities */}
                  {stay.amenities && stay.amenities.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {stay.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          style={{
                            padding: '4px 10px',
                            background: 'rgba(168, 85, 247, 0.15)',
                            color: theme.primaryLight,
                            borderRadius: '6px',
                            fontSize: '12px',
                          }}
                        >
                          {amenity}
                        </span>
                      ))}
                      {stay.amenities.length > 3 && (
                        <span style={{
                          padding: '4px 10px',
                          background: theme.cardBorder,
                          color: theme.textMuted,
                          borderRadius: '6px',
                          fontSize: '12px',
                        }}>
                          +{stay.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Social Metrics */}
                  {(stay.social_mentions || stay.is_trending) && (
                    <div style={{
                      background: 'rgba(168, 85, 247, 0.1)',
                      border: '1px solid rgba(168, 85, 247, 0.2)',
                      borderRadius: '10px',
                      padding: '12px',
                      marginBottom: '16px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MessageCircle size={14} color={theme.primary} />
                          <span style={{ color: theme.textMuted, fontSize: '12px' }}>
                            {stay.social_mentions || 0} mentions
                          </span>
                        </div>
                        {stay.is_trending && (
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            background: theme.success,
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: '600',
                          }}>
                            <TrendingUp size={12} /> Trending
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Images count */}
                  {stay.stay_images && stay.stay_images.length > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                      color: theme.textMuted,
                      fontSize: '13px',
                    }}>
                      <ImageIcon size={14} />
                      {stay.stay_images.length} {stay.stay_images.length === 1 ? 'image' : 'images'} uploaded
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px',
                    paddingTop: '16px',
                    borderTop: `1px solid ${theme.cardBorder}`,
                  }}>
                    <button
                      onClick={() => handleToggleOpen(stay)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px',
                        background: stay.is_open !== false ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                        color: stay.is_open !== false ? theme.danger : theme.success,
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                      }}
                    >
                      {stay.is_open !== false ? 'Close' : 'Open'}
                    </button>
                    <button
                      onClick={() => handleEdit(stay)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px',
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: '#3b82f6',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                      }}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleOpenImageModal(stay)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px',
                        background: 'rgba(168, 85, 247, 0.15)',
                        color: theme.primary,
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                      }}
                    >
                      <Upload size={14} /> Images
                    </button>
                    <button
                      onClick={() => handleDelete(stay.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: theme.danger,
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 50,
          }}
          onClick={resetForm}
        >
          <div
            style={{
              background: theme.cardBg,
              borderRadius: '20px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              border: `1px solid ${theme.cardBorder}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
              padding: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Building2 size={28} color="white" />
                </div>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: 0 }}>
                    {editingStay ? 'Edit Property' : 'Add New Property'}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '14px' }}>
                    {editingStay ? 'Update your property details' : 'List your accommodation'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px', maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
              <form onSubmit={handleSubmit}>
                {/* Basic Info */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ color: theme.text, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                    📝 Basic Information
                  </h3>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '6px', display: 'block' }}>
                        Property Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Sunset Beach Resort"
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: theme.background,
                          border: `1px solid ${theme.cardBorder}`,
                          borderRadius: '10px',
                          color: theme.text,
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '6px', display: 'block' }}>
                          Property Type *
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: theme.background,
                            border: `1px solid ${theme.cardBorder}`,
                            borderRadius: '10px',
                            color: theme.text,
                            fontSize: '14px',
                          }}
                        >
                          <option value="">Select type...</option>
                          {stayTypes.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '6px', display: 'block' }}>
                          District *
                        </label>
                        <select
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: theme.background,
                            border: `1px solid ${theme.cardBorder}`,
                            borderRadius: '10px',
                            color: theme.text,
                            fontSize: '14px',
                          }}
                        >
                          <option value="">Select district...</option>
                          {districts.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '6px', display: 'block' }}>
                          Price Per Night (RM) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.priceNight}
                          onChange={(e) => setFormData({ ...formData, priceNight: e.target.value })}
                          placeholder="150.00"
                          required
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: theme.background,
                            border: `1px solid ${theme.cardBorder}`,
                            borderRadius: '10px',
                            color: theme.text,
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '6px', display: 'block' }}>
                          Nearby Landmark
                        </label>
                        <input
                          type="text"
                          value={formData.landmark}
                          onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                          placeholder="e.g., Near Pantai Cenang"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: theme.background,
                            border: `1px solid ${theme.cardBorder}`,
                            borderRadius: '10px',
                            color: theme.text,
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ color: theme.text, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                    ✨ Amenities
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                    {commonAmenities.map(amenity => (
                      <label
                        key={amenity}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 14px',
                          background: formData.amenities.includes(amenity)
                            ? 'rgba(168, 85, 247, 0.2)'
                            : theme.background,
                          border: `1px solid ${formData.amenities.includes(amenity) ? theme.primary : theme.cardBorder}`,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                          style={{ display: 'none' }}
                        />
                        <span style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '4px',
                          border: `2px solid ${formData.amenities.includes(amenity) ? theme.primary : theme.cardBorder}`,
                          background: formData.amenities.includes(amenity) ? theme.primary : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {formData.amenities.includes(amenity) && <Check size={12} color="white" />}
                        </span>
                        <span style={{ color: theme.text, fontSize: '13px' }}>{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ color: theme.text, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                    📞 Contact Information
                  </h3>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '6px', display: 'block' }}>
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        placeholder="info@yourhotel.com"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: theme.background,
                          border: `1px solid ${theme.cardBorder}`,
                          borderRadius: '10px',
                          color: theme.text,
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '6px', display: 'block' }}>
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.contact_phone}
                          onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                          placeholder="+60123456789"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: theme.background,
                            border: `1px solid ${theme.cardBorder}`,
                            borderRadius: '10px',
                            color: theme.text,
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '6px', display: 'block' }}>
                          WhatsApp
                        </label>
                        <input
                          type="tel"
                          value={formData.contact_whatsapp}
                          onChange={(e) => setFormData({ ...formData, contact_whatsapp: e.target.value })}
                          placeholder="+60123456789"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: theme.background,
                            border: `1px solid ${theme.cardBorder}`,
                            borderRadius: '10px',
                            color: theme.text,
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Links */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ color: theme.text, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                    🔗 Booking Platform Links
                  </h3>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '6px', display: 'block' }}>
                        Booking.com URL
                      </label>
                      <input
                        type="url"
                        value={formData.booking_com_url}
                        onChange={(e) => setFormData({ ...formData, booking_com_url: e.target.value })}
                        placeholder="https://www.booking.com/hotel/..."
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: theme.background,
                          border: `1px solid ${theme.cardBorder}`,
                          borderRadius: '10px',
                          color: theme.text,
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '6px', display: 'block' }}>
                        Agoda URL
                      </label>
                      <input
                        type="url"
                        value={formData.agoda_url}
                        onChange={(e) => setFormData({ ...formData, agoda_url: e.target.value })}
                        placeholder="https://www.agoda.com/..."
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: theme.background,
                          border: `1px solid ${theme.cardBorder}`,
                          borderRadius: '10px',
                          color: theme.text,
                          fontSize: '14px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      padding: '12px 24px',
                      background: 'transparent',
                      border: `1px solid ${theme.cardBorder}`,
                      borderRadius: '10px',
                      color: theme.textMuted,
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      background: theme.primary,
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    <Save size={18} />
                    {editingStay ? 'Update Property' : 'Add Property'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {showImageModal && selectedStayForImages && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 50,
          }}
          onClick={() => setShowImageModal(false)}
        >
          <div
            style={{
              background: theme.cardBg,
              borderRadius: '20px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              border: `1px solid ${theme.cardBorder}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
              padding: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <ImageIcon size={28} color="white" />
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>
                      Manage Images
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '14px' }}>
                      {selectedStayForImages.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowImageModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <X size={20} color="white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px', maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
              {/* Current Images */}
              {selectedStayForImages.stay_images && selectedStayForImages.stay_images.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ color: theme.text, fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                    Current Images
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {selectedStayForImages.stay_images.map((img) => (
                      <div
                        key={img.id}
                        style={{
                          position: 'relative',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          aspectRatio: '1',
                        }}
                      >
                        <img
                          src={img.image_url}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {img.is_primary && (
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            background: theme.primary,
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '600',
                          }}>
                            PRIMARY
                          </div>
                        )}
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          display: 'flex',
                          gap: '4px',
                        }}>
                          {!img.is_primary && (
                            <button
                              onClick={() => handleSetPrimaryImage(selectedStayForImages.id, img.id)}
                              style={{
                                background: 'rgba(0,0,0,0.7)',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px',
                                cursor: 'pointer',
                              }}
                              title="Set as primary"
                            >
                              <Star size={14} color="white" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteImage(selectedStayForImages.id, img.id)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.9)',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px',
                              cursor: 'pointer',
                            }}
                            title="Delete"
                          >
                            <Trash2 size={14} color="white" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New */}
              <div>
                <h4 style={{ color: theme.text, fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                  Upload New Images
                </h4>
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                    border: `2px dashed ${theme.cardBorder}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <Upload size={32} color={theme.textMuted} style={{ marginBottom: '12px' }} />
                  <span style={{ color: theme.text, fontWeight: '600', marginBottom: '4px' }}>
                    Click to upload images
                  </span>
                  <span style={{ color: theme.textMuted, fontSize: '13px' }}>
                    PNG, JPG up to 5MB each
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                </label>

                {/* Previews */}
                {imagePreviews.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={index}
                          style={{
                            position: 'relative',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            aspectRatio: '1',
                          }}
                        >
                          <img
                            src={preview}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <button
                            onClick={() => handleRemovePreview(index)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(239, 68, 68, 0.9)',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            <X size={12} color="white" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleUploadImages}
                      disabled={uploadingImages}
                      style={{
                        width: '100%',
                        marginTop: '16px',
                        padding: '12px',
                        background: theme.primary,
                        border: 'none',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: uploadingImages ? 'not-allowed' : 'pointer',
                        opacity: uploadingImages ? 0.7 : 1,
                      }}
                    >
                      {uploadingImages ? 'Uploading...' : `Upload ${imagePreviews.length} Image${imagePreviews.length > 1 ? 's' : ''}`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StayOwnerDashboard;
