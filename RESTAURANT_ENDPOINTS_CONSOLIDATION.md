# Restaurant/Vendor Endpoints - Complete Analysis

## 🔍 Current Status: DUPLICATE ENDPOINTS FOUND

You have **TWO SEPARATE** vendor/restaurant systems running in parallel:

### 1️⃣ Main Vendor System (Primary - `/api/vendors/`)
**Location:** `backend/vendors/` app  
**URLs:** `backend/api/urls.py` + `backend/vendors/urls.py`  
**Database:** 99 restaurants in `vendors_vendor` table

### 2️⃣ Analytics Vendor System (Legacy - Removed from URLs)
**Location:** `backend/analytics/views.py` (VendorsListView, VendorDetailView)  
**Status:** Previously had endpoints but now commented out/removed

---

## 📊 All Restaurant Endpoints

### **PRIMARY CRUD ENDPOINTS** (Active - 99 Restaurants)

#### 1. **GET /api/vendors/** - List All Restaurants
- **Backend:** `VendorViewSet` in `backend/vendors/views.py`
- **Features:**
  - Pagination (20 per page)
  - Filtering by: city, cuisine, rating, promotions, active status
  - Search query parameter `?q=`
  - Owner-based permissions (vendors see only their own)
- **Used by:** `frontend/src/components/RestaurantVendors.tsx`
- **Demo Data:** `frontend/src/data/restaurants.demo.json` (99 restaurants)

**Query Parameters:**
```
?city=Alor+Setar          # Filter by city
?cuisine=Malay,Chinese    # Filter by cuisines (comma-separated)
?q=nasi                   # Search by name or city
?min_rating=4.0           # Minimum average rating
?has_promotions=true      # Only show vendors with active promotions
?active=true              # Only show active vendors
```

#### 2. **GET /api/vendors/{id}/** - Get Single Restaurant
- **Serializer:** `VendorDetailSerializer`
- **Includes:** Full details, menu items, opening hours, reviews

#### 3. **POST /api/vendors/** - Create New Restaurant
- **Permission:** Authenticated vendors only
- **Auto-sets:** `owner = request.user`

#### 4. **PUT/PATCH /api/vendors/{id}/** - Update Restaurant
- **Permission:** Only owner can update
- **Protected:** Owner field cannot be changed

#### 5. **DELETE /api/vendors/{id}/** - Delete Restaurant
- **Permission:** Only owner can delete

---

### **VENDOR-SPECIFIC ACTIONS**

#### 6. **GET /api/vendors/{id}/menu/** - Get Restaurant Menu
- **Custom action** on VendorViewSet
- **Returns:** All available menu items for vendor

#### 7. **GET /api/vendors/{id}/reviews/** - Get Restaurant Reviews
- **Custom action** with pagination
- **Returns:** All reviews for vendor

#### 8. **GET /api/vendors/{id}/promotions/** - Get Active Promotions
- **Custom action**
- **Returns:** Current active promotions for vendor

#### 9. **GET /api/vendors/{id}/toggle_open/** - Toggle Open/Closed Status
- **Custom action** (likely POST)
- **Updates:** `is_open` field

---

### **ADVANCED SEARCH ENDPOINT**

#### 10. **GET /api/vendors/search/** - Advanced Restaurant Search
**Location:** `backend/vendors/urls.py` → `VendorSearchView`  
**Features:**
- Location-based search (lat/lon + radius)
- Cuisine filtering
- Price range filtering
- Dietary requirements (vegetarian, halal)
- Rating filtering
- Annotates with: avg_rating, review_count, has_promotions

**Query Parameters:**
```
?cuisine=Malay
?price_range=10-50
?dietary=vegetarian,halal
?rating=4.5
?lat=6.1203&lon=100.3669&radius=5  # 5km radius search
```

---

### **VENDOR ANALYTICS ENDPOINT**

#### 11. **GET /api/vendors/analytics/** - Vendor-specific Analytics
**Location:** `backend/vendors/urls.py` → `VendorAnalyticsView`  
**Purpose:** Analytics for individual vendor dashboard

---

### **MENU ITEMS ENDPOINTS**

#### 12. **GET /api/menu-items/** - List Menu Items
**Query Parameters:**
```
?vendor_id=123  # Get menu items for specific vendor (public)
```

#### 13. **POST /api/menu-items/** - Create Menu Item
- **Permission:** Vendor owners only
- **Validation:** Can only add to own restaurants

#### 14. **PUT/PATCH /api/menu-items/{id}/** - Update Menu Item
#### 15. **DELETE /api/menu-items/{id}/** - Delete Menu Item

---

### **OPENING HOURS ENDPOINTS**

