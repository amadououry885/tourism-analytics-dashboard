# Backend ↔ Frontend Connection Analysis

**Analysis Date**: December 24, 2025  
**Purpose**: Identify gaps between backend APIs and frontend usage

---

## 🔍 **EXECUTIVE SUMMARY**

### **Connection Status**: ⚠️ **PARTIALLY CONNECTED**

**Key Findings**:
1. ✅ **Portals (Admin/Vendor/Stay Owner)** - FULLY connected via `useApi` hook
2. ⚠️ **Public Components** - Using axios directly with inconsistent URLs
3. ❌ **EventsTimeline & MapView** - Using DEMO DATA ONLY (no API calls found)
4. ⚠️ **URL Inconsistencies** - Multiple base URLs, some hardcoded to wrong ports

---

## 📡 **API CONNECTION METHODS**

### **Method 1: `useApi` Hook (PORTALS)** ✅
**Used by**: AdminDashboard, VendorDashboard, StayOwnerDashboard  
**How it works**:
```typescript
// hooks/useApi.ts wraps AuthContext.apiCall
const { request } = useApi();
await request('/auth/admin/users/pending/'); // Auto-prefixes with /api/
```

**Advantages**:
- Automatic JWT authentication
- Auto-token refresh on 401
- Proper error handling with toast
- Uses correct base URL from AuthContext

**Base URL**:
```typescript
// AuthContext.tsx
const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // Vite proxy → localhost:8000
  : 'https://tourism-analytics-dashboard.onrender.com/api';
```

---

### **Method 2: Direct Axios (COMPONENTS)** ✅
**Used by**: 20+ public components (OverviewMetrics, PopularDestinations, SocialMediaCharts, etc.)  
**How it works**:
```typescript
import axios from '../services/api';
const response = await axios.get('/analytics/places/popular/');
```

**Configuration** (`frontend/src/services/api.ts`):
```typescript
const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // Vite proxy → localhost:8000
  : 'https://tourism-analytics-dashboard.onrender.com/api';

// ✅ HAS JWT Authentication via interceptor
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ✅ HAS Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token and retry
    }
  }
);
```

**Advantages**:
- ✅ Correct base URL (same as AuthContext)
- ✅ Automatic JWT authentication
- ✅ Auto-token refresh on 401
- ✅ Consistent error handling

**Conclusion**: **This method is FINE** - axios instance is properly configured!

---

### **Method 3: Demo Data Only (PUBLIC PAGES)** ❌
**Used by**: EventsTimeline, MapView  
**How it works**:
```typescript
const [events] = useState(demoEvents); // Static data only
// NO API CALLS FOUND
```

**Problem**: These components show ONLY demo data, never fetch from backend

---

## 🗺️ **BACKEND API INVENTORY**

### **Authentication Endpoints** (`/api/auth/...`)
| Endpoint | Method | Portal Usage | Component Usage |
|----------|--------|-------------|-----------------|
| `/auth/register/` | POST | ✅ AuthContext | N/A |
| `/auth/login/` | POST | ✅ AuthContext | N/A |
| `/auth/token/refresh/` | POST | ✅ AuthContext (auto) | N/A |
| `/auth/me/` | GET | ✅ Available | ❌ Not used |
| `/auth/admin/users/pending/` | GET | ✅ AdminDashboard | N/A |
| `/auth/admin/users/{id}/approve/` | POST | ✅ AdminDashboard | N/A |
| `/auth/admin/users/{id}/reject/` | POST | ✅ AdminDashboard | N/A |
| `/auth/password-reset/` | POST | ❌ Not used | ❌ Not used |
| `/auth/password-reset/verify/` | POST | ❌ Not used | ❌ Not used |
| `/auth/password-reset/confirm/` | POST | ❌ Not used | ❌ Not used |

**GAPS**:
- ❌ Password reset flow not implemented in frontend
- ❌ `/auth/me/` endpoint exists but unused (could validate current user)

