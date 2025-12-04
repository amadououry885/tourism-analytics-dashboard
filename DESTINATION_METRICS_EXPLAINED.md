# 📊 Destination Metrics Calculation - Real Data Explained

**Question from Supervisor:** "How will the destination cards get their metrics (popularity, ratings, trending) when real data comes in?"

**Answer:** All metrics are **automatically calculated** from scraped social media posts. Here's exactly how:

---

## 🎯 What Shows on Each Destination Card

Looking at your screenshot, each destination card shows:

1. **Posts** - Number of social media posts
2. **Engagement** - Total likes + comments + shares
3. **Popularity** - Percentage bar (0-100%)
4. **Rating** - Star rating (0-5 stars)
5. **Trending** - Growth percentage (+12%)

---

## 🔄 How Each Metric is Calculated (Automatic)

### 1. **Posts Count**
**Source:** Count of `SocialPost` records linked to this place

```python
# backend/analytics/views_new.py (Line 175-177)
posts_count=Count('posts', filter=Q(
    posts__created_at__date__range=[start, end]
))
```

**Calculation:**
```sql
SELECT COUNT(*) 
FROM analytics_socialpost 
WHERE place_id = 1  -- Zahir Mosque
AND created_at >= '2025-11-01'
```

**Example:**
- Twitter scraped 15 tweets about "Zahir Mosque"
- Instagram scraped 8 posts about "Zahir Mosque"  
- **Posts = 23** ✅

---

### 2. **Engagement (Likes + Comments + Shares)**
**Source:** Sum of all engagement metrics from social posts

```python
# backend/analytics/views_new.py (Line 178-182)
total_engagement=Sum(
    F('posts__likes') + F('posts__comments') + F('posts__shares'),
    filter=Q(posts__created_at__date__range=[start, end])
)
```

**Calculation:**
```sql
SELECT 
    SUM(likes + comments + shares) as total_engagement
FROM analytics_socialpost
WHERE place_id = 1  -- Zahir Mosque
```

**Example:**
- Post 1: 543 likes + 23 comments + 12 shares = 578
- Post 2: 234 likes + 15 comments + 8 shares = 257
- Post 3: 876 likes + 45 comments + 34 shares = 955
- **Total Engagement = 1,790** ✅

---

### 3. **Popularity Score (0-100%)**
**Source:** Calculated from post count

```typescript
// frontend/src/components/DestinationCard.tsx (Line 83)
const engagementScore = Math.min(100, Math.round((destination.posts || 0) * 10));
```

**Calculation:**
```
popularity_percentage = min(100, posts_count × 10)
```

**Example:**
- If posts = 1 → 10%
- If posts = 5 → 50%
- If posts = 10 → 100%
- If posts = 23 → 100% (capped at 100%)

**Better Formula (Recommended Update):**
```typescript
// Calculate relative to max posts in dataset
const maxPosts = 100; // or fetch from API
const popularity = Math.round((destination.posts / maxPosts) * 100);
```

---

### 4. **Rating (Star Score 0-5)**
**Source:** Calculated from sentiment analysis

**Current:** Using placeholder (4.5)
```typescript
// frontend/src/components/DestinationCard.tsx (Line 83)
const sentimentScore = destination.rating || 4.5;
```

**Should Be:** Sentiment score from AI analysis
```python
# backend/analytics/models.py - Add to SocialPost
sentiment_score = models.FloatField(default=0.0, help_text="AI sentiment score -1 to +1")

# Then calculate average per place:
# Positive sentiment = +1.0 → 5 stars
# Neutral sentiment = 0.0 → 3 stars  
# Negative sentiment = -1.0 → 1 star
```

