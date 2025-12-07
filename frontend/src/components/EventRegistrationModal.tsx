import { useState, useEffect } from 'react';
import { X, Check, Loader2, User, Mail, Phone, Calendar, FileText } from 'lucide-react';
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'dropdown':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.is_required}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{formConfig?.title || 'Event Registration'}</h2>
            <p className="text-blue-100 mt-1">{event.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {formConfig?.description && (
                <p className="text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  {formConfig.description}
                </p>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

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

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
