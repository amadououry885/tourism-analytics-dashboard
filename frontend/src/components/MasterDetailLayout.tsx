import React, { ReactNode } from 'react';

interface MasterDetailLayoutProps {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: ReactNode;
  listContent: ReactNode;
  detailContent: ReactNode;
  leftPanel?: ReactNode;
  rightPanel?: ReactNode;
  leftPanelWidth?: string;
  rightPanelWidth?: string;
  className?: string;
}

export function MasterDetailLayout({
  title,
  subtitle,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filters,
  listContent,
  detailContent,
  leftPanel,
  rightPanel,
  leftPanelWidth = 'w-2/5',
  rightPanelWidth = 'w-3/5',
  className = ''
}: MasterDetailLayoutProps) {
  // If using new props (title, subtitle, etc.), render new layout
  if (title || listContent) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        {/* Header Section */}
        {(title || subtitle || searchPlaceholder || filters) && (
          <div className="px-6 py-4 border-b border-gray-200 bg-white">
            {(title || subtitle) && (
              <div className="mb-4">
                {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
                {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
              </div>
            )}
            
            {searchPlaceholder && (
              <div className="mb-3">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            
            {filters && <div className="mb-2">{filters}</div>}
          </div>
        )}

        {/* Main Content - Split Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Scrollable List */}
          <div 
            className={`${leftPanelWidth} overflow-y-auto`}
            style={{ 
              borderRight: '1px solid #E5E7EB'
            }}
          >
            <div className="p-4">
              {listContent}
            </div>
          </div>

          {/* Right Panel - Fixed, Scrollable Content */}
          <div 
            className={`${rightPanelWidth} overflow-y-auto bg-gray-50`}
          >
            <div className="p-6">
              {detailContent}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Legacy layout for backward compatibility
  return (
    <div className={`flex h-full ${className}`}>
      {/* Left Panel - Master List */}
      <div 
        className={`${leftPanelWidth} overflow-y-auto`}
        style={{ 
          borderRight: '1px solid #E5E7EB',
          maxHeight: 'calc(100vh - 200px)'
        }}
      >
        {leftPanel}
      </div>

      {/* Right Panel - Detail View */}
      <div 
        className={`${rightPanelWidth} overflow-y-auto bg-white`}
        style={{ 
          maxHeight: 'calc(100vh - 200px)',
          position: 'sticky',
          top: 0
        }}
      >
        {rightPanel}
      </div>
    </div>
  );
}

