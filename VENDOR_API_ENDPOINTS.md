# 🍽️ Restaurant/Vendor API Endpoints - Complete Reference

## 📍 Base URLs
- **Main vendors route**: `/api/vendors/`
- **Vendor sub-resources**: `/api/vendors/menu-items/`, `/api/vendors/opening-hours/`, etc.

---

## 🏪 VENDOR/RESTAURANT ENDPOINTS

### 1. **List All Restaurants**
```
GET /api/vendors/
```
- **Public**: Shows only `is_active=True` restaurants
- **Vendor (authenticated)**: Shows only their own restaurants (regardless of status)
- **Returns**: Paginated list with `VendorListSerializer`

**Query Parameters:**
- `city` - Filter by city (case-insensitive)
- `q` - Search in name or city
- `cuisine` - Filter by cuisine type (comma-separated)
- `active` - Filter by active status (true/false)
- `min_rating` - Minimum average rating
- `has_promotions` - Filter restaurants with active promotions

### 2. **Get Restaurant Details**
```
GET /api/vendors/{id}/
```
- **Returns**: Detailed restaurant info with `VendorDetailSerializer`

### 3. **Create Restaurant**
```
POST /api/vendors/
```
- **Permission**: Authenticated vendor users only
- **Auto-sets**: `owner = request.user`
- **Required fields**: `name`, `city`, `cuisines`
- **Returns**: Created restaurant data

**Example payload:**
```json
{
  "name": "Mario's Bistro",
  "city": "Kuala Lumpur",
  "cuisines": ["Italian", "Mediterranean"],
  "description": "...",
  "price_range": "$$",
  "contact_phone": "+60...",
  "contact_email": "...",
  "address": "...",
  "amenities": {
    "wifi": true,
    "parking": true,
    "halal_certified": false
  }
}
```

