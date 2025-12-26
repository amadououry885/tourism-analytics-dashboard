# Quick Start Guide - Custom Registration Forms

## 🎯 For Event Organizers

### Step 1: Create an Event

1. **Login to Admin Portal** as admin user
2. **Navigate to Events** section
3. **Click "Create Event"** or edit existing event

### Step 2: Configure Registration Settings

#### Option A: Auto-Approve (Simple Events)
```python
# Example: Public workshop, festival, open house
event = Event.objects.create(
    title="Community Festival 2025",
    start_date="2025-03-15T10:00:00Z",
    requires_approval=False,  # ← Auto-approve
    registration_form_config=[
        {"label": "Full Name", "field_type": "text", "is_required": True, "order": 0},
        {"label": "Email", "field_type": "email", "is_required": True, "order": 1},
        {"label": "Phone", "field_type": "tel", "is_required": False, "order": 2}
    ]
)
```

#### Option B: Manual Approval (Exclusive Events)
```python
# Example: VIP event, limited capacity, application-based
event = Event.objects.create(
    title="Business Networking Dinner",
    start_date="2025-04-20T18:00:00Z",
    requires_approval=True,  # ← Requires admin approval
    approval_message="Your application will be reviewed within 2 business days.",
    registration_form_config=[
        {"label": "Full Name", "field_type": "text", "is_required": True, "order": 0},
        {"label": "Email", "field_type": "email", "is_required": True, "order": 1},
        {"label": "Company", "field_type": "text", "is_required": True, "order": 2},
        {"label": "Position/Title", "field_type": "text", "is_required": True, "order": 3},
        {
            "label": "Why do you want to attend?",
            "field_type": "textarea",
            "is_required": True,
            "order": 4,
            "help_text": "Tell us about your interests and what you hope to gain from this event."
        }
    ]
)
```

### Step 3: Using the Form Builder (Frontend)

In your React admin panel:

```tsx
import FormBuilder from '../components/FormBuilder';

function EventFormManager() {
  const [formFields, setFormFields] = useState([]);
  
  return (
    <FormBuilder 
      fields={formFields}
      onChange={setFormFields}
    />
  );
}
```

**Available Field Types:**
- 📝 **Text** - Short text input (name, company, etc.)
- 📧 **Email** - Email validation
- 📱 **Phone** - Phone number
- 🔢 **Number** - Numeric input
- 📄 **Textarea** - Long text (explanations, bios)
- ⬇️ **Select** - Dropdown menu
- 🔘 **Radio** - Single choice buttons
- ☑️ **Checkbox** - Multiple choices

### Step 4: Review Registrations (Approval Required Events Only)

In admin portal, use the `RegistrationApproval` component:

```tsx
import RegistrationApproval from '../components/RegistrationApproval';

function EventManagement({ eventId }) {
  return (
    <div>
      <h2>Pending Registrations</h2>
      <RegistrationApproval eventId={eventId} />
    </div>
  );
}
```

**Admin Actions:**
1. View all pending registrations
2. See applicant details and form responses
3. Click **Approve** → Sends confirmation email
4. Click **Reject** → Enter reason → Sends rejection email

## 📧 Email Templates

### Auto-Approved
```
Subject: ✅ Registration Confirmed - [Event Title]

Hi [Name],

Thank you for registering for [Event Title]!

EVENT DETAILS:
Date: [Date]
Time: [Time]
Location: [Location]

See you there! 🎊
```

### Pending Approval
```
Subject: ⏳ Registration Pending Approval - [Event Title]

Hi [Name],

Thank you for your interest in [Event Title]!
Your registration is currently pending approval.

[Custom Approval Message]

You'll receive an email once your registration is reviewed.
```

### Approved
```
Subject: ✅ Registration Approved - [Event Title]

Hi [Name],

Great news! Your registration for [Event Title] has been approved!

EVENT DETAILS:
[Event Info]

We look forward to seeing you!
```

### Rejected
```
Subject: Registration Update - [Event Title]

Hi [Name],

[Custom Rejection Reason]

We appreciate your interest and hope you'll join us for future events.
```

## 🔧 API Reference

### Submit Registration
```bash
POST /api/events/{event_id}/submit_registration/
Content-Type: application/json

{
  "form_data": {
    "full_name": "John Doe",
    "email_address": "john@example.com",
    "skill_level": "Intermediate"
  }
}

# Response (Auto-Approve):
{
  "message": "Thank you for registering!",
  "registration": {...},
  "requires_approval": false
}

# Response (Approval Required):
{
  "message": "Your registration is pending approval...",
  "registration": {...},
  "requires_approval": true
}
```

