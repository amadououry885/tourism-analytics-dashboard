# Tourism Analytics Dashboard - Complete System Architecture Report

**Generated:** 2024 | **Status:** Complete ERD Audit & Documentation

---

## Executive Summary

The Tourism Analytics Dashboard is a full-stack tourism intelligence platform built with:
- **Frontend:** React + TypeScript + Vite
- **Backend:** Django REST Framework + SQLite
- **Architecture:** Hybrid data pattern with demo/fallback data + live API integration
- **Database:** 24 core entities across 5 Django apps

### System At A Glance
```
┌─────────────────────────────────────────────────┐
│         Tourism Analytics Dashboard             │
├──────────────────┬──────────────────────────────┤
│  Frontend        │  Backend                     │
│  React + TS      │  Django REST + SQLite       │
│  Port 3000       │  Port 8000                  │
│  Vite Dev        │  Debug/Production           │
└──────────────────┴──────────────────────────────┘

Users (Auth & RBAC)
    ↓
    ├─→ Places (Tourism Attractions)
    ├─→ Events (Activities & Registrations)
    ├─→ Stays (Accommodations)
    ├─→ Vendors (Restaurants & Food)
    └─→ SocialPosts (Sentiment Analysis)
```

---

## Complete Entity Reference

### 1. **User** (users.User)
**Purpose:** Authentication, authorization, business ownership tracking

**Attributes:**
| Attribute | Type | Notes |
|-----------|------|-------|
| id | PK | Django auto-increment |
| email | String | Unique, for login |
| username | String | Unique |
| first_name | String | Optional |
| last_name | String | Optional |
| **role** | Choice | `admin` \| `vendor` \| `stay_owner` \| `place_owner` |
| is_approved | Boolean | Admin approval required for vendors/owners |
| is_active | Boolean | Account status |
| is_staff | Boolean | Django admin access |
| claimed_vendor_id | Int (nullable) | Claimed restaurant ownership |
| claimed_stay_id | Int (nullable) | Claimed accommodation ownership |
| claimed_place_id | Int (nullable) | Claimed place ownership |
| phone_number | String | Business contact |
| business_registration_number | String | Verification field |
| verification_document | File | Upload proof of ownership |
| admin_notes | Text | Internal notes for admins |
| business_verification_notes | Text | Verification tracking |
| created_at | DateTime | Account creation |
| updated_at | DateTime | Last modification |

**Relationships:**
- 1→N: Creates Places (as admin)
- 1→N: Owns Places (as place_owner)
- 1→N: Creates Events (as admin)
- 1→N: Registers for Events
- 1→N: Reviews EventRegistrations (as admin)
- 1→N: Sets EventReminders
- 1→N: Owns Stays
- 1→N: Owns Vendors

---

### 2. **Place** (analytics.Place)
**Purpose:** Tourism destinations, attractions, POIs

**Attributes:**
| Attribute | Type | Notes |
|-----------|------|-------|
| id | PK | |
| name | String | Attraction name |
| description | Text | About the place |
| category | String | Type: Museum, Temple, Beach, etc. |
| city | String | Location (indexed) |
| state | String | Region/Province |
| country | String | Country |
| latitude | Float (nullable) | GPS coordinate |
| longitude | Float (nullable) | GPS coordinate |
| is_free | Boolean | Free or paid admission |
| price | Decimal (nullable) | Admission fee in currency |
| currency | String | Currency code (default MYR) |
| image_url | Text | URL or Base64 data URL |
| wikipedia_url | URL | External reference |
| official_website | URL | Tourism board link |
| tripadvisor_url | URL | Review platform link |
| google_maps_url | URL | Navigation link |
| contact_phone | String | Information hotline |
| contact_email | Email | Inquiry email |
| address | Text | Full physical address |
| opening_hours | Text | Operating hours (e.g., "9AM-6PM Mon-Fri") |
| best_time_to_visit | String | Seasonal recommendation |
| is_open | Boolean | Currently operational |
| amenities | JSONField | {parking: true, wifi: false, wheelchair: true, ...} |
| created_by_id | FK (User, nullable) | Admin who created |
| owner_id | FK (User, nullable) | Private owner (non-council) |
| is_council_managed | Boolean | True=government, False=private |
| is_active | Boolean | Visible on platform |

