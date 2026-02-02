# Tourism Analytics Dashboard - Activity Diagrams Descriptions

---

## 1. Admin Creating Tourism Places (Figure 3.1)

**Description:**

Figure 3.1 represents the administrative process for creating and publishing new tourism attractions (Places) within the system. This diagram illustrates the complete workflow from initial data entry through to public availability on the platform.

**Process Overview:**

The workflow begins when an admin navigates to the Places Management section and initiates the creation of a new place record. The admin enters fundamental details including the place name, descriptive information, and category classification. Subsequently, geographic information is provided: city, state, and country location data, followed by precise geographic coordinates (latitude and longitude) for mapping integration.

**System-Side Validation (S1):**

Once all required fields are entered, the system performs comprehensive validation to ensure data integrity. A critical decision point checks whether all mandatory fields meet validation criteria. If validation fails, the system returns detailed error messages to the admin, halting the process until corrections are made. If validation succeeds, the system proceeds to check for duplicate places—specifically, it searches the database for existing places with the same name and location to prevent redundant entries. Should a duplicate be detected, the admin is alerted and the process terminates, allowing the admin to either modify the entry or cancel.

**Supplementary Details Entry:**

Upon successful duplication check, the admin continues by uploading place imagery (supporting both direct URLs and Base64-encoded data), adding contact information (phone, email, physical address), specifying operational hours, selecting relevant amenities from a standardized list (parking, WiFi, wheelchair accessibility, etc.), and linking external resources (Wikipedia articles, TripAdvisor pages, Google Maps locations).

**Image Processing (S2):**

The system validates uploaded images for format compliance and file size constraints. Invalid images trigger an error response, and the process halts until corrected images are provided.

**Administrative Designation & Database Creation (S3-S4):**

The admin designates the place as council-managed (default for most tourism places) and marks it as active for public visibility. The system then creates the Place record in the database, automatically setting the creator reference (created_by = Admin User ID), generating a unique place identifier, and recording the creation timestamp. A final verification ensures all data has been successfully persisted. Upon successful save, the system logs the place creation event to the audit trail for compliance tracking, notifies the admin of successful publication, and adds the place to the searchable Places index.

**Outcome & Publication:**

The newly created place is immediately displayed on the analytics dashboard, visible to tourists browsing attractions. The admin receives confirmation with the Place ID and all associated details, and is redirected to the place detail page for review or further modifications if needed.

---

## 2. Restaurant Reservation Flow (Figure 3.2)

**Description:**

Figure 3.2 illustrates the customer restaurant reservation workflow from initial browsing through to check-in. This process ensures controlled table management, confirmation tracking, and timely customer notifications throughout the booking lifecycle.

**Process Overview:**

The workflow initiates when a customer browses available restaurants, selects a specific establishment of interest, and triggers the reservation creation by clicking the "Make Reservation" button. The customer then provides essential booking parameters: desired reservation date, preferred time slot, and party size (number of guests).

**System-Side Availability Check (S1):**

The system checks real-time restaurant availability for the specified date and time. This is a critical decision point—if the requested time slot is unavailable due to capacity constraints, the system displays alternative available times to the customer, allowing flexibility in scheduling. Should the customer opt not to select an alternative time, the reservation process terminates. If the requested time is available, the process continues.

**Booking Customization (S2):**

The customer reviews available table options (if the restaurant supports specific seating preferences) and may add special requests such as window seating, dietary accommodation needs, or other customization preferences. The customer then provides personal contact information: name, email address, and phone number.

**Information Validation (S2 - System):**

The system validates all customer-provided information for completeness and format correctness. Required fields are checked for presence; phone numbers are formatted according to system standards; and email addresses are validated against standard email format rules. Should validation fail, the system returns specific error messages, and the process halts until corrected.

**Confirmation & Database Recording (S3):**

After customer review and explicit confirmation of all reservation details, the system creates a Reservation record in the database with an initial status of "PENDING". A unique confirmation code is generated and calculated with an estimated confirmation timeframe.

**Notification & Calendar Management (S4-S5):**

The system sends multiple notifications: a confirmation email to the customer containing the reservation details and confirmation code, and an SMS notification if the customer has opted into such communications. Simultaneously, the restaurant manager receives a reservation alert, and the restaurant's availability calendar is updated to reflect the booked time slot. The reservation event is logged to the audit trail for operational tracking.

**Customer Confirmation & Reminders:**

The customer receives the confirmation number and may later view all their reservations through the platform. As the reservation date approaches, the system automatically sends a reminder email 24 hours before the scheduled time. When the customer arrives at the restaurant, the manager checks them in, marks the reservation status as "CONFIRMED", and seats the customer.

**Outcome:**

This structured workflow ensures restaurants maintain accurate table management, customers receive timely confirmations and reminders, and the system maintains a complete audit trail of all reservations for operational and analytical purposes.

---

## 3. Stay Owner Registration Process (Figure 3.3)

**Description:**

Figure 3.3 represents the comprehensive onboarding workflow for accommodation (Stay) owners, encompassing registration, verification, business validation, and admin approval before platform activation. This multi-stage process ensures that only verified, legitimate accommodation providers can operate on the platform.

