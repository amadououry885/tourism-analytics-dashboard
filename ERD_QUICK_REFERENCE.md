# Tourism Analytics Dashboard - Quick Reference Guide

## 📊 Complete ERD Summary

Generated comprehensive documentation files:
1. **ERD_COMPREHENSIVE.md** - Complete entity inventory with relationships
2. **ERD_PLANTUML.txt** - PlantUML diagram format (render on plantuml.com)
3. **SYSTEM_ARCHITECTURE_COMPLETE.md** - Full architecture report

---

## 🔑 Entity Quick Lookup

| Entity | App | Purpose | Key Fields | FK Relationships |
|--------|-----|---------|-----------|------------------|
| **User** | users | Auth & RBAC | email, role, is_approved | → Place, Event, Stay, Vendor |
| **Place** | analytics | Tourism attractions | name, category, city, lat/lon, amenities | ← User (created_by, owner)<br/>→ SocialPost |
| **SocialPost** | analytics | Social media + sentiment | platform, content, sentiment_score | ← Place, Vendor, Stay<br/>→ PostRaw/Clean |
| **Event** | events | Events & activities | title, start_date, max_capacity, recurring | ← User (created_by)<br/>→ EventRegistration, EventReminder<br/>→ Self (parent) |
| **EventRegistration** | events | Event attendees | user, event, status, form_data | ← User, Event |
| **EventRegistrationForm** | events | Custom form (1:1) | event, title, fields | ← EventRegistrationField |
| **EventRegistrationField** | events | Form fields | label, field_type, is_required | ← EventRegistrationForm |
| **EventReminder** | events | Reminders | user, event, reminder_time | ← User, Event |
| **Stay** | stays | Accommodations | name, type, district, price, is_internal | ← User (owner)<br/>→ StayImage<br/>← SocialPost |
| **StayImage** | stays | Multiple images | stay, image, is_primary | ← Stay |
| **Vendor** | vendors | Restaurants | name, city, cuisines, price_range | ← User (owner)<br/>→ MenuItem, OpeningHours, Review, Promotion, Reservation<br/>← SocialPost |
| **MenuItem** | vendors | Menu items | vendor, name, price, category | ← Vendor |
| **OpeningHours** | vendors | Operating hours | vendor, day_of_week, open_time | ← Vendor |
| **Review** | vendors | Customer reviews | vendor, rating, comment | ← Vendor |
| **Promotion** | vendors | Offers | vendor, title, discount_%, date range | ← Vendor |
| **Reservation** | vendors | Table bookings | vendor, customer, date, time, status | ← Vendor |
| **PostRaw** | analytics | Raw posts | post, content, metadata | ← SocialPost |
| **PostClean** | analytics | Processed posts (1:1) | raw_post, content, sentiment, keywords | ← PostRaw |
| **SentimentTopic** | analytics | Sentiment aggregation | topic, sentiment, count, date | Standalone |

---

## 🔐 Authentication & Roles

### User Roles (5 types)
```
admin           → Full system access, can create/approve resources
vendor          → Manages Vendor profile, menu, reviews (approval required)
stay_owner      → Manages Stay/accommodations (approval required)
place_owner     → Manages Place attractions (approval required)
(user)          → Regular user, can register for events
```

### Approval Workflow
```
User registers (role=vendor/stay_owner/place_owner)
    ↓
is_approved=False (auto)
    ↓
Admin reviews verification_document
    ↓
APPROVE → is_approved=True → User can edit resources
```

---

## 🗂️ Database Schema at a Glance

### Core Relationships
```
User (1) ──→ (N) Place (created_by OR owner)
User (1) ──→ (N) Event
User (1) ──→ (N) EventRegistration (registers)
User (1) ──→ (N) Stay (owner)
User (1) ──→ (N) Vendor (owner)

Event (1) ──→ (N) EventRegistration
Event (1) ──→ (N) EventReminder
Event (1) ←→ (1) EventRegistrationForm
Event (1) ──→ (N) EventRegistrationField (via form)

SocialPost (N) → (1) Place
SocialPost (N) → (1) Vendor
SocialPost (N) → (1) Stay

Vendor (1) ──→ (N) MenuItem
Vendor (1) ──→ (N) Review
Vendor (1) ──→ (N) OpeningHours
Vendor (1) ──→ (N) Promotion
Vendor (1) ──→ (N) Reservation

Stay (1) ──→ (N) StayImage
```

