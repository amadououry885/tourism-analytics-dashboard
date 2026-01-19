import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  LogOut, 
  Phone, 
  Mail,
  Star,
  DollarSign,
  Home,
  Upload,
  Image as ImageIcon,
  X,
  Check,
  Globe,
  Clock,
  Eye,
  EyeOff,
  Save,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';

interface Place {
  id: number;
  name: string;
  description: string;
  category: string;
  city: string;
  state: string;
  country: string;
  is_free: boolean;
  price?: number;
  currency: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  wikipedia_url?: string;
  official_website?: string;
  tripadvisor_url?: string;
  google_maps_url?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  opening_hours?: string;
  best_time_to_visit?: string;
  is_open: boolean;
  is_active: boolean;
  amenities?: Record<string, boolean>;
  owner?: number;
}

// Theme colors - Teal for Places (to differentiate from purple stays)
const theme = {
  primary: '#14b8a6',
  primaryDark: '#0d9488',
  primaryLight: '#5eead4',
  background: '#0f172a',
  cardBg: '#1e293b',
  cardBorder: '#334155',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
};

const PlaceOwnerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { request } = useApi();
  const navigate = useNavigate();
  
  const [places, setPlaces] = useState<Place[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    city: '',
    state: 'Kedah',
    country: 'Malaysia',
    is_free: true,
    price: '',
    currency: 'MYR',
    latitude: '',
    longitude: '',
    image_url: '',
    wikipedia_url: '',
    official_website: '',
    tripadvisor_url: '',
    google_maps_url: '',
    contact_phone: '',
    contact_email: '',
    address: '',
    opening_hours: '',
    best_time_to_visit: '',
    amenities: {} as Record<string, boolean>,
  });

  const categories = [
    'Museum', 'Theme Park', 'Nature', 'Historical', 'Religious',
    'Beach', 'Garden', 'Adventure', 'Cultural', 'Art Gallery',
    'Zoo', 'Waterfall', 'Lake', 'Mountain', 'Other'
  ];

  const cities = [
    'Alor Setar', 'Langkawi', 'Kuala Kedah', 'Sungai Petani', 
    'Kulim', 'Baling', 'Yan', 'Pendang', 'Pokok Sena', 'Kubang Pasu'
  ];

  const commonAmenities = [
    'Parking', 'WiFi', 'Restroom', 'Wheelchair Access', 'Gift Shop',
    'Cafe', 'Guided Tours', 'Audio Guide', 'Photography Allowed', 'Pet Friendly',
  ];

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const data = await request('/places/');
      setPlaces(data.results || data);
    } catch (error) {
      console.error('Failed to fetch places:', error);
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: !prev.amenities[amenity]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        price: formData.is_free ? null : (formData.price ? parseFloat(formData.price) : null),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      if (editingPlace) {
        await request(
          `/places/${editingPlace.id}/`,
          { method: 'PUT', body: JSON.stringify(payload) },
          '✅ Place updated successfully!'
        );
      } else {
        await request(
          '/places/',
          { method: 'POST', body: JSON.stringify(payload) },
          '✅ Place added successfully!'
        );
      }
      
      fetchPlaces();
      resetForm();
    } catch (error) {
      console.error('Failed to save place:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this place?')) {
      try {
        await request(`/places/${id}/`, { method: 'DELETE' }, '✅ Place deleted!');
        fetchPlaces();
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  const handleToggleOpen = async (place: Place) => {
    try {
      await request(
        `/places/${place.id}/toggle_status/`,
        { method: 'POST' },
        `✅ Place ${place.is_open ? 'closed' : 'opened'}!`
      );
      fetchPlaces();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleToggleActive = async (place: Place) => {
    try {
      await request(
        `/places/${place.id}/toggle_active/`,
        { method: 'POST' },
        `✅ Place ${place.is_active ? 'hidden' : 'visible'}!`
      );
      fetchPlaces();
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  };

  const handleEdit = (place: Place) => {
    setEditingPlace(place);
    setFormData({
      name: place.name,
      description: place.description || '',
      category: place.category || '',
      city: place.city || '',
      state: place.state || 'Kedah',
      country: place.country || 'Malaysia',
      is_free: place.is_free,
      price: place.price?.toString() || '',
      currency: place.currency || 'MYR',
      latitude: place.latitude?.toString() || '',
      longitude: place.longitude?.toString() || '',
      image_url: place.image_url || '',
      wikipedia_url: place.wikipedia_url || '',
      official_website: place.official_website || '',
      tripadvisor_url: place.tripadvisor_url || '',
      google_maps_url: place.google_maps_url || '',
      contact_phone: place.contact_phone || '',
      contact_email: place.contact_email || '',
      address: place.address || '',
      opening_hours: place.opening_hours || '',
      best_time_to_visit: place.best_time_to_visit || '',
      amenities: place.amenities || {},
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      city: '',
      state: 'Kedah',
      country: 'Malaysia',
      is_free: true,
      price: '',
      currency: 'MYR',
      latitude: '',
      longitude: '',
      image_url: '',
      wikipedia_url: '',
      official_website: '',
      tripadvisor_url: '',
      google_maps_url: '',
      contact_phone: '',
      contact_email: '',
      address: '',
      opening_hours: '',
      best_time_to_visit: '',
      amenities: {},
    });
    setEditingPlace(null);
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
                <MapPin size={28} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>
                  Place Owner Portal
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
                Home
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'rgba(239,68,68,0.8)',
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
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {/* Stats Overview */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: theme.cardBg,
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${theme.cardBorder}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '10px',
                background: `${theme.primary}20`, display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <MapPin size={20} color={theme.primary} />
              </div>
              <div>
                <p style={{ fontSize: '24px', fontWeight: '700', color: theme.text, margin: 0 }}>
                  {places.length}
                </p>
                <p style={{ fontSize: '12px', color: theme.textMuted, margin: 0 }}>
                  Total Places
                </p>
              </div>
            </div>
          </div>
          
          <div style={{
            background: theme.cardBg,
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${theme.cardBorder}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '10px',
                background: `${theme.success}20`, display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <Eye size={20} color={theme.success} />
              </div>
              <div>
                <p style={{ fontSize: '24px', fontWeight: '700', color: theme.text, margin: 0 }}>
                  {places.filter(p => p.is_open).length}
                </p>
                <p style={{ fontSize: '12px', color: theme.textMuted, margin: 0 }}>
                  Open Now
                </p>
              </div>
            </div>
          </div>
          
          <div style={{
            background: theme.cardBg,
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${theme.cardBorder}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '10px',
                background: `${theme.warning}20`, display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <DollarSign size={20} color={theme.warning} />
              </div>
              <div>
                <p style={{ fontSize: '24px', fontWeight: '700', color: theme.text, margin: 0 }}>
                  {places.filter(p => !p.is_free).length}
                </p>
                <p style={{ fontSize: '12px', color: theme.textMuted, margin: 0 }}>
                  Paid Entry
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Button */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: theme.primary,
              borderRadius: '10px',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            <Plus size={20} />
            Add New Place
          </button>
        </div>

        {/* Places Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '20px' 
        }}>
          {places.map(place => (
            <div
              key={place.id}
              style={{
                background: theme.cardBg,
                borderRadius: '16px',
                overflow: 'hidden',
                border: `1px solid ${theme.cardBorder}`,
              }}
            >
              {/* Image */}
              <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                {place.image_url ? (
                  <img
                    src={place.image_url}
                    alt={place.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(135deg, ${theme.primary}40, ${theme.primaryDark}40)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <MapPin size={48} color={theme.primary} />
                  </div>
                )}
                
                {/* Status Badges */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: place.is_open ? theme.success : theme.danger,
                    color: 'white',
                  }}>
                    {place.is_open ? '🟢 OPEN' : '🔴 CLOSED'}
                  </span>
                  {!place.is_active && (
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background: theme.warning,
                      color: 'white',
                    }}>
                      👁️ HIDDEN
                    </span>
                  )}
                </div>
                
                {/* Category Badge */}
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '600',
                  background: 'rgba(0,0,0,0.6)',
                  color: 'white',
                }}>
                  {place.category || 'Uncategorized'}
                </span>
              </div>

              {/* Content */}
              <div style={{ padding: '16px' }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  color: theme.text, 
                  margin: '0 0 8px 0' 
                }}>
                  {place.name}
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <MapPin size={14} color={theme.textMuted} />
                  <span style={{ fontSize: '13px', color: theme.textMuted }}>
                    {place.city}, {place.state}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: place.is_free ? `${theme.success}20` : `${theme.warning}20`,
                    color: place.is_free ? theme.success : theme.warning,
                  }}>
                    {place.is_free ? '🆓 Free Entry' : `💰 ${place.currency} ${place.price}`}
                  </span>
                </div>
                
                {place.description && (
                  <p style={{ 
                    fontSize: '13px', 
                    color: theme.textMuted, 
                    margin: '0 0 12px 0',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {place.description}
                  </p>
                )}

                {/* Contact Info */}
                {(place.contact_phone || place.contact_email) && (
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    marginBottom: '12px',
                    flexWrap: 'wrap'
                  }}>
                    {place.contact_phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={12} color={theme.textMuted} />
                        <span style={{ fontSize: '12px', color: theme.textMuted }}>
                          {place.contact_phone}
                        </span>
                      </div>
                    )}
                    {place.contact_email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={12} color={theme.textMuted} />
                        <span style={{ fontSize: '12px', color: theme.textMuted }}>
                          {place.contact_email}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  paddingTop: '12px',
                  borderTop: `1px solid ${theme.cardBorder}`,
                }}>
                  <button
                    onClick={() => handleEdit(place)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px',
                      background: `${theme.primary}20`,
                      borderRadius: '8px',
                      color: theme.primary,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                    }}
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleOpen(place)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px',
                      background: place.is_open ? `${theme.warning}20` : `${theme.success}20`,
                      borderRadius: '8px',
                      color: place.is_open ? theme.warning : theme.success,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                    }}
                  >
                    {place.is_open ? <EyeOff size={14} /> : <Eye size={14} />}
                    {place.is_open ? 'Close' : 'Open'}
                  </button>
                  <button
                    onClick={() => handleDelete(place.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px',
                      background: `${theme.danger}20`,
                      borderRadius: '8px',
                      color: theme.danger,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {places.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: theme.cardBg,
            borderRadius: '16px',
            border: `1px solid ${theme.cardBorder}`,
          }}>
            <MapPin size={48} color={theme.textMuted} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', color: theme.text, margin: '0 0 8px 0' }}>
              No places yet
            </h3>
            <p style={{ fontSize: '14px', color: theme.textMuted, margin: '0 0 20px 0' }}>
              Add your first attraction or tourist spot to get started
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: theme.primary,
                borderRadius: '10px',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              <Plus size={20} />
              Add Your First Place
            </button>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: theme.cardBg,
            borderRadius: '16px',
            width: '100%',
            maxWidth: '700px',
            maxHeight: '90vh',
            overflow: 'auto',
            border: `1px solid ${theme.cardBorder}`,
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: `1px solid ${theme.cardBorder}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              background: theme.cardBg,
              zIndex: 10,
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: theme.text, margin: 0 }}>
                {editingPlace ? 'Edit Place' : 'Add New Place'}
              </h2>
              <button
                onClick={resetForm}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                }}
              >
                <X size={20} color={theme.textMuted} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              {/* Basic Info */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.primary, marginBottom: '12px' }}>
                  Basic Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '13px', color: theme.textMuted, display: 'block', marginBottom: '6px' }}>
                      Place Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: theme.background,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: '8px',
                        color: theme.text,
                        fontSize: '14px',
                      }}
                      placeholder="e.g., Alor Setar Tower"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: theme.textMuted, display: 'block', marginBottom: '6px' }}>
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: theme.background,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: '8px',
                        color: theme.text,
                        fontSize: '14px',
                      }}
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: theme.textMuted, display: 'block', marginBottom: '6px' }}>
                      City *
                    </label>
                    <select
                      required
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: theme.background,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: '8px',
                        color: theme.text,
                        fontSize: '14px',
                      }}
                    >
                      <option value="">Select city</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '13px', color: theme.textMuted, display: 'block', marginBottom: '6px' }}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: theme.background,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: '8px',
                        color: theme.text,
                        fontSize: '14px',
                        resize: 'vertical',
                      }}
                      placeholder="Describe this attraction..."
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.primary, marginBottom: '12px' }}>
                  Pricing
                </h3>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_free}
                      onChange={e => setFormData({ ...formData, is_free: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '14px', color: theme.text }}>Free Entry</span>
                  </label>
                </div>
                {!formData.is_free && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '13px', color: theme.textMuted, display: 'block', marginBottom: '6px' }}>
                        Entry Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: theme.background,
                          border: `1px solid ${theme.cardBorder}`,
                          borderRadius: '8px',
                          color: theme.text,
                          fontSize: '14px',
                        }}
                        placeholder="e.g., 15.00"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '13px', color: theme.textMuted, display: 'block', marginBottom: '6px' }}>
                        Currency
                      </label>
                      <select
                        value={formData.currency}
                        onChange={e => setFormData({ ...formData, currency: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: theme.background,
                          border: `1px solid ${theme.cardBorder}`,
                          borderRadius: '8px',
                          color: theme.text,
                          fontSize: '14px',
                        }}
                      >
                        <option value="MYR">MYR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact & Location */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.primary, marginBottom: '12px' }}>
                  Contact & Location
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '13px', color: theme.textMuted, display: 'block', marginBottom: '6px' }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={e => setFormData({ ...formData, contact_phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: theme.background,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: '8px',
                        color: theme.text,
                        fontSize: '14px',
                      }}
                      placeholder="+60..."
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: theme.textMuted, display: 'block', marginBottom: '6px' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: theme.background,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: '8px',
                        color: theme.text,
                        fontSize: '14px',
                      }}
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '13px', color: theme.textMuted, display: 'block', marginBottom: '6px' }}>
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: theme.background,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: '8px',
                        color: theme.text,
                        fontSize: '14px',
                      }}
                      placeholder="Full address"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: theme.textMuted, display: 'block', marginBottom: '6px' }}>
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: theme.background,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: '8px',
                        color: theme.text,
                        fontSize: '14px',
                      }}
                      placeholder="e.g., 6.1248"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: theme.textMuted, display: 'block', marginBottom: '6px' }}>
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: theme.background,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: '8px',
                        color: theme.text,
                        fontSize: '14px',
                      }}
                      placeholder="e.g., 100.3685"
                    />
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.primary, marginBottom: '12px' }}>
                  Operating Hours
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '13px', color: theme.textMuted, display: 'block', marginBottom: '6px' }}>
                      Opening Hours
                    </label>
                    <input
                      type="text"
                      value={formData.opening_hours}
                      onChange={e => setFormData({ ...formData, opening_hours: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: theme.background,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: '8px',
                        color: theme.text,
                        fontSize: '14px',
                      }}
                      placeholder="e.g., Mon-Sun: 9AM-6PM"
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '13px', color: theme.textMuted, display: 'block', marginBottom: '6px' }}>
                      Best Time to Visit
                    </label>
                    <input
                      type="text"
                      value={formData.best_time_to_visit}
                      onChange={e => setFormData({ ...formData, best_time_to_visit: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: theme.background,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: '8px',
                        color: theme.text,
                        fontSize: '14px',
                      }}
                      placeholder="e.g., Early morning or evening"
                    />
                  </div>
                </div>
              </div>

              {/* Links */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.primary, marginBottom: '12px' }}>
                  External Links
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '13px', color: theme.textMuted, display: 'block', marginBottom: '6px' }}>
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: theme.background,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: '8px',
                        color: theme.text,
                        fontSize: '14px',
                      }}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: theme.textMuted, display: 'block', marginBottom: '6px' }}>
                      Official Website
                    </label>
                    <input
                      type="url"
                      value={formData.official_website}
                      onChange={e => setFormData({ ...formData, official_website: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: theme.background,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: '8px',
                        color: theme.text,
                        fontSize: '14px',
                      }}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: theme.textMuted, display: 'block', marginBottom: '6px' }}>
                      Google Maps URL
                    </label>
                    <input
                      type="url"
                      value={formData.google_maps_url}
                      onChange={e => setFormData({ ...formData, google_maps_url: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: theme.background,
                        border: `1px solid ${theme.cardBorder}`,
                        borderRadius: '8px',
                        color: theme.text,
                        fontSize: '14px',
                      }}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: theme.primary, marginBottom: '12px' }}>
                  Facilities & Amenities
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {commonAmenities.map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => handleAmenityToggle(amenity)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '500',
                        border: 'none',
                        cursor: 'pointer',
                        background: formData.amenities[amenity] ? theme.primary : theme.background,
                        color: formData.amenities[amenity] ? 'white' : theme.textMuted,
                        transition: 'all 0.2s',
                      }}
                    >
                      {formData.amenities[amenity] && <Check size={14} style={{ marginRight: '4px' }} />}
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                paddingTop: '20px',
                borderTop: `1px solid ${theme.cardBorder}`,
              }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: theme.background,
                    borderRadius: '10px',
                    color: theme.textMuted,
                    border: `1px solid ${theme.cardBorder}`,
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: theme.primary,
                    borderRadius: '10px',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  <Save size={18} />
                  {editingPlace ? 'Update Place' : 'Add Place'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceOwnerDashboard;