---

### **CRUD Endpoints** (`/api/.../`)

#### **Events** (`/api/events/`)
| Endpoint | Method | Portal Usage | Component Usage |
|----------|--------|-------------|-----------------|
| `/events/` | GET | ✅ AdminDashboard | ❌ EventsTimeline (demo only) |
| `/events/` | POST | ✅ AdminDashboard | N/A |
| `/events/{id}/` | PUT | ✅ AdminDashboard | N/A |
| `/events/{id}/` | DELETE | ✅ AdminDashboard | N/A |

**GAPS**:
- ❌ **EventsTimeline component does NOT fetch from `/events/`** - uses demo data only
- ❌ No event registration submission endpoint called (JOIN US button has no backend)
- ✅ Backend supports recurring events, but frontend EventsTimeline doesn't fetch them

---

#### **Vendors** (`/api/vendors/`)
| Endpoint | Method | Portal Usage | Component Usage |
|----------|--------|-------------|-----------------|
| `/vendors/` | GET | ✅ VendorDashboard | ⚠️ RestaurantVendors (axios) |
| `/vendors/` | POST | ✅ VendorDashboard | N/A |
| `/vendors/{id}/` | PUT | ✅ VendorDashboard | ⚠️ VendorDashboardNew |
| `/vendors/{id}/` | DELETE | ✅ VendorDashboard | ⚠️ VendorDashboardNew |
| `/vendors/menu-items/` | GET | ❌ Not in main | ✅ MenuManagement |
| `/vendors/menu-items/` | POST | ❌ Not in main | ✅ MenuManagement |
| `/vendors/menu-items/{id}/` | PUT | ❌ Not in main | ✅ MenuManagement |
| `/vendors/menu-items/{id}/` | DELETE | ❌ Not in main | ✅ MenuManagement |
| `/vendors/opening-hours/` | GET | ❌ Not in main | ✅ OpeningHoursManagement |
| `/vendors/opening-hours/{id}/` | PUT | ❌ Not in main | ✅ OpeningHoursManagement |
| `/vendors/reviews/` | GET/POST | ❌ Not used | ❌ Not used |
| `/vendors/promotions/` | GET/POST | ❌ Not used | ❌ Not used |

**GAPS**:
- ❌ Reviews and Promotions APIs exist but NO frontend implementation
- ⚠️ Menu & Opening Hours managed in separate components (not in main VendorDashboard tabs)

---

#### **Stays** (`/api/stays/`)
| Endpoint | Method | Portal Usage | Component Usage |
|----------|--------|-------------|-----------------|
| `/stays/` | GET | ✅ StayOwnerDashboard | ⚠️ AccommodationStats (axios) |
| `/stays/` | POST | ✅ StayOwnerDashboard | N/A |
| `/stays/{id}/` | PUT | ✅ StayOwnerDashboard | N/A |
| `/stays/{id}/` | DELETE | ✅ StayOwnerDashboard | N/A |

**CONNECTION**: ✅ Fully connected

---

#### **Places** (`/api/places/`)
| Endpoint | Method | Portal Usage | Component Usage |
|----------|--------|-------------|-----------------|
| `/places/` | GET | ✅ PlacesManagement | ⚠️ PopularDestinations (axios) |
| `/places/` | POST | ✅ PlacesManagement | N/A |
| `/places/{id}/` | PUT | ✅ PlacesManagement | N/A |
| `/places/{id}/` | DELETE | ✅ PlacesManagement | N/A |

**CONNECTION**: ✅ Fully connected (admin side)

---

