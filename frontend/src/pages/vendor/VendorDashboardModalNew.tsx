import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Store, X } from 'lucide-react';

// Dark theme colors
const theme = {
  background: '#0f172a',
  cardBg: '#1e293b',
  cardBgHover: '#334155',
  primary: '#f97316',
  primaryLight: '#fb923c',
  primaryDark: '#ea580c',
  primaryMuted: 'rgba(249, 115, 22, 0.15)',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  border: '#334155',
  inputBg: '#0f172a',
  inputBorder: '#475569',
};

interface ModalProps {
  editingRestaurant: any;
  formStep: 'basic' | 'details' | 'online' | 'amenities';
  setFormStep: (step: 'basic' | 'details' | 'online' | 'amenities') => void;
  formData: any;
  setFormData: (data: any) => void;
  cuisineOptions: string[];
  handleCuisineChange: (cuisine: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
  loading: boolean;
}

export const VendorDashboardModal: React.FC<ModalProps> = ({
  editingRestaurant,
  formData,
  setFormData,
  cuisineOptions,
  handleCuisineChange,
  handleSubmit,
  resetForm,
  loading,
}) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      resetForm();
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    background: theme.inputBg,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: '10px',
    color: theme.text,
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: theme.textSecondary,
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '6px',
  };

  const sectionStyle: React.CSSProperties = {
    background: theme.background,
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  };

  const sectionHeaderStyle: React.CSSProperties = {
    borderBottom: `1px solid ${theme.border}`,
    paddingBottom: '12px',
    marginBottom: '16px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: theme.primary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: 0,
  };

  const modalContent = (
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={handleClickOutside}
    >
      {/* Modal Card */}
      <div 
        style={{
          background: theme.cardBg,
          borderRadius: '16px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${theme.border}`,
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ 
          background: theme.cardBg, 
          padding: '20px 24px', 
          borderBottom: `1px solid ${theme.border}`, 
          flexShrink: 0 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ 
                padding: '12px', 
                background: theme.primaryMuted, 
                borderRadius: '12px',
                border: `1px solid ${theme.primary}30`
              }}>
                <Store style={{ width: '22px', height: '22px', color: theme.primary }} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: theme.text, margin: 0 }}>
                  {editingRestaurant ? 'Update Restaurant' : 'Add Restaurant'}
                </h2>
                <p style={{ fontSize: '14px', color: theme.textMuted, margin: '4px 0 0 0' }}>
                  Fill in the details below
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetForm}
              style={{ 
                padding: '10px', 
                color: theme.textMuted, 
                background: theme.background, 
                border: `1px solid ${theme.border}`, 
                borderRadius: '10px', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div 
          style={{ 
            overflowY: 'auto',
            flex: 1,
            padding: '24px',
            backgroundColor: theme.cardBg,
            maxHeight: 'calc(90vh - 160px)'
          }}
        >
          {/* Section 1: Basic Information */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <h3 style={sectionTitleStyle}>Basic Information</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>
                  Restaurant Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Restoran Nasi Kandar Subaidah"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  City <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., Alor Setar"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Cuisine Types <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '8px' 
                }}>
                  {cuisineOptions.map((cuisine) => (
                    <label 
                      key={cuisine} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '8px 12px',
                        background: formData.cuisines.includes(cuisine) ? theme.primaryMuted : 'transparent',
                        border: `1px solid ${formData.cuisines.includes(cuisine) ? theme.primary : theme.border}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.cuisines.includes(cuisine)}
                        onChange={() => handleCuisineChange(cuisine)}
                        style={{ 
                          width: '16px', 
                          height: '16px',
                          accentColor: theme.primary
                        }}
                      />
                      <span style={{ fontSize: '13px', color: theme.text }}>{cuisine}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell customers about your restaurant..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Year Established</label>
                  <input
                    type="number"
                    value={formData.established_year}
                    onChange={(e) => setFormData({ ...formData, established_year: e.target.value })}
                    placeholder="e.g., 2010"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Price Range</label>
                  <select
                    value={formData.price_range}
                    onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="$">$ Budget (under RM30)</option>
                    <option value="$$">$$ Moderate (RM30-80)</option>
                    <option value="$$$">$$$ Upscale (RM80-150)</option>
                    <option value="$$$$">$$$$ Fine Dining (over RM150)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <h3 style={sectionTitleStyle}>Contact Information</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+60 12-345 6789"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="info@restaurant.com"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Jalan Sultan, Alor Setar"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Online Presence */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <h3 style={sectionTitleStyle}>Online Presence</h3>
              <p style={{ fontSize: '12px', color: theme.textMuted, marginTop: '4px' }}>Optional</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Website</label>
                <input
                  type="url"
                  value={formData.official_website}
                  onChange={(e) => setFormData({ ...formData, official_website: e.target.value })}
                  placeholder="https://www.yourrestaurant.com"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Facebook</label>
                  <input
                    type="url"
                    value={formData.facebook_url}
                    onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                    placeholder="https://facebook.com/..."
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Instagram</label>
                  <input
                    type="url"
                    value={formData.instagram_url}
                    onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/..."
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Google Maps Link</label>
                <input
                  type="url"
                  value={formData.google_maps_url}
                  onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                  placeholder="Paste your Google Maps link"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Features & Amenities */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <h3 style={sectionTitleStyle}>Features & Amenities</h3>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '8px',
              marginBottom: '16px'
            }}>
              {[
                { key: 'parking', label: 'Parking' },
                { key: 'wifi', label: 'WiFi' },
                { key: 'wheelchair_accessible', label: 'Wheelchair Access' },
                { key: 'outdoor_seating', label: 'Outdoor Seating' },
                { key: 'halal_certified', label: 'Halal Certified' },
                { key: 'non_smoking', label: 'Non-smoking' },
                { key: 'live_music', label: 'Live Music' },
                { key: 'tv_sports', label: 'Sports TV' },
                { key: 'private_events', label: 'Private Events' },
              ].map(({ key, label }) => (
                <label 
                  key={key} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '8px 12px',
                    background: formData.amenities[key] ? theme.primaryMuted : 'transparent',
                    border: `1px solid ${formData.amenities[key] ? theme.primary : theme.border}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities[key]}
                    onChange={(e) => setFormData({
                      ...formData,
                      amenities: { ...formData.amenities, [key]: e.target.checked }
                    })}
                    style={{ 
                      width: '16px', 
                      height: '16px',
                      accentColor: theme.primary
                    }}
                  />
                  <span style={{ fontSize: '13px', color: theme.text }}>{label}</span>
                </label>
              ))}
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '8px',
              paddingTop: '16px',
              borderTop: `1px solid ${theme.border}`
            }}>
              {[
                { key: 'delivery_available', label: 'Delivery' },
                { key: 'takeaway_available', label: 'Takeaway' },
                { key: 'reservation_required', label: 'Reservations' },
              ].map(({ key, label }) => (
                <label 
                  key={key} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '8px 12px',
                    background: formData[key] ? theme.primaryMuted : 'transparent',
                    border: `1px solid ${formData[key] ? theme.primary : theme.border}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                    style={{ 
                      width: '16px', 
                      height: '16px',
                      accentColor: theme.primary
                    }}
                  />
                  <span style={{ fontSize: '13px', color: theme.text }}>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          background: theme.cardBg, 
          borderTop: `1px solid ${theme.border}`, 
          padding: '16px 24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexShrink: 0 
        }}>
          <button
            type="button"
            onClick={resetForm}
            style={{ 
              padding: '12px 24px', 
              border: `1px solid ${theme.border}`, 
              background: theme.background, 
              color: theme.textSecondary, 
              borderRadius: '10px', 
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !formData.name || !formData.city || formData.cuisines.length === 0}
            style={{ 
              padding: '12px 28px', 
              background: (loading || !formData.name || !formData.city || formData.cuisines.length === 0) 
                ? theme.textMuted
                : `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`, 
              color: 'white', 
              borderRadius: '10px', 
              border: 'none',
              cursor: (loading || !formData.name || !formData.city || formData.cuisines.length === 0) ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: (loading || !formData.name || !formData.city || formData.cuisines.length === 0) 
                ? 'none' 
                : `0 4px 12px ${theme.primary}40`,
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Saving...' : (editingRestaurant ? 'Update Restaurant' : 'Add Restaurant')}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default VendorDashboardModal;
