import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { 
  X, Search, Building2, Hotel, UserPlus, 
  Mail, Lock, Phone, FileText, Upload, User,
  Briefcase, CheckCircle2, Sparkles, Eye, EyeOff, MapPin
} from 'lucide-react';
import api from '../services/api';

interface Business {
  id: number;
  name: string;
  city: string;
  cuisines?: string[];
  type?: string;
  address: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    role: 'vendor' as 'vendor' | 'stay_owner' | 'place_owner',
    first_name: '',
    last_name: '',
    claimed_vendor_id: null as number | null,
    claimed_stay_id: null as number | null,
    claimed_place_id: null as number | null,
    phone_number: '',
    business_registration_number: '',
  });
  const [verificationDocument, setVerificationDocument] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);
  const [availableBusinesses, setAvailableBusinesses] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Fetch available businesses when role changes
  useEffect(() => {
    const fetchBusinesses = async () => {
      setIsLoadingBusinesses(true);
      try {
        const type = formData.role === 'vendor' ? 'vendor' : formData.role === 'stay_owner' ? 'stay' : 'place';
        const response = await api.get(`/auth/available-businesses/?type=${type}`);
        const businesses = formData.role === 'vendor' 
          ? response.data.vendors 
          : formData.role === 'stay_owner' 
            ? response.data.stays 
            : response.data.places;
        setAvailableBusinesses(businesses || []);
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
        setAvailableBusinesses([]);
      } finally {
        setIsLoadingBusinesses(false);
      }
    };

    fetchBusinesses();
    setSelectedBusiness(null);
    setSearchTerm('');
  }, [formData.role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'role') {
      setFormData(prev => ({
        ...prev,
        role: value as 'vendor' | 'stay_owner' | 'place_owner',
        claimed_vendor_id: null,
        claimed_stay_id: null,
        claimed_place_id: null,
      }));
    }
  };

  const handleBusinessSelect = (business: Business) => {
    setSelectedBusiness(business);
    setSearchTerm(business.name);
    setShowBusinessDropdown(false);
    
    if (formData.role === 'vendor') {
      setFormData(prev => ({ ...prev, claimed_vendor_id: business.id, claimed_stay_id: null, claimed_place_id: null }));
    } else if (formData.role === 'stay_owner') {
      setFormData(prev => ({ ...prev, claimed_stay_id: business.id, claimed_vendor_id: null, claimed_place_id: null }));
    } else {
      setFormData(prev => ({ ...prev, claimed_place_id: business.id, claimed_vendor_id: null, claimed_stay_id: null }));
    }
  };

  const filteredBusinesses = availableBusinesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.phone_number) {
      toast.error('Phone number is required');
      return;
    }

    setIsLoading(true);

    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          submitData.append(key, String(value));
        }
      });
      
      if (verificationDocument) {
        submitData.append('verification_document', verificationDocument);
      }

      const result = await register(submitData);
      
      if (result.requiresApproval) {
        // Role-specific success message
        const roleMessages: Record<string, string> = {
          vendor: '🍜 Restaurant registration submitted! Our team will review your application and notify you via email within 24-48 hours.',
          stay_owner: '🏨 Hotel registration submitted! Our team will review your application and notify you via email within 24-48 hours.',
          place_owner: '🏛️ Attraction registration submitted! Our team will review your application and notify you via email within 24-48 hours.',
        };
        const message = roleMessages[formData.role] || 'Registration successful! Please wait for admin approval.';
        toast.success(message, { autoClose: 5000 });
      } else {
        toast.success('🎉 Registration successful! You can now sign in.');
      }
      
      setTimeout(() => navigate('/sign-in'), 3000);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: '#0f172a',
    border: '2px solid #334155',
  };

  return (
    <div 
      className="min-h-screen overflow-y-auto"
      style={{ backgroundColor: '#0f172a' }}
    >
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}
        />
      </div>

      {/* Centered Container */}
      <div className="flex items-center justify-center min-h-screen py-8 px-4">
        {/* Modal Card */}
        <div 
          className="relative w-full max-w-md rounded-2xl overflow-visible"
          style={{
            backgroundColor: '#1e293b',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
        {/* Header */}
        <div 
          className="px-6 pt-6 pb-4 relative"
          style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' }}
        >
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm mb-3">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Create Account</h2>
            <p className="text-white/70 text-sm">Join Kedah Tourism Network</p>
          </div>
        </div>

        {/* Form Container - no max height, natural flow */}
        <div className="px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                I am a... <span className="text-red-400">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg text-white text-sm transition-all focus:outline-none"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              >
                <option value="vendor">🍜 Restaurant/Business Owner</option>
                <option value="stay_owner">🏨 Hotel/Accommodation Owner</option>
                <option value="place_owner">🏛️ Attraction/Place Owner</option>
              </select>
            </div>

            {/* Business Claiming */}
            <div className="relative">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                {formData.role === 'vendor' ? (
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                ) : formData.role === 'stay_owner' ? (
                  <Hotel className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                )}
                Claim Your {formData.role === 'vendor' ? 'Restaurant' : formData.role === 'stay_owner' ? 'Hotel' : 'Attraction'} <span className="text-gray-600">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowBusinessDropdown(true);
                  }}
                  onFocus={(e) => {
                    setShowBusinessDropdown(true);
                    e.target.style.borderColor = '#a855f7';
                  }}
                  onBlur={(e) => {
                    setTimeout(() => setShowBusinessDropdown(false), 200);
                    e.target.style.borderColor = '#334155';
                  }}
                  placeholder={`Search ${formData.role === 'vendor' ? 'restaurants' : formData.role === 'stay_owner' ? 'hotels' : 'attractions'}...`}
                  className="w-full px-3 py-2.5 pl-9 rounded-lg text-white placeholder-gray-500 text-sm transition-all focus:outline-none"
                  style={inputStyle}
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              </div>
              
              {showBusinessDropdown && (
                <div 
                  className="absolute z-20 w-full mt-1 rounded-lg shadow-xl max-h-40 overflow-y-auto"
                  style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                >
                  {isLoadingBusinesses ? (
                    <div className="px-3 py-4 text-center">
                      <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : filteredBusinesses.length > 0 ? (
                    filteredBusinesses.slice(0, 5).map((business) => (
                      <div
                        key={business.id}
                        onClick={() => handleBusinessSelect(business)}
                        className="px-3 py-2 hover:bg-purple-500/20 cursor-pointer text-sm"
                      >
                        <p className="text-white truncate">{business.name}</p>
                        <p className="text-xs text-gray-500">{business.city}</p>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-3 text-center text-gray-500 text-xs">
                      No {formData.role === 'vendor' ? 'restaurants' : 'hotels'} available
                    </div>
                  )}
                </div>
              )}
              
              {selectedBusiness && (
                <div className="mt-2 p-2 rounded-lg flex items-center justify-between text-xs" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                  <span className="text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {selectedBusiness.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBusiness(null);
                      setSearchTerm('');
                      setFormData(prev => ({ ...prev, claimed_vendor_id: null, claimed_stay_id: null }));
                    }}
                    className="text-green-400 hover:text-green-300"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Username & Email */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-gray-400 mb-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  Username <span className="text-red-400">*</span>
                </label>
                <input
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                  onBlur={(e) => e.target.style.borderColor = '#334155'}
                  placeholder="Username"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-gray-400 mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                  onBlur={(e) => e.target.style.borderColor = '#334155'}
                  placeholder="Email"
                />
              </div>
            </div>

            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">First Name</label>
                <input
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                  onBlur={(e) => e.target.style.borderColor = '#334155'}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Last Name</label>
                <input
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                  onBlur={(e) => e.target.style.borderColor = '#334155'}
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-gray-400 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-purple-400" />
                Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                name="phone_number"
                type="tel"
                required
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
                placeholder="+60 12-345 6789"
              />
            </div>

            {/* Business Reg Number */}
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-gray-400 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                Business Reg. Number <span className="text-gray-600">(Optional)</span>
              </label>
              <input
                name="business_registration_number"
                type="text"
                value={formData.business_registration_number}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
                placeholder="SSM-1234567-A"
              />
            </div>

            {/* Document Upload */}
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-gray-400 mb-1.5">
                <Upload className="w-3.5 h-3.5 text-purple-400" />
                Verification Document <span className="text-gray-600">(Optional)</span>
              </label>
              <div 
                className="relative rounded-lg p-3 text-center cursor-pointer transition-all hover:border-purple-500"
                style={{ backgroundColor: '#0f172a', border: '2px dashed #334155' }}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.size <= 5 * 1024 * 1024) {
                      setVerificationDocument(file);
                    } else if (file) {
                      toast.error('File must be less than 5MB');
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {verificationDocument ? (
                  <span className="text-green-400 text-xs flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {verificationDocument.name}
                  </span>
                ) : (
                  <span className="text-gray-500 text-xs">Click to upload (PDF, Image)</span>
                )}
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-gray-400 mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 pr-9 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-gray-500 hover:text-purple-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1 text-xs font-medium text-gray-400 mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  Confirm <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    name="password2"
                    type={showPassword2 ? 'text' : 'password'}
                    required
                    value={formData.password2}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 pr-9 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                    placeholder="Confirm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword2(!showPassword2)}
                    className="absolute right-2.5 top-2.5 text-gray-500 hover:text-purple-400"
                  >
                    {showPassword2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: isLoading ? '#6b7280' : 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                boxShadow: isLoading ? 'none' : '0 4px 15px rgba(168, 85, 247, 0.4)'
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>

            {/* Sign In Link */}
            <p className="text-center text-gray-400 text-sm pb-2">
              Already have an account?{' '}
              <Link to="/sign-in" className="text-purple-400 hover:text-purple-300 font-semibold">
                Sign in
              </Link>
            </p>
          </form>
        </div>

        {/* Footer gradient */}
        <div 
          className="h-1"
          style={{ background: 'linear-gradient(90deg, #a855f7 0%, #6366f1 50%, #3b82f6 100%)' }}
        />
        </div>
      </div>
    </div>
  );
};

export default Register;
