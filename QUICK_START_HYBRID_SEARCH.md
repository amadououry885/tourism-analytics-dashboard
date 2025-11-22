# Quick Start Guide - Hybrid Stay Search

## Test the Feature in 3 Minutes

### Step 1: Start Backend (30 seconds)

```bash
cd backend
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate  # Windows

python manage.py runserver 8000
```

**Expected Output:**
```
Starting development server at http://127.0.0.1:8000/
```

### Step 2: Start Frontend (30 seconds)

Open a NEW terminal:

```bash
cd frontend
npm install  # Only first time
npm run dev
```

**Expected Output:**
```
Local: http://localhost:3000/
```

### Step 3: Test the Hybrid Search (2 minutes)

#### Option A: Test Backend API Directly

```bash
cd backend
./venv/bin/python test_hybrid_search.py
```

**You should see:**
- ✅ 10 total stays (8 internal + 2 external)
- ✅ Filters working (district, price, rating)
- ✅ Contact info for internal stays
- ✅ Booking URLs for external stays

#### Option B: Test in Browser

1. **Open:** http://localhost:3000/accommodation (or whatever path you configure)

2. **You should see:**
   - Search bar at top
   - Filter panel (click "Show Filters")
   - Results grid with StayCard components
   - Badges: "X Local Partners" and "Y External Options"

3. **Test Internal Stay Card (Green):**
   - Look for green badge "✓ Local Partner"
   - Click "📧 Email" → Should open mailto: link
   - Click "📞 Call" → Should open tel: link  
   - Click "💬 WhatsApp" → Should open WhatsApp

4. **Test External Stay Card (Blue):**
   - Look for blue badge "🌐 External Booking"
   - Click "Book on Booking.com" → Should open Booking.com
   - Click "Book on Agoda" → Should open Agoda

5. **Test Filters:**
   - Select "Langkawi" district → See 3 internal + 2 external
   - Set price range RM 100-200 → See only internal stays
   - Set rating 4+ → See 4 internal + 2 external
   - Click amenities → See filtered results

### Step 4: Test Owner Dashboard (Bonus)

1. **Login** as a stay owner:
   - Username: `stayowner1` (or create new account with role='stay_owner')
   - Password: (whatever you set)

2. **Go to:** "My Accommodations" dashboard

3. **Click:** "Add Your Property"

4. **Fill out form** through Step 6:
   - Step 6 should show **Contact Information** fields:
     - Contact Email ✉️
     - Contact Phone 📞
     - WhatsApp Number 💬

5. **Save** → Should appear in public search with green badge

## Troubleshooting

### Backend not starting?

**Error:** `python: command not found`
**Fix:** Use `python3` or `./venv/bin/python`

**Error:** `ModuleNotFoundError: No module named 'celery'`
**Fix:** Make sure virtual environment is activated: `source venv/bin/activate`

### Frontend not loading?

**Error:** Port 3000 already in use
**Fix:** Check `vite.config.js` for port setting, or kill existing process

**Error:** Cannot connect to backend
**Fix:** 
1. Verify backend is running on port 8000
2. Check `frontend/vite.config.js` proxy is pointing to `http://localhost:8000`
3. Check CORS settings in `backend/tourism_api/settings.py`

### No stays showing?

**Fix:** Seed the database:
```bash
cd backend
source venv/bin/activate
python manage.py shell < seed_internal_stays.py
```

**Expected:** "✅ Created: Langkawi Sunset Resort" (and 4 more)

### Hybrid search returns error?

1. **Check migration applied:**
   ```bash
   python manage.py showmigrations stays
   ```
   Should show `[X] 0004_stay_contact_email_stay_contact_phone_and_more`

2. **Check endpoint exists:**
   ```bash
   curl http://localhost:8000/api/stays/hybrid_search/ | python -m json.tool
   ```
   Should return JSON with `count`, `internal_count`, `external_count`, `results`

## What You Should See

### Backend API Response Example

```json
{
  "count": 10,
  "internal_count": 8,
  "external_count": 2,
  "results": [
    {
      "id": 1,
      "name": "Langkawi Sunset Resort",
      "type": "Hotel",
      "district": "Langkawi",
      "rating": 4.5,
      "priceNight": 250.00,
      "is_internal": true,
      "contact_email": "info@langkawisunset.com",
      "contact_phone": "+60124567890",
      "contact_whatsapp": "+60124567890"
    },
    {
      "id": "ext_booking_1",
      "name": "Langkawi Luxury Resort (Booking.com)",
      "type": "Hotel",
      "district": "Langkawi",
      "rating": 4.8,
      "priceNight": 450,
      "is_internal": false,
      "booking_com_url": "https://www.booking.com/searchresults.html?ss=Langkawi"
    }
  ]
}
```

### Frontend Visual

**Internal Stay Card:**
```
┌────────────────────────────────────────┐
│ [🏨 Image/Emoji]                       │
│                                        │
│ 🟢 ✓ Local Partner                    │
│                                        │
│ Langkawi Sunset Resort                │
│ ⭐⭐⭐⭐⭐ 4.5 · Hotel                  │
│ Langkawi · RM 250/night               │
│                                        │
│ WiFi · Pool · Breakfast · AC          │
│                                        │
│ [📧 Email] [📞 Call] [💬 WhatsApp]    │
└────────────────────────────────────────┘
```

**External Stay Card:**
```
┌────────────────────────────────────────┐
│ [🏨 Image/Emoji]                       │
│                                        │
│ 🔵 🌐 External Booking                 │
│                                        │
│ Langkawi Luxury Resort (Booking.com)  │
│ ⭐⭐⭐⭐⭐ 4.8 · Hotel                  │
│ Langkawi · RM 450/night               │
│                                        │
│ WiFi · Pool · Restaurant · Spa        │
│                                        │
│ [Book on Booking.com]                 │
└────────────────────────────────────────┘
```

## Next Steps After Testing

1. ✅ Verify all filters work
2. ✅ Test contact buttons (email, phone, WhatsApp)
3. ✅ Test booking platform links
4. ✅ Add more internal stays via owner dashboard
5. ⏳ Deploy to staging environment
6. ⏳ User acceptance testing
7. ⏳ Phase 2: Real API integration

## Need Help?

Check the main documentation: `HYBRID_STAY_SEARCH_COMPLETE.md`

**Common Issues:**
- Migration not applied → Run `python manage.py migrate`
- No data → Run `python manage.py shell < seed_internal_stays.py`
- TypeScript errors → Run `npm install` in frontend folder
- CORS errors → Check `settings.py` CORS_ALLOWED_ORIGINS includes `http://localhost:3000`