### 4. **Update Restaurant**
```
PUT /api/vendors/{id}/
PATCH /api/vendors/{id}/
```
- **Permission**: Only the owner can update
- **Keeps**: Original owner (doesn't change)
- **Returns**: Updated restaurant data

### 5. **Delete Restaurant**
```
DELETE /api/vendors/{id}/
```
- **Permission**: Only the owner can delete
- **Returns**: 204 No Content

### 6. **Toggle Open/Closed Status**
```
POST /api/vendors/{id}/toggle_status/
```
- **Permission**: Only the owner
- **Action**: Toggles `is_open` field
- **Returns**: 
```json
{
  "is_open": true,
  "message": "Restaurant is now OPEN"
}
```

---

## 🍔 MENU ITEMS ENDPOINTS

### 7. **List Menu Items (for a vendor)**
```
GET /api/vendors/{vendor_id}/menu/
```
- **Public access**
- **Filters**: Only `is_available=True` items
- **Returns**: Array of menu items

### 8. **List ALL Menu Items (vendor owner)**
```
GET /api/vendors/menu-items/
```
- **Permission**: Authenticated vendor
- **Filters**: Only menu items for restaurants owned by current user
- **Returns**: All menu items across vendor's restaurants

### 9. **Create Menu Item**
```
POST /api/vendors/menu-items/
```
- **Permission**: Authenticated vendor
- **Validates**: Vendor must be owned by current user
- **Required fields**: `vendor`, `name`, `category`, `price`

**Example payload:**
```json
{
  "vendor": 1,
  "name": "Margherita Pizza",
  "category": "Main Course",
  "price": 35.00,
  "description": "...",
  "is_vegetarian": true,
  "is_halal": false,
  "spiciness_level": 0,
  "allergens": "Gluten, Dairy"
}
```

### 10. **Update Menu Item**
```
PUT /api/vendors/menu-items/{id}/
PATCH /api/vendors/menu-items/{id}/
```
- **Permission**: Only owner of the vendor can update

### 11. **Delete Menu Item**
```
DELETE /api/vendors/menu-items/{id}/
```
- **Permission**: Only owner can delete

---

## 🕐 OPENING HOURS ENDPOINTS

### 12. **List Opening Hours (vendor owner)**
```
GET /api/vendors/opening-hours/
```
- **Permission**: Authenticated vendor
- **Filters**: Only for restaurants owned by current user

### 13. **Create Opening Hours**
```
POST /api/vendors/opening-hours/
```
- **Permission**: Authenticated vendor
- **Validates**: Vendor must be owned by current user

**Example payload:**
```json
{
  "vendor": 1,
  "day_of_week": 1,
  "opening_time": "09:00:00",
  "closing_time": "22:00:00",
  "is_closed": false
}
```

### 14. **Update Opening Hours**
```
PUT /api/vendors/opening-hours/{id}/
PATCH /api/vendors/opening-hours/{id}/
```

### 15. **Delete Opening Hours**
```
DELETE /api/vendors/opening-hours/{id}/
```

---

## ⭐ REVIEWS ENDPOINTS

### 16. **List Reviews (for a vendor)**
```
GET /api/vendors/{vendor_id}/reviews/
```
- **Public access**
- **Paginated**
- **Ordered by**: Date (newest first)

### 17. **List ALL Reviews**
```
GET /api/vendors/reviews/
```
- **Public access**
- **Returns**: All reviews across all vendors

### 18. **Create Review**
```
POST /api/vendors/reviews/
```
- **Permission**: Authenticated users only

**Example payload:**
```json
{
  "vendor": 1,
  "rating": 5,
  "comment": "Excellent food and service!",
  "reviewer_name": "John Doe",
  "reviewer_email": "john@example.com"
}
```

---

## 🎉 PROMOTIONS ENDPOINTS

### 19. **List Active Promotions (for a vendor)**
```
GET /api/vendors/{vendor_id}/promotions/
```
- **Filters**: Only active promotions (current date within start/end range)

### 20. **List ALL Promotions (vendor owner)**
```
GET /api/vendors/promotions/
```
- **Permission**: Authenticated vendor
- **Filters**: Only for restaurants owned by current user

### 21. **Create Promotion**
```
POST /api/vendors/promotions/
```
- **Permission**: Authenticated vendor

**Example payload:**
```json
{
  "vendor": 1,
  "title": "20% Off Lunch Special",
  "description": "...",
  "discount_percentage": 20,
  "start_date": "2026-01-01",
  "end_date": "2026-01-31",
  "is_active": true
}
```

---

## 📅 RESERVATIONS ENDPOINTS

### 22. **Make Reservation (PUBLIC)**
```
POST /api/vendors/{vendor_id}/make_reservation/
```
- **Public access** (no authentication required)
- **Sends**: Confirmation email automatically
- **Returns**: 
```json
{
  "reservation": {...},
  "email_sent": true,
  "message": "Reservation created successfully!"
}
```

**Example payload:**
```json
{
  "customer_name": "Jane Smith",
  "customer_email": "jane@example.com",
  "customer_phone": "+60123456789",
  "date": "2026-01-15",
  "time": "19:00:00",
  "party_size": 4,
  "special_requests": "Window seat if possible"
}
```

### 23. **List Reservations (vendor owner)**
```
GET /api/vendors/reservations/
```
- **Permission**: Authenticated vendor
- **Filters**: Only for restaurants owned by current user

---

## 🔍 SEARCH & ANALYTICS

### 24. **Advanced Search**
```
GET /api/vendors/search/
```
**Parameters:**
- `cuisine` - Cuisine type
- `price_range` - e.g., "10-50"
- `dietary[]` - vegetarian, halal (array)
- `min_rating` - Minimum rating
- `lat`, `lon` - Location coordinates
- `radius` - Search radius in km (default: 5)

### 25. **Vendor Analytics**
```
GET /api/vendors/analytics/
```
**Parameters:**
- `days` - Number of days for trending (default: 30)

**Returns:**
```json
{
  "top_rated": [...],
  "most_reviewed": [...],
  "trending": [...]
}
```

---

## 🔑 KEY NOTES

### **Permissions:**
1. **Public endpoints** (no auth):
   - List restaurants (only active)
   - Get restaurant details
   - View menu items
   - View reviews
   - Make reservations

2. **Vendor-only endpoints** (requires authentication):
   - Create/Edit/Delete own restaurants
   - Manage menu items
   - Manage opening hours
   - View/manage reservations
   - Toggle open/closed status

3. **Permission class**: `IsVendorOwnerOrReadOnly`
   - Authenticated vendors can only edit their own resources
   - Everyone else has read-only access

### **Auto-set Fields:**
- `owner` - Automatically set to `request.user` on restaurant creation
- `vendor` - Required for menu items, hours, etc.

### **Filtering Logic:**
- **Authenticated vendors**: See only their own restaurants (all statuses)
- **Public users**: See only `is_active=True` restaurants
- **Open/Closed badges**: Shown on frontend, not filtered in API

### **Important Model Fields:**
- `is_active` - Whether restaurant is listed (soft delete)
- `is_open` - Current open/closed status (for today)
- `owner` - FK to User (vendor who owns this)

---

## 🎯 FRONTEND USAGE

**Current implementation in VendorDashboard:**
```typescript
// List restaurants (vendor sees only theirs)
GET /api/vendors/

// Create restaurant
POST /api/vendors/

// Update restaurant  
PUT /api/vendors/{id}/

// Delete restaurant
DELETE /api/vendors/{id}/

// Toggle open/closed
POST /api/vendors/{id}/toggle_status/
```

**Menu management** (separate component):
```typescript
// List menu items
GET /api/vendors/menu-items/

// Create menu item
POST /api/vendors/menu-items/

// Update menu item
PUT /api/vendors/menu-items/{id}/

// Delete menu item
DELETE /api/vendors/menu-items/{id}/
```

**Opening hours** (separate component):
```typescript
// Same pattern as menu items
GET/POST/PUT/DELETE /api/vendors/opening-hours/
```

---

## ✅ NO DUPLICATES FOUND

There is **ONE main ViewSet** for vendors: `VendorViewSet` in `backend/vendors/views.py`

It's registered in TWO places but refers to the SAME ViewSet:
1. `backend/vendors/urls.py` - Local app routing
2. `backend/api/urls.py` - Project-wide API routing

Both point to the same `VendorViewSet` class - **NO DUPLICATION** of logic.

The frontend should use: **`/api/vendors/`** for all restaurant CRUD operations.
