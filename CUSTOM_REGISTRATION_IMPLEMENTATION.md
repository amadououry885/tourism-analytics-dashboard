# Custom Registration Forms & Approval Workflow - Complete Implementation

## 🎯 Overview

This system allows event organizers to:
1. Create custom registration forms with different fields per event
2. Choose between auto-approval or manual review for registrations
3. Review and approve/reject registrations with email notifications
4. Collect custom data from attendees based on event needs

## 📦 What Was Implemented

### Backend Changes

#### 1. Event Model (`backend/events/models.py`)
Added three new fields:
```python
requires_approval = BooleanField(default=False)
# If True, registrations start as "pending" and need admin approval

registration_form_config = JSONField(default=list)
# Stores custom form fields configuration as JSON array

approval_message = TextField(default="Your registration is pending approval...")
# Custom message shown when registration is pending
```

#### 2. EventRegistration Model (`backend/events/models.py`)
Updated status choices and added approval tracking:
```python
status = CharField(choices=[
    ('pending', 'Pending Approval'),
    ('confirmed', 'Confirmed'),
    ('rejected', 'Rejected'),
    ('cancelled', 'Cancelled'),
    ('waitlist', 'Waitlist'),
])

admin_notes = TextField()  # Internal notes during review
reviewed_by = ForeignKey(User)  # Admin who reviewed
reviewed_at = DateTimeField()  # When reviewed
```

#### 3. API Endpoints (`backend/events/views.py`)

**Existing (Updated):**
- `POST /events/{id}/submit_registration/` - Now checks `requires_approval` and sets status accordingly

**New Endpoints:**
- `GET /events/{id}/pending_registrations/` - List pending registrations (Admin only)
- `POST /events/{id}/registrations/{reg_id}/approve/` - Approve registration (Admin only)
- `POST /events/{id}/registrations/{reg_id}/reject/` - Reject with reason (Admin only)

#### 4. Email Templates (`backend/events/emails.py`)

**Updated:**
- `send_registration_confirmation()` - Now supports `is_pending` parameter for different messages

**New Functions:**
- `send_approval_email()` - Sends confirmation when approved
- `send_rejection_email()` - Sends rejection with custom reason

### Frontend Changes

#### 1. Form Builder (`frontend/src/components/FormBuilder.tsx`)
**NEW COMPONENT** - Visual form builder for admins to configure custom fields:
- Drag & drop field ordering
- 8 field types: text, email, tel, number, textarea, select, radio, checkbox
- Field validation settings (required, placeholder, help text)
- Options management for select/radio/checkbox fields

#### 2. Registration Modal (`frontend/src/components/EventRegistrationModal.tsx`)
**UPDATED** - Now displays dynamic success messages:
- Shows approval pending message when `requires_approval=true`
- Shows immediate confirmation when auto-approved
- Longer display time (4s) for pending messages

#### 3. Admin Approval Interface (`frontend/src/components/RegistrationApproval.tsx`)
**NEW COMPONENT** - For admins to review registrations:
- Lists all pending registrations with details
- Shows form data submitted by users
- Approve/Reject buttons with email notifications
- Rejection modal to provide custom reason

## 🚀 How to Use

### For Event Organizers (Admin Portal)

#### Creating an Event with Custom Form

1. **Navigate to Event Management** in admin portal
2. **Create/Edit Event**, set basic details
3. **Enable Approval Workflow** (optional):
   ```
   ☑ Requires Approval
   Approval Message: "Your registration will be reviewed within 24 hours..."
   ```

