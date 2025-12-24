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

  // Create modal content
  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Join Event</h2>
                <p className="text-green-100 text-sm truncate max-w-[250px]">{event.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            </div>
          ) : success ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
              <p className="text-gray-600">{formConfig?.confirmation_message}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Event Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">
                    {new Date(event.start_date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span className="text-sm">{event.location_name || event.city || 'Location TBA'}</span>
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                  {formConfig?.fields
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                      <div key={field.id}>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
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

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="text-blue-600 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">Confirmation</p>
                      <p className="text-blue-700">You'll receive a confirmation email with event details.</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Confirm
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Use createPortal to render at document.body level
  return createPortal(modalContent, document.body);
}
