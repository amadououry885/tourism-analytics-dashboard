import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Loader2, User, Mail, Phone, Calendar, FileText, Users, MapPin } from 'lucide-react';
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
  const [successMessage, setSuccessMessage] = useState<string>('');

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
      const response = await api.post(`/events/${event.id}/submit_registration/`, {
        form_data: submission,
      });
      
      // Set success message from response (may be approval pending message)
      setSuccessMessage(response.data.message || formConfig?.confirmation_message || 'Thank you for registering!');
      setSuccess(true);
      
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({});
        setSuccessMessage('');
      }, 4000); // 4 seconds for pending approval messages
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

  // Modal content
  const modalContent = (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
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
        zIndex: 999999,
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(to right, #16a34a, #15803d)',
          color: 'white',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Users style={{ width: '20px', height: '20px', color: 'white' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Join Event</h2>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                color: 'white',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '50%',
                padding: '8px',
                cursor: 'pointer',
              }}
            >
              <X style={{ width: '24px', height: '24px' }} />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div style={{ overflowY: 'auto', maxHeight: 'calc(90vh - 100px)', padding: '24px', backgroundColor: '#f9fafb' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
              <Loader2 style={{ width: '32px', height: '32px', color: '#16a34a', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : success ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Check style={{ width: '32px', height: '32px', color: '#16a34a' }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Registration Received!</h3>
              <p style={{ color: '#4b5563', padding: '0 16px' }}>{successMessage}</p>
            </div>
          ) : (
            <div>
              {/* Event Info */}
              <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', marginBottom: '12px' }}>
                  <Calendar style={{ width: '16px', height: '16px', color: '#2563eb' }} />
                  <span style={{ fontSize: '14px' }}>
                    {new Date(event.start_date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                  <MapPin style={{ width: '16px', height: '16px', color: '#dc2626' }} />
                  <span style={{ fontSize: '14px' }}>{event.location_name || event.city || 'Location TBA'}</span>
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>
                    {error}
                  </div>
                )}

                <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '16px', marginBottom: '16px' }}>
                  {formConfig?.fields
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                      <div key={field.id} style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                          {field.label}
                          {field.is_required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                        </label>
                        {renderField(field)}
                        {field.help_text && (
                          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{field.help_text}</p>
                        )}
                      </div>
                    ))}
                </div>

                {/* Info Box */}
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ color: '#2563eb', marginTop: '2px' }}>
                      <FileText style={{ width: '16px', height: '16px' }} />
                    </div>
                    <div style={{ fontSize: '14px', color: '#1e40af' }}>
                      <p style={{ fontWeight: '600', marginBottom: '4px' }}>Confirmation</p>
                      <p style={{ color: '#1d4ed8' }}>You'll receive a confirmation email with event details.</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      backgroundColor: 'white',
                      color: '#374151',
                      borderRadius: '8px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'linear-gradient(to right, #16a34a, #15803d)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                        Registering...
                      </>
                    ) : (
                      <>
                        <Check style={{ width: '20px', height: '20px' }} />
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
    </>
  );

  // Use createPortal to render at document.body level - this ensures modal
  // is not affected by any parent CSS (transforms, overflow, stacking contexts)
  return createPortal(modalContent, document.body);
}