4. **Build Custom Form**:
   ```tsx
   <FormBuilder 
     fields={formFields}
     onChange={setFormFields}
   />
   ```
   
   Example configuration stored in `registration_form_config`:
   ```json
   [
     {
       "id": "field_1",
       "label": "Full Name",
       "field_type": "text",
       "is_required": true,
       "placeholder": "Enter your full name",
       "order": 0
     },
     {
       "id": "field_2",
       "label": "Email Address",
       "field_type": "email",
       "is_required": true,
       "placeholder": "your.email@example.com",
       "order": 1
     },
     {
       "id": "field_3",
       "label": "T-Shirt Size",
       "field_type": "select",
       "is_required": true,
       "options": ["S", "M", "L", "XL"],
       "order": 2
     },
     {
       "id": "field_4",
       "label": "Dietary Requirements",
       "field_type": "checkbox",
       "is_required": false,
       "options": ["Vegetarian", "Vegan", "Halal", "No Pork"],
       "order": 3
     }
   ]
   ```

#### Reviewing Registrations

1. **Navigate to Event Details** in admin portal
2. **View "Pending Registrations" Tab**:
   ```tsx
   <RegistrationApproval eventId={eventId} />
   ```

3. **Review Each Registration**:
   - See attendee contact info (name, email, phone)
   - View all form responses
   - Click "Approve" → Sends confirmation email
   - Click "Reject" → Enter reason → Sends rejection email

### For End Users (Public Dashboard)

#### Registering for Event

1. **Browse Events** in timeline
2. **Click "JOIN US"** button
3. **Fill Dynamic Form** - Fields are based on event's `registration_form_config`
4. **Submit Registration**:
   - **Auto-Approved Events**: See "Registration Successful!" immediately
   - **Approval Required**: See "Registration Pending Approval" message
5. **Check Email** for confirmation or approval notification

## 📧 Email Flow

### Auto-Approval Events
```
User Submits Form
    ↓
Status: confirmed
    ↓
Email: "Registration Confirmed!" ✅
```

### Manual Approval Events
```
User Submits Form
    ↓
Status: pending
    ↓
Email: "Registration Pending Approval" ⏳
    ↓
Admin Reviews
    ├─ Approve → Email: "Registration Approved!" ✅
    └─ Reject → Email: "Registration Update" (with reason) ❌
```

## 🎨 UI/UX Features

### Form Builder
- **Drag & Drop**: Reorder fields with up/down arrows
- **Live Preview**: See field type icons
- **Inline Editing**: Click "Edit Settings" to configure
- **Options Manager**: Add/remove choices for dropdowns
- **Validation Badges**: Required fields marked with asterisk

### Registration Modal
- **Dynamic Rendering**: Form fields generated from config
- **Validation**: Client-side checks before submission
- **Loading States**: Spinner during API calls
- **Success Animations**: Green checkmark on success
- **Error Handling**: Clear error messages

### Admin Approval Interface
- **Card Layout**: Each registration in clean card
- **Status Badges**: Yellow "Pending" badge
- **Data Display**: All form responses visible
- **Quick Actions**: Approve/Reject buttons
- **Rejection Dialog**: Modal for entering reason

## 🔧 Database Schema

### Migration Created: `events/migrations/0009_event_approval_message_and_more.py`

```sql
ALTER TABLE events_event ADD COLUMN requires_approval BOOLEAN DEFAULT FALSE;
ALTER TABLE events_event ADD COLUMN registration_form_config JSON DEFAULT '[]';
ALTER TABLE events_event ADD COLUMN approval_message TEXT;

ALTER TABLE events_eventregistration ADD COLUMN admin_notes TEXT;
ALTER TABLE events_eventregistration ADD COLUMN reviewed_at DATETIME NULL;
ALTER TABLE events_eventregistration ADD COLUMN reviewed_by_id INTEGER NULL REFERENCES users_user(id);
ALTER TABLE events_eventregistration MODIFY COLUMN status VARCHAR(20) DEFAULT 'confirmed';
```

## 📊 Example Use Cases

### Use Case 1: Conference Registration
```json
{
  "requires_approval": false,
  "registration_form_config": [
    {"label": "Full Name", "field_type": "text", "is_required": true},
    {"label": "Email", "field_type": "email", "is_required": true},
    {"label": "Company", "field_type": "text", "is_required": false},
    {"label": "Workshop Track", "field_type": "radio", "options": ["Beginner", "Intermediate", "Advanced"]},
    {"label": "Lunch Preference", "field_type": "select", "options": ["Chicken", "Fish", "Vegetarian"]}
  ]
}
```

