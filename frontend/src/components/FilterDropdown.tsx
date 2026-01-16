import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Check, X } from 'lucide-react';

// ============================================
// DROPDOWN CONFIG - Consistent across all filters
// ============================================
const DROPDOWN_CONFIG = {
  maxHeight: 320,           // Fixed max height (px) - dropdown scrolls internally
  zIndex: 99999,            // Always on top of everything
  gap: 8,                   // Gap between trigger and dropdown (px)
  minWidth: 240,            // Minimum dropdown width (px)
  sortMinWidth: 200,        // Sort dropdown minimum width (px)
};

// ============================================
// ANIMATION CONFIG - Subtle & Professional
// Fade in + slight slide, no bounce
// Duration: 150-200ms
// ============================================
const ANIMATION = {
  duration: '180ms',        // Short and smooth
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-out feel
  hoverDuration: '150ms',   // Even faster for hover states
};

// ============================================
// FEATURE ACCENT COLORS
// Each feature has its own color
// ============================================
export const FEATURE_COLORS = {
  places: '#2563EB',      // Blue
  food: '#F97316',        // Orange
  stay: '#22C55E',        // Green
  events: '#8B5CF6',      // Purple
  overview: '#64748B',    // Slate
};

// ============================================
// NEUTRAL DESIGN SYSTEM
// Clean, high contrast, accessible
// ============================================
const DROPDOWN_COLORS = {
  // Surfaces - SOLID white
  background: '#FFFFFF',
  backgroundAlt: '#F9FAFB',
  
  // Text hierarchy (high contrast for readability)
  textPrimary: '#111827',    // Near black - main options
  textSecondary: '#6B7280',  // Gray - secondary text
  textPlaceholder: '#9CA3AF', // Light gray - placeholder
  
  // Interactive states (neutral base)
  hoverBg: '#F3F4F6',        // Light gray hover
  
  // Borders & shadows (soft, not heavy)
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  shadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
};

// ============================================
// Portal Component - Renders children at body level
// This ensures dropdowns are NEVER clipped by overflow:hidden
// ============================================
interface DropdownPortalProps {
  children: React.ReactNode;
  triggerRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  align?: 'left' | 'right';
  minWidth?: number;
}

function DropdownPortal({ 
  children, 
  triggerRef, 
  isOpen, 
  align = 'left',
  minWidth = DROPDOWN_CONFIG.minWidth 
}: DropdownPortalProps) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: minWidth });

  // Calculate position based on trigger button using FIXED positioning
  // Fixed positioning is relative to viewport, not affected by scroll
  const updatePosition = useCallback(() => {
    if (triggerRef.current && isOpen) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate left position
      let left = rect.left;
      
      // Right align if specified
      if (align === 'right') {
        left = rect.right - minWidth;
      }
      
      // Prevent dropdown from going off-screen on the right
      if (left + minWidth > viewportWidth - 16) {
        left = viewportWidth - minWidth - 16;
      }
      
      // Prevent dropdown from going off-screen on the left
      if (left < 16) {
        left = 16;
      }
      
      // Calculate top position - check if there's room below
      let top = rect.bottom + DROPDOWN_CONFIG.gap;
      const spaceBelow = viewportHeight - rect.bottom - DROPDOWN_CONFIG.gap;
      
      // If not enough space below, position above (if enough space)
      if (spaceBelow < DROPDOWN_CONFIG.maxHeight && rect.top > DROPDOWN_CONFIG.maxHeight) {
        top = rect.top - DROPDOWN_CONFIG.maxHeight - DROPDOWN_CONFIG.gap;
      }
      
      setPosition({
        top: top,
        left: left,
        width: Math.max(minWidth, rect.width),
      });
    }
  }, [triggerRef, isOpen, align, minWidth]);

  useEffect(() => {
    updatePosition();
    
    // Update position on scroll and resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [updatePosition]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="dropdown-portal-container"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: DROPDOWN_CONFIG.zIndex,
        minWidth: position.width,
        // Smooth fade + slide animation
        animation: `dropdownSlideIn ${ANIMATION.duration} ${ANIMATION.easing} forwards`,
      }}
    >
      {children}
    </div>,
    document.body
  );
}