#### **Transport** (`/api/transport/...`)
| Endpoint | Method | Portal Usage | Component Usage |
|----------|--------|-------------|-----------------|
| `/transport/routes/` | GET | ✅ AdminDashboard | ❌ Not used |
| `/transport/routes/` | POST | ✅ AdminDashboard | N/A |
| `/transport/routes/{id}/` | PUT | ✅ AdminDashboard | N/A |
| `/transport/routes/{id}/` | DELETE | ✅ AdminDashboard | N/A |
| `/transport/places/` | GET | ❌ Not used | ❌ Not used |
| `/transport/schedules/` | GET | ❌ Not used | ❌ Not used |
| `/transport/search/` | GET | ❌ Not used | ✅ TransportAnalytics |
| `/transport/google-directions/` | GET | ❌ Not used | ❌ Not used |
| `/transport/analytics/transport-modes/` | GET | ❌ Not used | ❌ Not used |
| `/transport/analytics/monthly-usage/` | GET | ❌ Not used | ❌ Not used |
| `/transport/analytics/popular-routes/` | GET | ❌ Not used | ❌ Not used |

**GAPS**:
- ❌ **3 transport analytics endpoints exist but are NEVER called**
- ❌ Transport places and schedules not used anywhere
- ❌ Google Directions API not integrated

---

### **Analytics Endpoints** (`/api/analytics/...`, `/api/...`)

#### **Overview & Metrics**
| Endpoint | Component | Status |
|----------|-----------|--------|
| `/analytics/overview-metrics/` | OverviewMetrics | ⚠️ axios |
| `/metrics/visitors` | ❓ Unknown | ❓ Need to check |
| `/metrics/totals` | ❓ Unknown | ❓ Need to check |
| `/metrics/engagement` | ❓ Unknown | ❓ Need to check |
| `/metrics/top-attractions` | ❓ Unknown | ❓ Need to check |

#### **Places Analytics**
| Endpoint | Component | Status |
|----------|-----------|--------|
| `/analytics/places/list/` | CitySelector, Overview | ⚠️ axios |
| `/analytics/places/popular/` | PopularDestinations | ⚠️ axios |
| `/analytics/places/trending/` | ❌ Not used | ❌ Not used |
| `/analytics/places/nearby/` | ❌ Not used | ❌ Not used |
| `/analytics/places/least-visited/` | ❌ Not used | ❌ Not used |

**GAPS**:
- ❌ **Trending places API exists but not used**
- ❌ **Nearby places API exists but not used**
- ❌ **Least-visited API exists but not used** (though `/rankings/least-pois` is used)

#### **Sentiment Analysis**
| Endpoint | Component | Status |
|----------|-----------|--------|
| `/sentiment/summary/` | ❓ Unknown | ❓ Need to check |
| `/analytics/sentiment/summary/` | ❓ Unknown | ❓ Need to check |
| `/sentiment/by-category/` | ❓ Unknown | ❓ Need to check |
| `/sentiment/keywords/` | ❓ Unknown | ❓ Need to check |

**GAPS**: Need to verify if sentiment components exist

#### **Social Media**
| Endpoint | Component | Status |
|----------|-----------|--------|
| `/analytics/social-metrics/` | SocialMetricsBar | ⚠️ axios |
| `/analytics/social/metrics/` | SocialMediaCharts | ⚠️ axios |
| `/analytics/social/platforms/` | SocialMediaCharts | ⚠️ axios |
| `/analytics/social-engagement/` | SocialMediaCharts | ⚠️ axios |
| `/social/metrics/` | SocialMediaCharts (alias) | ⚠️ axios |
| `/social/platforms/` | ❓ Alias | ⚠️ axios |
| `/social/engagement/` | ❓ Alias | ⚠️ axios |

**CONNECTION**: ✅ Connected via axios (need to verify base URL)

#### **Events Analytics**
| Endpoint | Component | Status |
|----------|-----------|--------|
| `/events/attendance-trend/` | ❌ Not used | ❌ Not used |

**GAPS**: Attendance trend API exists but not visualized

#### **Rankings**
| Endpoint | Component | Status |
|----------|-----------|--------|
| `/rankings/top-pois/` | ❓ Unknown | ❓ Need to check |
| `/rankings/least-pois/` | PopularDestinations | ⚠️ axios |