### Indexes (Performance)
- Place: (name), (city, state)
- SocialPost: (place, created_at), (created_at), unique(platform, post_id)
- Event: (city), (start_date), (recurrence_type)
- EventRegistration: (event, status), (user), (contact_email)
- Vendor: (city)
- MenuItem: (vendor, category), (is_available), (is_vegetarian), (is_halal)
- Reservation: (vendor, date), (status)
- Review: (vendor, date), (rating), (verified_visit)

---

## 📋 Field Types Reference

| Type | Description | Examples |
|------|-------------|----------|
| CharField | String field | username, name, city |
| TextField | Long text | description, address, content |
| EmailField | Email validation | contact_email, customer_email |
| URLField | URL validation | official_website, image_url |
| IntegerField | Whole numbers | rating (1-5), day_of_week (0-6) |
| DecimalField | Currency/prices | price (max_digits=8, decimal_places=2) |
| FloatField | Decimals | latitude, longitude, sentiment_score |
| BooleanField | True/False | is_active, is_free, is_halal |
| DateField | Date only | date, start_date, end_date |
| DateTimeField | Date + Time | created_at, registered_at, fetched_at |
| TimeField | Time only | open_time, close_time |
| ImageField | File upload | main_image, image (stays) |
| FileField | Any file | verification_document |
| JSONField | Flexible JSON | amenities, tags, gallery_images |
| ForeignKey | Link to entity | user_id, event_id, vendor_id |
| OneToOneField | Link 1:1 | event ↔ registration_form |
| Choice Field | Enum options | role, status, field_type |

---

## 🎯 Common Queries

### Get user's resources
```
Place.objects.filter(owner=user)
Event.objects.filter(created_by=user)
Stay.objects.filter(owner=user)
Vendor.objects.filter(owner=user)
EventRegistration.objects.filter(user=user)
```

### Get pending approvals
```
EventRegistration.objects.filter(event__requires_approval=True, status='pending')
User.objects.filter(role='vendor', is_approved=False)
```

### Get event registrations
```
Event.objects.get(id=1).registrations.filter(status='confirmed')
```

### Get social posts by sentiment
```
SocialPost.objects.filter(place_id=place_id, sentiment='positive')
```

### Get vendor's menu
```
Vendor.objects.get(id=1).menu_items.filter(is_available=True)
```

### Get today's reservations
```
Reservation.objects.filter(vendor=vendor, date=today(), status='confirmed')
```

---

## 🔄 Key Features by Entity

### Event Recurring
- `parent_event` (Self FK): Links instances to parent
- `recurrence_type`: none | daily | weekly | monthly | yearly
- Auto-generates future instances via `generate_recurring_instances()`
- Each instance: `is_recurring_instance=True, recurrence_type='none'`

### Event Registration
- Custom forms: Each event has optional `EventRegistrationForm`
- Form responses stored in `form_data` (JSONField)
- Guest registrations: `user_id=NULL` (if `allow_guest_registration=True`)
- Approval workflow: Status can be `pending` → `confirmed/rejected`

### Social Posts
- Multi-entity linkage: Can link to Place OR Vendor OR Stay
- Unique constraint on (platform, post_id) prevents duplication
- Sentiment: AI-classified as positive/negative/neutral
- Confidence: 0-100% AI confidence score

### Stay Hybrid Model
- `is_internal=True`: Direct booking (contact email/phone)
- `is_internal=False`: Affiliate booking (Booking.com, Agoda URLs)
- Multi-image support: `StayImage` model with `is_primary` flag

### Vendor Review System
- Reviews for restaurants ONLY (not places or stays yet)
- Sub-ratings: food, service, ambience, value
- Verified visit flag for credibility

---

## 💾 JSON Fields (Flexible Storage)

### amenities (Place, Vendor)
```python
{
  "parking": True,
  "wifi": True,
  "wheelchair_accessible": False,
  "restaurant": True,
  "restroom": True,
  ...
}
```

### tags (Event)
```python
["Culture", "Family", "Adventure", "Budget-Friendly"]
```

### gallery_images (Vendor, Stay)
```python
[
  "https://example.com/img1.jpg",
  "https://example.com/img2.jpg",
  "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
]
```