// ============================================
// FilterDropdown - Reusable dropdown filter component
// Uses Portal to escape layout constraints
// ============================================

export interface FilterOption {
  value: string;
  label: string;
  icon?: string;
  count?: number;
}

interface FilterDropdownProps {
  label: string;
  icon?: React.ReactNode;
  options: FilterOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  placeholder?: string;
  showCount?: boolean;
  accentColor?: string;
  className?: string;
}

export function FilterDropdown({
  label,
  icon,
  options,
  value,
  onChange,
  multiple = false,
  searchable = false,
  placeholder = 'Search...',
  showCount = false,
  accentColor = '#2563EB',
  className = '',
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedTrigger = triggerRef.current?.contains(target);
      const clickedDropdown = dropdownRef.current?.contains(target);
      
      if (!clickedTrigger && !clickedDropdown) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Get display value for button
  const getDisplayValue = () => {
    if (multiple) {
      const selectedValues = value as string[];
      if (selectedValues.length === 0) return label;
      if (selectedValues.length === 1) {
        const opt = options.find(o => o.value === selectedValues[0]);
        return opt?.label || label;
      }
      return `${selectedValues.length} selected`;
    } else {
      const selectedValue = value as string;
      if (!selectedValue || selectedValue === 'all' || selectedValue === '') {
        return label;
      }
      const opt = options.find(o => o.value === selectedValue);
      return opt?.label || label;
    }
  };

  // Check if option is selected
  const isSelected = (optionValue: string) => {
    if (multiple) {
      return (value as string[]).includes(optionValue);
    }
    return value === optionValue;
  };

  // Handle option click
  const handleOptionClick = (optionValue: string) => {
    if (multiple) {
      const currentValues = value as string[];
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter(v => v !== optionValue));
      } else {
        onChange([...currentValues, optionValue]);
      }
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Clear all selections
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      onChange([]);
    } else {
      onChange('');
    }
  };

  // Check if any value is selected
  const hasSelection = multiple 
    ? (value as string[]).length > 0 
    : value && value !== 'all' && value !== '';

  // Light tinted background when selected
  const selectedBgTint = `${accentColor}12`; // 12% opacity

  return (
    <>
      {/* Dropdown Button - Clean, neutral base with accent on selection */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`filter-trigger-btn px-3.5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 whitespace-nowrap border ${className}`}
        style={{
          backgroundColor: hasSelection ? selectedBgTint : DROPDOWN_COLORS.background,
          borderColor: hasSelection ? accentColor : DROPDOWN_COLORS.border,
          color: hasSelection ? accentColor : DROPDOWN_COLORS.textPrimary,
          boxShadow: 'var(--shadow-sm)',
          transition: `all ${ANIMATION.hoverDuration} ${ANIMATION.easing}`,
        }}
      >
        {/* Icon - uses accent color */}
        {icon && (
          <span 
            className="w-4 h-4 flex items-center justify-center"
            style={{ color: accentColor }}
          >
            {icon}
          </span>
        )}
        <span className="truncate max-w-[120px]">{getDisplayValue()}</span>
        
        {/* Selection count badge */}
        {multiple && (value as string[]).length > 0 && (
          <span 
            className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ backgroundColor: accentColor, color: '#FFFFFF' }}
          >
            {(value as string[]).length}
          </span>
        )}
        
        {/* Clear button for single select with selection */}
        {!multiple && hasSelection && (
          <button
            onClick={handleClear}
            className="p-1 rounded-full transition-colors"
            style={{ 
              backgroundColor: `${accentColor}20`,
            }}
          >
            <X className="w-3 h-3" style={{ color: accentColor }} />
          </button>
        )}
        
        <ChevronDown 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: hasSelection ? accentColor : DROPDOWN_COLORS.textSecondary }}
        />
      </button>

      {/* Dropdown Panel - Rendered via Portal at body level */}
      <DropdownPortal triggerRef={triggerRef} isOpen={isOpen} minWidth={DROPDOWN_CONFIG.minWidth}>
        <div 
          ref={dropdownRef}
          className="rounded-xl dropdown-panel"
          style={{ 
            backgroundColor: DROPDOWN_COLORS.background,
            border: `1px solid ${DROPDOWN_COLORS.border}`,
            boxShadow: DROPDOWN_COLORS.shadow,
            maxHeight: `${DROPDOWN_CONFIG.maxHeight}px`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Search Input - Fixed at top */}
          {searchable && (
            <div 
              className="p-3 border-b flex-shrink-0"
              style={{ 
                backgroundColor: DROPDOWN_COLORS.backgroundAlt,
                borderColor: DROPDOWN_COLORS.border,
              }}
            >
              <div className="relative">
                <Search 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
                  style={{ color: DROPDOWN_COLORS.textPlaceholder }}
                />
                <input
                  type="text"
                  placeholder={placeholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: DROPDOWN_COLORS.background,
                    border: `1px solid ${DROPDOWN_COLORS.border}`,
                    color: DROPDOWN_COLORS.textPrimary,
                  }}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Options List - Scrollable area with custom scrollbar */}
          <div 
            className="dropdown-scroll-area"
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            {/* Clear / All option for multi-select */}
            {multiple && (value as string[]).length > 0 && (
              <button
                onClick={handleClear}
                className="w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors border-b hover:bg-red-50"
                style={{ 
                  color: '#DC2626',
                  backgroundColor: DROPDOWN_COLORS.background,
                  borderColor: DROPDOWN_COLORS.border,
                }}
              >
                <X className="w-4 h-4" />
                <span>Clear all ({(value as string[]).length})</span>
              </button>
            )}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const selected = isSelected(option.value);
                // Light tinted background for hover using accent color
                const hoverBg = `${accentColor}10`; // 10% opacity of accent
                const selectedBg = accentColor;     // Solid accent for selected
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleOptionClick(option.value)}
                    className="dropdown-option w-full text-left px-4 py-3 text-sm flex items-center gap-3"
                    style={{ 
                      backgroundColor: selected ? selectedBg : DROPDOWN_COLORS.background,
                      color: selected ? '#FFFFFF' : DROPDOWN_COLORS.textPrimary,
                      fontWeight: selected ? 600 : 500,
                      transition: `all ${ANIMATION.hoverDuration} ${ANIMATION.easing}`,
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) {
                        e.currentTarget.style.backgroundColor = hoverBg;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.currentTarget.style.backgroundColor = DROPDOWN_COLORS.background;
                      }
                    }}
                  >
                    {/* Checkbox for multi-select */}
                    {multiple && (
                      <div 
                        className="w-5 h-5 rounded flex items-center justify-center transition-colors flex-shrink-0"
                        style={{
                          backgroundColor: selected ? '#FFFFFF' : DROPDOWN_COLORS.background,
                          border: `2px solid ${selected ? '#FFFFFF' : DROPDOWN_COLORS.border}`,
                        }}
                      >
                        {selected && (
                          <Check className="w-3.5 h-3.5" style={{ color: accentColor }} strokeWidth={3} />
                        )}
                      </div>
                    )}
                    
                    {/* Icon - uses accent color */}
                    {option.icon && (
                      <span 
                        className="text-lg flex-shrink-0"
                        style={{ filter: selected ? 'brightness(10)' : 'none' }}
                      >
                        {option.icon}
                      </span>
                    )}
                    
                    {/* Label */}
                    <span className="flex-1" style={{ lineHeight: 1.5 }}>{option.label}</span>
                    
                    {/* Count */}
                    {showCount && option.count !== undefined && (
                      <span 
                        className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                        style={{ 
                          color: selected ? '#FFFFFF' : DROPDOWN_COLORS.textSecondary,
                          backgroundColor: selected ? 'rgba(255,255,255,0.2)' : DROPDOWN_COLORS.backgroundAlt,
                        }}
                      >
                        {option.count}
                      </span>
                    )}
                    
                    {/* Checkmark for single select - white on selected */}
                    {!multiple && selected && (
                      <Check className="w-5 h-5 flex-shrink-0 text-white" strokeWidth={2.5} />
                    )}
                  </button>
                );
              })
            ) : (
              <div 
                className="px-4 py-8 text-center text-sm"
                style={{ color: DROPDOWN_COLORS.textSecondary }}
              >
                No options found
              </div>
            )}
          </div>

          {/* Footer for multi-select */}
          {multiple && (
            <div 
              className="p-3 border-t flex items-center justify-between"
              style={{ 
                backgroundColor: DROPDOWN_COLORS.backgroundAlt,
                borderColor: DROPDOWN_COLORS.border,
              }}
            >
              <span 
                className="text-xs"
                style={{ color: DROPDOWN_COLORS.textSecondary }}
              >
                {(value as string[]).length} of {options.length} selected
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg transition-colors"
                style={{ 
                  backgroundColor: accentColor,
                  color: '#FFFFFF',
                }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </DropdownPortal>
    </>
  );
}

// ============================================
// Toggle Filter - For simple on/off filters
// Professional design with clear active state
// ============================================

interface ToggleFilterProps {
  label: string;
  icon?: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  accentColor?: string;
  className?: string;
}

export function ToggleFilter({
  label,
  icon,
  checked,
  onChange,
  accentColor = '#2563EB',
  className = '',
}: ToggleFilterProps) {
  const checkedBgTint = `${accentColor}12`; // 12% opacity
  
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`filter-trigger-btn px-3.5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 whitespace-nowrap border ${className}`}
      style={{
        backgroundColor: checked ? checkedBgTint : DROPDOWN_COLORS.background,
        borderColor: checked ? accentColor : DROPDOWN_COLORS.border,
        color: checked ? accentColor : DROPDOWN_COLORS.textPrimary,
        boxShadow: 'var(--shadow-sm)',
        transition: `all ${ANIMATION.hoverDuration} ${ANIMATION.easing}`,
      }}
    >
      {icon && (
        <span 
          className="w-4 h-4 flex items-center justify-center"
          style={{ color: accentColor }}
        >
          {icon}
        </span>
      )}
      <span>{label}</span>
      {checked && (
        <Check className="w-4 h-4" style={{ color: accentColor }} strokeWidth={2.5} />
      )}
    </button>
  );
}

