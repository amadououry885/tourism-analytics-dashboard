import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface FormField {
  id: number;
  label: string;
  field_type: string;
  is_required: boolean;
  placeholder: string;
  help_text: string;
  options: string[];
  order: number;
  min_length?: number;
  max_length?: number;
  pattern?: string;
}

interface RegistrationForm {
  id: number;
  event: number;
  event_title: string;
  title: string;
  description: string;
  confirmation_message: string;
  allow_guest_registration: boolean;
  fields: FormField[];
}

interface DynamicRegistrationFormProps {
  eventId: number;
  eventTitle: string;
  onSuccess?: (data: any) => void;
  onClose?: () => void;
}

export function DynamicRegistrationForm({ 
  eventId, 
  eventTitle,
  onSuccess, 
  onClose 
}: DynamicRegistrationFormProps) {
  const [form, setForm] = useState<RegistrationForm | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/events/${eventId}/registration_form/`);
        setForm(response.data);
        setError(null);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('This event does not have a registration form yet.');
        } else {
          setError('Failed to load registration form. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [eventId]);

  const getFieldKey = (label: string) => {
    return label.toLowerCase().replace(/\s+/g, '_').replace(/[?]/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    console.log('Submitting form data:', formData);

    try {
      const response = await axios.post(
        `/api/events/${eventId}/submit_registration/`,
        { form_data: formData }
      );

      setConfirmationMessage(response.data.message);
      setSuccess(true);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response.data);
      }

      // Auto-close after 3 seconds
      setTimeout(() => {
        if (onClose) onClose();
      }, 3000);
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
      
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.message ||
                      err.response?.data?.form_data ||
                      JSON.stringify(err.response?.data) ||
                      'Registration failed. Please check your information and try again.';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const fieldKey = getFieldKey(field.label);
    const value = formData[fieldKey] || '';

    const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-2";

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
      case 'date':
        return (
          <div key={field.id} className="mb-4">
            <label htmlFor={fieldKey} className={labelClasses}>
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <input
              id={fieldKey}
              type={field.field_type === 'email' ? 'text' : field.field_type}
              inputMode={field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : field.field_type === 'number' ? 'numeric' : undefined}
              name={fieldKey}
              placeholder={field.placeholder}
              required={field.is_required}
              value={value}
              onChange={(e) => setFormData({ ...formData, [fieldKey]: e.target.value })}
              className={inputClasses}
              minLength={field.field_type === 'email' ? undefined : field.min_length}
              maxLength={field.field_type === 'email' ? undefined : field.max_length}
              pattern={field.field_type === 'email' ? undefined : field.pattern}
            />
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="mb-4">
            <label htmlFor={fieldKey} className={labelClasses}>
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              id={fieldKey}
              name={fieldKey}
              placeholder={field.placeholder}
              required={field.is_required}
              value={value}
              onChange={(e) => setFormData({ ...formData, [fieldKey]: e.target.value })}
              className={`${inputClasses} min-h-[100px]`}
              rows={4}
            />
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
          </div>
        );

      case 'dropdown':
        return (
          <div key={field.id} className="mb-4">
            <label htmlFor={fieldKey} className={labelClasses}>
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <select
              id={fieldKey}
              name={fieldKey}
              required={field.is_required}
              value={value}
              onChange={(e) => setFormData({ ...formData, [fieldKey]: e.target.value })}
              className={inputClasses}
            >
              <option value="">Select {field.label}</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="mb-4">
            <label className={labelClasses}>
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {field.options.map((opt) => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={fieldKey}
                    value={opt}
                    required={field.is_required}
                    checked={value === opt}
                    onChange={(e) => setFormData({ ...formData, [fieldKey]: e.target.value })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="mb-4">
            <label className={labelClasses}>
              {field.label} {field.is_required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              {field.options.map((opt) => {
                const checkboxValue = formData[fieldKey] || [];
                const isChecked = Array.isArray(checkboxValue) && checkboxValue.includes(opt);
                
                return (
                  <label key={opt} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name={fieldKey}
                      value={opt}
                      checked={isChecked}
                      onChange={(e) => {
                        const currentValues = formData[fieldKey] || [];
                        const newValues = e.target.checked
                          ? [...currentValues, opt]
                          : currentValues.filter((v: string) => v !== opt);
                        setFormData({ ...formData, [fieldKey]: newValues });
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{opt}</span>
                  </label>
                );
              })}
            </div>
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600">Loading registration form...</p>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-12 text-center shadow-lg">
        <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-16 h-16 text-green-600" />
        </div>
        <h3 className="text-3xl font-bold text-green-800 mb-3">Registration Successful! 🎉</h3>
        <p className="text-green-700 text-lg mb-6 whitespace-pre-line">{confirmationMessage}</p>
        <div className="bg-white/60 rounded-lg py-3 px-6 inline-block">
          <p className="text-sm text-green-700 font-medium">This window will close automatically...</p>
        </div>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="bg-white rounded-lg">
      {/* Form Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{form.title}</h2>
        {form.description && (
          <p className="text-gray-600 mt-2">{form.description}</p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Render fields sorted by order */}
        {form.fields
          .sort((a, b) => a.order - b.order)
          .map((field) => renderField(field))}

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Register Now'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