**Indexes:**
- (name) - for search
- (city, state) - for geographic filtering

**Relationships:**
- N→1: created_by User (admin)
- N→1: owner User (private owner)
- 1→N: Linked to SocialPosts (reverse: posts)

---

### 3. **SocialPost** (analytics.SocialPost)
**Purpose:** Scraped social media posts with AI sentiment analysis

**Attributes:**
| Attribute | Type | Notes |
|-----------|------|-------|
| id | PK | |
| platform | String | "instagram", "twitter", "tiktok", etc. |
| post_id | String | Platform's unique post ID |
| url | URL | Direct link to post |
| content | Text | Post caption/body |
| created_at | DateTime | When post was published |
| fetched_at | DateTime | When we ingested it (auto) |
| likes | Integer | Engagement metric |
| comments | Integer | Engagement metric |
| shares | Integer | Engagement metric |
| views | Integer | Engagement metric |
| **sentiment** | Choice | `positive` \| `negative` \| `neutral` |
| sentiment_score | Float | Range: -1.0 (very negative) to +1.0 (very positive) |
| confidence | Float | AI classification confidence (0-100%) |
| is_tourism | Boolean | Filtered for tourism relevance |
| extra | JSONField | {hashtags: [], language: "en", keywords: []} |
| place_id | FK (Place, nullable) | Linked attraction |
| vendor_id | FK (Vendor, nullable) | Linked restaurant |
| stay_id | FK (Stay, nullable) | Linked accommodation |

**Constraints:**
- Unique: (platform, post_id) - prevents duplicate ingestion

**Indexes:**
- (place, created_at) - for range queries
- (created_at) - for timeline views
- (vendor) - for vendor sentiment dashboards
- (stay) - for accommodation sentiment

**Relationships:**
- N→1: place (optional)
- N→1: vendor (optional)
- N→1: stay (optional)
- 1→N: Has PostRaw (raw data)

---

### 4. **PostRaw & PostClean** (analytics.PostRaw, PostClean)
**Purpose:** Two-stage post processing pipeline (raw → cleaned)

**PostRaw:**
- Stores unprocessed scraped content
- FK to SocialPost
- Metadata JSONField for raw platform data

**PostClean (1:1 with PostRaw):**
- Processed, normalized post
- Sentiment classification applied
- Keywords extracted
- Linked to Place for categorization

---

### 5. **SentimentTopic** (analytics.SentimentTopic)
**Purpose:** Aggregated sentiment trends by topic/date

**Attributes:**
- topic (String): "Cleanliness", "Food Quality", "Service", etc.
- sentiment (Choice): positive | neutral | negative
- count (Integer): How many posts about this topic
- category (String): "Attractions", "Food", "Transport"
- date (Date): Aggregation date

---

### 6. **Event** (events.Event)
**Purpose:** Events, conferences, activities with recurring support and custom registration forms

