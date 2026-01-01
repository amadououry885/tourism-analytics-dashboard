# 🚀 Redis Deployment Guide - Render vs Vercel

## Quick Answer

**Can Vercel run Redis?** ❌ **NO**
- Vercel is serverless (frontend only)
- No persistent background services
- No Redis support

**Can Render run Redis?** ✅ **YES**
- Full backend support
- Managed Redis service (free tier available)
- Supports Celery workers + Beat scheduler

---

## 🎯 Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│  VERCEL (Frontend)                                         │
│  - React/Vite app                                          │
│  - Static files                                            │
│  - CDN distribution                                        │
└────────────────┬───────────────────────────────────────────┘
                 │ API Calls
                 ▼
┌────────────────────────────────────────────────────────────┐
│  RENDER.COM (Backend)                                      │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 1. Django Web Service (tourism-analytics-dashboard) │ │
│  │    - Handles API requests                            │ │
│  │    - Connects to Redis for caching                   │ │
│  └──────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 2. Redis Service (tourism-redis)                     │ │
│  │    - Cache storage                                    │ │
│  │    - Celery message broker                           │ │
│  └──────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 3. Celery Worker (tourism-celery-worker)            │ │
│  │    - Processes background tasks                      │ │
│  │    - Social media scraping                           │ │
│  └──────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 4. Celery Beat (tourism-celery-beat)                │ │
│  │    - Schedules periodic tasks (every 2 hours)       │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## 📦 What's Deployed Where

| Component | Vercel | Render | Why |
|-----------|--------|--------|-----|
| React Frontend | ✅ | ❌ | Vercel is best for static/frontend |
| Django Backend | ❌ | ✅ | Needs Python runtime |
| Redis Cache | ❌ | ✅ | Needs persistent service |
| Celery Workers | ❌ | ✅ | Background processing |
| PostgreSQL | ❌ | ✅ (optional) | Database service |

---

## 🛠️ Deployment Instructions

### Step 1: Deploy to Render (Backend + Redis)

#### Option A: Using Dashboard (Easiest)

1. **Go to Render Dashboard**
   - https://dashboard.render.com

2. **Create Redis Service**
   - Click "New +" → "Redis"
   - Name: `tourism-redis`
   - Plan: Free (25MB)
   - Click "Create Redis"
   - **Copy the connection string** (Internal Redis URL)

3. **Create Web Service (Django)**
   - Click "New +" → "Web Service"
   - Connect GitHub repository: `amadououry885/tourism-analytics-dashboard`
   - Name: `tourism-analytics-dashboard`
   - Root Directory: `backend`
   - Environment: Python 3
   - Build Command:
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
     ```
   - Start Command:
     ```bash
     gunicorn --bind 0.0.0.0:$PORT --workers 2 tourism_api.wsgi
     ```

4. **Add Environment Variables**
   ```
   SECRET_KEY = [Auto-generate]
   DEBUG = False
   ENV = production
   
   REDIS_URL = [Paste from Redis service]
   CELERY_BROKER_URL = [Same as REDIS_URL]
   CELERY_RESULT_BACKEND = [Same as REDIS_URL]
   
   ALLOWED_HOSTS = tourism-analytics-dashboard.onrender.com
   CORS_ALLOWED_ORIGINS = https://tourism-analytics-dashboard.vercel.app
   
   EMAIL_HOST_USER = gaoualmanjallow@gmail.com
   EMAIL_HOST_PASSWORD = cpczyuxwhowihxmr
   ```

5. **Create Celery Worker**
   - Click "New +" → "Background Worker"
   - Name: `tourism-celery-worker`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `celery -A tourism_api.celery worker -l info`
   - Add environment variables (same REDIS_URL, etc.)

6. **Create Celery Beat**
   - Click "New +" → "Background Worker"
   - Name: `tourism-celery-beat`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `celery -A tourism_api.celery beat -l info`
   - Add environment variables

#### Option B: Using render.yaml (Infrastructure as Code)

1. **Push render.yaml to GitHub**
   ```bash
   git add render.yaml
   git commit -m "Add Render deployment config with Redis"
   git push origin main
   ```

2. **Create Blueprint in Render**
   - Dashboard → "New +" → "Blueprint"
   - Select your repository
   - Render will detect `render.yaml`
   - Click "Apply"

3. **All 4 services deploy automatically:**
   - Redis service
   - Django web service
   - Celery worker
   - Celery beat

### Step 2: Verify Deployment

1. **Check Redis Connection**
   ```bash
   # In Render Shell for web service
   python manage.py shell
   >>> from django.core.cache import cache
   >>> cache.set('test', 'hello')
   >>> cache.get('test')
   'hello'
   ```

2. **Check Celery Worker**
   - Go to Celery worker logs
   - Should see: `celery@... ready`

3. **Check Celery Beat**
   - Go to Beat logs
   - Should see: `Scheduler: Sending due task...`

4. **Test Cache Invalidation**
   ```bash
   # In Render Shell
   python manage.py cache_status
   ```

---

## 💰 Cost Breakdown

### Free Tier (Current Setup)

| Service | Render Free Tier | Cost |
|---------|------------------|------|
| Redis | 25MB storage | **FREE** |
| Web Service | 750 hours/month | **FREE** |
| Worker (Celery) | 750 hours/month | **FREE** |
| Worker (Beat) | 750 hours/month | **FREE** |
| **Total** | | **$0/month** |

**Limitations:**
- Redis: 25MB (enough for caching)
- Services spin down after 15min inactivity
- 750 hours/month (enough for 1 service running 24/7)

### Paid Tier (Production)

| Service | Plan | Cost |
|---------|------|------|
| Redis | Starter (256MB) | **$7/month** |
| Web Service | Starter | **$7/month** |
| Worker | Starter | **$7/month** |
| Worker Beat | Starter | **$7/month** |
| **Total** | | **$28/month** |

**Benefits:**
- No spin-down (always running)
- More memory/CPU
- Better performance

---

## 🔧 Alternative: Deploy Everything to One Platform

### Option 1: All on Render

✅ **Pros:**
- Everything in one place
- Easy to manage
- Redis included

❌ **Cons:**
- Frontend not as optimized as Vercel
- More expensive for high traffic

### Option 2: All on Railway

✅ **Pros:**
- Better free tier than Render
- Easier setup
- Built-in Redis

❌ **Cons:**
- Free tier runs out after $5 credit

### Option 3: All on Fly.io

✅ **Pros:**
- Good free tier
- Global edge deployment
- Redis support

❌ **Cons:**
- More complex setup

---

## 🎯 Recommended Production Setup

**For Your Project:**

```
Frontend: Vercel (FREE)
- Best CDN for React
- Global distribution
- Automatic HTTPS

