# Quick API Reference - Supervisor's Analytics Features

## 📍 New Endpoints

### 1. Sentiment Comparison
**URL:** `GET /api/analytics/sentiment/comparison/`  
**Purpose:** Compare sentiment between most and least visited places

**Response:**
```json
{
  "comparison": {
    "most_visited": { "total_places": 7, "average_rating": 3.0, ... },
    "least_visited": { "total_places": 7, "average_rating": 3.0, ... }
  },
  "insights": ["AI-generated insights..."],
  "methodology": { "most_visited_threshold": "≥1724 engagement points", ... }
}
```

---

### 2. Places by Visit Level
**URL:** `GET /api/analytics/places/by-visit-level/?level={most|least|medium}`  
**Purpose:** Filter places by visit frequency tier

**Parameters:**
- `level=most` - Top 33% (most visited)
- `level=least` - Bottom 33% (least visited)
- `level=medium` - Middle 33%

**Response:**
```json
{
  "level": "most",
  "description": "Most visited places (top 33% by engagement, ≥1724 points)",
  "total_places": 7,
  "aggregate_stats": { "total_engagement": 746889, ... },
  "places": [
    {
      "id": 7,
      "name": "Alor Setar",
      "sentiment": { "positive_percentage": 0.0, "rating": 3.0 },
      ...
    }
  ]
}
```

---

### 3. Place-Specific Sentiment
**URL:** `GET /api/analytics/places/{id}/sentiment/`  
**Purpose:** Detailed sentiment analysis for one place

**Example:** `GET /api/analytics/places/7/sentiment/`

**Response:**
```json
{
  "place_id": 7,
  "place_name": "Alor Setar",
  "sentiment_summary": { "positive": 0, "neutral": 12, "negative": 0 },
  "rating": 3.0,
  "sentiment_over_time": [ { "month": "2025-10", "positive": 0 } ],
  "engagement_stats": { "total_likes": 223567, ... },
  "platform_breakdown": [ { "platform": "facebook", "count": 6 } ],
  "recommendation": "Limited sentiment data - check other sources"
}
```

---

## 🧮 Key Formulas

**Engagement Calculation:**
```
engagement = likes + comments + shares
```

**Visit Level Tiers:**
```
Most Visited:   engagement >= 67th percentile
Medium Visited: 33rd percentile < engagement < 67th percentile
Least Visited:  engagement <= 33rd percentile
```

**Sentiment to Rating:**
```
rating = ((sentiment_score + 1) / 2) * 4 + 1
# Converts -1.0 → +1.0 to 1 → 5 stars
```

---

## 🎨 Frontend Usage

**Import Component:**
```typescript
import { SentimentComparison } from '@/components/SentimentComparison';
```

**Use in Page:**
```typescript
<SentimentComparison />
```

**Fetch Data Manually:**
```typescript
// Most visited places
const response = await axios.get('/analytics/places/by-visit-level/?level=most');

// Least visited places
const response = await axios.get('/analytics/places/by-visit-level/?level=least');

// Comparison data
const response = await axios.get('/analytics/sentiment/comparison/');

// Specific place sentiment
const response = await axios.get(`/analytics/places/${placeId}/sentiment/`);
```

---

## 🧪 Quick Test Commands

**Test all endpoints:**
```bash
# Sentiment comparison
curl "http://127.0.0.1:8000/api/analytics/sentiment/comparison/" | jq

# Most visited
curl "http://127.0.0.1:8000/api/analytics/places/by-visit-level/?level=most" | jq

# Least visited
curl "http://127.0.0.1:8000/api/analytics/places/by-visit-level/?level=least" | jq

# Medium visited
curl "http://127.0.0.1:8000/api/analytics/places/by-visit-level/?level=medium" | jq

# Specific place (Alor Setar)
curl "http://127.0.0.1:8000/api/analytics/places/7/sentiment/" | jq
```

---

## 📦 Current Data Summary

**From Database (January 2026):**
- Total Places: 94
- Places with Social Data: 20
- Total Social Posts: 102
- Most Visited Threshold: ≥1,724 engagement points
- Least Visited Threshold: ≤1,066 engagement points

**Top Place:** Alor Setar (247,367 engagement)  
**Sentiment:** Currently all neutral (0.0 score)

---

## 🔗 Related Endpoints

**Existing Analytics:**
- Popular Places: `GET /api/analytics/places/popular/`
- Trending Places: `GET /api/analytics/places/trending/`
- Least Visited (old): `GET /api/analytics/places/least-visited/`
- Sentiment Summary: `GET /api/analytics/sentiment/summary/`

**NEW Endpoints:**
- ✨ Sentiment Comparison: `GET /api/analytics/sentiment/comparison/`
- ✨ Visit Level Filter: `GET /api/analytics/places/by-visit-level/`
- ✨ Place Sentiment Detail: `GET /api/analytics/places/{id}/sentiment/`