**Attributes:**
| Attribute | Type | Notes |
|-----------|------|-------|
| id | PK | |
| title | String | Event name |
| description | Text | Event details |
| tags | JSONField | ["Culture", "Family", "Adventure"] |
| start_date | DateTime | Event begins |
| end_date | DateTime (nullable) | Event ends (NULL for single-day) |
| location_name | String | Venue name |
| city | String | City (indexed) |
| lat | Float (nullable) | Venue GPS latitude |
| lon | Float (nullable) | Venue GPS longitude |
| expected_attendance | Int (nullable) | Projected attendees |
| actual_attendance | Int (nullable) | Recorded attendance (past events) |
| max_capacity | Int (nullable) | Capacity limit (NULL = unlimited) |
| image_url | Text | Base64 or URL |
| is_published | Boolean | Visible to public |
| **recurrence_type** | Choice | `none` \| `daily` \| `weekly` \| `monthly` \| `yearly` |
| recurrence_end_date | Date (nullable) | Stop recurring after this |
| parent_event_id | FK (Self, nullable) | Reference to parent event (for instances) |
| is_recurring_instance | Boolean | True if auto-generated from parent |
| requires_approval | Boolean | Registrations need admin review |
| approval_message | Text | Message shown to pending users |
| registration_form_config | JSONField | Custom field definitions (deprecated in favor of EventRegistrationForm) |
| created_by_id | FK (User, nullable) | Admin who created |

**Indexes:**
- (city) - for location-based search
- (start_date) - for timeline queries
- (recurrence_type) - for recurring event filtering

**Methods:**
- `generate_recurring_instances(count=12)` - Auto-generates future instances
- `is_user_registered(user)` - Checks registration status
- `get_nearby_stays(radius_km=10)` - Finds accommodations nearby
- `get_nearby_restaurants(radius_km=5)` - Finds vendors nearby
- `get_affiliate_urls()` - Generates Booking.com, Agoda links

**Relationships:**
- N→1: created_by User
- 1→N: Registrations (EventRegistration)
- 1→N: Reminders (EventReminder)
- 1→1: Registration form (EventRegistrationForm)
- Self-referential: parent_event (for recurring)

---

### 7. **EventRegistration** (events.EventRegistration)
**Purpose:** Tracks event attendees and registrations with approval workflow

**Attributes:**
| Attribute | Type | Notes |
|-----------|------|-------|
| id | PK | |
| user_id | FK (User, nullable) | Registered user (NULL for guests) |
| event_id | FK (Event) | Which event |
| **status** | Choice | `pending` \| `confirmed` \| `rejected` \| `cancelled` \| `waitlist` |
| form_data | JSONField | User's form responses {"name": "John", "email": "...} |
| contact_name | String | Extracted from form |
| contact_email | String | Extracted from form (CharField for flexibility) |
| contact_phone | String | Extracted from form |
| admin_notes | Text | Notes from approval review |
| reviewed_by_id | FK (User, nullable) | Admin who approved/rejected |
| reviewed_at | DateTime (nullable) | When reviewed |
| registered_at | DateTime | Registration timestamp |
| updated_at | DateTime | Last update |

**Indexes:**
- (event, status) - for approval workflow queries
- (user) - for user's registrations
- (contact_email) - for contact lookups

**Relationships:**
- N→1: user (nullable, for guests)
- N→1: event
- N→1: reviewed_by (admin)

---

### 8. **EventRegistrationForm** (events.EventRegistrationForm)
**Purpose:** Defines custom registration form for an event (1:1 with Event)

**Attributes:**
- event_id (FK, 1-1): Which event
- title (String): Form title shown to users
- description (Text): Instructions/welcome message
- confirmation_message (Text): "Thank you for registering!" message
- allow_guest_registration (Boolean): Allow unlogged users
- created_at (DateTime)
- updated_at (DateTime)

**Relationships:**
- 1→1: event
- 1→N: fields (EventRegistrationField)

---

### 9. **EventRegistrationField** (events.EventRegistrationField)
**Purpose:** Individual fields in a registration form

**Attributes:**
| Attribute | Type | Notes |
|-----------|------|-------|
| id | PK | |
| form_id | FK (EventRegistrationForm) | Which form |
| label | String | "Full Name", "Email Address", etc. |
| **field_type** | Choice | text \| textarea \| email \| phone \| number \| date \| dropdown \| checkbox \| radio |
| is_required | Boolean | Mandatory field? |
| placeholder | String | "Enter your email..." |
| help_text | String | Additional instructions |
| options | JSONField (List) | ["Option1", "Option2"] (for dropdown/radio/checkbox) |
| order | Integer | Display order (lower = first) |
| min_length | Int (nullable) | Validation constraint |
| max_length | Int (nullable) | Validation constraint |
| pattern | String (nullable) | Regex validation pattern |
| created_at | DateTime | |

