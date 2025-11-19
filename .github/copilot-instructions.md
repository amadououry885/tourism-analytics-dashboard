# Tourism Analytics Dashboard — AI Agent Instructions

Essential guide for AI coding agents working in this codebase. Focus: architecture patterns, dev workflows, and project-specific conventions.

## 1. Architecture Overview

**Full-stack Tourism Analytics Platform** — React + TypeScript frontend, Django REST backend.

**Critical Pattern: Hybrid Data Architecture**
- Components initialize with demo/fallback data for instant UI load
- `useEffect` fetches from backend APIs and overwrites state only if successful
- Pattern: `const [data, setData] = useState(defaultData)` → `useEffect(() => fetch().then(setData))` → graceful degradation on error
- Example: `frontend/src/components/OverviewMetrics.tsx`, `AccommodationStats.tsx`, `EventsTimeline.tsx`

**Why?** Ensures presentation-ready UI even when backend is unavailable. Critical for demos and offline development.

## 2. Quick Start (Run These First)

**Backend (SQLite dev):**
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000  # Note: 8000, not 8001
```

**Frontend (Vite dev server):**
```bash
cd frontend
npm install
npm run dev  # Runs on port 3000 (see vite.config.js)
```

**Celery (optional background tasks):**
```bash
cd backend
celery -A tourism_api.celery worker -l info
celery -A tourism_api.celery beat -l info  # Scheduler for periodic tasks
```

## 3. Port Configuration & Common Gotchas

**Port Mismatch Issues:**
- Backend default: `8000` (see `backend/tourism_api/settings.py`)
- Frontend proxy: `http://localhost:8000` (see `frontend/vite.config.js`)
- **Problem:** Many frontend components hardcode `http://127.0.0.1:8001` (legacy) — if backend not responding, check URLs
- **Fix locations:** `frontend/src/services/api.ts`, `frontend/src/contexts/AuthContext.tsx`, component fetch calls

**Vite Proxy Setup:**
- Vite proxies `/api/*` → `http://localhost:8000` (configured in `vite.config.js`)
- API calls should use relative paths `/api/...` to utilize proxy
- CORS: Backend allows `http://localhost:3000` in `CORS_ALLOWED_ORIGINS`

## 4. Authentication & Permissions (RBAC)

**Custom User Model:** `users.User` with role-based access
- Roles: `admin`, `vendor`, `stay_owner`
- Approval workflow: Vendors/stay owners require admin approval (`is_approved=True`)
- Auth: JWT with SimpleJWT (`ACCESS_TOKEN_LIFETIME=5h`, `REFRESH_TOKEN_LIFETIME=1d`)

**Key Settings:**
- `AUTH_USER_MODEL = 'users.User'` in `backend/tourism_api/settings.py`
- Auto-approval for admins in `users/models.py` `save()` method

**Custom Permissions** (see `backend/common/permissions.py`):
- `IsAdmin`: Admin-only access
- `IsApprovedVendor`: Approved vendors only
- `IsApprovedStayOwner`: Approved stay owners only
- `IsVendorOwnerOrReadOnly`: Vendors can edit own profiles, others read-only

**Authentication Endpoints:**
- Register: `POST /api/auth/register/`
- Login: `POST /api/auth/login/` (returns `access` and `refresh` tokens)
- Refresh: `POST /api/auth/token/refresh/`
- Current user: `GET /api/auth/me/`
- Approval workflow: `GET /api/auth/admin/users/pending/`, `POST /api/auth/admin/users/<id>/approve/`

**Frontend Auth:**
- Axios interceptor in `frontend/src/services/api.ts` adds JWT to all requests
- Auto-refresh on 401 response
- Tokens stored in `localStorage`

## 5. Key Files & Modules

**Backend Core:**
- `backend/tourism_api/settings.py` — DB (SQLite at `backend/data/db.sqlite3`), CORS, JWT, Celery config
- `backend/tourism_api/urls.py` — Root URL config; note auth first, then analytics, then CRUD apps
- `backend/analytics/api_urls.py` — 20+ analytics endpoints (metrics, sentiment, social, rankings)
- `backend/analytics/views_new.py` — Aggregation-style analytics views (prefer adding new analytics here)
- `backend/analytics/models.py` — `Place`, `SocialPost` with `created_by` FK to User
- `backend/analytics/tasks.py` — Celery tasks for social media scraping (see `@shared_task`)
- `backend/tourism_api/celery.py` — Beat schedule (runs scraper every 2 hours)
- `backend/common/permissions.py` — Custom RBAC permissions

**Frontend Core:**
- `frontend/src/components/` — Dashboard components with hybrid data pattern
- `frontend/src/services/api.ts` — Axios instance with JWT interceptor (`API_BASE_URL = 'http://127.0.0.1:8001/api'` ⚠️ hardcoded)
- `frontend/src/lib/hybrid.ts` — Utility functions for hybrid fetch pattern (`fetchHybrid`, `buildUrlWithParams`)
- `frontend/src/contexts/AuthContext.tsx` — Auth state management
- `frontend/vite.config.js` — Proxy config (`/api` → `http://localhost:8000`)