### Use Case 2: Exclusive Workshop (Approval Required)
```json
{
  "requires_approval": true,
  "approval_message": "Your application will be reviewed within 48 hours. We'll notify you via email.",
  "registration_form_config": [
    {"label": "Full Name", "field_type": "text", "is_required": true},
    {"label": "Email", "field_type": "email", "is_required": true},
    {"label": "Phone Number", "field_type": "tel", "is_required": true},
    {"label": "Why do you want to attend?", "field_type": "textarea", "is_required": true},
    {"label": "Experience Level", "field_type": "radio", "options": ["Beginner", "Intermediate", "Expert"]},
    {"label": "Portfolio URL", "field_type": "text", "is_required": false}
  ]
}
```

## 🧪 Testing

### Test Auto-Approval Flow
```bash
# 1. Create event with requires_approval=False
curl -X POST http://localhost:8000/api/events/ \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Event",
    "start_date": "2025-02-01T10:00:00Z",
    "requires_approval": false
  }'

# 2. Submit registration
curl -X POST http://localhost:8000/api/events/1/submit_registration/ \
  -d '{
    "form_data": {
      "full_name": "John Doe",
      "email_address": "john@example.com"
    }
  }'

# Expected: status=confirmed, immediate email
```

### Test Approval Workflow
```bash
# 1. Create event with requires_approval=True
curl -X POST http://localhost:8000/api/events/ \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "VIP Event",
    "start_date": "2025-02-01T10:00:00Z",
    "requires_approval": true,
    "approval_message": "Your application is under review."
  }'

# 2. Submit registration
curl -X POST http://localhost:8000/api/events/2/submit_registration/ \
  -d '{
    "form_data": {
      "full_name": "Jane Smith",
      "email_address": "jane@example.com"
    }
  }'
# Expected: status=pending, pending email

# 3. Get pending registrations (admin)
curl -X GET http://localhost:8000/api/events/2/pending_registrations/ \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 4. Approve registration (admin)
curl -X POST http://localhost:8000/api/events/2/registrations/1/approve/ \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Expected: status=confirmed, approval email

# 5. Reject registration (admin)
curl -X POST http://localhost:8000/api/events/2/registrations/2/reject/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"reason": "Event is full. Thank you for your interest."}'
# Expected: status=rejected, rejection email
```

## 🎯 Benefits

### For Event Organizers
✅ **Flexibility** - Different forms for different events
✅ **Quality Control** - Review applications before confirming
✅ **Data Collection** - Gather exactly the info you need
✅ **Professional** - Automated emails keep attendees informed

### For Attendees
✅ **Clear Communication** - Know registration status immediately
✅ **Relevant Questions** - Only answer what's needed
✅ **Email Updates** - Automatic notifications

### For Admins
✅ **Centralized Review** - All pending registrations in one place
✅ **Quick Actions** - Approve/reject with one click
✅ **Audit Trail** - Track who approved/rejected and when

## 🔄 Future Enhancements (Not Implemented)

1. **Batch Actions** - Approve/reject multiple registrations
2. **File Uploads** - Support document attachments
3. **Conditional Fields** - Show fields based on previous answers
4. **Form Templates** - Save form configs for reuse
5. **Analytics Dashboard** - Approval rates, response times
6. **Waitlist Management** - Auto-promote when spots open
7. **Payment Integration** - Collect fees during registration

## 📝 Summary

This implementation provides a complete, production-ready system for custom event registrations with approval workflows. It covers:
- ✅ Database migrations
- ✅ Backend API endpoints
- ✅ Email notifications
- ✅ Frontend form builder
- ✅ Dynamic form rendering
- ✅ Admin approval interface

All components are fully functional and integrated with the existing tourism dashboard system.