#### 16. **GET /api/opening-hours/** - List Opening Hours
#### 17. **POST /api/opening-hours/** - Create Opening Hours
#### 18. **PUT/PATCH /api/opening-hours/{id}/** - Update Opening Hours
#### 19. **DELETE /api/opening-hours/{id}/** - Delete Opening Hours

---

### **REVIEWS ENDPOINTS**

#### 20. **GET /api/reviews/** - List Reviews
#### 21. **POST /api/reviews/** - Create Review
#### 22. **PUT/PATCH /api/reviews/{id}/** - Update Review
#### 23. **DELETE /api/reviews/{id}/** - Delete Review

---

### **PROMOTIONS ENDPOINTS**

#### 24. **GET /api/promotions/** - List Promotions
#### 25. **POST /api/promotions/** - Create Promotion
#### 26. **PUT/PATCH /api/promotions/{id}/** - Update Promotion
#### 27. **DELETE /api/promotions/{id}/** - Delete Promotion

---

### **RESERVATIONS ENDPOINTS**

#### 28. **GET /api/reservations/** - List Reservations
#### 29. **POST /api/reservations/** - Create Reservation
#### 30. **PUT/PATCH /api/reservations/{id}/** - Update Reservation
#### 31. **DELETE /api/reservations/{id}/** - Delete Reservation

---

## 🗄️ Database Tables

### vendors_vendor (99 records)
- id, name, description, city, address, contact_email, contact_phone
- lat, lon, cuisines (JSONField), amenities (JSONField)
- price_range, is_active, is_open
- owner_id (FK to users_user)
- created_at, updated_at

### vendors_menuitem
- vendor_id (FK), name, description, price, category
- is_available, is_vegetarian, is_halal, is_spicy
- image

### vendors_openinghours
- vendor_id (FK), day_of_week, opening_time, closing_time, is_closed

### vendors_review
- vendor_id (FK), user_id (FK), rating, comment, created_at

### vendors_promotion
- vendor_id (FK), title, description, discount_percentage
- start_date, end_date, is_active

### vendors_reservation
- vendor_id (FK), user_id (FK), date, time, party_size
- special_requests, status, created_at

---

## 🎯 Recommendation: CONSOLIDATE ALL ENDPOINTS

**Problem:** You have duplicate systems that can cause confusion:
1. `/api/vendors/` (main CRUD - 99 restaurants) ✅ ACTIVE
2. Analytics vendor views (removed/legacy) ❌ INACTIVE

**Solution:** Use ONLY `/api/vendors/` for everything

---

## 📝 Frontend Integration Points

### Current Frontend Usage:
1. **RestaurantVendors.tsx** → Uses `/api/vendors/` ✅
2. **Demo Data** → `restaurants.demo.json` (99 restaurants) ✅

### What Frontend Should Use:
```typescript
// List all restaurants
GET /api/vendors/

// Search restaurants
GET /api/vendors/search/?cuisine=Malay&rating=4.5&lat=6.12&lon=100.37&radius=5

// Get single restaurant with full details
GET /api/vendors/{id}/

// Get restaurant menu
GET /api/vendors/{id}/menu/

// Get restaurant reviews
GET /api/vendors/{id}/reviews/

// Get active promotions
GET /api/vendors/{id}/promotions/

// Create reservation
POST /api/reservations/
{
  "vendor_id": 123,
  "date": "2026-01-15",
  "time": "19:00",
  "party_size": 4,
  "special_requests": "Window seat preferred"
}
```

---

## ✅ Action Items

### Option 1: Keep Current Setup (Recommended)
✅ **DONE** - All 99 restaurants in demo data  
✅ **DONE** - Frontend uses `/api/vendors/`  
✅ **DONE** - Hybrid approach with fallback  
⚠️ **TODO** - Fix Render backend (returns 500 errors)

### Option 2: Add Missing Frontend Features
Could add these features to frontend:
- [ ] Advanced search with filters (cuisine, price, dietary)
- [ ] Location-based search (nearby restaurants)
- [ ] Restaurant detail page with reviews
- [ ] Menu browsing
- [ ] Online reservation system
- [ ] Promotions display

---

## 📌 Summary

**Total Restaurant Endpoints: 31+**
- Main vendor CRUD: 5 endpoints
- Vendor actions: 4 endpoints
- Advanced search: 1 endpoint
- Vendor analytics: 1 endpoint
- Menu items CRUD: 4 endpoints
- Opening hours CRUD: 4 endpoints
- Reviews CRUD: 4 endpoints
- Promotions CRUD: 4 endpoints
- Reservations CRUD: 4 endpoints

**Database Count: 99 restaurants** (not 113)

**Primary Endpoint:** `/api/vendors/` with pagination (20 per page, 5 pages)

**Frontend Status:** ✅ Working with demo data fallback

**Backend Status:** ⚠️ Render.com returns 500 errors (needs debugging)