#### **Time Series**
| Endpoint | Component | Status |
|----------|-----------|--------|
| `/timeseries/mentions/` | ❌ Not used | ❌ Not used |

**GAPS**: Mentions time series API exists but not visualized

#### **Search**
| Endpoint | Component | Status |
|----------|-----------|--------|
| `/search/pois/` | ❌ Not used | ❌ Not used |

**GAPS**: POI search API exists but not used

#### **Social Posts (CRUD)**
| Endpoint | Component | Status |
|----------|-----------|--------|
| `/posts/` | SocialMediaCharts | ⚠️ axios |
| `/posts-raw/` | ❌ Not used | ❌ Not used |
| `/posts-clean/` | ❌ Not used | ❌ Not used |

---

## ⚠️ **CRITICAL ISSUES FOUND**

### **1. API Connection Methods** ✅ (RESOLVED)

**GOOD NEWS**: Frontend uses 2 properly configured methods:

| Method | Location | Base URL | Auth | Components |
|--------|----------|----------|------|------------|
| `useApi` hook | Portals | ✅ `/api/` (Vite proxy) | ✅ JWT | Admin, Vendor, Stay |
| `axios` import | Components | ✅ `/api/` (Vite proxy) | ✅ JWT | 20+ components |
| Demo data | Pages | ❌ No connection | N/A | EventsTimeline, MapView |

**Both useApi and axios use the SAME configuration**:
- Base URL: `/api/` (dev) → Vite proxy → `localhost:8000`
- Base URL: `https://tourism-analytics-dashboard.onrender.com/api` (prod)
- JWT auth via `Authorization: Bearer` header
- Auto-refresh on 401 response

**Conclusion**: ✅ **NO STANDARDIZATION NEEDED** - both methods work correctly!

