import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, MapPin, Upload, Power, Search, Globe, Phone, Clock, Wifi, Car, Accessibility, UtensilsCrossed, Bath } from 'lucide-react';
import axios from '../../services/api';

interface Place {
  id?: number;
  name: string;
  description: string;
  category: string;
  city: string;
  state: string;
  country: string;
  is_free: boolean;
  is_open: boolean;
  price: string;
  currency: string;
  latitude: string;
  longitude: string;
  image_url: string;
  wikipedia_url?: string;
  official_website?: string;
  tripadvisor_url?: string;
  google_maps_url?: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  opening_hours?: string;
  best_time_to_visit?: string;
  amenities?: {
    parking?: boolean;
    wifi?: boolean;
    wheelchair_accessible?: boolean;
    restaurant?: boolean;
    restroom?: boolean;
  };
}

const emptyPlace: Place = {
  name: '',
  description: '',
  category: '',
  city: '',
  state: 'Kedah',
  country: 'Malaysia',
  is_free: true,
  is_open: true,
  price: '0.00',
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
  amenities: {
    parking: false,
    wifi: false,
    wheelchair_accessible: false,
    restaurant: false,
    restroom: false
  }
};

const categories = [
  { value: 'Tourist Attraction / Landmark', label: '🏛️ Landmark', color: '#a855f7' },
  { value: 'Beach', label: '🏖️ Beach', color: '#06b6d4' },
  { value: 'Museum', label: '🏛️ Museum', color: '#f59e0b' },
  { value: 'Park', label: '🌳 Park', color: '#22c55e' },
  { value: 'Temple', label: '⛩️ Temple', color: '#ef4444' },
  { value: 'Shopping Mall', label: '🛍️ Shopping', color: '#ec4899' },
  { value: 'Restaurant', label: '🍽️ Restaurant', color: '#f97316' },
  { value: 'Hotel', label: '🏨 Hotel', color: '#6366f1' },
  { value: 'City', label: '🏙️ City', color: '#8b5cf6' },
  { value: 'Royal Heritage', label: '👑 Royal Heritage', color: '#fbbf24' },
  { value: 'Other', label: '📍 Other', color: '#64748b' },
];

