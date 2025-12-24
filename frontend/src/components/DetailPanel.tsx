import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface DetailPanelProps {
  title: string;
  subtitle?: string;
  image?: string;
  children: ReactNode;
  actions?: ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function DetailPanel({
  title,
  subtitle,
  image,
  children,
  actions,
  onClose,
  showCloseButton = false
}: DetailPanelProps) {
  return (
    <div className="h-full bg-white">
      {/* Header with optional image */}
      {image && (
        <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-500">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          {showCloseButton && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>
      )}

      {/* Content - constrained width for consistent card sizes */}
      <div className="p-6 max-w-2xl">
        {/* Title Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-600 text-sm">
              {subtitle}
            </p>
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
