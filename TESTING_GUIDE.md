# 🚀 Quick Test Guide - Frontend ↔ Backend Integration

## ✅ **What Changed**

All 4 main components now fetch data from backend APIs:

1. **EventsTimeline** → `/api/events/` (was already connected ✅)
2. **RestaurantVendors** → `/api/vendors/` (NOW connected ✅)  
3. **AccommodationStats** → `/api/stays/` (NOW connected ✅)
4. **MapView** → `/api/places/` (NOW connected ✅ - completely redesigned)

---

## 🧪 **How to Test**

### **1. Start Backend** (Terminal 1)
```bash
cd backend
python manage.py runserver 8000
```

### **2. Start Frontend** (Terminal 2)
```bash
cd frontend
npm run dev
```

### **3. Test Events Flow**

**In Admin Portal** (`http://localhost:3000/admin`):
1. Login as admin
2. Go to "Events" tab
3. Click "+ Add Event"
4. Fill in:
   - Title: "New Year Festival 2026"
   - Description: "Celebrate the new year!"
   - Location: "Town Square"
   - Start Date: 2026-01-01
   - City: "Alor Setar"
   - Tags: Select "Festival"
   - Max Capacity: 5000
5. Click "Save"

**In Public Events Page** (`http://localhost:3000/events` or Dashboard → Events tab):
1. Refresh page
2. **SHOULD SEE**: "New Year Festival 2026" in the list
3. Click on it → right side shows details
4. Check console: `[EventsTimeline] Received events: X` (X should include your event)

---

### **4. Test Vendors Flow**

**In Vendor Portal** (`http://localhost:3000/vendor`):
1. Login as vendor (or register as vendor + get admin approval)
2. Click "+ Add Restaurant"
3. Fill in:
   - Name: "Delicious Noodle House"
   - City: "Alor Setar"
   - Cuisines: Select "Chinese", "Malaysian"
   - Price Range: $$
   - Description: "Best noodles in town"
   - Contact Phone: +60 12 345 6789
4. Click "Add Restaurant"

**In Public Food Page** (`http://localhost:3000` → Food tab):
1. Refresh page
2. **SHOULD SEE**: "Delicious Noodle House" in the list
3. Click on it → right side shows details
4. Check console: `[RestaurantVendors] Received vendors: X`

---

### **5. Test Stays Flow**

**In Stay Owner Portal** (`http://localhost:3000/stays-owner`):
1. Login as stay owner (or register + get admin approval)
2. Click "+ Add Accommodation"
3. Fill in:
   - Name: "Cozy Beach Villa"
   - Type: "Guest House"
   - District: "Langkawi"
   - Price per Night: 250
   - Amenities: WiFi, Pool, Beach
   - Rating: 4.5
4. Click "Add Accommodation"

**In Public Stay Page** (`http://localhost:3000` → Stay tab):
1. Refresh page
2. **SHOULD SEE**: "Cozy Beach Villa" in the stats/charts
3. Check console: `[AccommodationStats] Received stays: X`

---

### **6. Test Places Flow**

**In Admin Portal** → **Places Tab**:
1. Login as admin
2. Go to "Places" tab (4th tab)
3. Click "+ Add Place"
4. Fill in:
   - Name: "Beautiful Waterfall"
   - Category: "Nature"
   - City: "Langkawi"
   - Description: "Hidden gem waterfall"
   - Free Entry: Yes
   - Latitude: 6.35
   - Longitude: 99.80
   - Image URL: `https://images.unsplash.com/photo-1508177209647-b4a3e7e4e39c?w=800`
5. Click "Save"

**In Public Places/Map Page** (`http://localhost:3000` → Places tab):
1. Refresh page
2. **SHOULD SEE**: 
   - "Beautiful Waterfall" in left places list
   - Marker on map at coordinates 6.35, 99.80
3. Click on place → right side shows full details with image
4. Check console: `[MapView] Received places: X`

---

## 🔍 **Debugging**