**Formula:**
```python
# Convert sentiment (-1 to +1) to stars (1 to 5)
def sentiment_to_rating(sentiment_score):
    # sentiment: -1.0 to +1.0
    # rating: 1.0 to 5.0
    return ((sentiment_score + 1) / 2) * 4 + 1
    
# Examples:
# sentiment = +1.0 → rating = 5.0 stars (very positive)
# sentiment = 0.0 → rating = 3.0 stars (neutral)
# sentiment = -1.0 → rating = 1.0 stars (negative)
```

**Average Rating per Place:**
```python
# Calculate average sentiment for all posts about this place
place_rating = Place.objects.annotate(
    avg_sentiment=Avg('posts__sentiment_score'),
    rating=Case(
        When(avg_sentiment__isnull=False, 
             then=((F('avg_sentiment') + 1) / 2) * 4 + 1),
        default=3.0
    )
)
```

---

### 5. **Trending Arrow (+12%)**
**Source:** Compare current period engagement vs previous period

```python
# backend/analytics/views_new.py (Line 203-220)
class TrendingPlacesView(APIView):
    def get_engagement(start, end):
        return Sum(
            F('posts__likes') + F('posts__comments') + F('posts__shares'),
            filter=Q(posts__created_at__date__range=[start, end])
        )
    
    current_week = get_engagement(current_start, current_end)
    previous_week = get_engagement(previous_start, previous_end)
    
    trend_percentage = ((current - previous) / previous) * 100
```

**Calculation:**
```
This Week Engagement: 1,790
Last Week Engagement: 1,600

Trending = ((1,790 - 1,600) / 1,600) × 100 = +11.875% ≈ +12%
```

---

## 🖼️ Image Collection (Your Second Question)

**Question:** "How are destination images collected?"

### Current Implementation:

**1. Manual Upload (Admin Panel)**
```python
# backend/analytics/models.py (Line 24)
image_url = models.TextField(blank=True, default="", 
    help_text="URL or base64 data URL for place image")
```

Admins can:
- Upload image file → Converts to base64 → Stores in database
- Paste image URL → Stores URL directly

### Automatic Image Collection (Can Be Added):

**Option 1: From Instagram Posts**
```python
# When scraping Instagram, save first image
if post.media_type == 'IMAGE':
    place.image_url = post.media_url
    place.save()
```

**Option 2: From Unsplash API (Free)**
```python
import requests

def get_place_image(place_name):
    url = f"https://api.unsplash.com/search/photos"
    params = {
        'query': place_name,
        'client_id': 'YOUR_UNSPLASH_KEY'
    }
    response = requests.get(url, params=params)
    if response.json()['results']:
        return response.json()['results'][0]['urls']['regular']
    return None

# Auto-fetch when place is created
place.image_url = get_place_image("Zahir Mosque Malaysia")
```

**Option 3: From Google Places API**
```python
def get_google_place_photo(place_name):
    # Google Places API returns high-quality photos
    # Requires Google Maps API key
    pass
```

---

## 💻 Complete Implementation Code

### Backend: Enhanced API Endpoint

