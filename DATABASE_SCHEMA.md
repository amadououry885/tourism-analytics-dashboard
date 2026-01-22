# Tourism Analytics Dashboard - Database Schema

## Entity Relationship Diagram (ERD)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           TOURISM ANALYTICS DASHBOARD - DATABASE SCHEMA                             │
│                                        20 Tables | 5 Apps                                           │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘


                                    ┌─────────────────────┐
                                    │                     │
                                    │       USERS         │
                                    │                     │
                                    │  ┌───────────────┐  │
                                    │  │ id (PK)       │  │
                                    │  │ username      │  │
                                    │  │ email         │  │
                                    │  │ password      │  │
                                    │  │ role          │  │
                                    │  │ is_approved   │  │
                                    │  │ phone_number  │  │
                                    │  └───────────────┘  │
                                    │                     │
                                    └──────────┬──────────┘
                                               │
                 ┌─────────────────────────────┼─────────────────────────────┐
                 │                             │                             │
                 │                             │                             │
                 ▼                             ▼                             ▼
    ┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
    │                     │      │                     │      │                     │
    │       PLACES        │      │       VENDORS       │      │        STAYS        │
    │                     │      │                     │      │                     │
    │  ┌───────────────┐  │      │  ┌───────────────┐  │      │  ┌───────────────┐  │
    │  │ id (PK)       │  │      │  │ id (PK)       │  │      │  │ id (PK)       │  │
    │  │ name          │  │      │  │ name          │  │      │  │ name          │  │
    │  │ category      │  │      │  │ city          │  │      │  │ type          │  │
    │  │ city          │  │      │  │ cuisines      │  │      │  │ district      │  │
    │  │ lat/lon       │  │      │  │ lat/lon       │  │      │  │ rating        │  │
    │  │ image_url     │  │      │  │ price_range   │  │      │  │ priceNight    │  │
    │  │ is_free       │  │      │  │ is_halal      │  │      │  │ amenities     │  │
    │  │ owner_id (FK) │◄─┼──────┼──│ owner_id (FK) │◄─┼──────┼──│ owner_id (FK) │  │
    │  │ created_by(FK)│  │      │  │ is_open       │  │      │  │ is_open       │  │
    │  └───────────────┘  │      │  └───────────────┘  │      │  └───────────────┘  │
    │                     │      │                     │      │                     │
    └──────────┬──────────┘      └──────────┬──────────┘      └──────────┬──────────┘
               │                            │                            │
               │                            │                            │
               │         ┌──────────────────┼──────────────────┐         │
               │         │                  │                  │         │
               │         ▼                  ▼                  ▼         │
               │    ┌─────────┐       ┌───────────┐      ┌─────────┐     │
               │    │MENU_ITEM│       │  REVIEWS  │      │STAY_IMG │     │
               │    ├─────────┤       ├───────────┤      ├─────────┤     │
               │    │id (PK)  │       │id (PK)    │      │id (PK)  │     │
               │    │vendor_id│       │vendor_id  │      │stay_id  │◄────┘
               │    │name     │       │rating     │      │image    │
               │    │price    │       │comment    │      │caption  │
               │    │category │       │author     │      │is_primary│
               │    └─────────┘       └───────────┘      └─────────┘
               │
               │         ┌──────────────────┬──────────────────┐
               │         │                  │                  │
               │         ▼                  ▼                  ▼
               │    ┌──────────┐      ┌───────────┐     ┌────────────┐
               │    │OPENING   │      │PROMOTIONS │     │RESERVATIONS│
               │    │HOURS     │      │           │     │            │
               │    ├──────────┤      ├───────────┤     ├────────────┤
               │    │id (PK)   │      │id (PK)    │     │id (PK)     │
               │    │vendor_id │      │vendor_id  │     │vendor_id   │
               │    │day_of_wk │      │title      │     │customer    │
               │    │open_time │      │discount   │     │date/time   │
               │    │close_time│      │promo_code │     │party_size  │
               │    └──────────┘      └───────────┘     └────────────┘
               │
               │
               ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│                                    SOCIAL_POSTS                                      │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐  │
│  │ id (PK)          │ platform        │ post_id         │ content                 │  │
│  │ likes            │ comments        │ shares          │ views                   │  │
│  │ sentiment        │ sentiment_score │ confidence      │ is_tourism              │  │
│  │ place_id (FK) ───┼─────────────────┼─────────────────┼──► PLACES               │  │
│  │ vendor_id (FK) ──┼─────────────────┼─────────────────┼──► VENDORS              │  │
│  │ stay_id (FK) ────┼─────────────────┼─────────────────┼──► STAYS                │  │
│  │ created_at       │ fetched_at      │ extra (JSON)    │                         │  │
│  └────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
               │
               │ 1:1
               ▼
    ┌─────────────────────┐           ┌─────────────────────┐
    │      POST_RAW       │    1:1    │     POST_CLEAN      │
    │  ┌───────────────┐  │ ────────► │  ┌───────────────┐  │
    │  │ id (PK)       │  │           │  │ id (PK)       │  │
    │  │ post_id (FK)  │  │           │  │ raw_post_id   │  │
    │  │ content       │  │           │  │ content       │  │
    │  │ metadata      │  │           │  │ sentiment     │  │
    │  └───────────────┘  │           │  │ keywords      │  │
    └─────────────────────┘           │  │ poi_id (FK)   │  │
                                      │  └───────────────┘  │
                                      └─────────────────────┘


┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         EVENTS MODULE                                               │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────────────────┐
                                    │                     │
                                    │       EVENTS        │
                                    │                     │
                                    │  ┌───────────────┐  │
                                    │  │ id (PK)       │  │
                                    │  │ title         │  │
                                    │  │ description   │  │
                                    │  │ start_date    │  │
                                    │  │ end_date      │  │
                                    │  │ location_name │  │
                                    │  │ city          │  │
                                    │  │ max_capacity  │  │
                                    │  │ created_by(FK)│──────────► USERS
                                    │  │ parent_event  │──┐ (self-reference)
                                    │  │ recurrence    │  │
                                    │  └───────────────┘  │
                                    │         ▲           │
                                    └─────────┼───────────┘
                                              │
                 ┌────────────────────────────┴────────────────────────────┐
                 │                            │                            │
                 ▼                            ▼                            ▼
    ┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
    │                     │      │                     │      │                     │
    │ EVENT_REGISTRATION  │      │ EVENT_REG_FORM      │      │  EVENT_REMINDER     │
    │                     │      │                     │      │                     │
    │  ┌───────────────┐  │      │  ┌───────────────┐  │      │  ┌───────────────┐  │
    │  │ id (PK)       │  │      │  │ id (PK)       │  │      │  │ id (PK)       │  │
    │  │ user_id (FK)  │──┼──────┼──│ event_id (FK) │  │      │  │ user_id (FK)  │──┼──► USERS
    │  │ event_id (FK) │  │      │  │ title         │  │      │  │ event_id (FK) │  │
    │  │ status        │  │      │  │ description   │  │      │  │ reminder_time │  │
    │  │ form_data     │  │      │  │ allow_guest   │  │      │  │ is_sent       │  │
    │  │ contact_name  │  │      │  └───────────────┘  │      │  │ sent_at       │  │
    │  │ contact_email │  │      │         │           │      │  └───────────────┘  │
    │  │ reviewed_by   │──┼──────┼─────────┼───────────┼──────┼──► USERS            │
    │  └───────────────┘  │      │         │           │      │                     │
    │                     │      │         ▼           │      └─────────────────────┘
    └─────────────────────┘      │  ┌───────────────┐  │
                                 │  │ REG_FIELD     │  │
                                 │  ├───────────────┤  │
                                 │  │ id (PK)       │  │
                                 │  │ form_id (FK)  │  │
                                 │  │ label         │  │
                                 │  │ field_type    │  │
                                 │  │ is_required   │  │
                                 │  │ options       │  │
                                 │  │ order         │  │
                                 │  └───────────────┘  │
                                 │                     │
                                 └─────────────────────┘


┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    STANDALONE TABLES                                                │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────┐                              ┌─────────────────────┐
    │                     │                              │                     │
    │ PASSWORD_RESET_TOKEN│                              │  SENTIMENT_TOPICS   │
    │                     │                              │                     │
    │  ┌───────────────┐  │                              │  ┌───────────────┐  │
    │  │ id (PK)       │  │                              │  │ id (PK)       │  │
    │  │ user_id (FK)  │──┼──────────► USERS             │  │ topic         │  │
    │  │ token         │  │                              │  │ sentiment     │  │
    │  │ created_at    │  │                              │  │ count         │  │
    │  │ used          │  │                              │  │ category      │  │
    │  └───────────────┘  │                              │  │ date          │  │
    │                     │                              │  └───────────────┘  │
    └─────────────────────┘                              └─────────────────────┘