Backend: Render (FREE or $7/month)
- Django web service
- Redis cache (managed)
- Celery workers
- Easy deployment

Alternative Backend: Railway ($5 credit, then ~$10/month)
- All services included
- Better performance
- Simpler setup
```

---

## 🚨 Current Issue: Why Render Backend Returns 500

Your Render backend is failing because:

1. **Missing Redis connection**
   - Current Render deployment has no Redis service
   - Cache operations fail
   - Celery can't connect

2. **Missing Environment Variables**
   - REDIS_URL not set
   - Other production configs missing

3. **No Celery Workers**
   - Background tasks not running
   - Scraping doesn't work

---

## ✅ Fix Your Current Render Deployment

### Quick Fix (Without Redis - Cache Disabled)

Update `settings.py` to fallback to dummy cache:

```python
# In backend/tourism_api/settings.py

if ENV == 'production' and not os.getenv('REDIS_URL'):
    # Fallback to dummy cache if Redis not available
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
        }
    }
else:
    # Use Redis cache
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': os.environ.get('REDIS_URL', 'redis://localhost:6379/1'),
        }
    }
```

This will make your backend work (but without caching).

### Proper Fix (With Redis)

1. Delete current Render web service
2. Follow "Step 1: Deploy to Render" above
3. Set up all 4 services (Redis, Web, Worker, Beat)

---

## 📊 What You Get With Full Setup

```
✅ Redis Cache
   - 90-226x faster analytics queries
   - Auto-invalidation after scraping
   
✅ Celery Workers
   - Background social media scraping
   - Email notifications
   
✅ Celery Beat
   - Scheduled tasks every 2 hours
   - Automatic cache invalidation
   
✅ Production Ready
   - Scalable architecture
   - Professional deployment
   - Monitoring included
```

---

## 🎓 For Your FYP Report

**Deployment Architecture Diagram:**

```
Internet
    │
    ├─→ Vercel CDN (Frontend)
    │     • React application
    │     • Global edge network
    │     • HTTPS + SSL
    │
    └─→ Render.com (Backend)
          ├─→ Web Service (Django)
          │     • REST API endpoints
          │     • Authentication
          │     • Data processing
          │
          ├─→ Redis Service
          │     • Cache layer
          │     • Message broker
          │     • Session storage
          │
          ├─→ Celery Worker
          │     • Social media scraping
          │     • Email notifications
          │     • Data processing
          │
          └─→ Celery Beat
                • Task scheduler
                • Periodic scraping
                • Cache invalidation
```

**Technical Justification:**

"The system uses a **distributed deployment architecture** with frontend and backend decoupled:

1. **Frontend (Vercel):** Optimized for static content delivery with global CDN
2. **Backend (Render):** Full-stack Python environment supporting:
   - Django REST API
   - Redis caching layer
   - Celery distributed task queue
   - Scheduled background jobs

This architecture ensures **high availability**, **scalability**, and **cost-effectiveness** while maintaining separation of concerns between presentation and business logic layers."

---

## 🚀 Next Steps

1. **Choose deployment option** (render.yaml recommended)
2. **Set up Redis on Render**
3. **Deploy all 4 services**
4. **Test caching works**
5. **Monitor performance**

Would you like me to help you deploy this now?
