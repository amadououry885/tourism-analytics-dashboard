# Vendor Filtering Fix — Food Page Issue Resolution

## Problem Description

**Issue**: When vendor2 logged into the vendor portal and navigated to the Food page, they only saw their own restaurant ("Vendor2 Production Test") instead of all 99+ restaurants available in the system.

**Root Cause**: The `VendorViewSet.get_queryset()` method in `backend/vendors/views.py` was filtering restaurants by owner for ALL authenticated vendor users, regardless of whether they were browsing publicly or managing their own restaurants in the dashboard.

### Previous Logic (Line 35-48)
```python
def get_queryset(self):
    """Filter vendors - owners see their own, others see all active"""
    qs = super().get_queryset()
    user = self.request.user
    
    # If user is authenticated vendor, show their own vendors (regardless of status)
    if user.is_authenticated and user.role == 'vendor':
        qs = qs.filter(owner=user)  # ❌ PROBLEM: Applied everywhere
    else:
        qs = qs.filter(is_active=True)
```

**Why This Was Wrong**:
- ✅ Correct for vendor dashboard (managing own restaurants)
- ❌ Wrong for public Food page (should show all restaurants)
- The endpoint `/api/vendors/` was used by BOTH components
- No way to distinguish between dashboard vs. public browsing

## Solution Implemented

### 1. Backend: Query Parameter Context Detection

Modified `VendorViewSet.get_queryset()` to check for a `my_restaurants=true` query parameter:

**File**: `backend/vendors/views.py`

```python
def get_queryset(self):
    """Filter vendors based on context:
    - Dashboard (?my_restaurants=true): Vendors see only their own
    - Public browsing: Everyone sees all active vendors
    """
    qs = super().get_queryset()
    user = self.request.user
    
    # Check if this is a dashboard request (vendor managing their own restaurants)
    my_restaurants = self.request.query_params.get('my_restaurants', '').lower() == 'true'
    
    # If user is authenticated vendor AND requesting their own restaurants, filter by owner
    if user.is_authenticated and user.role == 'vendor' and my_restaurants:
        qs = qs.filter(owner=user)
    else:
        # Public browsing: show all active vendors (even for logged-in users)
        qs = qs.filter(is_active=True)
    
    # ... rest of filtering logic (city, cuisine, etc.)
```

**Key Changes**:
- Added `my_restaurants` parameter check
- Only filter by owner when `user.role == 'vendor' AND my_restaurants == 'true'`
- Default behavior: show all active vendors (public browsing)

### 2. Frontend: VendorDashboard Uses Parameter

Updated vendor dashboard to add `?my_restaurants=true` when fetching:

**File**: `frontend/src/pages/vendor/VendorDashboard.tsx` (Line 139)

```typescript
const fetchRestaurants = async () => {
  try {
    console.log('[VendorDashboard] Fetching vendors...');
    console.log('[VendorDashboard] User authenticated:', user);
    // Add my_restaurants=true to only fetch vendor's own restaurants
    const data = await request('/vendors/?my_restaurants=true');
    // ...
```

**Result**: Vendor dashboard now explicitly requests "my restaurants only"

### 3. Frontend: RestaurantVendors No Changes Needed

The `RestaurantVendors` component (Food page) already calls `/api/vendors/` without the parameter:

**File**: `frontend/src/components/RestaurantVendors.tsx` (Line 178)

```typescript
const response = await api.get(`/vendors/?${pageParams.toString()}`);
```

**Result**: Public Food page shows all active vendors (no filtering by owner)

### 4. Frontend: Fixed Navigation Routes

Updated navigation tabs in Overview page to use correct routes:

**File**: `frontend/src/pages/Overview.tsx`

**Before**:
```typescript
navigate('/food');        // ❌ Route doesn't exist
navigate('/stays');       // ❌ Route doesn't exist
navigate('/transport');   // ❌ Route doesn't exist
navigate('/events');      // ❌ Route doesn't exist
```

**After**:
```typescript
navigate('/?tab=restaurants');    // ✅ TourismDashboard with restaurants tab
navigate('/?tab=accommodation');  // ✅ TourismDashboard with accommodation tab
navigate('/?tab=transport');      // ✅ TourismDashboard with transport tab
navigate('/?tab=events');         // ✅ TourismDashboard with events tab
navigate('/?tab=destinations');   // ✅ TourismDashboard with destinations tab
navigate('/?tab=overview');       // ✅ TourismDashboard with overview tab
```

**Why This Fix**:
- No `/food`, `/stays`, etc. routes exist in `App.tsx`
- TourismDashboard handles tabs via URL query parameters
- Navigation was redirecting to `/` (home) instead of intended tabs

## Architecture Pattern

### API Endpoint Usage Matrix

| Component | Endpoint | Query Params | Context | Expected Result |
|-----------|----------|--------------|---------|-----------------|
| **RestaurantVendors** (Food Page) | `/vendors/` | `city=langkawi` (optional) | Public browsing | All active vendors |
| **VendorDashboard** | `/vendors/` | `my_restaurants=true` | Vendor management | Only owned vendors |
| **AccommodationSearch** (Stays Page) | `/stays/` | `city=langkawi` (optional) | Public browsing | All active stays |
| **StayOwnerDashboard** | `/stays/` | `my_stays=true` (potential) | Stay owner management | Only owned stays |

### Authentication Flow