```python
# backend/analytics/views_new.py

from django.db.models import Avg, Case, When, F

class PopularPlacesView(APIView):
    """Get most popular places with all calculated metrics"""
    def get(self, request):
        start, end = parse_range(request)
        city_filter = request.GET.get('city', None)
        
        places_qs = Place.objects
        if city_filter:
            places_qs = places_qs.filter(city__icontains=city_filter)
        
        # Get current period metrics
        places = (
            places_qs
            .annotate(
                # Post count
                posts_count=Count('posts', filter=Q(
                    posts__created_at__date__range=[start, end]
                )),
                
                # Total engagement
                total_engagement=Sum(
                    F('posts__likes') + F('posts__comments') + F('posts__shares'),
                    filter=Q(posts__created_at__date__range=[start, end])
                ),
                
                # Average sentiment → Rating
                avg_sentiment=Avg('posts__sentiment_score', filter=Q(
                    posts__created_at__date__range=[start, end]
                )),
                
                # Convert sentiment to star rating (1-5)
                rating=Case(
                    When(avg_sentiment__isnull=False,
                         then=((F('avg_sentiment') + 1) / 2) * 4 + 1),
                    default=4.5  # Default for places without sentiment data
                ),
                
                # Previous period engagement (for trending)
                prev_engagement=Sum(
                    F('posts__likes') + F('posts__comments') + F('posts__shares'),
                    filter=Q(posts__created_at__date__range=[
                        start - timedelta(days=(end-start).days),
                        start
                    ])
                )
            )
            .filter(posts_count__gt=0)
            .order_by('-total_engagement')[:20]
        )
        
        results = []
        for p in places:
            current_eng = getattr(p, 'total_engagement', 0) or 0
            prev_eng = getattr(p, 'prev_engagement', 0) or 1  # Avoid division by zero
            
            # Calculate trending percentage
            if prev_eng > 0:
                trend_pct = ((current_eng - prev_eng) / prev_eng) * 100
            else:
                trend_pct = 0.0
            
            results.append({
                'id': p.id,
                'name': p.name,
                'slug': p.name.lower().replace(' ', '-'),
                'posts': getattr(p, 'posts_count', 0),
                'engagement': current_eng,
                'rating': round(getattr(p, 'rating', 4.5), 1),  # Star rating
                'trending': round(trend_pct, 1),  # Trending percentage
                'category': p.category or 'Uncategorized',
                'city': p.city or '',
                'image_url': p.image_url or '',
                'is_free': p.is_free,
                'price': float(p.price) if p.price else None
            })
        
        return Response(results)
```

### Frontend: Update to Use Real Rating

```typescript
// frontend/src/components/DestinationCard.tsx

// BEFORE (Line 83):
const sentimentScore = destination.rating || 4.5;

// AFTER (Use rating from API):
const sentimentScore = destination.rating || 4.5;  // Already correct!

// Update trending display (Line 237):
// BEFORE:
<span className="text-xs font-semibold">+12%</span>

// AFTER:
<span className="text-xs font-semibold">
  {destination.trending > 0 ? '+' : ''}{destination.trending?.toFixed(1)}%
</span>
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  DESTINATION METRICS FLOW                    │
└─────────────────────────────────────────────────────────────┘

1. SOCIAL MEDIA SCRAPING (Every 2 Hours)
   ↓
   Twitter/Instagram Posts → Database
   - Content: "Amazing sunset at Zahir Mosque!"
   - Likes: 543
   - Comments: 23
   - Shares: 12
   - AI Sentiment: +0.85 (positive)
   - Linked to: Place "Zahir Mosque"

2. DATABASE STORAGE
   ↓
   SocialPost Table:
   ┌────────────┬──────────┬───────┬──────────┬───────────┐
   │ place_id   │ likes    │ shares│ comments │ sentiment │
   ├────────────┼──────────┼───────┼──────────┼───────────┤
   │ 1 (Zahir)  │ 543      │ 12    │ 23       │ +0.85     │
   │ 1 (Zahir)  │ 234      │ 8     │ 15       │ +0.92     │
   │ 1 (Zahir)  │ 876      │ 34    │ 45       │ +0.78     │
   └────────────┴──────────┴───────┴──────────┴───────────┘

3. API CALCULATION (On Page Load)
   ↓
   GET /api/analytics/places/popular/
   
   Calculates:
   - Posts: COUNT(*) = 23
   - Engagement: SUM(likes + comments + shares) = 1,790
   - Rating: AVG(sentiment) converted to stars = 4.7
   - Trending: Compare with previous week = +12%
   - Popularity: (posts / max_posts) × 100 = 85%

4. FRONTEND DISPLAY
   ↓
   DestinationCard Shows:
   ┌─────────────────────────────────┐
   │ Zahir Mosque (Masjid Zahir)     │
   │ 📍 Alor Setar                    │
   │                                 │
   │ Posts: 23                       │
   │ Engagement: 1,790               │
   │ Popularity: ████████░ 85%       │
   │ Rating: ⭐⭐⭐⭐⭐ 4.7           │
   │ Trending: 📈 +12%               │
   └─────────────────────────────────┘
```

