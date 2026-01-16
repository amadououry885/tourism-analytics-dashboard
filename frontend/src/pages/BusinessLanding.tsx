import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Utensils, Building2, Eye, EyeOff, CheckCircle, AlertCircle, User, Mail, Lock, ArrowLeft } from 'lucide-react';
import axios from 'axios';

type BusinessType = 'vendor' | 'stay_owner';

// Animated counter hook
const useCountUp = (end: number, duration: number = 2000, startDelay: number = 0) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(easeOut * end));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [end, duration, startDelay]);
  
  return count;
};

const BusinessLanding: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [businessType, setBusinessType] = useState<BusinessType>('vendor');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    restaurantName: '',
    cuisineType: '',
    propertyName: '',
    propertyType: 'hotel',
    document: null as File | null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const visitorsCount = useCountUp(10000, 2000, 400);
  const partnersCount = useCountUp(500, 1800, 600);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, document: e.target.files![0] }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username.trim()) newErrors.username = 'Required';
    if (!formData.email.trim()) newErrors.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.firstName.trim()) newErrors.firstName = 'Required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Required';
    if (!formData.password) newErrors.password = 'Required';
    else if (formData.password.length < 8) newErrors.password = 'Min 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords don\'t match';
    if (businessType === 'vendor' && !formData.restaurantName.trim()) newErrors.restaurantName = 'Required';
    if (businessType === 'stay_owner' && !formData.propertyName.trim()) newErrors.propertyName = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        password: formData.password,
        password2: formData.confirmPassword,
        role: businessType,
        business_name: businessType === 'vendor' ? formData.restaurantName : formData.propertyName,
        ...(businessType === 'vendor' && { cuisine_type: formData.cuisineType }),
        ...(businessType === 'stay_owner' && { property_type: formData.propertyType })
      };

      await axios.post('http://127.0.0.1:8000/api/auth/register/', payload);
      setSubmitStatus('success');
      setTimeout(() => navigate('/sign-in'), 2000);
    } catch (error: any) {
      setSubmitStatus('error');
      const errorData = error.response?.data;
      if (errorData && typeof errorData === 'object') {
        const firstError = Object.values(errorData)[0];
        setErrorMessage(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const cuisineTypes = ['Malaysian', 'Chinese', 'Indian', 'Western', 'Japanese', 'Thai', 'Fusion', 'Other'];
  const propertyTypes = [
    { value: 'hotel', label: 'Hotel' },
    { value: 'resort', label: 'Resort' },
    { value: 'homestay', label: 'Homestay' },
    { value: 'guesthouse', label: 'Guesthouse' },
    { value: 'villa', label: 'Villa' }
  ];

  // Step-based form (Step 1 = role, Step 2 = details)
  const [step, setStep] = useState(1);

  const canProceedToStep2 = businessType !== null;

  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* ===== LEFT COLUMN - Hero (50%) ===== */}
      <div className={`hidden lg:flex bg-gradient-to-br from-blue-900 via-blue-800 to-sky-600 text-white p-10 flex-col relative overflow-hidden transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute top-1/2 right-0 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"></div>
        
        {/* TOP - Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center font-bold text-lg">
              KT
            </div>
            <span className="font-semibold text-lg tracking-wide">Kedah Tourism</span>
          </div>
        </div>

        {/* MIDDLE - Welcome Content (grows to push footer down) */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h1 className="text-5xl font-bold mb-5 leading-tight">
            Welcome Page
          </h1>
          <p className="text-blue-100/70 text-lg leading-relaxed max-w-md">
            Join Kedah's official tourism network and connect with thousands of local and international visitors every month.
          </p>
        </div>

        {/* FOOTER - Metrics + Social (ANCHORED TO BOTTOM) */}
        <div className="relative z-10 mt-auto">
          {/* Metrics Row */}
          <div className="flex gap-8 mb-6">
            <div className={`transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="font-bold text-3xl mb-1">{visitorsCount.toLocaleString()}+</div>
              <div className="text-sm text-blue-200/60">Monthly Visitors</div>
            </div>
            
            <div className={`transition-all duration-500 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="font-bold text-3xl mb-1">{partnersCount}+</div>
              <div className="text-sm text-blue-200/60">Verified Partners</div>
            </div>
            
            <div className={`transition-all duration-500 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="font-bold text-3xl mb-1">24h</div>
              <div className="text-sm text-blue-200/60">Quick Approval</div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <span className="text-sm text-blue-200/50">Stay Connected With</span>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition cursor-pointer">
                <span className="text-sm">𝕏</span>
              </div>
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition cursor-pointer">
                <span className="text-sm">G</span>
              </div>
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition cursor-pointer">
                <span className="text-sm">f</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT COLUMN - Auth Card (50%) ===== */}
      <div className={`bg-slate-200 flex items-center justify-center p-6 transition-all duration-500 delay-100 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* FIXED WIDTH CARD - 420px, NOT responsive */}
        <div 
          className="bg-white rounded-2xl p-8"
          style={{ 
            width: '420px',
            maxWidth: '420px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)' 
          }}
        >
          {/* Top Row: Back button + Tab Switcher */}
          <div className="flex items-center justify-between mb-6">
            {/* Dynamic Back Button */}
            {step === 1 ? (
              <Link 
                to="/"
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Link>
            ) : (
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to role selection</span>
              </button>
            )}

            {/* Tab Switcher */}
            <div className="flex gap-2">
              <Link 
                to="/sign-in" 
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Sign In
              </Link>
              <div className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg">
                Register
              </div>
            </div>
          </div>

          {/* Header */}
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Register</h2>
          <p className="text-gray-400 text-sm mb-6">Create your business account</p>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-green-700">Account created! Redirecting...</span>
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="text-red-700">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* ===== STEP 1: Role Selection ===== */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Register as
                  </label>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${businessType === 'vendor' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                      <input type="radio" name="businessType" checked={businessType === 'vendor'} onChange={() => setBusinessType('vendor')} className="hidden" />
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${businessType === 'vendor' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Utensils className={`w-6 h-6 ${businessType === 'vendor' ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <div className={`font-semibold ${businessType === 'vendor' ? 'text-blue-700' : 'text-gray-700'}`}>Restaurant / Café</div>
                        <div className="text-xs text-gray-400">Food & beverage business</div>
                      </div>
                    </label>
                    
                      <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${businessType === 'stay_owner' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                        <input type="radio" name="businessType" checked={businessType === 'stay_owner'} onChange={() => setBusinessType('stay_owner')} className="hidden" />
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${businessType === 'stay_owner' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Building2 className={`w-6 h-6 ${businessType === 'stay_owner' ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <div className={`font-semibold ${businessType === 'stay_owner' ? 'text-blue-700' : 'text-gray-700'}`}>Hotel / Stay</div>
                          <div className="text-xs text-gray-400">Accommodation business</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => canProceedToStep2 && setStep(2)}
                    disabled={!canProceedToStep2}
                    className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
                      canProceedToStep2
                        ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* ===== STEP 2: Form Fields ===== */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* Business Info Section */}
                  <div className="pb-4 border-b border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      {businessType === 'vendor' ? 'Restaurant Details' : 'Property Details'}
                    </label>
                    {businessType === 'vendor' ? (
                      <div className="space-y-3">
                        <div className="relative">
                          <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input name="restaurantName" value={formData.restaurantName} onChange={handleInputChange} placeholder="Restaurant Name" className={`w-full pl-10 pr-3 py-3 rounded-xl border ${errors.restaurantName ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`} />
                        </div>
                        <select name="cuisineType" value={formData.cuisineType} onChange={handleInputChange} className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-600">
                          <option value="">Select Cuisine Type</option>
                          {cuisineTypes.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input name="propertyName" value={formData.propertyName} onChange={handleInputChange} placeholder="Property Name" className={`w-full pl-10 pr-3 py-3 rounded-xl border ${errors.propertyName ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`} />
                        </div>
                        <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-600">
                          {propertyTypes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Personal Info Section */}
                  <div className="pb-4 border-b border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Personal Information
                    </label>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" className={`w-full px-3 py-3 rounded-xl border ${errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`} />
                        <input name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" className={`w-full px-3 py-3 rounded-xl border ${errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`} />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className={`w-full pl-10 pr-3 py-3 rounded-xl border ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`} />
                      </div>
                    </div>
                  </div>

                  {/* Account Section */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Account Details
                    </label>
                    <div className="space-y-3">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input name="username" value={formData.username} onChange={handleInputChange} placeholder="Username" className={`w-full pl-10 pr-3 py-3 rounded-xl border ${errors.username ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`} />
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange} placeholder="Password" className={`w-full pl-10 pr-10 py-3 rounded-xl border ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm Password" className={`w-full pl-10 pr-10 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Terms checkbox */}
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                    <span className="text-xs text-gray-500">
                      I agree to all the Statements in{' '}
                      <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                    </span>
                  </label>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || submitStatus === 'success'}
                    className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all ${
                      isSubmitting || submitStatus === 'success'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Account...
                      </span>
                    ) : submitStatus === 'success' ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Account Created!
                      </span>
                    ) : (
                      'Sign Up'
                    )}
                  </button>
                </div>
              )}

              {/* Login Link */}
              <p className="text-center text-sm text-gray-500 pt-2">
                Already have an account?{' '}
                <Link to="/sign-in" className="text-blue-600 font-medium hover:underline">Sign in</Link>
              </p>
            </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessLanding;