**Indexes:**
- (form, order) - for form rendering

---

### 10. **EventReminder** (events.EventReminder)
**Purpose:** Automatic reminders for registered users

**Attributes:**
- id (PK)
- user_id (FK): User to remind
- event_id (FK): Which event
- reminder_time (Choice): `1_week` | `1_day` | `1_hour`
- is_sent (Boolean): Already sent?
- sent_at (DateTime, nullable): When sent
- created_at (DateTime)

**Constraints:**
- Unique: (user_id, event_id, reminder_time) - one reminder per type

**Indexes:**
- (event, is_sent) - for bulk reminder sending

---

### 11. **Stay** (stays.Stay)
**Purpose:** Accommodations (hotels, apartments, guest houses, homestays)

**Attributes:**
| Attribute | Type | Notes |
|-----------|------|-------|
| id | PK | |
| name | String | Property name |
| **type** | Choice | Hotel \| Apartment \| Guest House \| Homestay |
| district | String | Location (indexed) |
| landmark | String | Nearby landmark |
| rating | Decimal (nullable) | 0-10 rating |
| priceNight | Decimal | Nightly rate in MYR |
| amenities | JSONField (List) | ["WiFi", "Parking", "Pool"] |
| images | JSONField (List) | Array of image URLs |
| lat | Float (nullable) | GPS latitude |
| lon | Float (nullable) | GPS longitude |
| distanceKm | Decimal (nullable) | From city center |
| is_active | Boolean | Active on platform |
| is_open | Boolean | Currently accepting bookings |
| **is_internal** | Boolean | True=platform owner, False=affiliate |
| contact_email | Email (nullable) | For direct booking |
| contact_phone | String (nullable) | For direct booking |
| contact_whatsapp | String (nullable) | WhatsApp for direct booking |
| booking_com_url | URL (nullable) | External booking link |
| agoda_url | URL (nullable) | External booking link |
| **booking_provider** | Choice | booking.com \| agoda \| both \| direct |
| main_image_id | ImageField (nullable) | Primary display image |
| owner_id | FK (User, nullable) | Owner for internal stays |

**Hybrid Model:**
- `is_internal=True` → Use contact_email, contact_phone, contact_whatsapp
- `is_internal=False` → Use booking_com_url, agoda_url

**Relationships:**
- N→1: owner (User, optional)
- 1→N: stay_images (StayImage)
- 1→N: social_posts (SocialPost, reverse)

---

### 12. **StayImage** (stays.StayImage)
**Purpose:** Multiple images per stay

**Attributes:**
- id (PK)
- stay_id (FK): Which stay
- image (ImageField): Actual image file
- caption (String): Image description
- is_primary (Boolean): Main display image (only one per stay)
- order (Integer): Display order
- uploaded_at (DateTime): Auto timestamp

**Ordering:** -is_primary, order, -uploaded_at (primary first)

---

### 13. **Vendor** (vendors.Vendor)
**Purpose:** Restaurants and food businesses

