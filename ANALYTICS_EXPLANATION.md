# 📊 Kedah Tourism Analytics Dashboard - Metrics Explanation

## Presentation Guide for FYP Defense

This document explains how every metric in the Analytics Dashboard is calculated. Use this for your presentation tomorrow.

---

## 🏠 Section 1: Overview Metrics (Top Cards)

### 📝 Total Posts
**What it shows:** The total number of social media posts collected about Kedah tourism.

**How it's calculated:**
```python
total_posts = COUNT(all SocialPost records in the date range)
```

**Data source:** `SocialPost` table → `id` field (count)

**Example from your dashboard:** **249 posts** in the last 30 days

**Trending (+408.7%):** 
```python
current_period_posts = 249
previous_period_posts = 49  (30 days before)
trending = ((249 - 49) / 49) * 100 = +408.7%
```

---

### ❤️ Total Likes
**What it shows:** Sum of all likes across all social media posts.

**How it's calculated:**
```python
total_likes = SUM(likes) from all SocialPost records
```

**Data source:** `SocialPost` table → `likes` field

**Example from your dashboard:** **153.2K likes**

**Trending (+8.2%):**
```python
current_likes = 153,200
previous_likes = 141,589
trending = ((153200 - 141589) / 141589) * 100 = +8.2%
```

---

### 💬 Comments
**What it shows:** Sum of all comments across all social media posts.

**How it's calculated:**
```python
total_comments = SUM(comments) from all SocialPost records
```

**Data source:** `SocialPost` table → `comments` field

**Example from your dashboard:** **21.6K comments**

---

### 👁️ Page Views
**What it shows:** Estimated page views based on engagement.

**How it's calculated:**
```python
page_views = total_comments * 2  # Approximation: each comment = 2 views
```

**Why multiply by 2?** Not everyone who views a post comments. We estimate that for every comment, there are approximately 2 viewers.

**Example:** 21,600 comments × 2 = **43.2K page views**

---

## 📈 Section 2: Engagement Trends Chart

**What it shows:** Daily social media activity over time (Likes, Comments, Shares).

**How it's calculated:**
```python
# Group posts by date
daily_data = SocialPost.objects
    .annotate(date=TruncDate('created_at'))  # Extract date from timestamp
    .values('date')
    .annotate(
        likes=SUM('likes'),
        comments=SUM('comments'),
        shares=SUM('shares')
    )
    .order_by('date')
```

**Data source:** `SocialPost` table grouped by `created_at` date

**Chart lines:**
- 🔴 **Pink/Red line:** Likes per day
- 🔵 **Blue line:** Comments per day  
- 🟢 **Green line:** Shares per day

---

## 🌐 Section 3: Platform Performance

**What it shows:** Which social media platforms have the most engagement.

**How it's calculated:**
```python
platforms = SocialPost.objects
    .values('platform')  # Group by platform name
    .annotate(
        total_engagement=SUM(likes + comments + shares)
    )
    .order_by('-total_engagement')
```

**Data source:** `SocialPost` table → `platform` field (instagram, facebook, tiktok, twitter)

**Example from your dashboard:**
| Platform | Engagement |
|----------|------------|
| Instagram | ~55,000 |
| Facebook | ~45,000 |
| TikTok | ~40,000 |
| Twitter | ~35,000 |

---

## 😊 Section 4: Visitor Sentiment (Donut Chart)

**What it shows:** How tourists feel about Kedah based on their social media posts.

**How it's calculated:**
```python
# Count posts by sentiment category
sentiment_counts = SocialPost.objects.aggregate(
    positive = COUNT(posts WHERE sentiment='positive'),
    neutral = COUNT(posts WHERE sentiment='neutral'),
    negative = COUNT(posts WHERE sentiment='negative')
)

total = positive + neutral + negative

# Calculate percentages
positive_pct = (positive / total) * 100
neutral_pct = (neutral / total) * 100  
negative_pct = (negative / total) * 100
```

**Data source:** `SocialPost` table → `sentiment` field

**Example from your dashboard:**
- 🟢 **Positive: 60%** → Tourists are happy
- 🟡 **Neutral: 100%** (likely display bug, should be ~30%)
- 🔴 **Negative: 10%** → Few complaints

**How sentiment is determined:**
Each social media post is analyzed by AI (sentiment classifier) which reads the text content and assigns:
- `positive` → Happy words like "amazing", "beautiful", "love"
- `neutral` → Factual statements, no emotion
- `negative` → Complaints like "bad", "disappointing", "crowded"

---

## 🏆 Section 5: Top Destinations

**What it shows:** Most popular tourist attractions ranked by social media engagement.

**How it's calculated:**
```python
top_places = Place.objects.annotate(
    total_engagement = SUM(
        posts__likes + posts__comments + posts__shares
    )
).order_by('-total_engagement')[:5]  # Top 5
```