```

---

## Tables Summary

| # | Table Name | App | Description |
|---|------------|-----|-------------|
| 1 | `users` | users | Custom user model with roles (admin/vendor/stay_owner/place_owner) |
| 2 | `password_reset_tokens` | users | Stores password reset tokens with expiry |
| 3 | `analytics_place` | analytics | Tourism destinations/attractions |
| 4 | `analytics_socialpost` | analytics | Social media posts with sentiment analysis |
| 5 | `analytics_postraw` | analytics | Raw social media data before processing |
| 6 | `analytics_postclean` | analytics | Processed/cleaned social media posts |
| 7 | `analytics_sentimenttopic` | analytics | Aggregated sentiment by topic |
| 8 | `vendors_vendor` | vendors | Restaurants/food establishments |
| 9 | `vendors_menuitem` | vendors | Menu items for restaurants |
| 10 | `vendors_openinghours` | vendors | Operating hours per day |
| 11 | `vendors_review` | vendors | Customer reviews for restaurants |
| 12 | `vendors_promotion` | vendors | Special offers and discounts |
| 13 | `vendors_reservation` | vendors | Table reservations |
| 14 | `stays_stay` | stays | Accommodations (hotels, homestays, etc.) |
| 15 | `stays_stayimage` | stays | Multiple images per accommodation |
| 16 | `events_event` | events | Events with recurring support |
| 17 | `events_eventregistration` | events | User registrations for events |
| 18 | `events_eventregistrationform` | events | Custom registration forms |
| 19 | `events_eventregistrationfield` | events | Individual form fields |
| 20 | `events_eventreminder` | events | User reminder notifications |

---

## Relationships

### One-to-Many (1:N)

| Parent Table | Child Table | Foreign Key |
|--------------|-------------|-------------|
| users | places | owner_id, created_by_id |
| users | vendors | owner_id |
| users | stays | owner_id |
| users | events | created_by_id |
| users | event_registrations | user_id, reviewed_by_id |
| users | event_reminders | user_id |
| users | password_reset_tokens | user_id |
| places | social_posts | place_id |
| vendors | social_posts | vendor_id |
| stays | social_posts | stay_id |
| vendors | menu_items | vendor_id |
| vendors | opening_hours | vendor_id |
| vendors | reviews | vendor_id |
| vendors | promotions | vendor_id |
| vendors | reservations | vendor_id |
| stays | stay_images | stay_id |
| events | event_registrations | event_id |
| events | event_reminders | event_id |
| events | events (self) | parent_event_id |
| event_registration_form | event_registration_fields | form_id |

### One-to-One (1:1)

| Table A | Table B | Foreign Key |
|---------|---------|-------------|
| events | event_registration_form | event_id |
| social_post | post_raw | post_id |
| post_raw | post_clean | raw_post_id |

---

## Field Types Reference

### User Roles
```
admin       → Full system access
vendor      → Manages restaurants
stay_owner  → Manages accommodations  
place_owner → Manages attractions
```

### Event Registration Status
```
pending   → Awaiting approval
confirmed → Approved/confirmed
rejected  → Denied by admin
cancelled → Cancelled by user
waitlist  → On waiting list
```

### Stay Types
```
Hotel      → Traditional hotels
Apartment  → Rental apartments
Guest House → Guest houses
Homestay   → Local homestays
```

### Vendor Price Range
```
$    → Budget (< RM30)
$$   → Moderate (RM30-80)
$$$  → Upscale (RM80-150)
$$$$ → Fine Dining (> RM150)
```

### Sentiment Values
```
positive → Score > 0.3
neutral  → Score -0.3 to 0.3
negative → Score < -0.3
```

### Event Recurrence Types
```
none    → Does not repeat
daily   → Every day
weekly  → Every week
monthly → Every month
yearly  → Every year
```

---

## Database Statistics

- **Total Tables:** 20
- **Apps:** 5 (users, analytics, vendors, stays, events)
- **Foreign Key Relationships:** 25+
- **Self-Referencing Tables:** 1 (events → parent_event)
- **JSON Fields:** 12 (for flexible data like amenities, cuisines, form_data)

---

*Generated: January 22, 2026*