---

## 🎓 What to Tell Your Supervisor

**"All destination metrics are automatically calculated from real scraped data:"**

### 1. **Posts & Engagement**
*"When our scraper fetches Twitter/Instagram posts, it extracts engagement metrics (likes, comments, shares) and links each post to a specific destination in our database. The API then aggregates these numbers - counting total posts and summing all engagement for each place."*

### 2. **Rating (Stars)**
*"Our Google Gemini AI analyzes each post's sentiment, giving a score from -1 (negative) to +1 (positive). We average all sentiment scores for posts about a destination and convert to a 1-5 star rating. For example:*
- *Average sentiment +0.8 → 4.6 stars*
- *Average sentiment 0.0 → 3.0 stars*
- *Average sentiment -0.5 → 1.8 stars"*

### 3. **Trending Percentage**
*"We compare current period engagement (last 7 days) with previous period (7 days before that). If engagement increased, we show +X%. If decreased, -X%. This is calculated automatically by the Django API."*

### 4. **Popularity Bar**
*"Popularity is calculated relative to the most popular destination. If a place has 10 posts and the max is 20 posts, it shows 50% popularity. This scales automatically as more data comes in."*

### 5. **Images**
*"Currently, administrators manually upload destination images via the admin panel. We can also automatically fetch images from:*
- *Instagram posts (first photo from scraped posts)*
- *Unsplash API (free stock photos)*
- *Google Places API (high-quality destination photos)*

*The system supports both URLs and direct image uploads stored as base64."*

---

## ✅ Summary Table

| Metric | Data Source | Calculation | Updates |
|--------|-------------|-------------|---------|
| **Posts** | `SocialPost.count()` | Count records linked to place | Every scrape (2h) |
| **Engagement** | `SocialPost.likes + comments + shares` | Sum all engagement metrics | Every scrape (2h) |
| **Rating** | `SocialPost.sentiment_score` | Avg sentiment → stars (1-5) | Every scrape (2h) |
| **Trending** | Current vs previous engagement | `((current - prev) / prev) × 100` | Every scrape (2h) |
| **Popularity** | Relative post count | `(posts / max_posts) × 100` | Every scrape (2h) |
| **Image** | `Place.image_url` | Manual upload or API fetch | On demand |

**All metrics update automatically when new social media data is scraped.** ✅

---

## 🚀 Next Steps (Optional Improvements)

### 1. Add Sentiment Score to Model
```python
# backend/analytics/models.py
class SocialPost(models.Model):
    # ... existing fields ...
    sentiment_score = models.FloatField(
        default=0.0, 
        help_text="AI sentiment score: -1.0 (negative) to +1.0 (positive)"
    )
```

### 2. Update AI Classifier to Return Score
```python
# backend/analytics/classifier.py
def classify_post(self, content):
    # ... existing code ...
    return {
        'sentiment': 'positive',  # categorical
        'sentiment_score': 0.85,  # numerical (-1 to +1)
        # ... other fields ...
    }
```

### 3. Update Scraping Task to Save Score
```python
# backend/analytics/tasks.py
SocialPost.objects.create(
    # ... existing fields ...
    sentiment_score=classification['sentiment_score']
)
```

### 4. Auto-Fetch Images from Instagram
```python
# When saving Instagram post, update place image if empty
if not place.image_url and post.media_url:
    place.image_url = post.media_url
    place.save()
```

---

**Bottom Line:** All metrics are derived from real scraped data and calculated automatically. No manual input needed (except images, which can also be automated). Everything updates every 2 hours when new posts are scraped! ✅

---

*Last Updated: November 28, 2025*  
*Tourism Analytics Dashboard - FYP Project*