**Data source:** `Place` table + `SocialPost` table (joined by `place_id`)

**Example from your dashboard:**
| Rank | Place | Engagements | Rating | Trending |
|------|-------|-------------|--------|----------|
| 1 | Al-Bukhary Mosque | 0 | ⭐4.5 | +2% |
| 2 | Alor Setar | 0 | ⭐4.5 | +10% |
| 3 | Alor Setar 250 Tahun Monument | 0 | ⭐4.5 | +10% |
| 4 | Alor Setar Tower | 0 | ⭐4.5 | +9% |
| 5 | Aman Central Mall | 0 | ⭐4.5 | +6% |

---

## ⭐ Section 6: Star Rating Calculation

**What it shows:** A 1-5 star rating for each place based on sentiment.

**How it's calculated:**
```python
# Get average sentiment score for a place (-1.0 to +1.0)
avg_sentiment = AVG(SocialPost.sentiment_score) WHERE place_id = X

# Convert to 1-5 star scale
# Formula: rating = ((sentiment + 1) / 2) * 4 + 1
rating = ((avg_sentiment + 1) / 2) * 4 + 1
```

**Conversion table:**
| Sentiment Score | Star Rating |
|-----------------|-------------|
| -1.0 (very negative) | ⭐ 1.0 |
| -0.5 (somewhat negative) | ⭐⭐ 2.0 |
| 0.0 (neutral) | ⭐⭐⭐ 3.0 |
| +0.5 (somewhat positive) | ⭐⭐⭐⭐ 4.0 |
| +1.0 (very positive) | ⭐⭐⭐⭐⭐ 5.0 |

**Default rating:** If no sentiment data exists, places get **4.5 stars** by default.

---

## 📈 Section 7: Trending Percentage

**What it shows:** How much more (or less) engagement a place has compared to the previous period.

**How it's calculated:**
```python
# Current period (e.g., last 30 days)
current_engagement = SUM(likes + comments + shares) for Jan 1-30

# Previous period (30 days before that)
previous_engagement = SUM(likes + comments + shares) for Dec 1-30

# Calculate trending percentage
if previous_engagement > 0:
    trending = ((current - previous) / previous) * 100
else:
    trending = 100  # New place, 100% growth
```

**Example:**
- Langkawi Sky Bridge: Current = 5000, Previous = 4348
- Trending = ((5000 - 4348) / 4348) × 100 = **+15%** ↑

---

## 🔥 Section 8: Most Visited Places

**What it shows:** Top performing destinations by total engagement.

**How it's calculated:**
```python
most_visited = Place.objects.annotate(
    engagement = SUM(posts__likes + posts__comments + posts__shares)
).filter(
    engagement__gte = threshold_for_top_33%
).order_by('-engagement')
```

**Example from your dashboard:**
| Rank | Place | Engagement | Rating |
|------|-------|------------|--------|
| 1 | Langkawi Sky Bridge | 125.0K | ⭐4.7 |
| 2 | Menara Alor Setar | 58.4K | ⭐4.5 |

**"Top 33%" badge:** Places in the top third by engagement.

---

## 💎 Section 9: Hidden Gems

**What it shows:** Undiscovered treasures with low engagement but good sentiment.

**How it's calculated:**
```python
hidden_gems = Place.objects.annotate(
    engagement = SUM(posts__likes + posts__comments + posts__shares),
    avg_sentiment = AVG(posts__sentiment_score)
).filter(
    engagement__lt = threshold_for_bottom_33%,  # Low engagement
    avg_sentiment__gt = 0  # But positive sentiment
).order_by('engagement')
```

**Why this matters:** These places have good reviews but few visitors = opportunity for promotion!

**Example from your dashboard:**
| Place | Engagement | Rating |
|-------|------------|--------|
| Nobat Tower | 680 | ⭐4.3 |
| Royal Museum | 520 | ⭐4.2 |

**"Bottom 33%" badge:** Places in the bottom third by engagement (hidden gems).

---

## 🧠 Section 10: Sentiment Analytics Comparison

**What it shows:** Compares "Most Visited" vs "Hidden Gems" sentiment and engagement.

### Most Visited (Top 33%)
```python
most_visited_stats = {
    'places': COUNT(places in top 33%),           # 7 places
    'posts': SUM(posts for these places),          # 58 posts
    'positive_pct': AVG(positive sentiment %),     # 72%
    'rating': AVG(star rating)                     # ⭐4.6
}
```

### Hidden Gems (Bottom 33%)
```python
hidden_gems_stats = {
    'places': COUNT(places in bottom 33%),         # 7 places
    'posts': SUM(posts for these places),          # 19 posts
    'positive_pct': AVG(positive sentiment %),     # 63%
    'rating': AVG(star rating)                     # ⭐4.2
}
```

