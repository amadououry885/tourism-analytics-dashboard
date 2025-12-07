# 🚀 Complete Render Deployment Guide

## ✅ Your Backend is Ready with ALL Data!

### What Gets Deployed:
- ✅ All 28 cleaned API endpoints
- ✅ 102 social media posts with sentiment analysis
- ✅ 20 places (Langkawi, Alor Setar, etc.)
- ✅ 15 events
- ✅ 4 vendors (restaurants)
- ✅ 8 stays (hotels)
- ✅ Complete analytics system

---

## 📋 Step-by-Step Deployment

### 1. Create PostgreSQL Database on Render

1. Go to https://render.com/dashboard
2. Click "New +" → "PostgreSQL"
3. Name: `tourism-db`
4. Database: `tourism_analytics`
5. User: `tourism_user`
6. Region: Singapore (or closest to you)
7. Plan: **Free**
8. Click "Create Database"
9. **Copy the "Internal Database URL"** - you'll need this!

### 2. Deploy Backend Web Service

1. Still on Render, click "New +" → "Web Service"
2. Connect GitHub repo: `amadououry885/tourism-analytics-dashboard`
3. Configure:

**Basic Settings:**
- Name: `tourism-backend`
- Region: Same as database (Singapore)
- Branch: `main`
- Root Directory: `backend`
- Runtime: `Python 3`
- Build Command: 
  ```bash
  pip install -r requirements.txt && python manage.py collectstatic --noinput
  ```
- Start Command:
  ```bash
  gunicorn tourism_api.wsgi:application
  ```
- Plan: **Free**

**Environment Variables** (Click "Add Environment Variable"):
```
DATABASE_URL = [paste the Internal Database URL from step 1]
ENV = production
DJANGO_DEBUG = false
SECRET_KEY = your-long-random-secret-key-here-change-this
ALLOWED_HOSTS = .onrender.com,.vercel.app
CORS_ALLOWED_ORIGINS = https://tourism-analytics-dashboard.vercel.app
PYTHON_VERSION = 3.12.0
```

4. Click "Create Web Service"
5. Wait 5-10 minutes for deployment

### 3. Run Database Migrations

After deployment succeeds:

1. In your Render dashboard, go to your `tourism-backend` service
2. Click "Shell" tab (left sidebar)
3. Run these commands:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   # Follow prompts to create admin user
   ```

### 4. Seed Your Data

Still in the Render Shell:
```bash
python seed.py
```

This will populate:
- All 20 places
- 102 social media posts with sentiment
- Events, vendors, stays
- Sample data for analytics

### 5. Verify Deployment

Your backend URL will be: `https://tourism-backend.onrender.com`

Test it:
```bash
curl https://tourism-backend.onrender.com/api/overview-metrics/
curl https://tourism-backend.onrender.com/api/analytics/places/popular/
curl https://tourism-backend.onrender.com/api/sentiment/summary/
```

---

## 🔧 Update Frontend

Once backend is deployed, update `frontend/src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' 
  : 'https://tourism-backend.onrender.com/api';
```

Then deploy frontend to Vercel:
```bash
cd frontend
vercel --prod
```

---

## 📊 What Your Deployed Backend Will Have:

**After running seed.py on Render:**

✅ **Places:** 20 tourism destinations
   - Langkawi (12 social posts)
   - Alor Setar (25 posts)
   - Kuala Lumpur, Penang, etc.

✅ **Social Media:** 102 posts with:
   - Platform distribution (Instagram, Facebook, Twitter, TikTok)
   - Sentiment analysis (positive/neutral/negative)
   - Engagement metrics (likes, comments, shares)

✅ **Analytics:**
   - 8,474 total visitors
   - 165,576 social engagement
   - Sentiment breakdown by category
   - Platform performance metrics
   - Daily trends and hourly patterns

✅ **Events:** 15 cultural/tourism events
✅ **Vendors:** 4 restaurants with menus
✅ **Stays:** 8 hotels/accommodations

---

## 🔍 Troubleshooting

**If seed.py fails:**
```bash
# In Render Shell:
python manage.py shell
>>> from analytics.models import Place, SocialPost
>>> Place.objects.count()  # Should show 20
>>> SocialPost.objects.count()  # Should show 102
```

**Check logs:**
- Render Dashboard → Your Service → "Logs" tab

**Re-run migrations:**
```bash
python manage.py migrate --run-syncdb
```

---

## ✅ Success Checklist

- [ ] PostgreSQL database created on Render
- [ ] Web service deployed successfully
- [ ] Migrations run (`python manage.py migrate`)
- [ ] Superuser created
- [ ] Data seeded (`python seed.py`)
- [ ] Test endpoints returning data
- [ ] Frontend updated with backend URL
- [ ] Frontend deployed to Vercel
- [ ] Full application working!

---

## 💡 Pro Tips

1. **Free tier limitations:**
   - Render free tier sleeps after 15 min inactivity
   - First request after sleep takes ~30 seconds
   - Database has 1GB storage limit

2. **Keep data persistent:**
   - PostgreSQL keeps all data even when service sleeps
   - Unlike SQLite, your data survives restarts!

3. **Monitor your app:**
   - Render Dashboard shows request logs, errors, metrics
   - Set up email alerts for downtime

4. **Update easily:**
   - Just `git push` to main branch
   - Render auto-deploys on every push!

---

**Your backend will have ALL the data we've been working with locally!** 🎉