**Data & Seeding:**
- `backend/seed.py` — Main seeding script (Places, Events, Stays, Vendors, Transport, SocialPosts)
- `backend/populate_attendance.py`, `backend/populate_places.py` — Additional seed utilities
- Run: `cd backend && python seed.py` to populate demo data

## 6. API Structure

**Analytics Endpoints** (`/api/analytics/...` or `/api/...`):
- Metrics: `/api/analytics/overview-metrics/`, `/api/metrics/visitors`
- Social: `/api/analytics/social-engagement/`, `/api/analytics/social-platforms/`
- Rankings: `/api/analytics/places/popular/`, `/api/rankings/top-pois/`
- Sentiment: `/api/sentiment/summary/`, `/api/sentiment/by-category/`
- Events: `/api/analytics/events/attendance-trend/`

**CRUD Endpoints** (DRF ViewSets):
- Vendors: `/api/vendors/` (`VendorViewSet` with owner filtering)
- Events: `/api/events/` (`EventViewSet`)
- Stays: `/api/stays/` (`StayViewSet`)
- Transport: `/api/transport/places/`, `/api/transport/routes/`

**Endpoint Discovery Pattern:**
- Check `backend/analytics/api_urls.py` for analytics routes
- Check `backend/api/urls.py` for CRUD apps (uses DRF `DefaultRouter`)
- URL pattern: `router.register(r'vendors', VendorViewSet, basename='vendor')` → `/api/vendors/`

## 7. Database Models

**Multi-App Schema:**
- `analytics.Place`: Tourism places with geolocation, category, pricing, `created_by` (admin)
- `analytics.SocialPost`: Social media posts linked to places, sentiment analysis
- `events.Event`: Events with attendance tracking (`expected_attendance`, `actual_attendance`)
- `stays.Stay`: Accommodations with type, pricing, `owner` (stay_owner user)
- `vendors.Vendor`: Restaurants/businesses with cuisines, `owner` (vendor user)
- `transport.Route`: Transport routes with mode, pricing, `created_by` (admin)
- `users.User`: Custom user model with `role`, `is_approved`

**FK Pattern:** Most models have `created_by` or `owner` FK to `settings.AUTH_USER_MODEL` for ownership tracking.

## 8. Frontend Component Pattern

**Standard Component Structure:**
```typescript
// 1. Import demo/default data
const defaultData = [...];

// 2. Initialize state with default
const [data, setData] = useState(defaultData);

// 3. Fetch from API in useEffect
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await axios.get('/api/...');
      setData(response.data);  // Overwrite only on success
    } catch (error) {
      console.error('Error:', error);
      // Keep defaultData on error
    }
  };
  fetchData();
}, [dependencies]);
```

**DO NOT** remove demo data or convert to API-only unless explicitly requested. Preserve hybrid pattern.

## 9. Background Tasks (Celery)

**Task Definition:**
- Decorated with `@shared_task` in `backend/analytics/tasks.py`
- Main task: `collect_and_process_social_posts()` — scrapes social media, classifies with AI, stores in DB

**Schedule:**
- Defined in `backend/tourism_api/celery.py` `beat_schedule`
- Default: Every 2 hours (`crontab(minute=0, hour='*/2')`)

**Dependencies:**
- Redis as broker: `redis://localhost:6379/0`
- Timezone: `Asia/Kuala_Lumpur`

## 10. Testing & Migrations

**Django Tests:**
```bash
cd backend
python manage.py test  # Run all tests
python manage.py test analytics  # Specific app
```

**Migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

**Important:** Migrations exist for auth system (`users.User` as `AUTH_USER_MODEL`). Don't create conflicting migrations.

## 11. Deployment (AWS Elastic Beanstalk)

- **Procfile:** `gunicorn --bind 127.0.0.1:8000 --workers 2 tourism_api.wsgi`
- **Docker:** `docker-compose.yml` includes PostGIS, Redis, backend, frontend services
- **Static files:** Collected to `backend/staticfiles/` with WhiteNoise

## 12. Troubleshooting Quick Checks

**Frontend shows demo data only:**
1. Check backend is running on port 8000
2. Inspect browser devtools → Network tab for failed `/api/...` requests
3. Check for CORS errors (backend must allow `http://localhost:3000`)
4. Verify hardcoded URLs in components use correct port (many still use `8001`)

**Celery tasks not running:**
1. Redis must be running: `redis-server` or Docker Compose
2. Start worker: `celery -A tourism_api.celery worker -l info`
3. Start beat: `celery -A tourism_api.celery beat -l info`
4. Check `backend/tourism_api/celery.py` for task schedule

**Database issues:**
1. Confirm SQLite path: `backend/data/db.sqlite3` (check `settings.py` `SQLITE_PATH`)
2. Run migrations: `python manage.py migrate`
3. Seed data: `python seed.py`

