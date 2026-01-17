import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Store, X } from 'lucide-react';

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
  // Prevent body scroll when modal is open
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

  const modalContent = (
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={handleClickOutside}
    >
      {/* Modal Card */}
      <div 
        className="bg-white rounded-xl w-full overflow-hidden relative"
        style={{
          maxWidth: '720px',
          maxHeight: '90vh',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - White with warm accent */}
        <div style={{ background: 'white', padding: '16px 24px', borderBottom: '1px solid #eee', flexShrink: 0 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div style={{ padding: '10px', background: 'rgba(212, 165, 116, 0.15)', borderRadius: '10px' }}>
                <Store style={{ width: '20px', height: '20px', color: '#d4a574' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#2d2d2d', margin: 0 }}>
                  {editingRestaurant ? 'Update Restaurant' : 'Add Restaurant'}
                </h2>
                <p style={{ fontSize: '14px', color: '#888', margin: '2px 0 0 0' }}>Fill in the details below</p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetForm}
              style={{ padding: '8px', color: '#888', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              className="hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Content - Fixed height for proper scrolling */}
        <div 
          style={{ 
            overflowY: 'auto',
            flex: 1,
            padding: '24px',
            backgroundColor: '#fff',
            maxHeight: 'calc(90vh - 140px)'
          }}
        >
          <div className="space-y-6">
            
            {/* Section 1: Basic Information */}
            <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '12px', padding: '20px' }}>
              <div style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#d4a574', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Basic Information</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Restaurant Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Restoran Nasi Kandar Subaidah"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., Alor Setar"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cuisine Types <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {cuisineOptions.map((cuisine) => (
                    <label key={cuisine} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.cuisines.includes(cuisine)}
                        onChange={() => handleCuisineChange(cuisine)}
                        className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">{cuisine}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell customers about your restaurant..."
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Year Established</label>
                  <input
                    type="number"
                    value={formData.established_year}
                    onChange={(e) => setFormData({ ...formData, established_year: e.target.value })}
                    placeholder="e.g., 2010"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price Range</label>
                  <select
                    value={formData.price_range}
                    onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900"
                  >
                    <option value="$">$ Budget (under RM30)</option>
                    <option value="$$">$$ Moderate (RM30-80)</option>
                    <option value="$$$">$$$ Upscale (RM80-150)</option>
                    <option value="$$$$">$$$$ Fine Dining (over RM150)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Information */}
            <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '12px', padding: '20px' }}>
              <div style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#d4a574', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Contact Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+60 12-345 6789"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="info@restaurant.com"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                <input
                  type="text"
                  value={formData.location_address}
                  onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                  placeholder="123 Jalan Sultan, Alor Setar"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Section 3: Online Presence */}
            <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '12px', padding: '20px' }}>
              <div style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#d4a574', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Online Presence</h3>
                <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Optional</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                <input
                  type="url"
                  value={formData.official_website}
                  onChange={(e) => setFormData({ ...formData, official_website: e.target.value })}
                  placeholder="https://www.yourrestaurant.com"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Facebook</label>
                  <input
                    type="url"
                    value={formData.facebook_url}
                    onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                    placeholder="https://facebook.com/..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram</label>
                  <input
                    type="url"
                    value={formData.instagram_url}
                    onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Google Maps Link</label>
                <input
                  type="url"
                  value={formData.google_maps_url}
                  onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                  placeholder="Paste your Google Maps link"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Section 4: Features & Amenities */}
            <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '12px', padding: '20px' }}>
              <div style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#d4a574', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Features & Amenities</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
                  <label key={key} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities[key]}
                      onChange={(e) => setFormData({
                        ...formData,
                        amenities: { ...formData.amenities, [key]: e.target.checked }
                      })}
                      className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                {[
                  { key: 'delivery_available', label: 'Delivery' },
                  { key: 'takeaway_available', label: 'Takeaway' },
                  { key: 'reservation_required', label: 'Reservations' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                      className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer - Sticky at bottom */}
        <div style={{ 
          background: 'white', 
          borderTop: '1px solid #eee', 
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
              padding: '10px 20px', 
              border: '1px solid #ddd', 
              background: 'white', 
              color: '#666', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !formData.name || !formData.city || formData.cuisines.length === 0}
            style={{ 
              padding: '10px 24px', 
              background: (loading || !formData.name || !formData.city || formData.cuisines.length === 0) 
                ? '#ccc' 
                : 'linear-gradient(135deg, #d4a574 0%, #c89963 100%)', 
              color: 'white', 
              borderRadius: '8px', 
              border: 'none',
              cursor: (loading || !formData.name || !formData.city || formData.cuisines.length === 0) ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              boxShadow: (loading || !formData.name || !formData.city || formData.cuisines.length === 0) 
                ? 'none' 
                : '0 4px 12px rgba(212, 165, 116, 0.3)'
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