### **Check Console Logs**

Open browser DevTools (F12) → Console tab, you should see:

```
[EventsTimeline] Fetching events from: /api/events/
[EventsTimeline] Received events: 6 events
[EventsTimeline] Using backend data

[RestaurantVendors] Fetching vendors from: /api/vendors/
[RestaurantVendors] Received vendors: 3
[RestaurantVendors] Using backend data

[AccommodationStats] Fetching stays from: /api/stays/
[AccommodationStats] Received stays: 5
[AccommodationStats] Using backend data

[MapView] Fetching places from: /api/places/
[MapView] Received places: 8
[MapView] Using backend data
```

### **Check Network Tab**

DevTools → Network tab → Filter by "XHR":
- Should see: `events?`, `vendors?`, `stays?`, `places?`
- Status: 200 OK
- Response: JSON with data

### **If Shows Demo Data Only**

1. Check backend is running on port 8000
2. Check Vite proxy in `frontend/vite.config.js`:
   ```js
   proxy: {
     '/api': {
       target: 'http://localhost:8000',
       changeOrigin: true
     }
   }
   ```
3. Check console for "No backend data" warnings
4. Check Network tab for failed requests (404, 500, etc.)

---

## ✅ **Success Indicators**

**You'll know it's working when**:

1. ✅ Create data in portal → immediately appears in public page (after refresh)
2. ✅ Console logs show "Using backend data"
3. ✅ Network tab shows 200 OK for API calls
4. ✅ Master-detail layout works (click list → shows details on right)
5. ✅ No errors in console
6. ✅ Real images show (not placeholder images)

---

## 🎯 **Key Features to Test**

### **EventsTimeline**
- [x] List shows all events from backend
- [x] Click event → shows full details on right
- [x] JOIN US button appears for upcoming events
- [x] Days countdown works
- [x] Capacity/attendee count shows
- [x] Event image displays

### **RestaurantVendors** (Food)
- [x] List shows all vendors from backend
- [x] Click vendor → shows details on right
- [x] Images show (cover_image_url, logo_url, or gallery)
- [x] Cuisines display correctly
- [x] Price range shows ($, $$, $$$, $$$$)
- [x] Rating displays

### **AccommodationStats** (Stay)
- [x] Charts show real data from backend
- [x] Types grouped correctly (Hotel, Apartment, etc.)
- [x] Price per night shows
- [x] District/city filter works

### **MapView** (Places)
- [x] List shows all places from backend
- [x] Click place → shows full details on right
- [x] Map shows markers for each place
- [x] Map centers on selected place
- [x] Category filter works
- [x] Free/Paid entry indicator shows
- [x] Opening hours display
- [x] External links work (TripAdvisor, Wikipedia, etc.)
- [x] Get Directions button works

---

## 🐛 **Common Issues**

### **Issue: Shows only demo data**
**Solution**: 
- Backend not running → Start: `python manage.py runserver 8000`
- Wrong port → Check backend is on 8000, not 8001

### **Issue: 401 Unauthorized**
**Solution**: Some endpoints require auth
- Login first
- Check JWT token in localStorage

### **Issue: CORS error**
**Solution**: Check `backend/tourism_api/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Vite dev server
]
```

### **Issue: 404 Not Found**
**Solution**: Check URL patterns in `backend/tourism_api/urls.py`

---

## 📊 **Expected Data Counts**

After running `python seed.py` in backend:

- **Events**: ~20 events (15 + 6 recurring instances)
- **Vendors**: ~10 vendors
- **Stays**: ~15 accommodations
- **Places**: ~30 tourism places

All should appear in their respective frontend components!

---

## 🎉 **You're Done When...**

✅ All 4 components show backend data  
✅ Master-detail layout works smoothly  
✅ No console errors  
✅ Create in portal → shows in public page  
✅ City filters work  
✅ Images display correctly  

**Congratulations! Your frontend is now fully connected to the backend!** 🚀
