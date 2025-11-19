# City Filtering & Scraping Analysis Report

Date: November 19, 2025

## Executive Summary

✅ **City filtering logic is CORRECT** - Backend properly aggregates all cities when no filter is applied  
❌ **Celery scraping is NOT running** - Worker and beat processes are not started  
✅ **Redis is running** - Broker is available on 3 instances  

---

## Issue 1: "All Cities" Data Aggregation

### Current Database State
```
Total Posts: 7
- Langkawi: 6 posts (0 likes, 0 comments, 67 shares)
- Jitra: 1 post (1 like, 1 comment, 0 shares)
- Alor Setar: 0 posts
- Sungai Petani: 0 posts

EXPECTED TOTALS (ALL CITIES):
- Likes: 1
- Comments: 1  
- Shares: 67
- Posts: 7
```

### Backend Logic Analysis (`backend/analytics/views_new.py`, lines 263-309)

The `OverviewMetricsView` correctly handles filtering:

```python
# Filter by city if specified
if city and city != 'all':
    place = Place.objects.filter(name__iexact=city).first()
    if place:
        posts_qs = posts_qs.filter(place=place)  # ← Filters for ONE city
# Otherwise, uses ALL posts (no filter applied) # ← Correct!

# Calculate metrics
metrics = posts_qs.aggregate(
    total_posts=Count('id'),
    total_likes=Sum('likes'),
    total_comments=Sum('comments'),
    total_shares=Sum('shares')
)
```

**✅ Backend is correct** - When `city` is empty or `'all'`, it queries all posts.

### Frontend Logic Analysis (`frontend/src/components/OverviewMetrics.tsx`)

```typescript
const cityParam = selectedCity && selectedCity !== 'all' ? selectedCity : '';
const queryParams = new URLSearchParams();
if (cityParam) queryParams.append('city', cityParam);  // ← Only adds if NOT 'all'
```

**✅ Frontend is correct** - When `selectedCity === 'all'`, no city parameter is sent.

### Verification Needed

The logic appears correct. To verify the issue:

1. **Check browser console** for actual API requests when "All Cities" is selected
2. **Compare API response** with expected totals (1 like, 1 comment, 67 shares, 7 posts)
3. **Check if frontend is correctly displaying** the response data

### Recommended Test

```bash
# Start backend if not running
cd /home/amadou-oury-diallo/tourism-analytics-dashboard/backend
python manage.py runserver 8000

# In another terminal, test the API:
curl "http://localhost:8000/api/analytics/overview-metrics/?period=month"

# Expected response:
# {
#   "total_visitors": 1,      # Comments count
#   "social_engagement": 1,   # Likes count  
#   "total_posts": 7,
#   "shares": 67,
#   "page_views": 2           # Estimated from visitors * 2
# }
```

---

## Issue 2: Celery Scraping Status

### Current Status
```
✅ Redis Server: RUNNING (3 instances on ports)
❌ Celery Worker: NOT RUNNING
❌ Celery Beat: NOT RUNNING
```

### Configuration (`backend/tourism_api/celery.py`)

Celery is **correctly configured** to scrape every 2 hours:

```python
app.conf.beat_schedule = {
    'collect-social-media-every-2-hours': {
        'task': 'analytics.tasks.collect_and_process_social_posts',
        'schedule': crontab(minute=0, hour='*/2'),  # Every 2 hours at :00
    },
}
```

### The Problem

**Celery processes are not running!** The schedule is configured, but no worker/beat processes are active to execute it.

### Solution: Start Celery Services

You need to run **TWO separate processes**:

#### 1. Start Celery Worker (processes tasks)
```bash
cd /home/amadou-oury-diallo/tourism-analytics-dashboard/backend
celery -A tourism_api.celery worker -l info
```

This will show output like:
```
 -------------- celery@hostname v5.x.x
 ---- **** -----
 --- * ***  * -- Linux-x.x.x
-- * - **** ---
- ** ----------
- ** ----------
- *** --- * ---
- ******* ----
--- ***** -----

[tasks]
  . analytics.tasks.collect_and_process_social_posts
```

#### 2. Start Celery Beat (scheduler)
```bash
cd /home/amadou-oury-diallo/tourism-analytics-dashboard/backend
celery -A tourism_api.celery beat -l info
```

