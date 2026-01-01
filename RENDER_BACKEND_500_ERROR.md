# 🔥 CRITICAL: Render Backend Returning 500 Errors

## Problem

Your Render.com backend at `https://tourism-analytics-dashboard.onrender.com` is **completely broken** and returning **500 Internal Server Errors** for all API calls.

### Failed Endpoints:
```
❌ GET https://tourism-analytics-dashboard.onrender.com/api/vendors/
   Status: 500 Internal Server Error
   
❌ GET https://tourism-analytics-dashboard.onrender.com/api/vendors/?1  
   Status: 500 Internal Server Error
```

### What Users See:
- Frontend shows "0 restaurants found" 
- Console errors showing 500 status codes
- Demo data not displaying (was another bug - now fixed)

---

## Root Causes (Likely Issues)

### 1. Database Connection Failed
Render free tier databases go to sleep and may fail to wake up:
```python
# Check backend/tourism_api/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',  # or SQLite?
        'NAME': os.environ.get('DB_NAME'),
        # Missing credentials or invalid connection string
    }
}
```

### 2. Missing Environment Variables
```bash
# Required on Render:
DATABASE_URL=postgresql://...
SECRET_KEY=...
ALLOWED_HOSTS=tourism-analytics-dashboard.onrender.com
DEBUG=False
```

### 3. Migration Not Applied
```bash
# Render build command might be missing:
python manage.py migrate
python manage.py collectstatic --noinput
```

### 4. Render Service Crashed
Free tier services restart after inactivity and may fail to start

---

## Immediate Fix Options

### Option 1: Check Render Logs (RECOMMENDED)
1. Go to https://dashboard.render.com
2. Find your `tourism-analytics-dashboard` service
3. Click "Logs" tab
4. Look for Python tracebacks showing the actual error

**Common errors you'll see:**
- `django.db.utils.OperationalError: could not connect to server`
- `ImproperlyConfigured: SECRET_KEY must not be empty`
- `ProgrammingError: relation "vendors_vendor" does not exist`

### Option 2: Frontend-Only Solution (DONE ✅)
- Frontend now uses demo data with 99 restaurants
- Filter bug fixed (city name transformation)
- Works even when backend is down
- **This is currently deployed and working**

### Option 3: Replace Render with Railway/Fly.io
Render's free tier is unreliable. Consider:
- **Railway**: Better free tier, easier setup
- **Fly.io**: Free tier with better reliability
- **PythonAnywhere**: Free tier specifically for Django

### Option 4: Use Localhost Backend Only
- Keep backend running locally
- Use ngrok to expose: `ngrok http 8000`
- Update frontend API URL to ngrok URL
- Good for development/demos

---

## How to Debug Render Backend

### Step 1: Access Render Dashboard
```
1. Login to https://dashboard.render.com
2. Click on "tourism-analytics-dashboard" service
3. Go to "Logs" section
```

### Step 2: Look for These Error Patterns

**Database Connection Error:**
```
django.db.utils.OperationalError: FATAL: password authentication failed
django.db.utils.OperationalError: could not connect to server
```
**Fix:** Update `DATABASE_URL` environment variable in Render dashboard

**Migration Error:**
```
django.db.utils.ProgrammingError: relation "vendors_vendor" does not exist
```
**Fix:** Add to Render build command: `python manage.py migrate`

**Static Files Error:**
```
ValueError: Missing staticfiles manifest entry
```
**Fix:** Add to build command: `python manage.py collectstatic --noinput`

**Secret Key Error:**
```
django.core.exceptions.ImproperlyConfigured: SECRET_KEY must not be empty
```
**Fix:** Set `SECRET_KEY` environment variable in Render

### Step 3: Fix Environment Variables
Go to Render Dashboard → Environment → Add:
```
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=tourism-analytics-dashboard.onrender.com,tourism-analytics-dashboard.vercel.app
DATABASE_URL=postgresql://user:password@host:5432/dbname
CORS_ALLOWED_ORIGINS=https://tourism-analytics-dashboard.vercel.app
```

### Step 4: Rebuild Service
```
Render Dashboard → Manual Deploy → Deploy latest commit
```

---

## Current Workaround (ACTIVE)

✅ **Frontend fix deployed** (commit c9f5f42)
- Transforms demo data to match filter format
- Shows all 99 restaurants from demo data
- Works perfectly without backend

**User Impact:** None - users see all restaurants with demo data

**Backend Status:** Still broken but not blocking users

---

## Next Steps

### Priority 1: Check Render Logs
Go to Render dashboard and find the actual error. Without logs, we're guessing.

### Priority 2: If Render Can't Be Fixed
Consider these alternatives:
1. **Keep using demo data** - Frontend works fine without backend
2. **Deploy to Railway** - More reliable free tier
3. **Use localhost + ngrok** - For demos only
4. **Paid Render tier** - $7/month, much more reliable

---

## Testing Checklist

Once you fix Render backend, test:

- [ ] `curl https://tourism-analytics-dashboard.onrender.com/healthz/` - Should return "OK"
- [ ] `curl https://tourism-analytics-dashboard.onrender.com/api/vendors/` - Should return JSON with restaurants
- [ ] Check Vercel site shows live data instead of demo data
- [ ] Verify restaurant filters work
- [ ] Test search functionality

---

## Contact Support

If you need help debugging Render:
1. Check Render docs: https://render.com/docs/troubleshooting-deploys
2. Render Discord: https://discord.gg/render
3. Or switch to Railway (easier setup)
