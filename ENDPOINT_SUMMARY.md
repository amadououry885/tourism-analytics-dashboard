# 🎯 VENDOR/RESTAURANT ENDPOINT SUMMARY

## ✅ CONFIRMED: NO DUPLICATES

### Backend Structure:
- **ONE ViewSet**: `VendorViewSet` in `backend/vendors/views.py`
- **ONE URL registration**: Routes to same ViewSet
- **Clean architecture**: No duplicate logic

---

## 📝 CURRENT USAGE IN FRONTEND

### VendorDashboard.tsx (ACTIVE - Using this one)
```typescript
✅ GET    /vendors/              - List restaurants
✅ POST   /vendors/              - Create restaurant  
✅ PUT    /vendors/{id}/         - Update restaurant
✅ DELETE /vendors/{id}/         - Delete restaurant
✅ POST   /vendors/{id}/toggle_status/ - Toggle open/closed
```

### VendorDashboardNew.tsx (INACTIVE - Hidden with `false &&`)
```typescript
❌ This file exists but is NOT being used
❌ The old modal calls this instead of VendorDashboard
❌ We disabled it: `{false && showAddModal && (`
```

### MenuManagement.tsx (Menu Items)
```typescript
✅ GET    /vendors/menu-items/         - List menu items
✅ POST   /vendors/menu-items/         - Create menu item
✅ PUT    /api/vendors/menu-items/{id}/ - Update menu item ⚠️ (has /api prefix)
✅ DELETE /api/vendors/menu-items/{id}/ - Delete menu item ⚠️ (has /api prefix)
```

### OpeningHoursManagement.tsx (Opening Hours)
```typescript
✅ GET    /vendors/opening-hours/     - List hours
✅ POST   /vendors/opening-hours/     - Create hours
✅ PUT    /vendors/opening-hours/{id}/ - Update hours
✅ DELETE /vendors/opening-hours/{id}/ - Delete hours
```

---

## ⚠️ INCONSISTENCIES FOUND

### Issue 1: Mixed API prefix usage
Some endpoints use `/api/vendors/` while others use `/vendors/`
- Vite proxy forwards `/api/*` → backend
- Direct `/vendors/` also works because of proxy config

**Recommendation**: Use `/vendors/` consistently (no `/api` prefix)

### Issue 2: VendorDashboardNew.tsx exists but unused
- File contains old implementation
- Currently hidden with `false &&` condition
- **Action**: Can be safely deleted

---

## 🔧 RECOMMENDED FIXES

### 1. Delete unused file:
```bash
rm frontend/src/pages/vendor/VendorDashboardNew.tsx
```

### 2. Fix MenuManagement.tsx API prefix:
```typescript
// Change from:
await axios.put(`/api/vendors/menu-items/${id}/`, ...)
await axios.delete(`/api/vendors/menu-items/${id}/`)

// To:
await axios.put(`/vendors/menu-items/${id}/`, ...)
await axios.delete(`/vendors/menu-items/${id}/`)
```

---

## ✅ CORRECT ENDPOINTS (Final Reference)

### Restaurant CRUD:
```
GET    /vendors/                    - List all
POST   /vendors/                    - Create
GET    /vendors/{id}/               - Detail
PUT    /vendors/{id}/               - Update
DELETE /vendors/{id}/               - Delete
POST   /vendors/{id}/toggle_status/ - Toggle open/closed
```

### Menu Items:
```
GET    /vendors/menu-items/         - List
POST   /vendors/menu-items/         - Create
PUT    /vendors/menu-items/{id}/    - Update
DELETE /vendors/menu-items/{id}/    - Delete
```

### Opening Hours:
```
GET    /vendors/opening-hours/      - List
POST   /vendors/opening-hours/      - Create
PUT    /vendors/opening-hours/{id}/  - Update
DELETE /vendors/opening-hours/{id}/  - Delete
```

### Reviews, Promotions, Reservations:
Same pattern as above - all under `/vendors/` prefix

---

## 🎯 WHAT WE'RE WORKING ON

**Current Task**: Professional tabbed modal for restaurant CRUD
**File**: `frontend/src/pages/vendor/VendorDashboard.tsx`
**Modal Component**: `frontend/src/pages/vendor/VendorDashboardModal.tsx`
**Endpoints Used**: `/vendors/` (correct ✅)

**Next**: Make sure update button works properly in the modal
