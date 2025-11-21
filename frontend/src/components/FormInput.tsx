import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  step?: string | number;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  icon?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = 'text',
  step,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  hint,
  disabled = false,
  multiline = false,
  rows = 4,
  icon,
}) => {
  const InputComponent = multiline ? 'textarea' : 'input';
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <InputComponent
          name={name}
          type={type}
          step={step}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={multiline ? rows : undefined}
          className={`
            w-full px-4 py-3 border-2 rounded-lg text-gray-900 
            focus:outline-none focus:border-blue-500 transition-colors
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            ${multiline ? 'resize-y' : ''}
          `}
        />
      </div>
      
      {error && (
        <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      
      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
};