**Attributes:**
| Attribute | Type | Notes |
|-----------|------|-------|
| id | PK | |
| name | String | Restaurant name |
| city | String | Location (indexed) |
| cuisines | JSONField (List) | ["Malaysian", "Chinese", "Italian"] |
| description | Text | About the restaurant |
| established_year | Int (nullable) | Year founded |
| lat | Float (nullable) | GPS latitude |
| lon | Float (nullable) | GPS longitude |
| address | Text | Full street address |
| **price_range** | Choice | $ (Budget) \| $$ (Moderate) \| $$$ (Upscale) \| $$$$ (Fine Dining) |
| contact_phone | String | Contact number |
| contact_email | Email | Inquiry email |
| official_website | URL | Restaurant website |
| facebook_url | URL | Facebook page |
| instagram_url | URL | Instagram profile |
| tripadvisor_url | URL | TripAdvisor listing |
| google_maps_url | URL | Google Maps |
| logo_url | URL | Restaurant logo |
| cover_image_url | URL | Banner image |
| gallery_images | JSONField (List) | Photo gallery URLs |
| amenities | JSONField | {parking: true, wifi: true, wheelchair: false, ...} |
| delivery_available | Boolean | Offers delivery |
| takeaway_available | Boolean | Offers takeaway |
| reservation_required | Boolean | Booking required |
| dress_code | String | "Casual", "Smart Casual", "Formal" |
| is_halal | Boolean | Halal certified |
| is_open | Boolean | Currently operational |
| is_active | Boolean | Active on platform |
| created_at | DateTime | |
| updated_at | DateTime | |
| owner_id | FK (User, nullable) | Vendor owner user |

**Indexes:**
- (city) - for location-based search

**Relationships:**
- N→1: owner (User, optional)
- 1→N: menu_items (MenuItem)
- 1→N: opening_hours (OpeningHours)
- 1→N: reviews (Review)
- 1→N: promotions (Promotion)
- 1→N: reservations (Reservation)
- 1→N: social_posts (SocialPost, reverse)

---

### 14. **MenuItem** (vendors.MenuItem)
**Purpose:** Food and beverage items on a vendor's menu

**Attributes:**
| Attribute | Type | Notes |
|-----------|------|-------|
| id | PK | |
| vendor_id | FK | Which restaurant |
| name | String | Dish name |
| description | Text | Ingredients, preparation |
| category | String | "Main Course", "Dessert", "Beverage" |
| price | Decimal | Item price |
| currency | String | Currency code (default MYR) |
| is_available | Boolean | Currently available |
| is_vegetarian | Boolean | Dietary info |
| is_halal | Boolean | Halal certified |
| spiciness_level | Int | 0-5 scale |
| allergens | JSONField (List) | ["Peanuts", "Shellfish"] |
| image_url | URL | Photo of dish |

**Indexes:**
- (vendor, category) - for menu browsing
- (is_available) - for availability filtering
- (is_vegetarian, is_halal) - for dietary filtering

---

### 15. **OpeningHours** (vendors.OpeningHours)
**Purpose:** Daily operating hours for a vendor

**Attributes:**
- id (PK)
- vendor_id (FK): Which restaurant
- day_of_week (Int): 0=Monday, 6=Sunday
- open_time (Time): Opening time
- close_time (Time): Closing time
- is_closed (Boolean): Closed on this day

**Indexes:**
- (vendor, day_of_week) - for schedule lookup

---

### 16. **Review** (vendors.Review)
**Purpose:** Customer reviews for vendors (restaurants)

**Attributes:**
| Attribute | Type | Notes |
|-----------|------|-------|
| id | PK | |
| vendor_id | FK | Which restaurant |
| rating | Int | Overall: 1-5 stars |
| comment | Text | Review text |
| author_name | String | Reviewer name |
| date | DateTime | Review date (auto) |
| verified_visit | Boolean | Verified purchase |
| food_rating | Int (nullable) | 1-5 for food |
| service_rating | Int (nullable) | 1-5 for service |
| ambience_rating | Int (nullable) | 1-5 for ambience |
| value_rating | Int (nullable) | 1-5 for value |

**Indexes:**
- (vendor, date) - for review timeline
- (rating) - for rating aggregation
- (verified_visit) - for filtering verified reviews

**Note:** Reviews are for VENDORS only, NOT for Places. To add Place reviews, create a `Place.Review` model with similar structure.

---

### 17. **Promotion** (vendors.Promotion)
**Purpose:** Special offers and promotional discounts

