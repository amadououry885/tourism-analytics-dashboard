# 🌍 Tourism Footprint Analytics System (Kedah)

> **Albukhary International University (AIU)**  
> Bachelor of Computer Science (Honours) — Data Science  
> Final Year Project (FYP)

---

## 📖 Overview

**Tourism Footprint Analytics System (Kedah)** is a full-stack web platform designed to collect, analyze, and visualize real-time tourism insights across Kedah, Malaysia.  
It empowers tourism boards, local vendors, and travelers to explore **stays, events, transport routes, and vendors**, supported by interactive analytics and geospatial visualization.

The project supports **sustainable tourism development** by combining data-driven intelligence with social engagement tools.

---

## 🎯 Objectives

1. Develop a centralized **tourism data platform** for Kedah state
2. Visualize and analyze tourism patterns (visitors, events, routes, stays)
3. Enable local businesses to gain visibility through integrated vendor listings
4. Promote data-informed decision-making for tourism stakeholders
5. Support sustainability through climate-conscious design and analytics
6. **Implement hybrid data architecture** for instant loading and reliability

## ✨ Key Features

### 📊 Advanced Analytics
- **Real-time Dashboard Metrics** - Visitor statistics, engagement rates, post counts
- **Social Media Analytics** - Platform-wise engagement trends (Instagram, Facebook, Twitter)
- **Sentiment Analysis** - Tourism sentiment breakdown with visual charts
- **Trending Destinations** - Dynamic ranking of popular and hidden gem locations
- **Event Attendance Tracking** - Expected vs actual attendance with trend analysis
- **Transport Analytics** - Mode statistics and popular route tracking

### 🔄 Hybrid Data Architecture
- **Instant Loading** - Demo data displays immediately (zero loading time)
- **Backend Integration** - Automatic API data fetching on component mount
- **Graceful Fallback** - Shows demo data when backend unavailable
- **Error Resilience** - Try-catch error handling with state preservation
- **Presentation-Ready** - Works perfectly with or without backend connection

### 🗺️ Geospatial Features
- **Interactive Maps** - Leaflet.js integration for location visualization
- **Nearby Search** - Find attractions, vendors, stays near specific coordinates
- **Route Mapping** - Visualize transport routes within and to/from Kedah
- **Spatial Queries** - PostGIS-powered location-based analytics

### 🔍 Search & Filter
- **Smart Search** - Autocomplete for vendors, stays, and transport routes
- **Multi-Filter** - Filter by price, rating, type, district, cuisine, date
- **Category Sorting** - Organize by accommodation type, event tags, transport modes
- **Date Range** - Filter events by time period (upcoming/past)

---

## 🏗️ System Architecture

**Hybrid Data Architecture** - The system uses a dual-data approach for optimal user experience:
- **Demo Data:** Embedded in frontend components for instant loading
- **Backend API:** Django REST Framework serving real-time analytics
- **Graceful Fallback:** Components display demo data when backend is unavailable

### Technology Stack

- **Frontend**: React 18.3.1 + TypeScript + Vite 5.4.21
- **UI Libraries**: Tailwind CSS + Radix UI + Recharts  
- **Backend**: Django 5.2.6 + Django REST Framework 3.15.2
- **Database**: PostgreSQL (AWS RDS) / SQLite (Development)  
- **Cloud Infrastructure**: AWS Elastic Beanstalk, EC2, S3, CloudFront  
- **Mapping**: Leaflet.js + React-Leaflet  
- **HTTP Client**: Axios for API communication
- **Future**: Celery + Redis (async processing)

---

## ⚙️ Core Modules

### 📊 Analytics Dashboard
- **Overview Metrics** - Real-time visitor statistics, engagement rates, post counts
- **Social Media Analytics** - Platform-wise engagement trends and performance
- **Popular Destinations** - Top visited places with visitor distribution charts
- **Hidden Gems** - Least visited destinations for tourism discovery
- **Sentiment Analysis** - Tourism sentiment breakdown (positive/neutral/negative)
- **Event Attendance Trends** - Expected vs actual attendance analytics
- Hybrid data approach (demo + backend) for instant loading

### 🏨 Stays
- Manage and view hotels, apartments, guest houses, and homestays
- Filter by price, rating, type, district, and amenities
- Integrated with geolocation coordinates for map display
- Statistics by accommodation type

### 🍜 Vendors
- Local restaurants, markets, and businesses with cuisines and locations
- City-based filtering and geospatial mapping
- Search functionality with autocomplete
- Cuisine categorization