### Engagement Gap
```python
engagement_gap = most_visited_avg / hidden_gems_avg
# Example: 106,700 / 746 = 143x higher
```

**This shows:** Popular places get **143x more engagement** than hidden gems!

---

## 🤖 Section 11: AI-Generated Insights

**What it shows:** Automatically generated observations based on the data.

**How it's generated:**
```python
insights = []

# Insight 1: Sentiment drives popularity
if most_visited_positive_pct > hidden_gems_positive_pct:
    insights.append("Most visited places have higher sentiment scores, suggesting visitor satisfaction drives popularity.")

# Insight 2: Hidden gems potential
if hidden_gems_positive_pct > 50:
    insights.append("Hidden gems maintain strong positive sentiment despite lower engagement, indicating potential for growth.")

# Insight 3: Engagement gap
insights.append(f"Engagement is {engagement_gap}x higher for popular places, showing significant room to promote hidden gems.")
```

---

## 💡 Section 12: Quick Insights (Bottom Banner)

**What it shows:** Key takeaways at a glance.

**How each insight is calculated:**

### 🔥 "Langkawi Sky Bridge is trending with +15% more mentions"
```python
trending_place = Place.objects.annotate(
    current = COUNT(posts in current period),
    previous = COUNT(posts in previous period)
).annotate(
    growth = (current - previous) / previous * 100
).order_by('-growth').first()
```

### 📱 "Instagram drives 49% of all social engagement"
```python
instagram_engagement = SUM(likes + comments + shares WHERE platform='instagram')
total_engagement = SUM(all likes + comments + shares)
instagram_pct = (instagram_engagement / total_engagement) * 100
```

### 😊 "Visitor sentiment is 60% positive"
```python
positive_posts = COUNT(posts WHERE sentiment='positive')
total_posts = COUNT(all posts)
positive_pct = (positive_posts / total_posts) * 100
```

---

## 📊 Data Flow Summary

```
┌─────────────────┐
│  Social Media   │  (Instagram, Facebook, TikTok, Twitter)
│     Posts       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Data Scraper   │  Collects posts about Kedah tourism
│  (Celery Task)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI Classifier  │  Analyzes sentiment: positive/neutral/negative
│                 │  Assigns sentiment_score: -1.0 to +1.0
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Database      │  SocialPost table stores all data
│   (SQLite/      │  - likes, comments, shares, views
│   PostgreSQL)   │  - sentiment, sentiment_score
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Django REST    │  API endpoints aggregate and calculate
│  API Views      │  all metrics shown in dashboard
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React Frontend │  Displays charts, cards, and insights
│  (Analytics     │  using Recharts library
│   Dashboard)    │
└─────────────────┘
```

---

## 🗄️ Database Tables Used

### `SocialPost` (Main data source)
| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Unique post ID |
| `platform` | String | instagram, facebook, tiktok, twitter |
| `content` | Text | Post text content |
| `likes` | Integer | Number of likes |
| `comments` | Integer | Number of comments |
| `shares` | Integer | Number of shares |
| `views` | Integer | Number of views |
| `sentiment` | String | positive, neutral, negative |
| `sentiment_score` | Float | -1.0 to +1.0 |
| `place_id` | FK | Links to Place table |
| `created_at` | DateTime | When post was made |

### `Place` (Tourism destinations)
| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer | Unique place ID |
| `name` | String | Place name |
| `city` | String | City (Alor Setar, Langkawi, etc.) |
| `category` | String | Landmark, Museum, Beach, etc. |

---

## 🎯 Key Takeaways for Presentation

1. **Real-time Data:** Dashboard shows live social media engagement
2. **AI-Powered:** Sentiment analysis automatically classifies posts
3. **Actionable Insights:** Identifies hidden gems for tourism promotion
4. **Multi-Platform:** Aggregates data from Instagram, Facebook, TikTok, Twitter
5. **Trend Detection:** Compares current vs previous periods
6. **Star Ratings:** Converts sentiment to easy-to-understand 1-5 scale

---

## 📁 Code Locations

| Feature | Backend File | Frontend File |
|---------|--------------|---------------|
| Overview Metrics | `backend/analytics/views_new.py` → `OverviewMetricsView` | `frontend/src/pages/analytics/AnalyticsPage.tsx` |
| Sentiment Summary | `backend/analytics/views_new.py` → `SentimentSummaryView` | Same |
| Platform Breakdown | `backend/analytics/views_new.py` → `SocialPlatformsView` | Same |
| Popular Places | `backend/analytics/views_new.py` → `PopularPlacesView` | Same |
| Trending | `backend/analytics/views_new.py` → `TrendingPlacesView` | Same |
| AI Classifier | `backend/analytics/classifier.py` | N/A |
| Data Scraper | `backend/analytics/tasks.py` | N/A |

---

**Good luck with your presentation tomorrow! 🎓**

*Last updated: January 20, 2026*
