# Menu Management Authentication Fix

## Problem
Vendors were unable to add menu items to their restaurants, receiving **401 Unauthorized** errors.

## Root Causes Identified

### 1. Missing Authentication Headers
- `MenuManagement.tsx` was importing `axios` directly instead of the configured `api` instance
- Direct axios imports don't include JWT token interceptors
- Result: API calls were made without `Authorization: Bearer <token>` header

### 2. Missing Permission Classes
- `MenuItemViewSet` and `OpeningHoursViewSet` didn't have explicit permission classes
- Without permissions, DRF defaults to global settings which may block authenticated requests
- Ownership checks existed but weren't enforced at the permission level

### 3. Inconsistent URL Prefixes
- Some calls used `/api/vendors/menu-items/` (with /api)
- Others used `/vendors/menu-items/` (without /api)
- Created routing confusion and failed requests

## Solutions Applied

### Backend Changes (backend/vendors/views.py)

1. **Added Permission Classes:**
```python
class MenuItemViewSet(viewsets.ModelViewSet):
    serializer_class = MenuItemSerializer
    permission_classes = [IsVendorOwnerOrReadOnly]  # ✅ ADDED
    
class OpeningHoursViewSet(viewsets.ModelViewSet):
    serializer_class = OpeningHoursSerializer
    permission_classes = [IsVendorOwnerOrReadOnly]  # ✅ ADDED
```

2. **Improved QuerySet Filtering:**
```python
def get_queryset(self):
    user = self.request.user
    vendor_id = self.request.query_params.get('vendor_id')
    
    if vendor_id:
        # Public view - anyone can see menu items for a specific vendor
        return MenuItem.objects.filter(vendor_id=vendor_id, is_available=True)
    
    if user.is_authenticated and user.role == 'vendor':
        # Vendors see all their menu items
        vendor_ids = user.vendor_set.values_list('id', flat=True)
        return MenuItem.objects.filter(vendor_id__in=vendor_ids)
    
    return MenuItem.objects.none()
```

3. **Better Error Handling:**
```python
def perform_create(self, serializer):
    vendor = serializer.validated_data['vendor']
    if vendor.owner != self.request.user:
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied('You can only add menu items to your own restaurants')
    serializer.save()
```

### Frontend Changes

1. **MenuManagement.tsx:**
```typescript
// ❌ OLD - No authentication
import axios from 'axios';
await axios.post('/vendors/menu-items/', formData);

// ✅ NEW - With JWT authentication
import api from '../services/api';
await api.post('/vendors/menu-items/', formData);
```

2. **OpeningHoursManagement.tsx:**
```typescript
// Same fix - replaced all axios with api
import api from '../services/api';
await api.get('/vendors/opening-hours/', { params: { vendor_id } });
await api.post('/vendors/opening-hours/', hour);
await api.put(`/vendors/opening-hours/${hour.id}/`, hour);
```

3. **Consistent URL Pattern:**
   - All calls now use `/vendors/menu-items/` (no /api prefix)
   - Vite proxy handles the `/api` prefix automatically
   - JWT interceptor adds authentication headers

## How It Works Now

1. **User logs in** → JWT tokens stored in localStorage
2. **Vendor opens dashboard** → Fetches their restaurants with auth headers
3. **Clicks "Manage Menu"** → MenuManagement component loads
4. **Adds menu item** → `api.post()` automatically includes:
   - Base URL: `/api` (from Vite config)
   - Full URL: `/api/vendors/menu-items/`
   - Headers: `Authorization: Bearer <access_token>`
   - Body: Menu item data with vendor ID

5. **Backend receives request:**
   - JWT middleware validates token
   - `IsVendorOwnerOrReadOnly` permission checks user role
   - `perform_create()` verifies vendor ownership
   - Menu item saved successfully

## Testing

To test the fix:

1. **Login as vendor** (vendor2/password)
2. **Navigate to Vendor Dashboard**
3. **Click on a restaurant** to manage it
4. **Click "Manage Menu"** tab
5. **Click "Add Menu Item"** button
6. **Fill out form** and submit
7. **Expected:** Menu item created successfully ✅
8. **Check console:** No 401 errors ✅

## Files Modified

- `backend/vendors/views.py` (MenuItemViewSet, OpeningHoursViewSet)
- `frontend/src/components/MenuManagement.tsx`
- `frontend/src/components/OpeningHoursManagement.tsx`

## Related Documentation

- See `VENDOR_API_ENDPOINTS.md` for complete API reference
- See `frontend/src/services/api.ts` for JWT interceptor configuration
- See `backend/common/permissions.py` for IsVendorOwnerOrReadOnly implementation