**Initial Registration Phase:**

The workflow begins when an accommodation owner initiates registration by selecting the "Stay Owner" role. Personal information is collected: full name, email address, and contact phone number. The owner is required to create a strong password meeting security requirements (minimum length, character complexity) and confirm it.

**Email & Password Validation (S1-S2):**

The system validates the email address format and checks whether the email is already registered in the system. Should the email already exist, the system rejects the registration with an appropriate error message. If the email is new, the system validates password strength against security policies. Passwords must meet complexity requirements; if not, the system returns specific guidance on password requirements and halts registration. The system then verifies that the password and confirmation password match exactly. Only upon successful validation does the system create a User account with role "stay_owner" and is_approved set to False.

**Email Verification:**

The system hashes the password using industry-standard bcrypt encryption, generates a time-limited email verification token, and sends a verification email to the owner. The owner must click the verification link within the token's validity period to confirm email ownership.

**Accommodation Details Entry (S3):**

Upon email verification, the owner enters detailed accommodation information: property name, accommodation type (Hotel, Apartment, Guest House, Homestay), district/location, base nightly price, amenities list, photo gallery, landmark reference information, and operational details.

**Image & Document Upload (S4):**

The owner uploads multiple accommodation photos, and the system validates image format compliance (JPEG, PNG) and file size constraints. Invalid images trigger error responses; valid images are stored in the media folder. The owner then uploads business registration documentation and enters the business registration number for verification purposes.

**Database Creation & Admin Notification (S5):**

The system creates a Stay record linked to the User (owner_id), sets the initial active status to False pending approval, and notifies the admin system that a new stay owner has registered and awaits review.

**Admin Review & Approval Decision:**

The admin reviews the owner's application, verifies the uploaded business registration documents for authenticity, and validates the accommodation information for completeness and accuracy.

**Approval Outcome (Two Paths):**

**Path A (Approved):** If the admin approves the application, the system:
- Sets is_approved = True on the User record
- Sets is_active = True on the Stay record
- Sends an approval confirmation email to the owner
- The owner can now manage and modify their stay listing, add photos, update pricing, and accept bookings

**Path B (Rejected):** If the admin rejects the application, the system:
- Keeps is_approved = False
- Sends a rejection email with explanation
- The workflow terminates; the owner may reapply

**Outcome:**

This rigorous multi-stage process ensures that only verified accommodation providers operate on the platform, building trust with users and maintaining data quality. The complete audit trail captures all stages of verification for compliance purposes.

---

## 4. Vendor Registration Process (Figure 3.4)

**Description:**

Figure 3.4 outlines the comprehensive onboarding workflow for restaurant vendors (food service providers), including registration, verification, business validation, and admin approval. This process parallels the Stay Owner workflow but includes restaurant-specific information collection and verification.

**Initial Registration Phase:**

The workflow begins when a restaurant owner clicks "Register" and selects the "Vendor" role. Personal information is collected: owner name, email address, and contact phone number. A strong password is created and confirmed, meeting system security requirements.

**Email & Password Validation (S1-S2):**

The system validates email format and checks for pre-existing registrations. Duplicate emails are rejected. Password strength is validated against complexity policies. If requirements are not met, specific guidance is provided. Password confirmation must match exactly. Upon successful validation, a User account is created with role "vendor" and is_approved = False.

**Email Verification & Account Security:**

The password is hashed using bcrypt, a verification token is generated, and a confirmation email is sent. The owner must verify their email within the token validity period.

**Restaurant Details Entry (S3-S4):**

Upon email verification, the owner provides comprehensive restaurant information:
- Restaurant name, cuisine types (JSON array), detailed description
- Location: city, address, geographic coordinates (latitude/longitude)
- Contact information: phone, email, official website
- Social media links: Facebook, Instagram, TripAdvisor, Google Maps
- Business classification: price range, establishment year, halal certification status
- Operational characteristics: delivery availability, takeaway options, amenities

**Image & Document Upload (S4):**

The owner uploads restaurant logo, cover/banner image, and photo gallery images. The system validates format and file size for all images. Valid images are persisted to the media storage; invalid images trigger error responses requiring corrected uploads. Business registration documentation is uploaded, and the business registration number is entered.

**Database Creation & Admin Notification (S5):**

The system creates a Vendor record linked to the User owner, sets is_active = False pending approval, and notifies the admin system of the new vendor registration awaiting review.

**Admin Review & Verification:**

The admin examines the vendor application, verifies business registration documents for authenticity, validates restaurant information for completeness and accuracy, and may contact the owner for clarification if needed.

**Approval Decision (Two Paths):**

**Path A (Approved):** If approved:
- Set is_approved = True on User record
- Set is_active = True on Vendor record
- Send approval confirmation email
- Owner gains access to: add/modify menu items, set daily operating hours, manage reservations, view analytics

**Path B (Rejected):** If rejected:
- Set is_approved = False
- Send rejection email with explanation
- Process terminates; owner may reapply

**Outcome:**

This structured workflow ensures only verified restaurants operate on the platform. Upon approval, vendors gain full access to menu management, reservation handling, and performance analytics, creating a complete ecosystem for food service operations.

