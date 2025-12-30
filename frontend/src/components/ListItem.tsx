import React, { ReactNode } from 'react';

interface ListItemProps {
  title: string;
  subtitle?: string;
  metrics?: { label: string; value: string | number; icon?: ReactNode }[];
  isSelected?: boolean;
  onClick?: () => void;
  badge?: ReactNode;
  rightContent?: ReactNode;
}

export function ListItem({
  title,
  subtitle,
  metrics = [],
  isSelected = false,
  onClick,
  badge,
  rightContent
}: ListItemProps) {
  // DEBUG: Log badge prop
  if (badge) {
    console.log('[ListItem] Received badge for:', title, 'badge:', badge);
  }
  
  return (
    <div
      onClick={onClick}
      className={`
        p-4 cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'bg-blue-50 border-l-4 border-blue-600' 
          : 'bg-white border-l-4 border-transparent hover:bg-gray-50'
        }
      `}
      style={{ 
        borderBottom: '1px solid #E5E7EB'
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 
            className="font-semibold text-gray-900 text-base truncate mb-1"
            style={{ color: isSelected ? '#2557A7' : '#111827' }}
          >
            {title}
          </h3>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-gray-600 text-sm mb-2 truncate">
              {subtitle}
            </p>
          )}

          {/* Metrics */}
          {metrics.length > 0 && (
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {metrics.map((metric, index) => (
                <div key={index} className="flex items-center gap-1 text-xs text-gray-500">
                  {metric.icon && <span className="text-gray-400">{metric.icon}</span>}
                  <span className="font-medium">{metric.label}:</span>
                  <span>{metric.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Content or Badge */}
        <div className="flex-shrink-0">
          {badge || rightContent}
        </div>
      </div>
    </div>
  );
}
