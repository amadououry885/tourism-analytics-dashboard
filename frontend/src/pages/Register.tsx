import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { ArrowLeft, Search, Building2, Hotel } from 'lucide-react';
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
    role: 'vendor' as 'vendor' | 'stay_owner',
    first_name: '',
    last_name: '',
    claimed_vendor_id: null as number | null,
    claimed_stay_id: null as number | null,
    phone_number: '',
    business_registration_number: '',
  });
  const [verificationDocument, setVerificationDocument] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableBusinesses, setAvailableBusinesses] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Fetch available businesses when role changes
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const type = formData.role === 'vendor' ? 'vendor' : 'stay';
        const response = await api.get(`/auth/available-businesses/?type=${type}`);
        const businesses = formData.role === 'vendor' ? response.data.vendors : response.data.stays;
        setAvailableBusinesses(businesses || []);
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
      }
    };

    fetchBusinesses();
    setSelectedBusiness(null);
    setSearchTerm('');
  }, [formData.role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Reset claimed business when role changes
    if (name === 'role') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        claimed_vendor_id: null,
        claimed_stay_id: null,
      }));
    }
  };

  const handleBusinessSelect = (business: Business) => {
    setSelectedBusiness(business);
    setSearchTerm(business.name);
    setShowBusinessDropdown(false);
    
    if (formData.role === 'vendor') {
      setFormData(prev => ({ ...prev, claimed_vendor_id: business.id, claimed_stay_id: null }));
    } else {
      setFormData(prev => ({ ...prev, claimed_stay_id: business.id, claimed_vendor_id: null }));
    }
  };

  const filteredBusinesses = availableBusinesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.password2) {
      toast.error('⚠️ Passwords do not match');
      return;
    }

    // Validate phone number
    if (!formData.phone_number) {
      toast.error('⚠️ Phone number is required');
      return;
    }

    setIsLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          submitData.append(key, String(value));
        }
      });
      
      // Add verification document if provided
      if (verificationDocument) {
        submitData.append('verification_document', verificationDocument);
      }

      const result = await register(submitData);
      
      if (result.requiresApproval) {
        toast.success('✅ Registration successful! Please wait for admin approval.');
        toast.info('📧 You will receive a notification once your account is approved.');
      } else {
        toast.success('✅ Registration successful!');
      }
      
      // Redirect to sign-in after 2 seconds (NEW unified auth flow)
      setTimeout(() => {
        navigate('/sign-in');
      }, 2000);
    } catch (error: any) {
      console.error('Registration failed:', error);
      const errorMessage = error.message || 'Registration failed. Please try again.';
      toast.error(`⚠️ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          {/* Back Button */}
          <Link
            to="/business"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Business Portal
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">
              Join the Kedah Tourism Network
            </p>
          </div>

          {/* Registration Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                I am a... <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="vendor">🍜 Restaurant/Business Owner</option>
                <option value="stay_owner">🏨 Hotel/Accommodation Owner</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Your account will require approval from the tourism council
              </p>
            </div>

            {/* Business Claiming */}
            <div className="relative">
              <label htmlFor="business" className="block text-sm font-medium text-gray-700 mb-2">
                {formData.role === 'vendor' ? '🏪 Claim Your Restaurant' : '🏨 Claim Your Hotel'} <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowBusinessDropdown(true);
                  }}
                  onFocus={() => setShowBusinessDropdown(true)}
                  placeholder={formData.role === 'vendor' ? 'Search for your restaurant...' : 'Search for your hotel...'}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              {showBusinessDropdown && filteredBusinesses.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredBusinesses.map((business) => (
                    <div
                      key={business.id}
                      onClick={() => handleBusinessSelect(business)}
                      className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        {formData.role === 'vendor' ? (
                          <Building2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Hotel className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{business.name}</p>
                          <p className="text-xs text-gray-500">{business.city}</p>
                          {business.cuisines && business.cuisines.length > 0 && (
                            <p className="text-xs text-gray-400 mt-0.5">{business.cuisines.join(', ')}</p>
                          )}
                          {business.type && (
                            <p className="text-xs text-gray-400 mt-0.5">{business.type}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedBusiness && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ Selected: <strong>{selectedBusiness.name}</strong> ({selectedBusiness.city})
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBusiness(null);
                      setSearchTerm('');
                      setFormData(prev => ({
                        ...prev,
                        claimed_vendor_id: null,
                        claimed_stay_id: null,
                      }));
                    }}
                    className="text-xs text-green-700 hover:text-green-900 mt-1 underline"
                  >
                    Clear selection
                  </button>
                </div>
              )}
              
              <p className="mt-1 text-xs text-gray-500">
                {availableBusinesses.length === 0 ? (
                  'No unclaimed businesses available at the moment'
                ) : (
                  `${availableBusinesses.length} ${formData.role === 'vendor' ? 'restaurant(s)' : 'hotel(s)'} available to claim`
                )}
              </p>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Choose a username"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="your@email.com"
              />
            </div>

            {/* First and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="First name"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                required
                value={formData.phone_number}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="+60 12-345 6789"
              />
              <p className="mt-1 text-xs text-gray-500">Required for verification purposes</p>
            </div>

            {/* Business Registration Number (Optional) */}
            <div>
              <label htmlFor="business_registration_number" className="block text-sm font-medium text-gray-700 mb-2">
                Business Registration Number <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                id="business_registration_number"
                name="business_registration_number"
                type="text"
                value={formData.business_registration_number}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., SSM-1234567-A"
              />
              <p className="mt-1 text-xs text-gray-500">Your official business license/registration number</p>
            </div>

            {/* Verification Document Upload */}
            <div>
              <label htmlFor="verification_document" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Document <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                id="verification_document"
                name="verification_document"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Check file size (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error('File size must be less than 5MB');
                      e.target.value = '';
                      return;
                    }
                    setVerificationDocument(file);
                  }
                }}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <p className="mt-1 text-xs text-gray-500">Upload ID, business license, or ownership proof (PDF, Image, max 5MB)</p>
              {verificationDocument && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {verificationDocument.name}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="At least 8 characters"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password2"
                name="password2"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password2}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Re-enter your password"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/sign-in"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