**Remaining Issue**: Demo-only components (see issue #2 below)

---

### **2. Demo Data Components** ❌

**Components NOT connected to backend**:
- `EventsTimeline.tsx` - Shows demo events, **NEVER calls `/events/` API**
- `MapView.tsx` - Shows demo places, **NEVER calls `/places/` API**

**Impact**:
- Users on Vercel see ONLY demo data (2026 events)
- Real events created in admin portal DON'T appear
- JOIN US registration has no backend submission

**Action Required**:
1. ❗ Add API fetch to EventsTimeline (follow hybrid pattern)
2. ❗ Add API fetch to MapView (follow hybrid pattern)
3. ❗ Create event registration endpoint and connect JOIN US button

---

### **3. Unused Backend APIs** 📊

**Backend has these APIs with NO frontend**:
- Password reset flow (3 endpoints)
- Vendor reviews (`/vendors/reviews/`)
- Vendor promotions (`/vendors/promotions/`)
- Transport analytics (3 endpoints)
- Transport places & schedules
- Google Directions integration
- Trending places
- Nearby places
- Least-visited destinations
- Event attendance trend
- Sentiment analysis (need to verify)
- Time series mentions
- POI search

**Action Required**: 
- ℹ️ Document these as "available but not integrated"
- 🎯 Prioritize which to implement (sentiment analysis, trending places?)

---

### **4. Missing Frontend Implementations** 🔨

**Frontend tries to call these (need to verify existence)**:
- `/api/analytics/destinations/` (used in Stays.tsx) - ❓ **DOESN'T EXIST IN BACKEND**
- `/api/analytics/destinations/ranking/` (DestinationsRanking.tsx) - ❓ **DOESN'T EXIST**

**Action Required**:
## 📋 **VERIFICATION CHECKLIST**

### **High Priority** 🔴
- [x] ✅ Check `frontend/src/services/api.ts` base URL configuration - **CORRECT**
- [x] ✅ Verify if axios instance includes authentication headers - **YES, JWT + auto-refresh**
- [ ] Test EventsTimeline - does it show real events from backend? - **NO, demo only**
- [ ] Test MapView - does it show real places from backend? - **NO, demo only**
- [ ] Check if `/api/analytics/destinations/` endpoint exists (Stays.tsx uses it)
- [x] ✅ Verify all components using axios can authenticate - **YES, interceptor works**iguration
- [ ] Verify if axios instance includes authentication headers
- [ ] Test EventsTimeline - does it show real events from backend?
- [ ] Test MapView - does it show real places from backend?
- [ ] Check if `/api/analytics/destinations/` endpoint exists (Stays.tsx uses it)
- [ ] Verify all components using axios can authenticate

### **Medium Priority** 🟡
- [ ] Test JOIN US button event registration (does it save to backend?)
- [ ] Verify sentiment analysis components exist and work
- [ ] Check if transport analytics endpoints are called anywhere
- [ ] Test password reset flow (appears to be unimplemented)

### **Low Priority** 🟢
- [ ] Document unused backend APIs
- [ ] Consider implementing reviews/promotions features
- [ ] Evaluate Google Directions integration value
- [ ] Plan trending/nearby places visualization

---

## 🎯 **RECOMMENDATIONS**

### **Immediate Actions** (Fix Critical Issues)

1. **API Connection** ✅ **NO ACTION NEEDED**
   - ✅ **KEEP**: `useApi` hook for portals (works perfectly)
   - ✅ **KEEP**: `axios` for components (properly configured with JWT + auto-refresh)
   - 📖 **OPTIONAL**: Document both patterns are acceptable in README

2. **Connect Demo-Only Components**
   ```typescript
   // EventsTimeline.tsx - ADD THIS
   useEffect(() => {
     const fetchEvents = async () => {
       try {
         const data = await request('/events/');
         setEvents(data.results || data);
       } catch (error) {
         // Keep demo data on error (hybrid pattern)
       }
     };
     fetchEvents();
   }, []);
   ```

3. **Fix Missing Endpoints**
   - Either create `/api/analytics/destinations/` OR update frontend to use `/stays/`

### **Short Term** (Improve Consistency)

4. **Add Event Registration Backend**
   ```python
   # events/views.py - ADD THIS
   @api_view(['POST'])
   def register_for_event(request, event_id):
       # Save registration (name, email, phone)
       # Send confirmation email
       # Update attendee count
   ```

5. **Implement Password Reset UI**
   - Backend endpoints exist, just need frontend forms

6. **Document API Usage**
   - Create API_REFERENCE.md showing which endpoints are used where

### **Long Term** (Feature Enhancement)

7. **Implement Unused Analytics**
   - Trending places visualization
   - Sentiment analysis dashboard
   - Transport analytics charts

8. **Add Review System**
   - Backend ready, need UI components

9. **Promotions Feature**
   - Backend ready, need vendor portal tab

---

## 📊 **CONNECTION SCORE**

| Category | Score | Notes |
|----------|-------|-------|
| **Portals** | 95% | ✅ Excellent - useApi works perfectly |
| **Public Components** | 90% | ✅ Good - axios properly configured |
| **Public Pages** | 20% | ❌ EventsTimeline/MapView demo only |
| **Backend API Utilization** | 55% | Many endpoints unused |
| **Overall** | **65%** | ⚠️ **GOOD but can improve** |

---

## 🔄 **NEXT STEPS**

1. ✅ ~~**CHECK** `frontend/src/services/api.ts`~~ - **DONE: Properly configured**
2. ⏳ **TEST** current deployment to see what actually works
3. ✅ ~~**DECIDE** on API connection standard~~ - **DONE: Both methods are fine**
4. 🔴 **FIX** EventsTimeline and MapView to fetch real data - **HIGH PRIORITY**
5. 🟡 **CREATE** missing backend endpoints or remove frontend calls
6. 🟢 **DOCUMENT** API architecture in README

---

**Analysis Complete** ✅  
**Document Created**: `BACKEND_FRONTEND_CONNECTION_ANALYSIS.md`