### form_data (EventRegistration)
```python
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+601234567890",
  "dietary_preference": "vegetarian",
  "number_of_guests": 4,
  "custom_field": "value"
}
```

### extra (SocialPost)
```python
{
  "hashtags": ["#tourism", "#malaysia"],
  "language": "en",
  "keywords": ["attractions", "family"],
  "engagement_rate": 0.08
}
```

---

## 🚀 API Structure

### Auth (`/api/auth/`)
- POST /register, /login, /token/refresh
- GET /me, /admin/users/pending/
- POST /admin/users/{id}/approve/

### Places (`/api/places/`)
- CRUD operations with owner filtering
- Indexed by name, city, state
- Linked to social posts

### Events (`/api/events/`)
- CRUD operations
- `/events/{id}/registrations/` - attendees
- `/events/{id}/registration-form/` - custom form schema
- Recurring instances auto-generated

### Vendors (`/api/vendors/`)
- CRUD operations with owner filtering
- `/vendors/{id}/menu-items/` - menu management
- `/vendors/{id}/reviews/` - create review
- `/vendors/{id}/reservations/` - table booking

### Stays (`/api/stays/`)
- CRUD operations with owner filtering
- `/stays/{id}/images/` - multi-image support
- Hybrid search (internal + affiliate)

### Analytics (`/api/analytics/`)
- `/overview-metrics/` - KPIs
- `/places/popular/` - top attractions
- `/social-engagement/` - sentiment metrics
- `/sentiment/summary/` - trends

---

## ⚠️ Important Notes

### Nullable FKs
- `Place.created_by` (nullable) - allows places without creator
- `Place.owner` (nullable) - allows council-managed places
- `User.user` in EventRegistration (nullable) - allows guest registrations
- `SocialPost.place/vendor/stay` (all nullable) - multi-entity support

### Image Handling
- URL support: "https://example.com/image.jpg"
- Base64 support: "data:image/jpeg;base64,..." 
- Both supported in `image_url`, `cover_image_url`, `gallery_images`

### Multi-Entity Events
- `SocialPost` can link to Place OR Vendor OR Stay (all optional)
- Not required to link to any (filtered by `is_tourism` instead)

### Constraints
- Unique: `(SocialPost.platform, SocialPost.post_id)` - no duplicate posts
- Unique: `(EventReminder.user, EventReminder.event, EventReminder.reminder_time)` - one reminder per type per user

### Date/Time Zones
- All DateTimes stored in UTC
- Timezone-aware in Django settings: `USE_TZ = True`

---

## 📈 Scalability Considerations

### Current Indexes
Good for typical operations on ~100K records per entity.

### Potential Additions (As You Scale)
- `(User.role)` - for role-based queries
- `(Place.is_active)` - for filtering inactive places
- `(Event.is_published)` - for visibility filtering
- `(Vendor.is_open)` - for operational status
- `(SocialPost.sentiment, SocialPost.created_at)` - for sentiment dashboards
- `(EventRegistration.status)` - for status-specific queries

### JSONField Considerations
- Queries on JSONField are slower (use filters sparingly)
- Cannot index JSONField values directly in SQLite
- Consider denormalizing for frequently searched fields

---

## 🔗 How to Navigate the Files

1. **Start Here:** `SYSTEM_ARCHITECTURE_COMPLETE.md` (this report)
2. **Visual Diagram:** `ERD_PLANTUML.txt` (render on plantuml.com)
3. **Detailed Specs:** `ERD_COMPREHENSIVE.md` (complete field-by-field breakdown)
4. **Code Reference:** Look in `/backend/<app_name>/models.py` for source truth

---

## ✅ Verification Checklist

- [x] 24 entities documented
- [x] All FK relationships mapped
- [x] Role-based access control documented
- [x] Approval workflows documented
- [x] JSONField patterns documented
- [x] Index strategy documented
- [x] API endpoints documented
- [x] Future enhancements identified
- [x] PlantUML format provided for rendering

---

**Documentation Complete:** All system architecture documented and available for design, implementation, and review.

**Next Steps (if needed):**
1. Generate Place reviews feature (currently only Vendor reviews exist)
2. Add Transport/Route models
3. Implement payment transaction tracking
4. Add real-time notification system
5. Build recommendation engine

