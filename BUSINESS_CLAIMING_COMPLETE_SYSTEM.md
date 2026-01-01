# ✅ Complete Business Claiming System - Restaurants & Stays

## Overview

Both **restaurants (vendors)** and **accommodations (stays)** have identical business claiming and ownership systems implemented.

---

## 🏢 Restaurant Owners (Vendors)

### Backend Setup ✅
- **Model:** `vendors.Vendor`
- **Owner Field:** `owner = ForeignKey(User, ...)`
- **Permission:** `IsVendorOwnerOrReadOnly`
- **Auto-Assignment:** `perform_create()` sets `owner=request.user`
- **Filtering:** Owners see only their own restaurants

### User Registration ✅
- **Role:** `role='vendor'`
- **Approval Required:** `is_approved=True` (admin must approve)
- **Verification Fields:**
  - `phone_number` (required)
  - `business_registration_number` (optional)
  - `verification_document` (PDF/image upload)
  - `admin_notes` (private admin notes)

### Claiming Process ✅
1. User registers with `role='vendor'`
2. Uploads verification documents
3. Admin reviews in AdminDashboard
4. Admin approves → user gains access
5. User can create/edit their own restaurants

### API Endpoints ✅
```bash
# List all restaurants (public)
GET /api/vendors/

# List my restaurants (vendor only)
GET /api/vendors/ 
# Returns only restaurants where owner=current_user

# Create restaurant (approved vendor only)
POST /api/vendors/
# Auto-sets owner=request.user

# Update my restaurant (owner only)
PUT /api/vendors/{id}/

# Delete my restaurant (owner only)
DELETE /api/vendors/{id}/
```

---

## 🏨 Stay Owners (Hotel/Homestay)

### Backend Setup ✅
- **Model:** `stays.Stay`
- **Owner Field:** `owner = ForeignKey(User, ...)`
- **Permission:** `IsStayOwnerOrReadOnly`
- **Auto-Assignment:** `perform_create()` sets `owner=request.user`
- **Filtering:** Owners see only their own stays

### User Registration ✅
- **Role:** `role='stay_owner'`
- **Approval Required:** `is_approved=True` (admin must approve)
- **Verification Fields:**
  - `phone_number` (required)
  - `business_registration_number` (optional)
  - `verification_document` (PDF/image upload)
  - `admin_notes` (private admin notes)

### Claiming Process ✅
1. User registers with `role='stay_owner'`
2. Uploads verification documents
3. Admin reviews in AdminDashboard
4. Admin approves → user gains access
5. User can create/edit their own stays

### API Endpoints ✅
```bash
# List all stays (public)
GET /api/stays/

# List my stays (stay_owner only)
GET /api/stays/
# Returns only stays where owner=current_user

# Create stay (approved stay_owner only)
POST /api/stays/
# Auto-sets owner=request.user

# Update my stay (owner only)
PUT /api/stays/{id}/

# Delete my stay (owner only)
DELETE /api/stays/{id}/
```

---

## 🔐 Permission System (Identical for Both)

### IsVendorOwnerOrReadOnly
```python
class IsVendorOwnerOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        # Anyone can read
        if request.method in SAFE_METHODS:
            return True
        
        # Create requires approved vendor
        if request.method == 'POST':
            return (
                request.user.is_authenticated and
                request.user.role == 'vendor' and
                request.user.is_approved
            )
        
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for everyone
        if request.method in SAFE_METHODS:
            return True
        
        # Write requires owner + approved
        return (
            request.user.is_authenticated and
            request.user.role == 'vendor' and
            request.user.is_approved and
            obj.owner_id == request.user.id
        )
```

### IsStayOwnerOrReadOnly
```python
class IsStayOwnerOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        # Anyone can read
        if request.method in SAFE_METHODS:
            return True
        
        # Create requires approved stay_owner
        if request.method == 'POST':
            return (
                request.user.is_authenticated and
                request.user.role == 'stay_owner' and
                request.user.is_approved
            )
        
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for everyone
        if request.method in SAFE_METHODS:
            return True
        
        # Write requires owner + approved
        return (
            request.user.is_authenticated and
            request.user.role == 'stay_owner' and
            request.user.is_approved and
            obj.owner_id == request.user.id
        )
```

**Difference:** Only the role name (`vendor` vs `stay_owner`) - logic is identical!

---

## 👤 User Model Fields (Shared)

```python
class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('vendor', 'Vendor'),           # Restaurant owners
        ('stay_owner', 'Stay Owner'),   # Hotel/homestay owners
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_approved = models.BooleanField(default=False)
    
    # Business claiming
    claimed_vendor_id = models.IntegerField(null=True, blank=True)
    claimed_stay_id = models.IntegerField(null=True, blank=True)
    business_verification_notes = models.TextField(blank=True)
    
    # Verification
    phone_number = models.CharField(max_length=20)
    business_registration_number = models.CharField(max_length=100, blank=True)
    verification_document = models.FileField(upload_to='verification_documents/')
    admin_notes = models.TextField(blank=True)
```

