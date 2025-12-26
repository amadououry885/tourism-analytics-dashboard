// FormBuilder.tsx - Component for admins to create custom registration forms
import React, { useState } from 'react';
import { Plus, X, GripVertical, Trash2 } from 'lucide-react';

export interface FormField {
  id: string;
  label: string;
  field_type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'radio' | 'checkbox' | 'textarea';
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  options?: string[]; // For select, radio, checkbox
  order: number;
}

interface FormBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input', icon: '📝' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'tel', label: 'Phone Number', icon: '📱' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'textarea', label: 'Long Text', icon: '📄' },
  { value: 'select', label: 'Dropdown', icon: '⬇️' },
  { value: 'radio', label: 'Radio Buttons', icon: '🔘' },
  { value: 'checkbox', label: 'Checkboxes', icon: '☑️' },
];

export default function FormBuilder({ fields, onChange }: FormBuilderProps) {
  const [editingField, setEditingField] = useState<string | null>(null);

  const addField = (type: FormField['field_type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: '',
      field_type: type,
      is_required: false,
      order: fields.length,
      ...(type === 'select' || type === 'radio' || type === 'checkbox' ? { options: [''] } : {}),
    };
    onChange([...fields, newField]);
    setEditingField(newField.id);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    onChange(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteField = (id: string) => {
    onChange(fields.filter(f => f.id !== id).map((f, idx) => ({ ...f, order: idx })));
  };

  const moveField = (id: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(f => f.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;

    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    
    // Update order numbers
    onChange(newFields.map((f, idx) => ({ ...f, order: idx })));
  };

  const addOption = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || !field.options) return;
    
    updateField(fieldId, {
      options: [...field.options, '']
    });
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || !field.options) return;
    
    const newOptions = [...field.options];
    newOptions[optionIndex] = value;
    updateField(fieldId, { options: newOptions });
  };

  const deleteOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || !field.options) return;
    
    updateField(fieldId, {
      options: field.options.filter((_, idx) => idx !== optionIndex)
    });
  };

  return (
    <div className="space-y-6">
      {/* Field Type Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Form Fields</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FIELD_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => addField(type.value as FormField['field_type'])}
              className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <span className="text-2xl mb-1">{type.icon}</span>
              <span className="text-sm font-medium text-gray-700">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Field List */}
      {fields.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Form Fields ({fields.length})</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                {/* Drag Handle */}
                <div className="flex flex-col gap-1 pt-2">
                  <button
                    onClick={() => moveField(field.id, 'up')}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <button
                    onClick={() => moveField(field.id, 'down')}
                    disabled={index === fields.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>

                {/* Field Content */}
                <div className="flex-1 space-y-3">
                  {/* Field Header */}
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {FIELD_TYPES.find(t => t.value === field.field_type)?.icon}
                    </span>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="Field Label (e.g., Full Name)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={field.is_required}
                        onChange={(e) => updateField(field.id, { is_required: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Required</span>
                    </label>
                    <button
                      onClick={() => deleteField(field.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Field Settings */}
                  {editingField === field.id || !field.label ? (
                    <div className="space-y-3 pl-8 pt-2 border-t border-gray-200">
                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        placeholder="Placeholder text (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <input
                        type="text"
                        value={field.help_text || ''}
                        onChange={(e) => updateField(field.id, { help_text: e.target.value })}
                        placeholder="Help text (optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />

                      {/* Options for select/radio/checkbox */}
                      {(field.field_type === 'select' || field.field_type === 'radio' || field.field_type === 'checkbox') && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Options:</label>
                          {field.options?.map((option, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(field.id, idx, e.target.value)}
                                placeholder={`Option ${idx + 1}`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                              />
                              <button
                                onClick={() => deleteOption(field.id, idx)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addOption(field.id)}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" /> Add Option
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => setEditingField(null)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Done Editing
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingField(field.id)}
                      className="pl-8 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Edit Settings
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No fields added yet. Click a field type above to get started.</p>
        </div>
      )}
    </div>
  );
}
