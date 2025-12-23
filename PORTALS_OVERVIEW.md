# Tourism Dashboard Portals Overview

## 📊 Complete Portal Feature Summary

### 🛡️ **ADMIN PORTAL** (`/pages/admin/AdminDashboard.tsx`)

**Role**: System administrator with full control
**Access**: Only users with `role: 'admin'`

#### **Features & Capabilities:**

1. **User Approvals** ✅
   - View pending vendor and stay owner registrations
   - Approve or reject new users
   - User details: username, email, role, join date
   - Approve button: Changes `is_approved` status
   - Reject button: Denies access

2. **Event Management** 📅
   - Create new events
   - Edit existing events
   - Delete events
   - Fields:
     - Title, description, location
     - Start date, end date
     - City, tags (multiple)
     - Image upload (base64)
     - **Recurring events**: daily, weekly, monthly, yearly
     - **Capacity management**: max_capacity
   - View all events across the platform

3. **Transport Management** 🚌
   - Create transport routes
   - Edit routes
   - Delete routes
   - Fields:
     - Route name
     - Transport type (bus, train, ferry, flight, etc.)
     - Departure/arrival locations
     - Duration (minutes)
     - Price
     - City

4. **Places Management** 📍
   - Full CRUD for tourism places/POIs
   - Managed in separate component: `PlacesManagement.tsx`
   - Create, edit, delete places
   - Categories, pricing, descriptions
   - GPS coordinates

#### **Admin Dashboard Tabs:**
```
📋 Approvals | 📅 Events | 🚌 Transport | 📍 Places
```

---

### 🏪 **VENDOR PORTAL** (`/pages/vendor/VendorDashboard.tsx`)

**Role**: Restaurant/food business owner
**Access**: Users with `role: 'vendor'` AND `is_approved: true`

#### **Features & Capabilities:**

1. **Restaurant Management** 🍽️
   - Create restaurants (only own restaurants)
   - Edit own restaurants
   - Delete own restaurants
   - **Rich Business Profile**:
     - Basic: Name, city, cuisines, description
     - Established year, price range ($$, $$$, etc.)
     - GPS coordinates (lat/lon)
     - Address, contact phone, email
     - Social media: Facebook, Instagram, TripAdvisor
     - Official website, Google Maps URL
     - Logo and cover image URLs
     - Gallery images (array)

2. **Amenities & Features** ✨
   - Parking, WiFi, wheelchair accessible
   - Outdoor seating, Halal certified
   - Non-smoking, live music, TV sports
   - Private events, delivery, takeaway
   - Reservations

3. **Menu Management** 📋 (Tab)
   - Managed via `MenuManagement` component
   - Add/edit/delete menu items
   - Categories, prices, descriptions
   - Dish images

4. **Opening Hours** ⏰ (Tab)
   - Managed via `OpeningHoursManagement` component
   - Set hours for each day
   - Special hours/holidays
   - Closed days

#### **Vendor Dashboard Tabs:**
```
🏪 Restaurants | 📋 Menu | ⏰ Opening Hours
```

#### **Key Features:**
- Vendors can **only see and manage their own restaurants**
- Multi-cuisine support (Italian, Chinese, Mexican, Indian, Japanese, etc.)
- Comprehensive business information
- Integration with booking platforms

---

### 🏨 **STAY OWNER PORTAL** (`/pages/stays/StayOwnerDashboard.tsx`)

**Role**: Hotel/accommodation owner
**Access**: Users with `role: 'stay_owner'` AND `is_approved: true`

#### **Features & Capabilities:**

1. **Accommodation Management** 🏨
   - Create accommodations (only own properties)
   - Edit own properties
   - Delete own properties
   - **Property Details**:
     - Name, type (Hotel, Apartment, Guest House, Homestay)
     - District/location
     - Price per night
     - GPS coordinates
     - Landmark reference
     - Distance from landmark (km)
     - Images (array)
     - Rating

2. **Amenities** ✨
   - WiFi, Parking, Pool
   - Gym, Breakfast, Air Conditioning
   - Kitchen, TV, Laundry
   - Pet Friendly

3. **Booking Integration** 🔗
   - Booking.com URL
   - Agoda URL
   - Booking provider selection
   - Contact details:
     - Email
     - Phone
     - WhatsApp

4. **Property Status** 📊
   - Active/inactive toggle
   - Owner information display

#### **Stay Owner Dashboard:**
```
🏨 My Accommodations (single tab/view)
```

#### **Key Features:**
- Stay owners can **only see and manage their own properties**
- Multiple property types supported
- Direct booking platform integration
- Rich amenity management

---

## 🔒 **ROLE-BASED ACCESS CONTROL (RBAC)**

### **Permission System:**

