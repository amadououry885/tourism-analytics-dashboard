import { useState, useEffect } from 'react';
import { X, Check, Loader2, User, Mail, Phone, Calendar, FileText, Users, MapPin } from 'lucide-react';
import { createPortal } from 'react-dom';
import api from '../services/api';

interface Event {
  id: number;
  title: string;
  start_date: string;
  location_name?: string;
  city?: string;
}

interface RegistrationField {
  id: number;
  label: string;
  field_type: 'text' | 'textarea' | 'email' | 'phone' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'radio';
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  options?: string[];
  order: number;
}

interface RegistrationForm {
  id: number;
  title: string;
  description?: string;
  confirmation_message: string;
  allow_guest_registration: boolean;
  fields: RegistrationField[];
}

interface EventRegistrationModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export function EventRegistrationModal({ event, isOpen, onClose }: EventRegistrationModalProps) {
  const [formConfig, setFormConfig] = useState<RegistrationForm | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && event.id) {
      fetchRegistrationForm();
    }
  }, [isOpen, event.id]);

  const fetchRegistrationForm = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch custom form configuration for this event
      const response = await api.get(`/events/${event.id}/registration_form/`);
      setFormConfig(response.data);
      
      // Initialize form data with empty values
      const initialData: Record<string, any> = {};
      response.data.fields.forEach((field: RegistrationField) => {
        initialData[field.id] = field.field_type === 'checkbox' ? [] : '';
      });
      setFormData(initialData);
    } catch (err: any) {
      // If no custom form exists, create a default one
      console.warn('No custom form found, using default fields');
      setFormConfig({
        id: 0,
        title: 'Event Registration',
        description: '',
        confirmation_message: 'Thank you for registering!',
        allow_guest_registration: true,
        fields: [
          { id: 1, label: 'Full Name', field_type: 'text', is_required: true, placeholder: 'Enter your full name', help_text: '', options: [], order: 1 },
          { id: 2, label: 'Email Address', field_type: 'email', is_required: true, placeholder: 'your.email@example.com', help_text: '', options: [], order: 2 },
          { id: 3, label: 'Phone Number', field_type: 'phone', is_required: false, placeholder: '+60 12-345-6789', help_text: '', options: [], order: 3 },
        ]
      });
      setFormData({ 1: '', 2: '', 3: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: number, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const validateForm = (): boolean => {
    if (!formConfig) return false;
    
    for (const field of formConfig.fields) {
      if (field.is_required) {
        const value = formData[field.id];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          setError(`Please fill in: ${field.label}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Convert form data to submission format
      const submission: Record<string, any> = {};
      formConfig?.fields.forEach(field => {
        submission[field.label.toLowerCase().replace(/\s+/g, '_')] = formData[field.id];
      });
      
      // Submit registration
      await api.post(`/events/${event.id}/submit_registration/`, {
        form_data: submission,
      });
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({});
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'textarea': return <FileText className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const renderField = (field: RegistrationField) => {
    const value = formData[field.id] || '';

    switch (field.field_type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.is_required}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
        );

      case 'dropdown':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.is_required}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          >
            <option value="">Select an option...</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => (
              <label key={idx} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`field-${field.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.is_required}
                  className="w-4 h-4 text-blue-600"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => (
              <label key={idx} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const newValue = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) {
                      newValue.push(option);
                    } else {
                      const index = newValue.indexOf(option);
                      if (index > -1) newValue.splice(index, 1);
                    }
                    handleInputChange(field.id, newValue);
                  }}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {getFieldIcon(field.field_type)}
            </div>
            <input
              type={field.field_type === 'phone' ? 'tel' : field.field_type}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.is_required}
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 50
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          maxWidth: '1200px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - matching event details modal style */}
        <div 
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div 
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(to bottom right, #10b981, #059669)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Event Registration</h2>
                <p className="text-sm text-gray-500">{event.title}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div 
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            backgroundColor: '#f9fafb'
          }}
        >
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : success ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
              <p className="text-gray-600">{formConfig?.confirmation_message}</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {/* Event info card - matching details modal */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <div className="text-sm font-semibold text-gray-700">Start Date & Time</div>
                      <div className="text-sm text-gray-600">
                        {new Date(event.start_date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <div className="text-sm font-semibold text-gray-700">Location</div>
                      <div className="text-sm text-gray-600">{event.location_name || 'TBA'}, {event.city}</div>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {formConfig?.description && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">{formConfig.description}</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5">
                  {formConfig?.fields
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                      <div key={field.id}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {field.label}
                          {field.is_required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {renderField(field)}
                        {field.help_text && (
                          <p className="text-xs text-gray-500 mt-1">{field.help_text}</p>
                        )}
                      </div>
                    ))}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting Registration...
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5" />
                      Complete Registration
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