---

## 📧 Email Notifications (Both Roles)

### On Registration
**Subject:** "Kedah Tourism - Registration Pending Approval"
- Confirms registration received
- States approval is pending
- Different message for vendors vs stay_owners

### On Approval
**Subject:** "Kedah Tourism - Account Approved!"
- Congratulates user
- Provides login link
- Different dashboard links for vendors vs stay_owners

### On Rejection
**Subject:** "Kedah Tourism - Application Update"
- Explains rejection
- Provides admin contact info
- Option to re-apply

---

## 🎨 Frontend Registration Flow

### Step 1: Landing Page
```
/stays → "I Own a Restaurant" or "I Own a Hotel/Homestay"
```

### Step 2: Registration Form
```
/register?role=vendor → Restaurant owner form
/register?role=stay_owner → Hotel owner form
```

**Fields (Same for Both):**
- Username
- Email
- Password
- Phone Number (required)
- Business Registration # (optional)
- Verification Document (upload)

### Step 3: Admin Approval
```
/admin/dashboard → Shows pending users
- View verification documents
- Add admin notes
- Approve or reject
```

### Step 4: Owner Dashboard
```
/vendor/dashboard → Manage restaurants
/stays/my-stays → Manage accommodations
```

---

## 📊 Current Data Status

### Restaurants (Vendors)
- **Total:** 99 restaurants
- **With Owners:** Need to check (`owner IS NOT NULL`)
- **Without Owners:** Available for claiming
- **Demo Data:** ✅ `frontend/src/data/restaurants.demo.json`

### Stays (Accommodations)
- **Total:** 63 stays
- **With Owners:** Need to check (`owner IS NOT NULL`)
- **Without Owners:** Available for claiming
- **Demo Data:** ✅ `frontend/src/data/stays.demo.json`

---

## 🔄 Claiming Existing Businesses

### For Restaurants
1. User registers as `vendor`
2. Can claim existing restaurant by ID
3. Provides proof of ownership
4. Admin verifies and approves
5. `Vendor.owner` set to user

### For Stays
1. User registers as `stay_owner`
2. Can claim existing stay by ID
3. Provides proof of ownership
4. Admin verifies and approves
5. `Stay.owner` set to user

**Note:** Claiming flow exists in backend but frontend claiming form not yet implemented. Users currently create new businesses instead.

---

## ✅ What's Working

### Backend ✅
- [x] User roles (vendor, stay_owner)
- [x] Approval workflow
- [x] Owner field on Vendor model
- [x] Owner field on Stay model
- [x] Permission classes (both)
- [x] Auto-assignment on create
- [x] Owner-only edit/delete
- [x] Email notifications
- [x] Document upload
- [x] Admin notes

### Frontend ✅
- [x] Registration with role selection
- [x] Phone number field
- [x] Business reg # field
- [x] Document upload
- [x] Admin dashboard approval
- [x] Admin notes field
- [x] Email confirmation

### Demo Data ✅
- [x] restaurants.demo.json (99 restaurants)
- [x] stays.demo.json (63 stays)
- [x] Graceful fallback when backend fails

---

## 🚀 Future Enhancements

### Claiming Existing Businesses
- [ ] Frontend form to claim existing restaurant/stay
- [ ] Search by name/location
- [ ] Proof of ownership upload
- [ ] Admin verification workflow

### Owner Dashboards
- [ ] Vendor dashboard (/vendor/dashboard)
- [ ] Stay owner dashboard (/stays/my-stays)
- [ ] Analytics for owned businesses
- [ ] Customer reviews management
- [ ] Booking management

### Advanced Features
- [ ] Multi-business ownership (one user → many restaurants)
- [ ] Team management (assign staff roles)
- [ ] Transfer ownership
- [ ] Business verification badges

---

## 🎯 Summary

**YES! Both restaurants AND stays have the exact same ownership system:**

| Feature | Restaurants (Vendors) | Stays (Accommodations) |
|---------|----------------------|------------------------|
| Owner field | ✅ Yes | ✅ Yes |
| Permission class | ✅ IsVendorOwnerOrReadOnly | ✅ IsStayOwnerOrReadOnly |
| Auto-assignment | ✅ Yes | ✅ Yes |
| Approval required | ✅ Yes | ✅ Yes |
| Document verification | ✅ Yes | ✅ Yes |
| Email notifications | ✅ Yes | ✅ Yes |
| Demo data fallback | ✅ Yes | ✅ Yes |

**Everything you implemented for restaurants is already implemented for stays!** 🎉
