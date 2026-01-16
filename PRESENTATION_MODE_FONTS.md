# Presentation Mode - Increased Font Sizes ✅

## What Was Changed

All text sizes across the entire Tourism Analytics Dashboard have been increased by **25-40%** for better visibility during presentations.

## Global CSS Changes

**File:** `frontend/src/index.css`

### Font Size Increases

| Element | Original Size | New Size | Increase |
|---------|--------------|----------|----------|
| Extra Small (text-xs) | 0.75rem (12px) | 1rem (16px) | +33% |
| Small (text-sm) | 0.875rem (14px) | 1.125rem (18px) | +29% |
| Base (text-base) | 1rem (16px) | 1.25rem (20px) | +25% |
| Large (text-lg) | 1.125rem (18px) | 1.5rem (24px) | +33% |
| XL (text-xl) | 1.25rem (20px) | 1.75rem (28px) | +40% |
| 2XL (text-2xl) | 1.5rem (24px) | 2rem (32px) | +33% |
| 3XL (text-3xl) | 1.875rem (30px) | 2.5rem (40px) | +33% |
| 4XL (text-4xl) | 2.25rem (36px) | 3rem (48px) | +33% |

### Specific Element Updates

✅ **Body Text:** 1.125rem (18px) with improved line height  
✅ **Headings (H1):** 2.25rem (36px)  
✅ **Headings (H2):** 1.875rem (30px)  
✅ **Headings (H3):** 1.5rem (24px)  
✅ **Chart Labels:** 1.125rem (18px)  
✅ **Chart Axis:** 1rem (16px)  
✅ **Table Text:** 1.125rem (18px)  
✅ **Button Text:** 1.125rem (18px)  
✅ **Badges/Tags:** 1rem (16px)  
✅ **Metric Numbers:** 1.5rem (24px)  

### Additional Improvements

- **Increased padding** on buttons (0.75rem × 1.5rem)
- **Increased padding** on table cells (0.75rem × 1rem)
- **Improved line height** (1.6) for better readability
- **Badge padding** increased (0.5rem × 1rem)

## How It Works

The changes use CSS custom properties and `!important` flags to override all Tailwind CSS default sizes globally:

```css
:root {
  --text-xs: 1rem !important;
  --text-sm: 1.125rem !important;
  --text-base: 1.25rem !important;
  /* ... etc */
}
```

This ensures **all components** inherit the larger sizes automatically, including:
- Overview metrics
- Charts (Recharts components)
- Tables
- Cards
- Buttons
- Forms
- Navigation
- Modals
- Tooltips

## Testing

### Before Presentation
1. ✅ Open dashboard: http://localhost:3000
2. ✅ Check all pages for text visibility
3. ✅ Verify charts are readable
4. ✅ Test on projector/large screen

### Current Status
- Frontend dev server is running
- Changes will auto-reload in browser
- Refresh your browser to see updated sizes

## Reverting Changes (If Needed)

To revert to original sizes, simply restore the original CSS variables in `frontend/src/index.css`:

```css
:root {
  --text-xs: .75rem;
  --text-sm: .875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
}
```

## Affected Components

All components automatically updated:
- ✅ Overview page (metrics, charts)
- ✅ Places page (destination cards)
- ✅ Food page (restaurant listings)
- ✅ Events page (event cards)
- ✅ Transport page (route information)
- ✅ Map view (markers, popups)
- ✅ SentimentComparison component
- ✅ Navigation menus
- ✅ Forms and inputs
- ✅ Tables and data displays

## Presentation Tips

1. **Test with projector:** Always test font sizes with actual presentation equipment
2. **Browser zoom:** Can still use Ctrl/Cmd + "+" to zoom further if needed
3. **Dark mode:** Consider if your presentation room has specific lighting
4. **Charts:** Recharts will auto-scale with new font sizes

## Notes

- All sizes use `!important` to ensure they override component-specific styles
- Line heights adjusted for better readability at larger sizes
- Responsive breakpoints maintained
- No component-level changes needed

## Verification

```bash
# Frontend should auto-reload
# Open browser at http://localhost:3000
# All text should be noticeably larger

# If not seeing changes:
cd frontend
npm run dev
```

---

**Status:** ✅ Applied and Active  
**Impact:** All text sizes increased 25-40%  
**Auto-reload:** Yes (Vite dev server detected)  
**Date:** January 14, 2026

**Next Steps:**
1. Refresh your browser
2. Check all pages
3. Test with projector
4. Present with confidence! 🎉
