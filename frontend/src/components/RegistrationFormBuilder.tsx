import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Save, Eye } from 'lucide-react';

interface FormField {
  id: string;
  label: string;
  field_type: string;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  options?: string[];
  order: number;
}

interface RegistrationFormBuilderProps {
  eventId: number;
  eventTitle: string;
  onClose: () => void;
  onSave: () => void;
}

const FIELD_TYPES = [
  { value: 'text', label: '📝 Short Text', example: 'Name, Student ID' },
  { value: 'textarea', label: '📄 Long Text', example: 'Comments, Address' },
  { value: 'email', label: '📧 Email', example: 'Email Address' },
  { value: 'phone', label: '📱 Phone', example: 'Phone Number' },
  { value: 'number', label: '🔢 Number', example: 'Age, Quantity' },
  { value: 'date', label: '📅 Date', example: 'Birth Date, Event Date' },
  { value: 'dropdown', label: '📋 Dropdown', example: 'Select One Option' },
  { value: 'checkbox', label: '☑️ Checkbox', example: 'Yes/No, Agree' },
  { value: 'radio', label: '⭕ Radio Buttons', example: 'Choose One' },
];

export const RegistrationFormBuilder: React.FC<RegistrationFormBuilderProps> = ({
  eventId,
  eventTitle,
  onClose,
  onSave,
}) => {
  const [formTitle, setFormTitle] = useState('Event Registration');
  const [formDescription, setFormDescription] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('Thank you for registering!');
  const [allowGuestRegistration, setAllowGuestRegistration] = useState(true);
  const [fields, setFields] = useState<FormField[]>([
    {
      id: '1',
      label: 'Full Name',
      field_type: 'text',
      is_required: true,
      placeholder: 'Enter your full name',
      order: 1,
    },
    {
      id: '2',
      label: 'Email Address',
      field_type: 'email',
      is_required: true,
      placeholder: 'your@email.com',
      order: 2,
    },
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      label: 'New Field',
      field_type: 'text',
      is_required: false,
      order: fields.length + 1,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const moveField = (id: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(f => f.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === fields.length - 1)
    ) {
      return;
    }

    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    
    // Update order
    newFields.forEach((f, i) => f.order = i + 1);
    setFields(newFields);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/events/${eventId}/create_registration_form/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          confirmation_message: confirmationMessage,
          allow_guest_registration: allowGuestRegistration,
          fields_data: fields.map(f => ({
            label: f.label,
            field_type: f.field_type,
            is_required: f.is_required,
            placeholder: f.placeholder || '',
            help_text: f.help_text || '',
            options: f.options || [],
            order: f.order,
          })),
        }),
      });

      if (response.ok) {
        alert('✅ Registration form created successfully!');
        onSave();
        onClose();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.detail || 'Failed to create form'}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">📋 Registration Form Builder</h2>
              <p className="text-blue-100 mt-1">Create custom form for: {eventTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
            >
              ✖️
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Form Settings */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              ⚙️ Form Settings
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form Title *
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., AIU Convocation Registration"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Instructions for people filling the form..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmation Message
              </label>
              <input
                type="text"
                value={confirmationMessage}
                onChange={(e) => setConfirmationMessage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Message shown after successful registration"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="guestReg"
                checked={allowGuestRegistration}
                onChange={(e) => setAllowGuestRegistration(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="guestReg" className="text-sm font-medium text-gray-700">
                Allow guest registration (no login required)
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">📝 Form Fields</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </button>
                <button
                  onClick={addField}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Field
                </button>
              </div>
            </div>

            {/* Field List */}
            <div className="space-y-3">
              {fields.map((field, index) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  index={index}
                  totalFields={fields.length}
                  onUpdate={(updates) => updateField(field.id, updates)}
                  onDelete={() => deleteField(field.id)}
                  onMove={(direction) => moveField(field.id, direction)}
                />
              ))}
            </div>

            {fields.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No fields added yet</p>
                <button
                  onClick={addField}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  Add Your First Field
                </button>
              </div>
            )}
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4">👀 Form Preview</h3>
              <div className="bg-white rounded-lg p-6 space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{formTitle}</h4>
                  {formDescription && <p className="text-gray-600 mt-2">{formDescription}</p>}
                </div>
                
                {fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      {field.is_required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.field_type === 'textarea' ? (
                      <textarea
                        disabled
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        rows={3}
                      />
                    ) : field.field_type === 'dropdown' ? (
                      <select disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        <option>Select...</option>
                        {field.options?.map((opt, i) => (
                          <option key={i}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.field_type}
                        disabled
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    )}
                    {field.help_text && (
                      <p className="text-sm text-gray-500 mt-1">{field.help_text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || fields.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Form'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Field Editor Component
interface FieldEditorProps {
  field: FormField;
  index: number;
  totalFields: number;
  onUpdate: (updates: Partial<FormField>) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  index,
  totalFields,
  onUpdate,
  onDelete,
  onMove,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all">
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div className="flex flex-col gap-1 pt-2">
          <button
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ▲
          </button>
          <GripVertical className="w-5 h-5 text-gray-300" />
          <button
            onClick={() => onMove('down')}
            disabled={index === totalFields - 1}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ▼
          </button>
        </div>

        {/* Field Content */}
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Field Label *</label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Student ID"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Field Type *</label>
              <select
                value={field.field_type}
                onChange={(e) => onUpdate({ field_type: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {FIELD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Placeholder (optional)</label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Enter your student ID"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Help Text (optional)</label>
              <input
                type="text"
                value={field.help_text || ''}
                onChange={(e) => onUpdate({ help_text: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Extra instructions"
              />
            </div>
          </div>

          {/* Options for dropdown/radio */}
          {(field.field_type === 'dropdown' || field.field_type === 'radio') && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Options (comma-separated)</label>
              <input
                type="text"
                value={field.options?.join(', ') || ''}
                onChange={(e) => onUpdate({ options: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Option 1, Option 2, Option 3"
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={field.is_required}
                onChange={(e) => onUpdate({ is_required: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700">Required field</span>
            </label>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
          title="Delete field"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default RegistrationFormBuilder;
