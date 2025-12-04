# Cancel Registration Feature ✅

## Overview
I've added a **cancel registration** feature that allows users to cancel their event registration. The "cancelled" status has been supported in the database from the beginning, but there was no API endpoint or UI for it.

## What I Added

### Backend (✅ Complete)
Added `/api/events/{id}/cancel_registration/` endpoint in `backend/events/views.py`:

**For Authenticated Users:**
```bash
POST /api/events/13/cancel_registration/
Authorization: Bearer <token>
```

**For Guest Users:**
```bash
POST /api/events/13/cancel_registration/
{
  "registration_id": 123,
  "contact_email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Registration cancelled successfully",
  "attendee_count": 0,
  "spots_remaining": 20000
}
```

### How It Works

1. **Status Change:** Changes registration status from `confirmed` to `cancelled`
2. **Attendee Count:** Automatically decreases when status changes (handled by model signals)
3. **Spots Available:** Opens up a spot for someone else
4. **Admin View:** Cancelled registrations still visible in admin panel under "Cancelled" filter

### Testing the Feature

**Test as Authenticated User:**
```bash
curl -X POST http://localhost:8000/api/events/13/cancel_registration/ \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json"
```

**Test as Guest:**
```bash
curl -X POST http://localhost:8000/api/events/13/cancel_registration/ \
  -H "Content-Type: application/json" \
  -d '{
    "registration_id": 1,
    "contact_email": "amadouodiallo77@gmail.com"
  }'
```

## Frontend Integration (TODO)

To complete this feature, you would need to:

### Option 1: Add to EventCard
Show "Cancel Registration" button instead of "JOIN US" for registered users:

```tsx
// In EventCard.tsx
{event.user_registered ? (
  <button onClick={handleCancelRegistration}>
    ❌ Cancel Registration
  </button>
) : (
  <div onClick={handleJoinUsClick}>
    JOIN US
  </div>
)}
```

### Option 2: Add to EventModal  
Show cancel button in the modal after registration or when viewing event details:

```tsx
// In EventModal.tsx
{userRegistration && userRegistration.status === 'confirmed' && (
  <button 
    onClick={handleCancelRegistration}
    className="bg-red-600 text-white px-6 py-3 rounded-lg"
  >
    Cancel My Registration
  </button>
)}
```

### Option 3: Add to User Dashboard
Create a "My Registrations" page where users can see all their registrations and cancel them:

```tsx
// New page: MyRegistrations.tsx
<div>
  <h2>My Event Registrations</h2>
  {registrations.map(reg => (
    <div key={reg.id}>
      <h3>{reg.event_title}</h3>
      <p>Status: {reg.status}</p>
      {reg.status === 'confirmed' && (
        <button onClick={() => cancelRegistration(reg.event, reg.id)}>
          Cancel Registration
        </button>
      )}
    </div>
  ))}
</div>
```

## Implementation Example

```typescript
// Add to any component that needs cancel functionality
import api from '../services/api';

const handleCancelRegistration = async (eventId: number) => {
  if (!confirm('Are you sure you want to cancel your registration?')) {
    return;
  }
  
  try {
    const response = await api.post(`/events/${eventId}/cancel_registration/`);
    alert(response.data.message);
    // Refresh event data or redirect
    window.location.reload();
  } catch (error: any) {
    alert(error.response?.data?.error || 'Failed to cancel registration');
  }
};
```

## Database Schema

The `EventRegistration` model already supports this:

```python
status = models.CharField(
    max_length=20,
    choices=[
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),  # ✅ Already exists
        ('waitlist', 'Waitlist'),
    ],
    default='confirmed'
)
```

## Benefits

✅ **Users can change their plans** - Life happens, events change  
✅ **Opens spots for others** - Cancelled registration frees up capacity  
✅ **Admin visibility** - Can see who cancelled (useful for analytics)  
✅ **No data loss** - Cancelled registrations are preserved, not deleted  
✅ **Analytics potential** - Track cancellation rates, reasons, timing  

## Current State

- ✅ Backend API endpoint ready
- ✅ Database model supports it
- ✅ Admin can view cancelled registrations
- ❌ Frontend UI not added yet
- ❌ User dashboard doesn't show registrations

## Recommended Next Steps

1. **Add "My Registrations" page** - Users can view all their registrations
2. **Add cancel button to EventModal** - Quick cancel from event details
3. **Add confirmation modal** - "Are you sure?" before cancelling
4. **Add cancellation reason** (optional) - Collect feedback
5. **Send cancellation email** - Confirm the cancellation via email

## Example User Flow

**Current:**
1. User registers for event ✅
2. User receives thank-you email ✅
3. User wants to cancel → **NO WAY TO DO THIS** ❌

**After Frontend Implementation:**
1. User registers for event ✅
2. User receives thank-you email ✅
3. User clicks "Cancel Registration" button ✅
4. User confirms cancellation ✅
5. Registration status changes to "cancelled" ✅
6. Spot opens for someone else ✅
7. User receives cancellation confirmation email (future) 🔄

## Testing

The endpoint is live! Test it with:
```bash
# Restart backend to pick up changes
cd backend
source venv/bin/activate
python manage.py runserver 8000
```

Then test with curl or Postman as shown above.

---

**Status:** Backend Complete ✅ | Frontend Pending ⏳

Let me know if you want me to implement the frontend UI for this feature!