```
User logs in as vendor2
  ↓
JWT token stored in localStorage
  ↓
Axios interceptor adds token to ALL requests
  ↓
Backend receives authenticated request
  ↓
┌─────────────────────────────────────────┐
│ VendorViewSet.get_queryset() checks:    │
│                                         │
│ 1. Is user.role == 'vendor'? YES ✓      │
│ 2. Is my_restaurants == 'true'?         │
│    ├─ YES → filter(owner=user)          │
│    └─ NO  → filter(is_active=True)      │
└─────────────────────────────────────────┘
```

## Testing Scenarios

### Scenario 1: Anonymous User Browsing Food Page
- **Action**: Visit Food page without logging in
- **Expected**: See all 99+ active restaurants
- **API Call**: `GET /api/vendors/?city=langkawi`
- **Backend Logic**: No authentication → `filter(is_active=True)`
- **Result**: ✅ All active vendors returned

### Scenario 2: Vendor2 Browsing Food Page (Logged In)
- **Action**: Login as vendor2, click Food tab
- **Expected**: See all 99+ active restaurants
- **API Call**: `GET /api/vendors/?city=langkawi` (JWT in headers, NO my_restaurants param)
- **Backend Logic**: `user.role == 'vendor'` BUT `my_restaurants != 'true'` → `filter(is_active=True)`
- **Result**: ✅ All active vendors returned (FIXED)

### Scenario 3: Vendor2 Managing Own Restaurants
- **Action**: Login as vendor2, go to Vendor Dashboard
- **Expected**: See only "Vendor2 Production Test"
- **API Call**: `GET /api/vendors/?my_restaurants=true` (JWT in headers)
- **Backend Logic**: `user.role == 'vendor'` AND `my_restaurants == 'true'` → `filter(owner=user)`
- **Result**: ✅ Only owned vendor returned

### Scenario 4: Admin Browsing Food Page
- **Action**: Login as admin, click Food tab
- **Expected**: See all 99+ active restaurants
- **API Call**: `GET /api/vendors/` (JWT in headers, NO my_restaurants param)
- **Backend Logic**: `user.role != 'vendor'` → `filter(is_active=True)`
- **Result**: ✅ All active vendors returned

### Scenario 5: Navigation Tabs
- **Action**: Click Food tab in Overview page
- **Expected**: Navigate to TourismDashboard with restaurants tab active
- **Route**: `/?tab=restaurants` (NOT `/food`)
- **Result**: ✅ Correct tab shown (FIXED)

## Verification Steps

1. **Test Public Food Page**:
   ```bash
   # Open browser (not logged in)
   # Navigate to http://localhost:3000/?tab=restaurants
   # Expect: All 99+ restaurants visible
   ```

2. **Test Vendor Browsing**:
   ```bash
   # Login as vendor2
   # Click Food tab in Overview
   # Expect: Navigate to /?tab=restaurants
   # Expect: All 99+ restaurants visible (not just vendor2's)
   ```

3. **Test Vendor Dashboard**:
   ```bash
   # Login as vendor2
   # Navigate to /vendor/dashboard
   # Expect: Only "Vendor2 Production Test" shown
   ```

4. **Check API Calls**:
   ```bash
   # Open browser DevTools → Network tab
   # Food page should call: GET /api/vendors/?city=langkawi
   # Vendor dashboard should call: GET /api/vendors/?my_restaurants=true
   ```

## Files Changed

1. **Backend**:
   - `backend/vendors/views.py` (Lines 35-58)
     - Added `my_restaurants` query parameter check
     - Modified filtering logic for context-aware filtering

2. **Frontend**:
   - `frontend/src/pages/vendor/VendorDashboard.tsx` (Line 143)
     - Added `?my_restaurants=true` to vendor fetch request
   
   - `frontend/src/pages/Overview.tsx` (Lines 114-184)
     - Fixed navigation routes to use query parameters
     - `navigate('/food')` → `navigate('/?tab=restaurants')`
     - `navigate('/stays')` → `navigate('/?tab=accommodation')`
     - `navigate('/transport')` → `navigate('/?tab=transport')`
     - `navigate('/events')` → `navigate('/?tab=events')`
     - `navigate('/?tab=destinations')` for Places tab
     - `navigate('/?tab=overview')` for Overview tab

## Deployment Notes

### Local Development
- Backend runs on port 8000 (already running)
- No migration needed (only code changes)
- No database changes required

### Render Deployment
1. Push changes to GitHub
2. Render auto-deploys from main branch
3. No manual migrations needed
4. Changes take effect immediately after deployment

### Vercel Deployment
1. Push frontend changes to GitHub
2. Vercel auto-deploys
3. Updated navigation routes work immediately

## Additional Benefits

This fix also enables future scenarios:

1. **Stay Owners Browsing Publicly**:
   - Stay owners can browse all accommodations while logged in
   - Their dashboard uses `?my_stays=true` to manage only their properties

2. **Admin Viewing All Data**:
   - Admins see all vendors/stays when browsing
   - No need for special permissions override

3. **Context-Aware Filtering**:
   - Same endpoint serves different contexts
   - Clean separation of concerns
   - Easy to extend with more query parameters

## Summary

✅ **Fixed**: Vendor filtering issue where logged-in vendors only saw their own restaurant  
✅ **Fixed**: Navigation routes now correctly route to TourismDashboard tabs  
✅ **Maintained**: Vendor dashboard still shows only owned restaurants  
✅ **Maintained**: Public browsing shows all active vendors  
✅ **Improved**: Clear context separation via query parameters  

**Root Cause**: Lack of context distinction between dashboard and public browsing  
**Solution**: Query parameter `my_restaurants=true` for explicit context signaling  
**Pattern**: Reusable for stays (`my_stays=true`) and other ownership-filtered resources
