# Demo Data Implementation for Sentiment Analysis Features

This document describes the demo/fallback data implementation for the three new sentiment analysis endpoints.

## Overview

All three new sentiment analysis endpoints now include comprehensive demo data that is returned when:
- No real data exists in the database
- The backend is unavailable (frontend uses demo data)
- The system is in presentation/demo mode

This ensures the UI always has data to display, following the hybrid data pattern used throughout the application.

## Backend Demo Data

### 1. PlaceSentimentDetailView (`/api/analytics/places/{id}/sentiment/`)

**Location:** `backend/analytics/views_new.py` lines ~730-780

**Demo Data Structure:**
```json
{
  "place_id": 1,
  "place_name": "Sample Place",
  "category": "Landmark",
  "has_data": true,
  "is_demo_data": true,
  "sentiment_summary": {
    "positive": 45,
    "neutral": 28,
    "negative": 12,
    "total_posts": 85,
    "positive_percentage": 52.9,
    "neutral_percentage": 32.9,
    "negative_percentage": 14.1,
    "average_score": 0.42,
    "rating": 4.2
  },
  "timeline": [
    {"date": "2024-01", "positive": 8, "neutral": 5, "negative": 2, "total": 15},
    // ... 6 months of data
  ],
  "engagement_stats": {
    "total_likes": 4850,
    "total_comments": 1240,
    "total_shares": 680,
    "total_engagement": 6770,
    "average_engagement_per_post": 79.6,
    "engagement_trend": "increasing"
  },
  "platform_breakdown": [
    {"platform": "Instagram", "posts": 35, "avg_sentiment": 0.48, "engagement": 3200},
    {"platform": "Facebook", "posts": 28, "avg_sentiment": 0.38, "engagement": 2150},
    {"platform": "Twitter", "posts": 22, "avg_sentiment": 0.35, "engagement": 1420}
  ],
  "top_positive_themes": [
    {"theme": "Beautiful scenery", "count": 18},
    {"theme": "Great experience", "count": 15},
    {"theme": "Family friendly", "count": 12}
  ],
  "top_negative_themes": [
    {"theme": "Crowded", "count": 5},
    {"theme": "Parking issues", "count": 4},
    {"theme": "Expensive", "count": 3}
  ],
  "recommendation": "This destination has strong positive sentiment (52.9%) and growing engagement. Consider promoting during peak seasons."
}
```

**When Triggered:** When a place exists but has no social media posts.

---

### 2. PlacesByVisitLevelView (`/api/analytics/places/by-visit-level/?level=most|least|medium`)

**Location:** `backend/analytics/views_new.py` lines ~900-1050

**Demo Data Structure:**
```json
{
  "level": "most",
  "description": "Most visited places (top 33% by engagement, ≥4500 engagement points)",
  "total_places": 2,
  "is_demo_data": true,
  "aggregate_stats": {
    "total_engagement": 10760,
    "average_sentiment_score": 0.60,
    "average_rating": 4.60,
    "sentiment_distribution": {
      "positive": 58,
      "neutral": 16,
      "negative": 6,
      "positive_percentage": 72.5,
      "neutral_percentage": 20.0,
      "negative_percentage": 7.5
    }
  },
  "places": [
    {
      "id": 1,
      "name": "Menara Alor Setar",
      "category": "Landmark",
      "city": "Alor Setar",
      "state": "Kedah",
      "total_engagement": 5840,
      "posts_count": 42,
      "estimated_visitors": 6300,
      "sentiment": {
        "positive": 28,
        "neutral": 10,
        "negative": 4,
        "positive_percentage": 66.7,
        "neutral_percentage": 23.8,
        "negative_percentage": 9.5,
        "average_score": 0.52,
        "rating": 4.52
      },
      "price": 5.0,
      "is_free": false,
      "latitude": 6.1245,
      "longitude": 100.3673
    }
    // ... more places
  ]
}
```

**Demo Data Includes:**
- **Most visited:** 2 places (Menara Alor Setar, Zahir Mosque)
- **Medium visited:** 1 place (Pekan Rabu Complex)
- **Least visited:** 2 places (Nobat Tower, Royal Museum)

**When Triggered:** When no places with social media posts exist in the database.

---

### 3. SentimentComparisonView (`/api/analytics/sentiment/comparison/`)

**Location:** `backend/analytics/views_new.py` lines ~1100-1200

