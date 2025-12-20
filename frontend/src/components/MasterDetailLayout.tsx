import React, { ReactNode } from 'react';

interface MasterDetailLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  leftPanelWidth?: string;
  rightPanelWidth?: string;
  className?: string;
}

export function MasterDetailLayout({
  leftPanel,
  rightPanel,
  leftPanelWidth = 'w-2/5',
  rightPanelWidth = 'w-3/5',
  className = ''
}: MasterDetailLayoutProps) {
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
