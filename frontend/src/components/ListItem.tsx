import React, { ReactNode } from 'react';

interface ListItemProps {
  title: string;
  subtitle?: string;
  metrics?: { label: string; value: string | number; icon?: ReactNode }[];
  isSelected?: boolean;
  onClick?: () => void;
  badge?: ReactNode;
  rightContent?: ReactNode;
  index?: number; // For staggered animation
  accentColor?: string; // Feature accent color
}

export function ListItem({
  title,
  subtitle,
  metrics = [],
  isSelected = false,
  onClick,
  badge,
  rightContent,
  index = 0,
  accentColor = '#2563EB' // Default to Places blue
}: ListItemProps) {
  
  return (
    <div
      onClick={onClick}
      className={`
        p-4 cursor-pointer animate-fadeIn
        ${isSelected 
          ? 'border-l-4' 
          : 'bg-white border-l-4 border-transparent hover:bg-gray-50'
        }
      `}
      style={{ 
        borderBottom: '1px solid #E5E7EB',
        animationDelay: `${index * 30}ms`,
        transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: isSelected ? `${accentColor}08` : undefined,
        borderLeftColor: isSelected ? accentColor : 'transparent',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Title - Dark gray for readability */}
          <h3 
            className="font-semibold text-base truncate mb-1"
            style={{ color: isSelected ? accentColor : '#111827' }}
          >
            {title}
          </h3>

          {/* Subtitle - Secondary gray */}
          {subtitle && (
            <p className="text-sm mb-2 truncate" style={{ color: '#6B7280' }}>
              {subtitle}
            </p>
          )}

          {/* Metrics - Muted gray */}
          {metrics.length > 0 && (
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {metrics.map((metric, idx) => (
                <div key={idx} className="flex items-center gap-1 text-xs" style={{ color: '#9CA3AF' }}>
                  {metric.icon && <span style={{ color: '#9CA3AF' }}>{metric.icon}</span>}
                  <span className="font-medium">{metric.label}:</span>
                  <span style={{ color: '#6B7280' }}>{metric.value}</span>
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