**Demo Data Structure:**
```json
{
  "is_demo_data": true,
  "comparison": {
    "most_visited": {
      "category": "Most Visited",
      "total_places": 2,
      "total_posts": 80,
      "total_engagement": 10760,
      "average_engagement_per_place": 5380.0,
      "sentiment_distribution": {
        "positive": 58,
        "neutral": 16,
        "negative": 6,
        "positive_percentage": 72.5,
        "neutral_percentage": 20.0,
        "negative_percentage": 7.5
      },
      "average_sentiment_score": 0.60,
      "average_rating": 4.60
    },
    "least_visited": {
      "category": "Least Visited",
      "total_places": 2,
      "total_posts": 21,
      "total_engagement": 1200,
      "average_engagement_per_place": 600.0,
      "sentiment_distribution": {
        "positive": 14,
        "neutral": 5,
        "negative": 2,
        "positive_percentage": 66.7,
        "neutral_percentage": 23.8,
        "negative_percentage": 9.5
      },
      "average_sentiment_score": 0.45,
      "average_rating": 4.45
    }
  },
  "insights": [
    "Most visited places have 15.0% higher sentiment scores, suggesting visitor satisfaction drives popularity.",
    "Most visited places have 5.8% more positive reviews.",
    "Most visited places average 5380 engagement points vs 600 for least visited.",
    "Despite lower visit numbers, least visited places maintain strong positive sentiment (66.7%), indicating potential hidden gems."
  ],
  "methodology": {
    "most_visited_threshold": "≥4500 engagement points (top 33%)",
    "least_visited_threshold": "≤1500 engagement points (bottom 33%)",
    "total_places_analyzed": 5,
    "engagement_calculation": "likes + comments + shares",
    "rating_formula": "((sentiment_score + 1) / 2) * 4 + 1"
  }
}
```

**When Triggered:** When no places with social media posts exist in the database.

---

## Frontend Demo Data

### SentimentComparison Component

**Location:** `frontend/src/components/SentimentComparison.tsx`

**Implementation Pattern:**
```typescript
// 1. Define demo data constant
const defaultData: ComparisonData = {
  is_demo_data: true,
  comparison: { /* ... */ },
  insights: [ /* ... */ ],
  methodology: { /* ... */ }
};

// 2. Initialize state with demo data
const [data, setData] = useState<ComparisonData>(defaultData);

// 3. Fetch from API and overwrite on success
useEffect(() => {
  const fetchComparisonData = async () => {
    try {
      const response = await api.get('/analytics/sentiment/comparison/');
      setData(response.data);  // Overwrites demo data
    } catch (err) {
      console.error('Error:', err);
      // Keep demo data on error
    }
  };
  fetchComparisonData();
}, []);
```

**Key Features:**
- Component always has data to display (no null checks needed)
- Graceful degradation when backend unavailable
- Seamless transition from demo to real data
- Error states don't break the UI

---

## Demo Data Design Principles

1. **Realistic Values:** Demo data uses realistic Kedah tourism statistics
2. **Consistent Structure:** Matches real API response structure exactly
3. **Presentation Ready:** Data looks good in charts and visualizations
4. **Helpful Insights:** Demonstrates feature capabilities effectively
5. **Clear Identification:** `is_demo_data: true` flag for transparency

---

## Testing Demo Data

### Backend Testing

Test each endpoint with an empty database or place without posts:

```bash
# Test place sentiment detail (place without posts)
curl "http://localhost:8000/api/analytics/places/999/sentiment/"

# Test visit level filtering
curl "http://localhost:8000/api/analytics/places/by-visit-level/?level=most"

# Test sentiment comparison
curl "http://localhost:8000/api/analytics/sentiment/comparison/"
```

### Frontend Testing

1. Start backend: `cd backend && python3 manage.py runserver 8000`
2. Start frontend: `cd frontend && npm run dev`
3. Open Overview page: `http://localhost:3000`
4. Check SentimentComparison component renders with data
5. Inspect browser console for API calls and responses

### Verification Checklist

- [ ] All endpoints return valid JSON
- [ ] Demo data has `is_demo_data: true` flag
- [ ] Frontend components render without errors
- [ ] Charts display demo data correctly
- [ ] Transition to real data works smoothly
- [ ] Error states don't crash the UI

---

## Benefits of This Approach

1. **Always-On Presentation:** Demo can be shown anytime, even offline
2. **Development Efficiency:** Frontend devs can work without backend
3. **Robust Error Handling:** Graceful degradation when APIs fail
4. **Better UX:** No blank screens or "No data" messages
5. **Testing Flexibility:** Easy to test UI with consistent data

---

## Files Modified

### Backend
- `backend/analytics/views_new.py` - Added demo data to all 3 views

### Frontend
- `frontend/src/components/SentimentComparison.tsx` - Added demo data pattern

### Documentation
- `SUPERVISOR_FEATURES_IMPLEMENTATION.md` - Feature documentation
- `DEMO_DATA_IMPLEMENTATION.md` - This file

---

## Future Enhancements

1. **Admin Toggle:** Add admin setting to force demo mode
2. **Demo Data Seeder:** Script to generate demo data from real patterns
3. **Multilingual Demo:** Demo data in multiple languages
4. **Custom Scenarios:** Different demo datasets for different presentations

---

## Related Documentation

- See `SUPERVISOR_FEATURES_IMPLEMENTATION.md` for feature details
- See `.github/copilot-instructions.md` for hybrid data pattern explanation
- See `HYBRID_APPROACH.md` for general hybrid data architecture
