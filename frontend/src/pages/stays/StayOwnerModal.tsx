import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Building2, X, MapPin, DollarSign, Upload, Camera, Info, Phone, Globe, Wifi } from 'lucide-react';

interface StayFormData {
  name: string;
  type: string;
  district: string;
  priceNight: string;
  amenities: string[];
  landmark: string;
  lat: string;
  lon: string;
  booking_com_url: string;
  agoda_url: string;
  booking_provider: string;
  contact_email: string;
  contact_phone: string;
  contact_whatsapp: string;
}

interface Stay {
  id: number;
  name: string;
  type: string;
  district: string;
  priceNight: number;
  amenities: string[];
  landmark?: string;
  lat?: number;
  lon?: number;
  booking_com_url?: string;
  agoda_url?: string;
  booking_provider?: string;
}

interface StayOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingStay: Stay | null;
  formData: StayFormData;
  setFormData: React.Dispatch<React.SetStateAction<StayFormData>>;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  stayTypes: { value: string; label: string }[];
  commonAmenities: string[];
  handleAmenityToggle: (amenity: string) => void;
  imageFiles: File[];
  imagePreviews: string[];
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
}

export const StayOwnerModal: React.FC<StayOwnerModalProps> = ({
  isOpen,
  onClose,
  editingStay,
  formData,
  setFormData,
  handleSubmit,
  loading,
  stayTypes,
  commonAmenities,
  handleAmenityToggle,
  imagePreviews,
  onImageSelect,
  onRemoveImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const bookingProviderOptions = [
    { value: 'booking.com', label: 'Booking.com' },
    { value: 'agoda', label: 'Agoda' },
    { value: 'direct', label: 'Direct Booking' },
    { value: 'both', label: 'Multiple Platforms' },
  ];

  const modalContent = (
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}
      onClick={handleClickOutside}
    >
      {/* Modal Card */}
      <div 
        className="w-full max-w-[680px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingStay ? 'Update Property' : 'Add New Property'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {editingStay ? 'Update your accommodation details' : 'Fill in the details to list your property'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <form onSubmit={handleSubmit} id="stay-form" className="space-y-5">
            
            {/* Section: Basic Information */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                <Info className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Basic Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Property Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Sunset Beach Resort"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">This will be displayed to guests searching for accommodation</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Property Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow cursor-pointer"
                  >
                    <option value="">Select Property Type</option>
                    {stayTypes.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Location */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Location</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    District or Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    placeholder="e.g., Langkawi, Alor Setar, Kuah"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nearby Landmark</label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                    placeholder="e.g., Near Pantai Cenang Beach"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">Helps guests find your property more easily</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => setFormData({...formData, lat: e.target.value})}
                      placeholder="e.g., 6.3500"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lon}
                      onChange={(e) => setFormData({...formData, lon: e.target.value})}
                      placeholder="e.g., 99.8000"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Pricing */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Pricing</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Price Per Night (RM) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.priceNight}
                  onChange={(e) => setFormData({...formData, priceNight: e.target.value})}
                  placeholder="e.g., 150"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                />
                <p className="text-xs text-gray-500 mt-1.5">Standard nightly rate in Malaysian Ringgit</p>
              </div>
            </div>

            {/* Section: Amenities */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                <Wifi className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Amenities</h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">Select all amenities available at your property</p>
              
              <div className="grid grid-cols-2 gap-2.5">
                {commonAmenities.map((amenity) => {
                  const isSelected = formData.amenities.includes(amenity);
                  return (
                    <label 
                      key={amenity}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-indigo-50 border-2 border-indigo-500' 
                          : 'bg-white border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className={`text-sm ${isSelected ? 'text-indigo-700 font-medium' : 'text-gray-700'}`}>
                        {amenity}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Section: Contact Information */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                <Phone className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Contact Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    placeholder="e.g., info@yourhotel.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                      placeholder="e.g., +60123456789"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp</label>
                    <input
                      type="tel"
                      value={formData.contact_whatsapp}
                      onChange={(e) => setFormData({...formData, contact_whatsapp: e.target.value})}
                      placeholder="e.g., +60123456789"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Online Booking */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                <Globe className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Online Booking Links</h3>
                <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Optional</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Booking Provider</label>
                  <select
                    value={formData.booking_provider}
                    onChange={(e) => setFormData({...formData, booking_provider: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow cursor-pointer"
                  >
                    {bookingProviderOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Booking.com URL</label>
                  <input
                    type="url"
                    value={formData.booking_com_url}
                    onChange={(e) => setFormData({...formData, booking_com_url: e.target.value})}
                    placeholder="https://www.booking.com/hotel/..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Agoda URL</label>
                  <input
                    type="url"
                    value={formData.agoda_url}
                    onChange={(e) => setFormData({...formData, agoda_url: e.target.value})}
                    placeholder="https://www.agoda.com/..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  />
                </div>
              </div>
            </div>

            {/* Section: Property Photos */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                <Camera className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Property Photos</h3>
                {!editingStay && (
                  <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Optional</span>
                )}
              </div>
              
              {/* Upload Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-7 h-7 text-indigo-600" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Upload photos from your phone or computer
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, JPEG up to 10MB • Click or drag and drop
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={onImageSelect}
                  className="hidden"
                />
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-900">
                      {imagePreviews.length} photo{imagePreviews.length > 1 ? 's' : ''} ready to upload
                    </p>
                    <span className="text-xs text-gray-500">First photo = Cover image</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div 
                        key={index} 
                        className={`relative rounded-lg overflow-hidden ${
                          index === 0 ? 'ring-2 ring-indigo-500' : 'border border-gray-200'
                        }`}
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveImage(index);
                          }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-1.5 left-1.5 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded font-semibold">
                            Cover
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {editingStay && (
                <p className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  💡 To manage existing images, use the "Manage Images" button on your property card after saving.
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="stay-form"
            disabled={loading}
            className={`px-6 py-2.5 rounded-lg text-white font-semibold text-sm transition-colors shadow-sm ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Saving...' : (editingStay ? 'Update Property' : 'Add Property')}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default StayOwnerModal;
