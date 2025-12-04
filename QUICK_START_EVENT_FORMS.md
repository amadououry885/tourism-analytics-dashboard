# 🚀 Quick Start: Event Custom Registration Forms

## ✅ What Just Got Done

You now have a **complete, production-ready event registration system** where event organizers can create custom forms (like Google Forms) for their events!

---

## 🎯 Quick Test (Backend Already Running)

### 1. **View Available Events with Forms:**
```bash
curl http://localhost:8000/api/events/ | python -m json.tool
```

### 2. **View Food Festival Registration Form:**
```bash
curl http://localhost:8000/api/events/21/registration_form/ | python -m json.tool
```

### 3. **Submit Registration (Guest):**
```bash
curl -X POST http://localhost:8000/api/events/21/submit_registration/ \
  -H "Content-Type: application/json" \
  -d '{
    "form_data": {
      "full_name": "Your Name",
      "email_address": "you@example.com",
      "phone_number": "+60123456789",
      "dietary_requirements": "Halal Only"
    }
  }' | python -m json.tool
```

### 4. **View All Attendees:**
```bash
curl http://localhost:8000/api/events/21/attendees/ | python -m json.tool
```

---

## 📊 Sample Events Created

We created 3 sample events for you:

### Event #21: **Alor Setar Food Festival 2025**
- **Form Fields:** Full Name, Email, Phone, Dietary Requirements (4 fields)
- **Guest Registration:** ✅ Allowed (no login needed)
- **Capacity:** 500 people
- **API:** `GET /api/events/21/registration_form/`

### Event #22: **Alor Setar Marathon 2025**
- **Form Fields:** Full Name, Email, Phone, Race Category, T-Shirt Size, Emergency Contact, Age, Medical Conditions, Dietary Requirements (10 fields!)
- **Guest Registration:** ❌ Require Login
- **Capacity:** 1000 people
- **API:** `GET /api/events/22/registration_form/`

### Event #23: **Photography Workshop**
- **Form Fields:** Full Name, Email, Phone, Experience Level, Camera Type, Dietary Requirements (6 fields)
- **Guest Registration:** ✅ Allowed
- **Capacity:** 30 people
- **API:** `GET /api/events/23/registration_form/`

---

## 🎨 For Event Organizers (Admin)

### Create Custom Registration Form via API:

```bash
curl -X POST http://localhost:8000/api/events/{EVENT_ID}/create_registration_form/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "My Event Registration",
    "description": "Please fill all required fields",
    "confirmation_message": "Thanks for registering!",
    "allow_guest_registration": true,
    "fields_data": [
      {
        "label": "Full Name",
        "field_type": "text",
        "is_required": true,
        "placeholder": "Enter your name",
        "order": 1
      },
      {
        "label": "Email",
        "field_type": "email",
        "is_required": true,
        "order": 2
      },
      {
        "label": "T-Shirt Size",
        "field_type": "dropdown",
        "is_required": true,
        "options": ["S", "M", "L", "XL"],
        "order": 3
      }
    ]
  }'
```

### Or Use Django Admin Panel:
```
http://localhost:8000/admin/
Username: admin
Password: admin123

Go to: Events → Event Registration Forms → Add Form
```

---

## 🔌 All Available Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/events/` | GET | None | List all events |
| `/api/events/{id}/` | GET | None | Event details (includes `has_custom_form` field) |
| `/api/events/{id}/registration_form/` | GET | None | View registration form schema |
| `/api/events/{id}/create_registration_form/` | POST/PUT | Admin | Create/update registration form |
| `/api/events/{id}/submit_registration/` | POST | None* | Submit registration |
| `/api/events/{id}/attendees/` | GET | None | View all attendees |
| `/api/events/{id}/my_registration/` | GET | User | View my registration |

*Some events require login if `allow_guest_registration = false`

---

## 📱 Frontend Integration (Next Steps)

### Step 1: Check if Event Has Custom Form
```typescript
const event = await axios.get(`/api/events/${eventId}/`);

if (event.data.has_custom_form) {
  // Show "Register" button
  // On click, fetch form and render dynamic form
} else {
  // Show default registration or "Contact Organizer"
}
```

### Step 2: Fetch & Render Form
```typescript
const form = await axios.get(`/api/events/${eventId}/registration_form/`);

// Render fields dynamically based on form.fields
form.data.fields.sort((a, b) => a.order - b.order).map(field => {
  switch (field.field_type) {
    case 'text':
    case 'email':
    case 'phone':
      return <input type={field.field_type} required={field.is_required} ... />;
    case 'dropdown':
      return <select>{field.options.map(opt => <option>{opt}</option>)}</select>;
    case 'textarea':
      return <textarea required={field.is_required} ... />;
    // ... etc
  }
});
```

### Step 3: Submit Registration
```typescript
const formData = {
  full_name: "...",
  email_address: "...",
  // ... collect all field values
};

const response = await axios.post(`/api/events/${eventId}/submit_registration/`, {
  form_data: formData
});

alert(response.data.message); // Show confirmation message
```

---

## 🎯 Field Types You Can Use

- **text** → Short text input
- **textarea** → Long text input  
- **email** → Email validation
- **phone** → Phone number
- **number** → Numeric input
- **date** → Date picker
- **dropdown** → Select dropdown (provide `options` array)
- **radio** → Radio buttons (provide `options` array)
- **checkbox** → Multiple selection (provide `options` array)

---

## ✅ Testing Checklist

- [x] Backend models created
- [x] Database migration applied
- [x] API endpoints working
- [x] Guest registration working
- [x] Authenticated registration working
- [x] Form validation working
- [x] Sample events created
- [x] Admin panel configured
- [ ] Frontend dynamic form component (TODO)
- [ ] Frontend form submission (TODO)
- [ ] Email confirmation (TODO - future)

---

## 📚 Full Documentation

See `EVENT_CUSTOM_REGISTRATION_FORMS.md` for complete documentation with:
- Database schema details
- All API endpoints with examples
- Frontend integration guide
- Field validation rules
- Admin panel usage
- Example use cases

---

## 🎉 You're Ready!

**Backend is 100% complete and tested!** ✅

**What you need to do next:**
1. Create frontend `DynamicRegistrationForm.tsx` component
2. Update event detail page to show "JOIN US" button
3. On click, fetch form schema and render dynamic form
4. Submit form data to `/api/events/{id}/submit_registration/`
5. Show confirmation message to user

**Estimated frontend work:** 2-3 hours (it's straightforward!)

---

**Questions? Check:**
- Full docs: `EVENT_CUSTOM_REGISTRATION_FORMS.md`
- Seed script: `backend/seed_event_forms.py`
- Models: `backend/events/models.py`
- Serializers: `backend/events/serializers.py`
- Views: `backend/events/views.py`

**Happy coding!** 🚀
