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
    <div style={{ width: '100%', height: '100%', backgroundColor: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header with optional image */}
      {image && (
        <div style={{ position: 'relative', height: '256px', width: '100%', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', flexShrink: 0 }}>
          <img
            src={image}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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

      {/* Scrollable Content Container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', width: '100%' }}>
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
        <div className="space-y-6 w-full">
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