**Attributes:**
| Attribute | Type | Notes |
|-----------|------|-------|
| id | PK | |
| vendor_id | FK | Which restaurant |
| title | String | Promotion name: "Happy Hour", "Buy 1 Get 1" |
| description | Text | Details |
| start_date | Date | Campaign start |
| end_date | Date | Campaign end |
| discount_percentage | Int (nullable) | e.g., 20 for 20% off |
| discount_amount | Decimal (nullable) | e.g., 10.00 RM off |
| promo_code | String | Coupon code |
| is_active | Boolean | Active promotion |

**Indexes:**
- (vendor, start_date, end_date) - for active promotion lookup
- (is_active) - for active promotion filtering

---

### 18. **Reservation** (vendors.Reservation)
**Purpose:** Table booking requests

**Attributes:**
| Attribute | Type | Notes |
|-----------|------|-------|
| id | PK | |
| vendor_id | FK | Which restaurant |
| customer_name | String | Guest name |
| customer_email | Email | Contact email |
| customer_phone | String | Contact phone |
| date | Date | Booking date |
| time | Time | Booking time |
| party_size | Int | Number of guests |
| special_requests | Text | "Window seat", "Quiet table", etc. |
| **status** | Choice | pending \| confirmed \| cancelled \| completed |

**Indexes:**
- (vendor, date) - for checking availability
- (status) - for reservation management

---

## Relationship Map Summary

### Entity Count
- **Total Entities:** 24
- **Core Entities:** 6 (User, Place, SocialPost, Event, Stay, Vendor)
- **Support Entities:** 18 (relationships, details, forms)

### Relationship Types

**One-to-Many (1:N) - Most Common:**
| From | To | Count | Notes |
|------|----|----|-------|
| User | Place (created_by, owner) | 2 | User creates as admin OR owns privately |
| User | Event | 1 | Admin creates events |
| User | Stay | 1 | Owner manages stay |
| User | Vendor | 1 | Owner manages vendor |
| Event | EventRegistration | 1 | Event receives registrations |
| Event | EventReminder | 1 | Users set reminders |
| EventRegistrationForm | EventRegistrationField | 1 | Form has fields |
| Vendor | MenuItem | 1 | Vendor offers items |
| Vendor | OpeningHours | 1 | Vendor has daily schedules |
| Vendor | Review | 1 | Vendor receives reviews |
| Vendor | Promotion | 1 | Vendor runs promotions |
| Vendor | Reservation | 1 | Vendor gets table bookings |
| Stay | StayImage | 1 | Stay has multiple photos |
| SocialPost | PostRaw | 1 | Post has raw ingestion |

**One-to-One (1:1):**
| From | To | Notes |
|------|----|----|
| Event | EventRegistrationForm | Each event has exactly one form |
| PostRaw | PostClean | Each raw post becomes one cleaned post |

**Many-to-One (N:1):**
- Reverse of 1:N relationships above

**Self-Referential:**
| Entity | Reference | Purpose |
|--------|-----------|---------|
| Event | parent_event | Recurring event instances |

---

## Authentication & Authorization Model

### User Roles
```
ROLE CHOICES:
├── admin
│   ├── Can create Places, Events
│   ├── Can approve vendors/owners
│   ├── Full system access
│   └── auto_approved=True
│
├── vendor
│   ├── Can manage Vendor profile
│   ├── Can manage MenuItems
│   ├── Requires approval
│   └── Links to claimed_vendor_id
│
├── stay_owner
│   ├── Can manage Stay accommodations
│   ├── Requires approval
│   └── Links to claimed_stay_id
│
└── place_owner
    ├── Can manage Place details
    ├── Requires approval
    └── Links to claimed_place_id
```

### Approval Workflow
1. User registers with role (e.g., `role='vendor'`)
2. Auto-set: `is_approved=False` (except admins)
3. Admin reviews `verification_document`
4. Admin approves: Set `is_approved=True`
5. User gains access to their owned resources