This will show output like:
```
celery beat v5.x.x is starting.
LocalTime -> 2025-11-19 16:00:00
Configuration ->
    . broker -> redis://localhost:6379/0
    . loader -> celery.loaders.app.AppLoader
    . scheduler -> celery.beat.PersistentScheduler

[Scheduler]
  . collect-social-media-every-2-hours : Every 2 hours
```

### Testing the Scraper Manually

Instead of waiting 2 hours, you can trigger it manually:

```bash
cd /home/amadou-oury-diallo/tourism-analytics-dashboard/backend
python -c "from analytics.tasks import collect_and_process_social_posts; collect_and_process_social_posts()"
```

This will:
1. Scrape Twitter/social media for tourism posts about Kedah places
2. Classify posts with AI (tourism vs non-tourism, sentiment)
3. Store new posts in the database
4. Update metrics automatically

---

## Summary & Next Steps

### City Filtering ✅
**Status**: Logic is correct  
**Action**: Verify frontend is displaying API response correctly

1. Open browser DevTools → Network tab
2. Select "All Cities" from dropdown
3. Check the API request to `/api/analytics/overview-metrics/`
4. Verify response matches expected totals: `{"total_visitors": 1, "social_engagement": 1, "total_posts": 7, "shares": 67}`
5. If response is correct but display is wrong, check `OverviewMetrics.tsx` data mapping

### Celery Scraping ❌
**Status**: Not running (needs to be started)  
**Action**: Start Celery worker and beat

**Option 1: Run in separate terminals (development)**
```bash
# Terminal 1: Backend
cd /home/amadou-oury-diallo/tourism-analytics-dashboard/backend
python manage.py runserver 8000

# Terminal 2: Celery Worker
cd /home/amadou-oury-diallo/tourism-analytics-dashboard/backend
celery -A tourism_api.celery worker -l info

# Terminal 3: Celery Beat
cd /home/amadou-oury-diallo/tourism-analytics-dashboard/backend
celery -A tourism_api.celery beat -l info
```

**Option 2: Run in background (production-like)**
```bash
cd /home/amadou-oury-diallo/tourism-analytics-dashboard/backend

# Start worker in background
celery -A tourism_api.celery worker -l info --detach --logfile=logs/celery_worker.log

# Start beat in background
celery -A tourism_api.celery beat -l info --detach --logfile=logs/celery_beat.log

# Check status
ps aux | grep celery
```

**Option 3: Test scraper immediately**
```bash
cd /home/amadou-oury-diallo/tourism-analytics-dashboard/backend
python -c "from analytics.tasks import collect_and_process_social_posts; collect_and_process_social_posts()"
```

### Verification Checklist

- [ ] Backend running on port 8000
- [ ] Redis running (already confirmed ✅)
- [ ] Celery worker running
- [ ] Celery beat running
- [ ] Test "All Cities" filter shows sum of all data
- [ ] Test individual city filter shows only that city's data
- [ ] Wait 2 hours or trigger manual scrape
- [ ] Verify new posts appear in database
- [ ] Verify metrics update automatically

---

## Database Schema Reference

```python
# analytics/models.py
class Place(models.Model):
    name = CharField  # "Langkawi", "Jitra", etc.
    
class SocialPost(models.Model):
    place = ForeignKey(Place)  # Which city/place
    content = TextField         # Post text
    likes = IntegerField        # Like count
    comments = IntegerField     # Comment count
    shares = IntegerField       # Share count
    platform = CharField        # 'twitter', 'facebook', etc.
    created_at = DateTimeField  # When post was created
```

### Current Data Distribution
- **Total**: 7 posts across 2 cities (Langkawi, Jitra)
- **Langkawi dominates**: 6 out of 7 posts (86%)
- **High virality**: 67 total shares despite low likes/comments
- **Low engagement**: Only 1 like, 1 comment across all posts
- **Need more data**: Only 2 out of 4 cities have posts

**Recommendation**: Run the scraper more frequently or manually to collect more diverse data across all 4 cities.

---

## Files Modified/Checked

**Backend**:
- `backend/analytics/views_new.py` (lines 263-309) - OverviewMetricsView
- `backend/tourism_api/celery.py` - Celery configuration
- `backend/analytics/tasks.py` - Scraping task

**Frontend**:
- `frontend/src/components/OverviewMetrics.tsx` - Metrics display

**New Files**:
- `backend/check_data.py` - Database inspection script
- This report: `ANALYSIS_REPORT.md`

---

**Report Generated**: November 19, 2025  
**Next Review**: After Celery services are started and running for 2+ hours