**Auth/Permission errors:**
1. Check user has correct `role` and `is_approved=True` (if vendor/stay_owner)
2. Admins are auto-approved in `User.save()`
3. Inspect `common/permissions.py` for permission logic
4. ViewSets may filter by ownership (see `VendorViewSet.get_queryset()`)

## 13. Project-Specific Conventions

**When adding new analytics endpoints:**
- Add to `backend/analytics/views_new.py` (not `views.py`)
- Register in `backend/analytics/api_urls.py`
- Follow existing patterns: use `APIView`, return JSON with camelCase keys

**When adding frontend components:**
- Use hybrid data pattern (demo data + API fetch)
- Place demo data in component file or `frontend/src/data/`
- Use `axios` for API calls, add error handling with try-catch
- Follow Recharts patterns for charts, react-leaflet for maps

**Code style:**
- Backend: DRF serializers for all API responses, use `queryset.filter()` for permissions
- Frontend: TypeScript interfaces for all API response types, use Radix UI components
    ```instructions
    # AI Agent Instructions — Tourism Analytics Dashboard

    Quick, actionable guidance to get an AI coding agent productive in this repo.

    1) Big picture
    - Full-stack: React + TypeScript frontend in `frontend/` and Django + DRF backend in `backend/` (app entry: `backend/tourism_api/`).
    - Hybrid data pattern: frontend bundles demo JSON in `frontend/src/data/` and components initialize from those files, then call backend APIs in a `useEffect` and overwrite state only if live data returns. See `frontend/src/pages/*` and `MapView.tsx` for examples.

    2) Local dev (do this first)
    - Backend (SQLite dev):
        - cd backend
        - pip install -r requirements.txt
        - python manage.py migrate
        - python manage.py runserver 8000
    - Frontend (Vite):
        - cd frontend
        - npm install
        - npm run dev  # Vite dev server; `server.port` is configured in `frontend/vite.config.js` (default 3000)
    - Celery (optional):
        - cd backend
        - celery -A tourism_api.celery worker -l info
        - celery -A tourism_api.celery beat -l info

    3) Ports, proxy & CORS gotchas
    - Vite proxies `/api` → backend (see `frontend/vite.config.js`). If frontend shows demo data only, check that proxy target matches `backend` port (default 8000).
    - Backend envs & CORS are in `backend/tourism_api/settings.py` (defaults point to `backend/data/db.sqlite3` and allow `http://localhost:3000`). Update `ALLOWED_HOSTS`/CORS when changing ports.

    4) Key files to inspect (high-value)
    - Frontend: `frontend/src/data/` (demo payloads), `frontend/src/components/*` and `frontend/src/pages/*` (how components fetch/merge backend data), `frontend/vite.config.js` (port/proxy).
    - Backend: `backend/tourism_api/settings.py`, `backend/tourism_api/urls.py`, `backend/analytics/views_new.py` (aggregations), `backend/analytics/views_crud.py` (ViewSets), `backend/analytics/tasks.py`, `backend/tourism_api/celery.py` (beat schedule).
    - Data & seeds: `backend/seed.py`, `backend/populate_attendance.py`, `backend/populate_places.py` — used to produce demo DB used by frontend fallback.

    5) Integration points & third-party libs
    - Mapping: react-leaflet / Leaflet (frontend `MapView`), backend may assume geospatial queries in analytics views.
    - Charts: Recharts (follow existing chart props and data shapes in `frontend/src/components/`).
    - Background jobs: Celery + Redis (default broker `redis://localhost:6379/0`).
    - Deployment: Elastic Beanstalk + Docker; check `Procfile`, `docker-compose.yml`, and `staticfiles/` for deployment-related wiring.

    6) Useful endpoints and patterns
    - Common analytics routes: `/api/analytics/overview-metrics/`, `/api/analytics/places/popular/` (see `backend/analytics/api_urls.py`).
    - CRUD endpoints: `/api/vendors/`, `/api/stays/`, `/api/events/` (ViewSets defined under `backend/analytics/views_crud.py`).

    7) Tests & migrations
    - Run Django tests: `python manage.py test` (from `backend/`).
    - Migrations: use `makemigrations` then `migrate` and inspect `backend/migrations/`.

    8) Troubleshooting / quick checks
    - Frontend stuck on demo: open browser devtools network tab, confirm `/api/*` requests and CORS errors.
    - Celery missing tasks: ensure Redis reachable and start Celery with the `-A tourism_api.celery` app.
    - DB mismatch: confirm `backend/data/db.sqlite3` is the DB in use (check `tourism_api/settings.py`).

    Notes: preserve the hybrid demo-first UI pattern when changing component startup logic. Prefer adding new analytics endpoints in `backend/analytics/views_new.py` (aggregation-style) and expose them via `api_urls.py` so the frontend can pick them up without changing client code.

    If you'd like, I can also add a short README snippet showing a minimal dev shell script (start DB, seed, run backend, run frontend). Ask and I will add it.
    ```