### Business Claiming
- Vendors claim existing Vendor record: `claimed_vendor_id`
- Stay owners claim Stay: `claimed_stay_id`
- Place owners claim Place: `claimed_place_id`
- Verified via uploaded documents

---

## Data Flow Diagrams

### User Registration & Approval
```
User Signup (role=vendor)
    ↓
Set is_approved=False
Set claimed_vendor_id=NULL
    ↓
Upload verification_document
    ↓
Admin Reviews
    ↓
├─→ APPROVED: Set is_approved=True
│   └─→ User can now edit Vendor profile
│
└─→ REJECTED: Keep is_approved=False
    └─→ User cannot edit resources
```

### Event Registration Flow
```
User views Event
    ↓
Clicks "Register"
    ↓
Fills Custom Registration Form
    ↓
Creates EventRegistration (status=pending or confirmed)
    ↓
If requires_approval=True:
    ├─→ Admin reviews (status stays pending)
    ├─→ APPROVE: status=confirmed, send confirmation email
    └─→ REJECT: status=rejected, notify user
    
If allow_guest_registration=True:
    └─→ Can register without login (user_id=NULL)
```

### Social Post Processing
```
Celery Task: collect_and_process_social_posts
    ↓
Scrape posts from Instagram, Twitter, etc.
    ↓
Create SocialPost record
    ↓
Create PostRaw (raw content)
    ↓
AI Sentiment Analysis
    ├─→ Classify: positive | negative | neutral
    ├─→ Score: -1.0 to +1.0
    └─→ Confidence: 0-100%
    
Create PostClean (processed)
    ↓
Auto-link to Place/Vendor/Stay (keyword matching)
    ↓
Store in SentimentTopic (aggregation)
    ↓
Available for Analytics Dashboard
```

---

## Key Database Patterns

### 1. Nullable FK for Flexibility
Places:
```python
created_by = FK(User, null=True, blank=True)  # Admin who created
owner = FK(User, null=True, blank=True)       # Private owner (separate)
```
This allows: council-managed (created_by only) OR private (owner + created_by).

### 2. JSONField for Flexibility
```python
amenities = JSONField(default=dict)  # Stores: {parking: True, wifi: False, ...}
tags = JSONField(default=list)       # Event tags: ["Culture", "Family"]
form_data = JSONField(default=dict)  # Registration responses: {name: "John", age: 25}
gallery_images = JSONField(default=list)  # Array of image URLs
```

### 3. Base64 + URL Support for Images
```python
image_url = TextField()  # Can store:
# 1. URL: "https://example.com/image.jpg"
# 2. Base64: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
```

### 4. Multi-Entity Linkage
```python
class SocialPost(models.Model):
    place = FK(Place, null=True)      # Can be about a place OR
    vendor = FK(Vendor, null=True)    # a restaurant OR
    stay = FK(Stay, null=True)        # an accommodation
```
Not required to link to any (is_tourism filtering used instead).

### 5. Guest Registration Support
```python
class EventRegistration(models.Model):
    user = FK(User, null=True, blank=True)  # NULL = guest registration
    contact_email = CharField()              # Store directly from form
    contact_name = CharField()               # Extract from form_data
```

---

## API Endpoint Structure

### Authentication Endpoints (`/api/auth/`)
- `POST /api/auth/register/` - User signup
- `POST /api/auth/login/` - JWT login
- `POST /api/auth/token/refresh/` - Refresh JWT
- `GET /api/auth/me/` - Current user info
- `GET /api/auth/admin/users/pending/` - Admin: pending approvals
- `POST /api/auth/admin/users/<id>/approve/` - Admin: approve user

### Place Endpoints (`/api/places/`)
- `GET /api/places/` - List all places (paginated)
- `POST /api/places/` - Create place (admin)
- `GET /api/places/{id}/` - Place detail
- `PUT /api/places/{id}/` - Edit place
- `DELETE /api/places/{id}/` - Delete place