---

## 5. Event Registration Flow (Figure 3.5)

**Description:**

Figure 3.5 illustrates the complete event registration workflow from user discovery through to event attendance and check-in. This process manages custom registration forms, capacity constraints, approval workflows, and attendee verification.

**Discovery & Event Selection:**

The workflow initiates when a user browses available events, selects an event of interest, views complete event details (date, location, description, capacity), and clicks to initiate registration.

**System-Side Status & Capacity Check (S1):**

The system performs a critical validation sequence. First, it verifies that the event registration period is open and has not closed. If registration is closed, the system denies access and terminates the process. If registration is open, the system checks current attendance against maximum capacity. Should the event be at capacity, the system offers the user a waitlist option; if the user does not opt for the waitlist, the process terminates. Should capacity be available, registration form loading proceeds.

**Authentication Status Check:**

The system determines whether the user is authenticated (logged in). If authenticated, the system pre-fills known fields (name, email) from the user profile. If not authenticated, the system offers guest registration (without login requirement if the event permits it), or requires login for custom form completion.

**Custom Form Display & User Input:**

The system displays the event's custom registration form fields (configured by the event creator), which may include: required fields (name, email, phone), optional fields (dietary preferences, special requests, accessibility needs), and custom fields specific to the event. The user completes all form fields.

**System-Side Validation (S2):**

The system validates that all required fields are filled. If any required field is empty, validation fails, and the system returns specific error messages indicating which fields need completion. If all required fields are present, the system validates email format. Invalid email formats trigger error responses. The system then checks whether this email has already registered for the same event (preventing duplicate registrations). If already registered, the system rejects with an appropriate error message. If all validations pass, the user is prompted to review the completed registration.

**Registration Confirmation & Database Creation (S3):**

Upon user confirmation, the system creates an EventRegistration record. A critical decision point assesses whether the event requires admin approval of registrations:

- **If approval required:** The system sets status = "PENDING_APPROVAL"
- **If approval not required:** The system sets status = "CONFIRMED" immediately

The system stores the user's form responses as JSON data for flexible field support and links the registration to the User record (if not a guest registration).

**Notification & Approval Workflow (S4-S5):**

The system sends a confirmation email to the user. If approval is required, the system notifies the event admin of the pending registration. The admin reviews applications, checking for completeness, any red flags, or custom criteria set by the event organizer.

**Approval Decision (Three Paths):**

**Path A (Approved):**
- System sets status = "CONFIRMED"
- Sends approval email to user with ticket details
- User receives confirmation number and QR code

**Path B (Rejected):**
- System sets status = "REJECTED"
- Sends rejection email to user
- Process terminates

**Path C (Approved, continued):**
- System sets a reminder to email user 1 week before the event
- User receives reminder notification

**Event Day & Check-In (S5):**

When the event date arrives, the user attends in person. At the venue, the user presents their ticket (QR code or confirmation number). The system scans the code or manually verifies the confirmation number, marks the registration status = "CHECKED_IN", and records attendance for analytics purposes.

**Outcome:**

This comprehensive workflow ensures controlled event capacity management, flexible custom registration forms (optional approval), automated attendee reminders, and verified check-in tracking. The system maintains complete audit trails of all registrations and attendance, enabling event organizers to analyze participation patterns and improve future events.

---

## Cross-Diagram Patterns

### Common Elements Across All Workflows:

1. **Multi-Stage Validation:** All diagrams include systematic validation of user/admin input at critical decision points
2. **Error Handling:** Each workflow includes error states with notifications to users, allowing corrective action
3. **Audit Logging:** System operations are logged for compliance, troubleshooting, and analytics
4. **Email Notifications:** Users receive status updates at key workflow transitions
5. **Database Integrity:** All processes ensure data consistency through validation before persistence
6. **Approval Gates:** Where applicable, admin approval gates control operational transitions
7. **Partition Isolation:** System operations are segregated in distinct partitions to clarify where business logic executes
8. **Fallback Mechanisms:** Workflows include controlled termination paths for error scenarios

### Security & Compliance Considerations:

- **Password Security:** Passwords are hashed with bcrypt before storage
- **Email Verification:** Time-limited tokens prevent unauthorized account access
- **Data Validation:** Input validation prevents malformed data and injection attacks
- **Access Control:** Only approved users can manage resources; ownership is tracked (created_by, owner_id)
- **Audit Trail:** All critical operations are logged for compliance and dispute resolution

---

**Document Summary:**

These five activity diagrams collectively represent the major user-facing workflows within the Tourism Analytics Dashboard system:

1. **Admin Places** - Data curation and content management
2. **Restaurant Reservations** - Transactional booking management
3. **Stay Owner Registration** - Vendor onboarding for accommodations
4. **Vendor Registration** - Vendor onboarding for food service
5. **Event Registration** - Attendee management and event lifecycle

Each workflow demonstrates the balance between user experience (minimal friction) and system integrity (comprehensive validation, audit logging, and error handling). The diagrams serve as detailed specifications for system design, implementation, testing, and user documentation.