export default function PlacesManagement() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [formData, setFormData] = useState<Place>(emptyPlace);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchPlaces();
  }, []);

  // Auto-clear success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/places/?page_size=1000');
      const placesData = response.data.results || response.data;
      setPlaces(placesData);
      setError('');
    } catch (err: any) {
      setError('Failed to load places: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      let finalFormData = { ...formData };
      if (imageFile) {
        finalFormData.image_url = imagePreview;
      }

      if (editingPlace?.id) {
        await axios.put(`/places/${editingPlace.id}/`, finalFormData);
        setSuccess('✅ Place updated successfully!');
      } else {
        await axios.post('/places/', finalFormData);
        setSuccess('✅ Place created successfully!');
      }
      
      fetchPlaces();
      closeModal();
    } catch (err: any) {
      setError('Failed to save place: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (place: Place) => {
    setEditingPlace(place);
    setFormData(place);
    setImageFile(null);
    setImagePreview(place.image_url || '');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this place?')) return;

    try {
      await axios.delete(`/places/${id}/`);
      setSuccess('✅ Place deleted successfully!');
      fetchPlaces();
    } catch (err: any) {
      setError('Failed to delete place: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const response = await axios.post(`/places/${id}/toggle_status/`);
      const newStatus = response.data.is_open;
      setSuccess(`✅ Place ${newStatus ? 'opened' : 'closed'} successfully!`);
      fetchPlaces();
    } catch (err: any) {
      setError('Failed to toggle status: ' + (err.response?.data?.message || err.message));
    }
  };

  const closeModal = () => {
    setFormData(emptyPlace);
    setEditingPlace(null);
    setShowModal(false);
    setImageFile(null);
    setImagePreview('');
    setError('');
  };

  const openAddModal = () => {
    setFormData(emptyPlace);
    setEditingPlace(null);
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  const getCategoryStyle = (cat: string) => {
    const found = categories.find(c => c.value === cat);
    return found || { label: cat, color: '#64748b' };
  };

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         place.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || place.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid rgba(34, 197, 94, 0.3)', borderTopColor: '#22c55e', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <div style={{ color: '#94a3b8', fontSize: '16px' }}>Loading places...</div>
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: '6px',
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MapPin size={28} style={{ color: 'white' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', margin: 0 }}>Places Management</h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>Add, edit, and manage tourism destinations</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          <Plus size={20} />
          Add New Place
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '14px',
          fontSize: '15px',
          fontWeight: '600',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          zIndex: 100,
          animation: 'slideIn 0.3s ease-out',
        }}>
          {success}
        </div>
      )}

      {/* Search and Filter */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 18px 14px 48px',
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '15px',
              outline: 'none',
            }}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            padding: '14px 18px',
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '15px',
            outline: 'none',
            minWidth: '180px',
          }}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Places Grid */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '20px' }}>
          All Places ({filteredPlaces.length})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredPlaces.map((place) => {
            const catStyle = getCategoryStyle(place.category);
            return (
              <div key={place.id} style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                overflow: 'hidden',
                transition: 'all 0.3s',
              }}>
                {/* Image */}
                <div style={{ position: 'relative', height: '180px', background: 'rgba(0, 0, 0, 0.3)' }}>
                  {place.image_url ? (
                    <img src={place.image_url} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin size={48} style={{ color: '#475569' }} />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: place.is_open ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: 'white',
                  }}>
                    <Power size={14} />
                    {place.is_open ? 'OPEN' : 'CLOSED'}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', lineHeight: '1.4' }}>
                    {place.name}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>Category:</span>
                      <span style={{
                        padding: '4px 12px',
                        background: `${catStyle.color}20`,
                        color: catStyle.color,
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}>
                        {catStyle.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '14px' }}>
                      <MapPin size={14} style={{ color: '#a855f7' }} />
                      {place.city}, {place.state}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <button
                      onClick={() => place.id && handleToggleStatus(place.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '12px',
                        background: place.is_open ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                        border: 'none',
                        borderRadius: '10px',
                        color: place.is_open ? '#ef4444' : '#22c55e',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      <Power size={16} />
                      {place.is_open ? 'Close' : 'Open'}
                    </button>
                    <button
                      onClick={() => handleEdit(place)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px',
                        background: 'rgba(168, 85, 247, 0.15)',
                        border: 'none',
                        borderRadius: '10px',
                        color: '#a855f7',
                        cursor: 'pointer',
                      }}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => place.id && handleDelete(place.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: 'none',
                        borderRadius: '10px',
                        color: '#ef4444',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPlaces.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <MapPin size={64} style={{ color: '#475569', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>No places found</h3>
            <p style={{ fontSize: '15px', color: '#64748b' }}>
              {searchQuery || categoryFilter ? 'Try adjusting your search or filter' : 'Click "Add New Place" to get started'}
            </p>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Place */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 50,
          }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div style={{
            background: '#1e293b',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Modal Header */}
            <div style={{
              background: editingPlace 
                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              padding: '24px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '28px' }}>{editingPlace ? '✏️' : '🏛️'}</span>
                </div>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'white', margin: 0 }}>
                    {editingPlace ? 'Edit Place' : 'Add New Place'}
                  </h2>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0' }}>
                    {editingPlace ? `Editing: ${editingPlace.name}` : 'Add a new tourism destination'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <form onSubmit={handleSubmit} style={{ flex: 1, overflow: 'auto' }}>
              <div style={{ padding: '24px 28px' }}>
                {/* Error Message */}
                {error && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    fontSize: '14px',
                  }}>
                    {error}
                  </div>
                )}

                {/* Basic Info Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Place Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Eagle Square"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      style={inputStyle}
                    >
                      <option value="">Select category...</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Kuah"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="e.g., Kedah"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Place Image</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}>
                      <Upload size={18} />
                      Choose Image
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>or</span>
                    <input
                      type="url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={(e) => {
                        handleInputChange(e);
                        setImagePreview(''); // Clear file preview when URL is entered
                        setImageFile(null);
                      }}
                      placeholder="Paste image URL"
                      style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
                    />
                  </div>
                  {(imagePreview || formData.image_url) && (
                    <div style={{ marginTop: '12px', position: 'relative', display: 'inline-block' }}>
                      <img
                        src={imagePreview || formData.image_url}
                        alt="Preview"
                        style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '10px', border: '2px solid rgba(255, 255, 255, 0.1)' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                          setFormData(prev => ({ ...prev, image_url: '' }));
                        }}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: '#ef4444',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 'bold',
                        }}
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Brief description of the place..."
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                {/* Status Checkboxes */}
                <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="is_free"
                      checked={formData.is_free}
                      onChange={handleInputChange}
                      style={{ width: '18px', height: '18px', accentColor: '#22c55e' }}
                    />
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>🆓 Free Entry</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="is_open"
                      checked={formData.is_open}
                      onChange={handleInputChange}
                      style={{ width: '18px', height: '18px', accentColor: '#22c55e' }}
                    />
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>✅ Open for Visitors</span>
                  </label>
                </div>

                {/* Price (if not free) */}
                {!formData.is_free && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={labelStyle}>Price</label>
                      <input type="number" name="price" value={formData.price} onChange={handleInputChange} step="0.01" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Currency</label>
                      <select name="currency" value={formData.currency} onChange={handleInputChange} style={inputStyle}>
                        <option value="MYR">MYR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Coordinates */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>Latitude</label>
                    <input type="text" name="latitude" value={formData.latitude} onChange={handleInputChange} placeholder="6.3200" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Longitude</label>
                    <input type="text" name="longitude" value={formData.longitude} onChange={handleInputChange} placeholder="99.8431" style={inputStyle} />
                  </div>
                </div>

                {/* External Links Section */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#a855f7', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={16} /> External Links
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    <input type="url" name="wikipedia_url" value={formData.wikipedia_url || ''} onChange={handleInputChange} placeholder="Wikipedia URL" style={inputStyle} />
                    <input type="url" name="official_website" value={formData.official_website || ''} onChange={handleInputChange} placeholder="Official Website" style={inputStyle} />
                    <input type="url" name="tripadvisor_url" value={formData.tripadvisor_url || ''} onChange={handleInputChange} placeholder="TripAdvisor URL" style={inputStyle} />
                    <input type="url" name="google_maps_url" value={formData.google_maps_url || ''} onChange={handleInputChange} placeholder="Google Maps URL" style={inputStyle} />
                  </div>
                </div>

                {/* Contact Section */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#22c55e', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={16} /> Contact Information
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    <input type="tel" name="contact_phone" value={formData.contact_phone || ''} onChange={handleInputChange} placeholder="Contact Phone" style={inputStyle} />
                    <input type="email" name="contact_email" value={formData.contact_email || ''} onChange={handleInputChange} placeholder="Contact Email" style={inputStyle} />
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <textarea name="address" value={formData.address || ''} onChange={handleInputChange} rows={2} placeholder="Full Address" style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                </div>

                {/* Visitor Info Section */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#f59e0b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} /> Visitor Information
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    <input type="text" name="opening_hours" value={formData.opening_hours || ''} onChange={handleInputChange} placeholder="Opening Hours (e.g., 9AM - 6PM)" style={inputStyle} />
                    <input type="text" name="best_time_to_visit" value={formData.best_time_to_visit || ''} onChange={handleInputChange} placeholder="Best Time to Visit" style={inputStyle} />
                  </div>
                </div>

                {/* Amenities Section */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#ec4899', marginBottom: '14px' }}>✨ Amenities</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {[
                      { key: 'parking', label: '🅿️ Parking', icon: Car },
                      { key: 'wifi', label: '📶 WiFi', icon: Wifi },
                      { key: 'wheelchair_accessible', label: '♿ Accessible', icon: Accessibility },
                      { key: 'restaurant', label: '🍽️ Restaurant', icon: UtensilsCrossed },
                      { key: 'restroom', label: '🚻 Restroom', icon: Bath },
                    ].map((amenity) => {
                      const isChecked = formData.amenities?.[amenity.key as keyof typeof formData.amenities] || false;
                      return (
                        <label
                          key={amenity.key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: isChecked ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${isChecked ? 'rgba(236, 72, 153, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              amenities: { ...prev.amenities, [amenity.key]: e.target.checked }
                            }))}
                            style={{ width: '16px', height: '16px', accentColor: '#ec4899' }}
                          />
                          <span style={{ color: isChecked ? '#ec4899' : '#94a3b8', fontSize: '13px', fontWeight: '500' }}>
                            {amenity.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '20px 28px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                gap: '12px',
                background: 'rgba(0, 0, 0, 0.2)',
                flexShrink: 0,
              }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: '#94a3b8',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    background: editingPlace 
                      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                      : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? (
                    <>
                      <div style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {editingPlace ? 'Update Place' : 'Save Place'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        input::placeholder, textarea::placeholder {
          color: #64748b;
        }
        input:focus, textarea:focus, select:focus {
          border-color: #a855f7 !important;
        }
        option {
          background: #1e293b;
          color: white;
        }
      `}</style>
    </div>
  );
}