// ============================================
// Sort Dropdown - Specialized for sorting
// Uses Portal to escape layout constraints
// ============================================

interface SortOption {
  value: string;
  label: string;
  icon?: string;
}

interface SortDropdownProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
  accentColor?: string;
  className?: string;
}

export function SortDropdown({
  options,
  value,
  onChange,
  accentColor = '#2563EB',
  className = '',
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedTrigger = triggerRef.current?.contains(target);
      const clickedDropdown = dropdownRef.current?.contains(target);
      
      if (!clickedTrigger && !clickedDropdown) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const currentOption = options.find(o => o.value === value) || options[0];

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`filter-trigger-btn px-3.5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 whitespace-nowrap border ${className}`}
        style={{
          backgroundColor: DROPDOWN_COLORS.background,
          borderColor: DROPDOWN_COLORS.border,
          color: DROPDOWN_COLORS.textPrimary,
        }}
      >
        <span style={{ color: DROPDOWN_COLORS.textSecondary }}>Sort:</span>
        <span>{currentOption?.label}</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: DROPDOWN_COLORS.textSecondary }}
        />
      </button>

      {/* Dropdown Panel - Rendered via Portal at body level */}
      <DropdownPortal triggerRef={triggerRef} isOpen={isOpen} align="right" minWidth={DROPDOWN_CONFIG.sortMinWidth}>
        <div 
          ref={dropdownRef}
          className="rounded-xl dropdown-panel"
          style={{ 
            backgroundColor: DROPDOWN_COLORS.background,
            border: `1px solid ${DROPDOWN_COLORS.border}`,
            boxShadow: DROPDOWN_COLORS.shadow,
            maxHeight: `${DROPDOWN_CONFIG.maxHeight}px`,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {options.map((option) => {
            const selected = value === option.value;
            return (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="dropdown-option w-full text-left px-4 py-3 text-sm flex items-center gap-3"
                style={{ 
                  backgroundColor: selected ? accentColor : DROPDOWN_COLORS.background,
                  color: selected ? '#FFFFFF' : DROPDOWN_COLORS.textPrimary,
                  fontWeight: selected ? 600 : 500,
                  transition: `all ${ANIMATION.hoverDuration} ${ANIMATION.easing}`,
                }}
                onMouseEnter={(e) => {
                  if (!selected) {
                    e.currentTarget.style.backgroundColor = `${accentColor}10`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selected) {
                    e.currentTarget.style.backgroundColor = DROPDOWN_COLORS.background;
                  }
                }}
              >
                {option.icon && (
                  <span 
                    className="text-lg flex-shrink-0"
                    style={{ filter: selected ? 'brightness(10)' : 'none' }}
                  >
                    {option.icon}
                  </span>
                )}
                <span className="flex-1" style={{ lineHeight: 1.5 }}>{option.label}</span>
                {selected && (
                  <Check className="w-5 h-5 flex-shrink-0 text-white" strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>
      </DropdownPortal>
    </>
  );
}

export default FilterDropdown;

// ============================================
// Global CSS for dropdown styling & animations
// Inject once when module loads
// ============================================
if (typeof document !== 'undefined') {
  const styleId = 'dropdown-premium-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* ============================================
         DROPDOWN ANIMATIONS - Smooth, subtle, professional
         ============================================ */
      
      @keyframes dropdownSlideIn {
        from {
          opacity: 0;
          transform: translateY(-8px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      @keyframes dropdownSlideOut {
        from {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        to {
          opacity: 0;
          transform: translateY(-8px) scale(0.98);
        }
      }
      
      /* Portal container animation */
      .dropdown-portal-container {
        will-change: opacity, transform;
      }
      
      /* ============================================
         DROPDOWN PANEL - Premium appearance
         ============================================ */
      
      .dropdown-panel {
        will-change: transform;
        transform-origin: top center;
      }
      
      /* Custom scrollbar - thin, modern */
      .dropdown-scroll-area::-webkit-scrollbar,
      .dropdown-panel::-webkit-scrollbar {
        width: 6px;
      }
      
      .dropdown-scroll-area::-webkit-scrollbar-track,
      .dropdown-panel::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .dropdown-scroll-area::-webkit-scrollbar-thumb,
      .dropdown-panel::-webkit-scrollbar-thumb {
        background: #D0D5DD;
        border-radius: 8px;
      }
      
      .dropdown-scroll-area::-webkit-scrollbar-thumb:hover,
      .dropdown-panel::-webkit-scrollbar-thumb:hover {
        background: #9CA3AF;
      }
      
      /* Firefox scrollbar styling */
      .dropdown-scroll-area,
      .dropdown-panel {
        scrollbar-width: thin;
        scrollbar-color: #D0D5DD transparent;
      }
      
      /* ============================================
         BUTTON & OPTION HOVER EFFECTS
         ============================================ */
      
      .dropdown-panel button {
        transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1),
                    color 150ms cubic-bezier(0.4, 0, 0.2, 1),
                    transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .dropdown-panel button:hover {
        background-color: #F3F4F6 !important;
      }
      
      .dropdown-panel button:active {
        transform: scale(0.99);
      }
      
      /* ============================================
         FILTER TRIGGER BUTTON EFFECTS
         ============================================ */
      
      .filter-trigger-btn {
        transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .filter-trigger-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .filter-trigger-btn:active {
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
  }
}
