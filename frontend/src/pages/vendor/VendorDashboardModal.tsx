import React from 'react';
import { Store, MapPin, Phone, Globe, Settings, CheckCircle, X, ArrowLeft, ArrowRight, Save } from 'lucide-react';

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
  formStep,
  setFormStep,
  formData,
  setFormData,
  cuisineOptions,
  handleCuisineChange,
  handleSubmit,
  resetForm,
  loading,
}) => {
  const tabs = [
    { id: 'basic' as const, label: 'Basic Info', icon: Store, color: 'blue' },
    { id: 'details' as const, label: 'Details', icon: Settings, color: 'purple' },
    { id: 'online' as const, label: 'Online', icon: Globe, color: 'emerald' },
    { id: 'amenities' as const, label: 'Amenities', icon: CheckCircle, color: 'green' },
  ];

  const isStepComplete = (step: string) => {
    switch (step) {
      case 'basic':
        return formData.name && formData.city && formData.cuisines.length > 0;
      case 'details':
        return formData.description || formData.established_year;
      case 'online':
        return formData.official_website || formData.facebook_url || formData.instagram_url;
      case 'amenities':
        return Object.values(formData.amenities).some(v => v);
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {editingRestaurant ? 'Update Restaurant' : 'Add New Restaurant'}
                </h2>
                <p className="text-emerald-100 text-sm">
                  Navigate through the tabs below to complete your restaurant profile
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-50 border-b-2 border-gray-200 px-8 py-4 flex-shrink-0">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = formStep === tab.id;
              const isComplete = isStepComplete(tab.id);
              
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFormStep(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all relative
                    ${isActive 
                      ? `bg-${tab.color}-500 text-white shadow-lg` 
                      : `bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200`
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {isComplete && !isActive && (
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* Basic Info Tab */}
            {formStep === 'basic' && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                  <h3 className="font-bold text-blue-900 text-xl mb-2">Essential Information</h3>
                  <p className="text-blue-700">Start with the basics - name, location, and cuisine type</p>
                </div>

                <div className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-6">
                  <div>
                    <label className="block text-gray-900 font-bold mb-2 text-lg">
                      Restaurant Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Mario's Italian Bistro"
                      required
                      className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-900 font-bold mb-2 text-lg">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g., Kuala Lumpur"
                      required
                      className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-900 font-bold mb-3 text-lg">
                      Cuisine Types <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {cuisineOptions.map((cuisine) => (
                        <label
                          key={cuisine}
                          className={`
                            flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all
                            ${formData.cuisines.includes(cuisine)
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={formData.cuisines.includes(cuisine)}
                            onChange={() => handleCuisineChange(cuisine)}
                            className="w-5 h-5 text-blue-600 border-gray-400 rounded focus:ring-blue-500"
                          />
                          <span className="font-semibold">{cuisine}</span>
                        </label>
                      ))}
                    </div>
                    {formData.cuisines.length === 0 && (
                      <p className="text-red-600 text-sm mt-2">Please select at least one cuisine type</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Details Tab */}
            {formStep === 'details' && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg">
                  <h3 className="font-bold text-purple-900 text-xl mb-2">Restaurant Details</h3>
                  <p className="text-purple-700">Add more information about your business</p>
                </div>

                <div className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-6">
                  <div>
                    <label className="block text-gray-900 font-bold mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tell customers about your restaurant, specialties, and atmosphere..."
                      rows={5}
                      className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-900 font-bold mb-2">Year Established</label>
                      <input
                        type="number"
                        value={formData.established_year}
                        onChange={(e) => setFormData({ ...formData, established_year: e.target.value })}
                        placeholder="e.g., 2010"
                        className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-900 font-bold mb-2">Price Range</label>
                      <select
                        value={formData.price_range}
                        onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                        className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all"
                      >
                        <option value="$">$ Budget (&lt; RM30)</option>
                        <option value="$$">$$ Moderate (RM30-80)</option>
                        <option value="$$$">$$$ Upscale (RM80-150)</option>
                        <option value="$$$$">$$$$ Fine Dining (&gt; RM150)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-900 font-bold mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      placeholder="+604-730 8888"
                      className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-900 font-bold mb-2">Email Address</label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="info@restaurant.com"
                      className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-900 font-bold mb-2">Full Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street address, building, city, postal code"
                      rows={3}
                      className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Online Presence Tab */}
            {formStep === 'online' && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-lg">
                  <h3 className="font-bold text-emerald-900 text-xl mb-2">Online Presence</h3>
                  <p className="text-emerald-700">Connect your website and social media accounts</p>
                </div>

                <div className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-6">
                  <div>
                    <label className="block text-gray-900 font-bold mb-2">Official Website</label>
                    <input
                      type="url"
                      value={formData.official_website}
                      onChange={(e) => setFormData({ ...formData, official_website: e.target.value })}
                      placeholder="https://yourrestaurant.com"
                      className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-900 font-bold mb-2">Facebook Page</label>
                      <input
                        type="url"
                        value={formData.facebook_url}
                        onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                        placeholder="https://facebook.com/..."
                        className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-900 font-bold mb-2">Instagram Profile</label>
                      <input
                        type="url"
                        value={formData.instagram_url}
                        onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                        placeholder="https://instagram.com/..."
                        className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-900 font-bold mb-2">TripAdvisor Link</label>
                      <input
                        type="url"
                        value={formData.tripadvisor_url}
                        onChange={(e) => setFormData({ ...formData, tripadvisor_url: e.target.value })}
                        placeholder="https://tripadvisor.com/..."
                        className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-900 font-bold mb-2">Google Maps Link</label>
                      <input
                        type="url"
                        value={formData.google_maps_url}
                        onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                        placeholder="https://maps.app.goo.gl/..."
                        className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-900 font-bold mb-2">Logo URL</label>
                      <input
                        type="url"
                        value={formData.logo_url}
                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        placeholder="https://example.com/logo.jpg"
                        className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-900 font-bold mb-2">Cover Image URL</label>
                      <input
                        type="url"
                        value={formData.cover_image_url}
                        onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                        placeholder="https://example.com/cover.jpg"
                        className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Amenities Tab */}
            {formStep === 'amenities' && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                  <h3 className="font-bold text-green-900 text-xl mb-2">Facilities & Amenities</h3>
                  <p className="text-green-700">Select the features your restaurant offers</p>
                </div>

                <div className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-6">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4 text-lg">Facilities</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { key: 'parking', label: 'Parking' },
                        { key: 'wifi', label: 'Free WiFi' },
                        { key: 'wheelchair_accessible', label: 'Wheelchair Accessible' },
                        { key: 'outdoor_seating', label: 'Outdoor Seating' },
                        { key: 'halal_certified', label: 'Halal Certified' },
                        { key: 'non_smoking', label: 'Non-Smoking Area' },
                        { key: 'live_music', label: 'Live Music' },
                        { key: 'tv_sports', label: 'TV/Sports' },
                        { key: 'private_events', label: 'Private Events' },
                      ].map((amenity) => (
                        <label
                          key={amenity.key}
                          className={`
                            flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all
                            ${formData.amenities[amenity.key]
                              ? 'bg-green-50 border-green-500'
                              : 'border-gray-300 hover:border-green-300'
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={formData.amenities[amenity.key] || false}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                amenities: {
                                  ...formData.amenities,
                                  [amenity.key]: e.target.checked,
                                },
                              });
                            }}
                            className="w-5 h-5 text-green-600 border-gray-400 rounded focus:ring-green-500"
                          />
                          <span className="font-semibold text-sm">{amenity.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-4 text-lg">Services</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <label className="flex items-center gap-3 p-4 bg-white border-2 border-gray-300 rounded-xl cursor-pointer hover:border-green-400 transition-all">
                        <input
                          type="checkbox"
                          checked={formData.delivery_available}
                          onChange={(e) => setFormData({ ...formData, delivery_available: e.target.checked })}
                          className="w-5 h-5 text-green-600 border-gray-400 rounded focus:ring-green-500"
                        />
                        <span className="font-semibold">Delivery Available</span>
                      </label>

                      <label className="flex items-center gap-3 p-4 bg-white border-2 border-gray-300 rounded-xl cursor-pointer hover:border-green-400 transition-all">
                        <input
                          type="checkbox"
                          checked={formData.takeaway_available}
                          onChange={(e) => setFormData({ ...formData, takeaway_available: e.target.checked })}
                          className="w-5 h-5 text-green-600 border-gray-400 rounded focus:ring-green-500"
                        />
                        <span className="font-semibold">Takeaway Available</span>
                      </label>

                      <label className="flex items-center gap-3 p-4 bg-white border-2 border-gray-300 rounded-xl cursor-pointer hover:border-green-400 transition-all">
                        <input
                          type="checkbox"
                          checked={formData.reservation_required}
                          onChange={(e) => setFormData({ ...formData, reservation_required: e.target.checked })}
                          className="w-5 h-5 text-green-600 border-gray-400 rounded focus:ring-green-500"
                        />
                        <span className="font-semibold">Reservation Required</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-900 font-bold mb-2">Dress Code (Optional)</label>
                    <input
                      type="text"
                      value={formData.dress_code}
                      onChange={(e) => setFormData({ ...formData, dress_code: e.target.value })}
                      placeholder="e.g., Casual, Smart Casual, Formal"
                      className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Actions */}
          <div className="flex-shrink-0 bg-gray-50 border-t-2 border-gray-200 px-8 py-5 flex items-center justify-between">
            <div className="flex gap-3">
              {formStep !== 'basic' && (
                <button
                  type="button"
                  onClick={() => {
                    const steps: Array<'basic' | 'details' | 'online' | 'amenities'> = ['basic', 'details', 'online', 'amenities'];
                    const currentIndex = steps.indexOf(formStep);
                    if (currentIndex > 0) setFormStep(steps[currentIndex - 1]);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-semibold"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Previous
                </button>
              )}

              {formStep !== 'amenities' && (
                <button
                  type="button"
                  onClick={() => {
                    const steps: Array<'basic' | 'details' | 'online' | 'amenities'> = ['basic', 'details', 'online', 'amenities'];
                    const currentIndex = steps.indexOf(formStep);
                    if (currentIndex < steps.length - 1) setFormStep(steps[currentIndex + 1]);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-semibold"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border-2 border-gray-400 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || formData.cuisines.length === 0}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : (editingRestaurant ? 'Update Restaurant' : 'Add Restaurant')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