### Get Pending Registrations (Admin)
```bash
GET /api/events/{event_id}/pending_registrations/
Authorization: Bearer [admin_token]

# Response:
{
  "count": 3,
  "registrations": [
    {
      "id": 1,
      "contact_name": "Jane Smith",
      "contact_email": "jane@example.com",
      "status": "pending",
      "form_data": {...}
    },
    ...
  ]
}
```

### Approve Registration (Admin)
```bash
POST /api/events/{event_id}/registrations/{reg_id}/approve/
Authorization: Bearer [admin_token]

# Optional body:
{
  "admin_notes": "Meets all criteria. Approved."
}

# Response:
{
  "message": "Registration approved successfully",
  "registration": {...},
  "email_sent": true
}
```

### Reject Registration (Admin)
```bash
POST /api/events/{event_id}/registrations/{reg_id}/reject/
Authorization: Bearer [admin_token]

{
  "reason": "Unfortunately, the event has reached capacity.",
  "admin_notes": "Applied after cutoff date"
}

# Response:
{
  "message": "Registration rejected",
  "registration": {...},
  "email_sent": true
}
```

## 🎨 Example Form Configurations

### Conference Registration
```json
[
  {"label": "Full Name", "field_type": "text", "is_required": true, "order": 0},
  {"label": "Email", "field_type": "email", "is_required": true, "order": 1},
  {"label": "Company", "field_type": "text", "is_required": false, "order": 2},
  {
    "label": "Session Track",
    "field_type": "radio",
    "is_required": true,
    "options": ["Technical", "Business", "Design"],
    "order": 3
  },
  {
    "label": "Dietary Requirements",
    "field_type": "checkbox",
    "is_required": false,
    "options": ["Vegetarian", "Vegan", "Halal", "Gluten-free"],
    "order": 4
  }
]
```

### Volunteer Sign-up
```json
[
  {"label": "Full Name", "field_type": "text", "is_required": true, "order": 0},
  {"label": "Email", "field_type": "email", "is_required": true, "order": 1},
  {"label": "Phone", "field_type": "tel", "is_required": true, "order": 2},
  {
    "label": "Availability",
    "field_type": "checkbox",
    "is_required": true,
    "options": ["Morning", "Afternoon", "Evening", "Weekend"],
    "order": 3
  },
  {
    "label": "T-Shirt Size",
    "field_type": "select",
    "is_required": true,
    "options": ["XS", "S", "M", "L", "XL", "XXL"],
    "order": 4
  },
  {
    "label": "Skills/Experience",
    "field_type": "textarea",
    "is_required": false,
    "placeholder": "Tell us about relevant skills...",
    "order": 5
  }
]
```

### Workshop Application
```json
[
  {"label": "Full Name", "field_type": "text", "is_required": true, "order": 0},
  {"label": "Email", "field_type": "email", "is_required": true, "order": 1},
  {
    "label": "Experience Level",
    "field_type": "radio",
    "is_required": true,
    "options": ["Beginner", "Intermediate", "Advanced"],
    "order": 2
  },
  {
    "label": "What do you hope to learn?",
    "field_type": "textarea",
    "is_required": true,
    "help_text": "2-3 sentences",
    "order": 3
  },
  {
    "label": "Laptop Available",
    "field_type": "radio",
    "is_required": true,
    "options": ["Yes", "No - Please provide one"],
    "order": 4
  }
]
```

## ✅ Checklist

Before launching your event registration:

- [ ] Event details complete (title, date, location)
- [ ] Registration form fields configured
- [ ] Approval workflow set (auto or manual)
- [ ] Approval message written (if manual approval)
- [ ] Email settings verified
- [ ] Test registration submitted
- [ ] Email received and formatted correctly
- [ ] Admin approval interface tested (if applicable)

## 🆘 Troubleshooting

**Problem:** Registrations not sending emails
- ✅ Check `settings.py` email configuration
- ✅ Verify `DEFAULT_FROM_EMAIL` is set
- ✅ Test email with `python manage.py shell`: `from django.core.mail import send_mail`

**Problem:** Form fields not showing
- ✅ Check `registration_form_config` is valid JSON
- ✅ Verify all required fields have `order` property
- ✅ Check browser console for errors

**Problem:** Can't approve registrations
- ✅ Ensure user is admin (`role='admin'`)
- ✅ Check event has `requires_approval=True`
- ✅ Verify registration status is `pending`

**Problem:** Custom fields not saving
- ✅ Check field `id` is unique
- ✅ Verify `field_type` is valid
- ✅ Ensure `order` is sequential