### 🚗 Transport
- Route analytics **within Kedah (Intra-Kedah)** and **to/from Kedah**
- Transport mode statistics (bus, taxi, rental, etc.)
- Popular routes tracking
- Monthly usage trends
- "From → To" search with autosuggestions and route classification

### 🎉 Events
- Upcoming and past events display
- Attendance tracking (expected and actual)
- Filterable by date, city, and tags
- Event categorization (culture, food, sports, etc.)
- Timeline visualization

---

## 📊 Data Flow Summary

### Hybrid Data Architecture (November 2025)

The system implements a **dual-data strategy** for optimal reliability:

1. **Frontend Components** — React components with embedded demo data
   - Instant page load (no waiting for API)
   - useState initialization with default/demo data
   - Works offline or during backend maintenance

2. **API Integration** — Automatic backend data fetching
   - useEffect hooks fetch from Django REST API on mount
   - Conditional state update (only if backend returns data)
   - Error handling with try-catch blocks

3. **Data Storage** — PostgreSQL (AWS RDS for production)
   - Place, SocialPost, Event (with attendance fields), Stay, Vendor, Transport models
   - Spatial data support with PostGIS
   - SQLite for local development

4. **API Exposure** — Django REST Framework
   - 14 analytics endpoints
   - 6 CRUD endpoints  
   - CORS-enabled for frontend communication

5. **Visualization** — Maps, charts, and dashboards
   - Recharts for analytics visualization
   - Leaflet.js for interactive maps
   - Real-time data updates when backend available  

---

## 🗂️ Project Structure

```
tourism-analytics-dashboard/
├── frontend/                    # React + TypeScript frontend
│   ├── src/
│   │   ├── components/         # React components (8 core components)
│   │   │   ├── OverviewMetrics.tsx        # Dashboard metrics
│   │   │   ├── SocialMediaCharts.tsx      # Social engagement
│   │   │   ├── PopularDestinations.tsx    # Top/least visited
│   │   │   ├── EventsTimeline.tsx         # Events + attendance
│   │   │   ├── AccommodationStats.tsx     # Hotel analytics
│   │   │   ├── SentimentAnalysis.tsx      # Sentiment breakdown
│   │   │   ├── RestaurantVendors.tsx      # Vendor listings
│   │   │   ├── TransportAnalytics.tsx     # Transport analytics
│   │   │   └── MapView.tsx                # Interactive map
│   │   ├── data/               # Demo/fallback data files
│   │   ├── lib/                # Utility functions
│   │   └── styles/             # CSS/Tailwind styles
│   ├── package.json            # Dependencies (React 18.3.1, Vite 5.4.21)
│   └── vite.config.ts          # Vite build configuration
│
├── backend/                     # Django backend
│   ├── analytics/              # Analytics app (core)
│   │   ├── models.py           # Place, SocialPost models
│   │   ├── views_new.py        # 14 analytics API views
│   │   ├── views_crud.py       # CRUD ViewSets
│   │   ├── serializers.py      # DRF serializers
│   │   └── urls.py             # API routing (20+ endpoints)
│   ├── events/                 # Events app
│   │   ├── models.py           # Event model (with attendance fields)
│   │   ├── views.py            # Event CRUD
│   │   └── migrations/         # Database migrations
│   ├── stays/                  # Accommodation app
│   ├── transport/              # Transport app
│   ├── vendors/                # Vendors app
│   ├── tourism_api/            # Django project settings
│   │   ├── settings.py         # Configuration
│   │   └── urls.py             # Main URL routing
│   ├── manage.py               # Django management
│   ├── requirements.txt        # Python dependencies
│   └── db.sqlite3              # Development database
│
├── docker-compose.yml          # Multi-container orchestration
├── ARCHITECTURE.md             # System architecture documentation
├── README.md                   # This file
└── TODO.md                     # Project tasks

```

## 🛠️ Build & Development

### Frontend
```bash
cd frontend
npm install                     # Install dependencies
npm run dev                     # Development server (port 5173)
npm run build                   # Production build (outputs 737KB)
```

### Backend
```bash
cd backend
pip install -r requirements.txt # Install dependencies
python manage.py migrate        # Run database migrations
python manage.py runserver 8001 # Development server (port 8001)
```

### Database Migrations
```bash
# Create migration for Event attendance fields
python manage.py makemigrations events

# Apply migrations
python manage.py migrate

# Populate sample data
python populate_attendance.py
```


---

## 🚀 Deployment (AWS)

**Deployed using AWS Elastic Beanstalk**

- Environment: Python 3.13 / Node 20  
- Service Role: `aws-elasticbeanstalk-service-role`  
- EC2 Role: `aws-elasticbeanstalk-ec2-role`  
- Database: PostgreSQL (RDS)  
- Storage: S3 Bucket for media  
- Static Hosting: CloudFront + S3 for frontend build  

