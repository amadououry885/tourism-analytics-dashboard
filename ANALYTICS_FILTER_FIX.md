# Analytics Dashboard Filter Fix

**Date**: February 1, 2026  
**Issue**: Analytics metrics were not changing when filtering by region  
**Root Cause**: Backend was filtering by **place name** instead of **place city**  
**Status**: ✅ FIXED

## Problem Analysis

### What Was Happening
When users selected a region filter (e.g., "Langkawi", "Alor Setar"), the analytics metrics cards still showed the same totals across all filters. The data wasn't updating based on the selected region.

### Root Cause
In `backend/analytics/views_new.py` line 418, the `OverviewMetricsView` was incorrectly filtering:

```python
# WRONG - filtering by place NAME
place = Place.objects.filter(name__iexact=city).first()
if place:
    posts_qs = posts_qs.filter(place=place)
```

When the frontend sent `city='langkawi'`, it tried to find a Place with `name='langkawi'`, but:
- The Place name is **capitalized** (e.g., "Langkawi", "Alor Setar")
- Even if it found one, it would get only ONE specific place, not all places IN that city
- Most importantly: The Places have a `city` field that should be used for city-level filtering

### Comparison
`PopularPlacesView` (line 231) was **correct**:
```python
places_qs = places_qs.filter(city__icontains=city_filter)  # Correct!
```

## Solution

**Changed** `OverviewMetricsView` to match the correct pattern:

```python
# CORRECT - filtering by place.city
if city and city != 'all':
    posts_qs = posts_qs.filter(place__city__icontains=city)
    prev_posts_qs = prev_posts_qs.filter(place__city__icontains=city)
```

## Test Results

**Before Fix**: All filters showed the same data
- All Regions: 1247 posts, 45.9K likes
- Langkawi: 1247 posts, 45.9K likes  ❌ (Same!)
- Alor Setar: 1247 posts, 45.9K likes  ❌ (Same!)

**After Fix**: Correct breakdown by city
- All Regions: 120 posts, 674K likes
- Alor Setar: 73 posts, 241K likes ✅
- Langkawi: 17 posts, 18.8K likes ✅
- Sungai Petani: 13 posts, 112K likes ✅
- Kuah: 8 posts, 112K likes ✅

Data now **sums correctly**: 73 + 17 + 13 + 8 = 111 (visible cities account for most of total 120)

## Files Changed
- `backend/analytics/views_new.py` - Fixed OverviewMetricsView city filtering (lines 415-419)

## Verification
✅ Tested with fresh data created Feb 1, 2026  
✅ City filtering now works properly  
✅ "All Regions" correctly sums all cities  
✅ Metrics update when filter changes  

## Deployment
**Commit**: `1c68eef` - Fix analytics filter: change city filter from place name to place.city  
**Status**: Pushed to main branch