### Event Endpoints (`/api/events/`)
- `GET /api/events/` - List events
- `POST /api/events/` - Create event
- `GET /api/events/{id}/registrations/` - Get registrations
- `POST /api/events/{id}/register/` - Register for event
- `GET /api/events/{id}/registration-form/` - Custom form schema
- `POST /api/events/{id}/approvals/` - Admin: approve registrations

### Vendor Endpoints (`/api/vendors/`)
- `GET /api/vendors/` - List vendors
- `POST /api/vendors/` - Create vendor
- `GET /api/vendors/{id}/menu-items/` - Get menu
- `POST /api/vendors/{id}/reviews/` - Create review
- `POST /api/vendors/{id}/reservations/` - Make reservation

### Stay Endpoints (`/api/stays/`)
- `GET /api/stays/` - List accommodations
- `POST /api/stays/` - Create stay
- `GET /api/stays/{id}/images/` - Get stay images

### Analytics Endpoints (`/api/analytics/`)
- `GET /api/analytics/overview-metrics/` - Dashboard KPIs
- `GET /api/analytics/places/popular/` - Top attractions
- `GET /api/analytics/social-engagement/` - Social metrics
- `GET /api/sentiment/summary/` - Sentiment trends

---

## Testing Checklist

- [ ] User registration with role-based assignment
- [ ] Admin approval workflow for vendors/owners
- [ ] Business claiming and verification
- [ ] Event recurring instance generation
- [ ] Custom registration form submission
- [ ] Event registration approval workflow
- [ ] Guest event registration (no login)
- [ ] EventReminder triggering
- [ ] Social post ingestion and sentiment analysis
- [ ] Stay hybrid (internal vs affiliate) model
- [ ] Vendor menu management
- [ ] Table reservation workflow
- [ ] Promotion and promo code validation
- [ ] Multi-image support for stays and vendors
- [ ] Place amenities JSONField storage
- [ ] Geographic queries (nearby places, events, vendors)
- [ ] Pagination of list endpoints
- [ ] Permission checks (owner can only edit own records)
- [ ] User role-based access control

---

## Future Enhancements

### Model Additions
1. **PlaceReview** - Reviews specifically for attractions (not social sentiment)
2. **TransportRoute** - Transportation options (buses, trains, taxis)
3. **GuidedTour** - Tour packages with itineraries
4. **Payment** - Payment transactions for bookings
5. **Analytics Snapshot** - Historical metric backups

### Feature Ideas
- Real-time notifications for event updates
- User wishlists/favorites
- Recommendation engine
- Review filtering by relevance
- Dynamic pricing for events based on capacity
- Multi-language support for all text fields
- Accessibility audit (WCAG compliance)

---

## Database Statistics

**Typical Test Data:**
- Users: ~50 (including 5 admins, 10 vendors, 10 stay owners, 10 place owners, 15 regular)
- Places: 94 attractions
- Events: 30+ events with recurring instances
- SocialPosts: 1000+ posts (scraped continuously)
- Vendors: 60+ restaurants
- MenuItems: 600+ dishes
- Stays: 200+ accommodations
- EventRegistrations: 500+ registrations across events

**Storage (SQLite):**
- DB size: ~200MB (with full social post history)
- Images stored externally (media/ or CDN)

---

## Conclusion

The Tourism Analytics Dashboard implements a comprehensive system for:
✅ Tourism destination management and discovery
✅ Social media sentiment analysis at scale
✅ Event management with custom registration forms
✅ Accommodation and dining discovery
✅ Role-based business ownership and management
✅ Approval workflows for trust and compliance

The architecture supports both **platform admins** (curating official data) and **business owners** (claiming and managing their own listings), with extensive customization through JSONField flexibility and FK relationships.

---

**Document Version:** 1.0
**Last Updated:** 2024
**Status:** Complete System Architecture Documented