| Feature | Admin | Vendor | Stay Owner | Public |
|---------|-------|--------|------------|--------|
| Approve Users | ✅ | ❌ | ❌ | ❌ |
| Manage All Events | ✅ | ❌ | ❌ | ❌ |
| Manage Transport | ✅ | ❌ | ❌ | ❌ |
| Manage All Places | ✅ | ❌ | ❌ | ❌ |
| Manage Own Restaurant | ❌ | ✅ | ❌ | ❌ |
| View All Restaurants | ✅ | ❌ | ❌ | ✅ |
| Manage Own Accommodation | ❌ | ❌ | ✅ | ❌ |
| View All Accommodations | ✅ | ❌ | ❌ | ✅ |
| Register for Events | ✅ | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ❌ | ❌ | ✅ |

### **Approval Workflow:**
1. User registers with role selection (vendor/stay_owner)
2. Account created with `is_approved: false`
3. User sees "Pending Approval" message
4. Admin reviews in Approvals tab
5. Admin approves → `is_approved: true` → User gains access
6. Admin rejects → User cannot access portal

**Note**: Admins are auto-approved on creation

---

## 🎯 **COMMON FEATURES ACROSS PORTALS**

### **All Portals Include:**
- 🔐 Authentication check
- 👤 User profile display
- 🚪 Logout button
- 🏠 Home/Dashboard link
- 📊 Real-time data from API
- ✅ Toast notifications for actions
- 📱 Responsive design

### **UI Components Used:**
- `FormInput` - Custom input fields
- `FormSelect` - Dropdown selects
- `useAuth` - Authentication context
- `useApi` - API request hook
- Modal dialogs for create/edit
- Confirmation dialogs for delete
- Loading states

---

## 📁 **File Structure:**

```
frontend/src/pages/
├── admin/
│   ├── AdminDashboard.tsx       (Main admin portal - 1653 lines)
│   ├── EventManagement.tsx      (Event management helper)
│   ├── PlaceManagement.tsx      (Legacy)
│   └── PlacesManagement.tsx     (Active places management)
├── vendor/
│   ├── VendorDashboard.tsx      (Main vendor portal - 1219 lines)
│   └── VendorDashboardNew.tsx   (Alternative version)
└── stays/
    └── StayOwnerDashboard.tsx   (Main stay owner portal - 737 lines)
```

---

## 🔄 **Backend Integration:**

### **API Endpoints Used:**

**Admin:**
- `GET /api/auth/admin/users/pending/` - Pending approvals
- `POST /api/auth/admin/users/{id}/approve/` - Approve user
- `GET/POST/PUT/DELETE /api/events/` - Event CRUD
- `GET/POST/PUT/DELETE /api/transport/routes/` - Transport CRUD
- `GET/POST/PUT/DELETE /api/analytics/places/` - Places CRUD

**Vendor:**
- `GET /api/vendors/` - List own restaurants (filtered by owner)
- `POST /api/vendors/` - Create restaurant
- `PUT /api/vendors/{id}/` - Update restaurant
- `DELETE /api/vendors/{id}/` - Delete restaurant

**Stay Owner:**
- `GET /api/stays/` - List own accommodations (filtered by owner)
- `POST /api/stays/` - Create accommodation
- `PUT /api/stays/{id}/` - Update accommodation
- `DELETE /api/stays/{id}/` - Delete accommodation

---

## ✨ **Key Highlights:**

### **Admin Portal** is the most comprehensive:
- 4 major tabs (Approvals, Events, Transport, Places)
- 1653 lines of code
- Complete platform management
- User approval workflow

### **Vendor Portal** is business-focused:
- 3 tabs (Restaurants, Menu, Opening Hours)
- Rich business profile support
- Social media integration
- Menu and hours management

### **Stay Owner Portal** is streamlined:
- Single focused view
- Property management
- Booking platform integration
- Amenity management

---

## 🚀 **Recent Enhancements:**

### **Admin Portal - Events:**
- ✅ Recurring events (daily, weekly, monthly, yearly)
- ✅ Max capacity management
- ✅ Image upload support
- ✅ Auto-generation of recurring instances

### **Vendor Portal:**
- ✅ Comprehensive business profiles
- ✅ Amenities system
- ✅ Social media links
- ✅ Menu management component

### **Stay Owner Portal:**
- ✅ Multiple booking platform support
- ✅ Contact information fields
- ✅ Property type variety
- ✅ Amenity checklist

---

## 📝 **Notes:**

1. **Security**: All portals check user authentication and role
2. **Ownership**: Vendors and Stay Owners can only edit their own content
3. **Approval**: Vendors and Stay Owners need admin approval before accessing portal
4. **API**: All data syncs with Django backend via REST API
5. **Real-time**: Changes reflect immediately after successful API calls