---

## 💻 API Endpoints

### Analytics Endpoints (14 routes)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/overview-metrics/` | GET | Dashboard metrics (visitors, engagement, posts) |
| `/api/analytics/social-engagement/` | GET | Social media engagement trends |
| `/api/analytics/sentiment/summary/` | GET | Sentiment analysis summary |
| `/api/analytics/places/popular/` | GET | Most visited destinations |
| `/api/analytics/places/least-visited/` | GET | **NEW** Hidden gems/least visited places |
| `/api/analytics/events/attendance-trend/` | GET | **NEW** Event attendance analytics |
| `/api/analytics/places/list/` | GET | Complete places listing |
| `/api/analytics/places/trending/` | GET | Trending destinations |
| `/api/analytics/places/nearby/` | GET | Nearby places (geospatial) |
| `/api/analytics/keywords/top/` | GET | Top tourism keywords |
| `/api/analytics/social/metrics/` | GET | Social media metrics |
| `/api/analytics/social/platforms/` | GET | Platform breakdown |
| `/api/analytics/sentiment/categories/` | GET | Sentiment by category |

### CRUD Endpoints (6 routes)
| Resource | Endpoint | Methods | Description |
|----------|----------|---------|-------------|
| Vendors | `/api/vendors/` | GET, POST, PUT, DELETE | Restaurant/vendor management |
| Stays | `/api/stays/` | GET, POST, PUT, DELETE | Accommodation listings |
| Events | `/api/events/` | GET, POST, PUT, DELETE | Event data with attendance |
| Transport | `/api/transport/routes/` | GET, POST | Travel routes management |
| Places | `/api/places/` | GET, POST, PUT, DELETE | Tourism places (ViewSet) |
| Posts | `/api/posts/` | GET, POST, PUT, DELETE | Social media posts (ViewSet) |

### System Status (November 2025)
- ✅ **7/10 endpoints fully operational** (200 OK)
- ⚠️ **3/10 endpoints with fallback** (vendors, sentiment, transport have demo data)
- 🎯 **100% presentation-ready** (hybrid approach ensures data always displays)

---

## 🧑‍💻 Contributors

| Name | Role | Profile |
|------|------|----------|
| **Amadou Oury Diallo** | Backend | [GitHub](https://github.com/amadououry885) |
| **Samia Hassan Haron Hamid** | Frontend | — |
| **Hasibullah Naeim** | Data Analytics | — |
| **ABU BAKAR NGAH:** Sir Abu Bakar Ngah| Project Supervisor | Albukhary International University |

<p align="center">
  <img src="frontend/public/images/team.png" alt="Contributors" width="600"/>
</p>


---

## 🏫 Academic Details

- **Course:** Final Year Project (FYP)  
- **Programme:** Bachelor of Computer Science (Honours) – Data Science  
- **Institution:** Albukhary International University (AIU), Malaysia  
- **Semester:** 2025 / Trimester 2  

---

## 👥 Contributors

### Development Team
- **Amadou Oury Diallo** - Backend Developer
- **Samia Hassan Haron Hamid** - Frontend Developer
- **Hasibullah Naeim** - Data Analyst

### Supervisor
- **Sir Abu Bakar Ngah** - Project Supervisor

---

## �🔮 Future Enhancements

### Completed (November 2025) ✅
- ✅ **Tourism Analytics Dashboard** with charts and KPIs
- ✅ **Hybrid data architecture** for instant loading and fallback
- ✅ **Least visited destinations** analytics
- ✅ **Event attendance tracking** and trend analysis
- ✅ **Social media engagement** analytics
- ✅ **Sentiment analysis** visualization

### Planned Features
- 🔄 Fix 3 backend API endpoints (vendors, sentiment, transport)
- 🔄 Integrate **social media sentiment analysis** (TripAdvisor, Facebook, Instagram)
- 🔄 Enable **real-time map clustering** of vendors and events
- 🔄 Provide **AI-powered recommendation engine** for stays and attractions
- 🔄 Add **admin statistics dashboard** (visits, revenue, user insights)
- 🔄 Implement **caching layer** (Redis) for performance
- 🔄 Add **WebSocket support** for real-time analytics
- 🔄 Mobile app development (React Native)
- 🔄 Predictive analytics with machine learning  

---

## 📄 License

This project is for academic and research purposes under Albukhary International University (AIU).  
Unauthorized reproduction or distribution is prohibited.

---

### 🧠 “Turning data into sustainable tourism insights for a better Kedah.”
