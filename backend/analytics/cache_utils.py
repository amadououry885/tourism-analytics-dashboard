"""
Cache Utilities - Cache Invalidation Strategy
==============================================
Implements cache invalidation for analytics endpoints.

Strategy: Cache Invalidation (Most Common & Best Practice)
- Database is source of truth
- All writes go to database first
- Cache is removed when data changes
- Next request fetches fresh data from DB and caches it

Why this strategy?
1. Simple & reliable - fewer bugs
2. DB remains source of truth
3. Fresh data guaranteed after invalidation
4. Lower risk of inconsistency

Perfect for tourism analytics because:
- Data updated in batches (Celery scraping every 2 hours)
- Read-heavy (users browse more than update)
- Accuracy matters (tourism stats must be correct)
"""

from django.core.cache import cache
from functools import wraps
from typing import Optional, List
import hashlib
import json


def generate_cache_key(prefix: str, **kwargs) -> str:
    """
    Generate a unique cache key from prefix and parameters.
    
    Example:
        generate_cache_key('destinations', city='langkawi', time_range='daily')
        → 'kedah_tourism:destinations:city=langkawi:time_range=daily'
    """
    # Sort kwargs for consistent key generation
    sorted_params = sorted(kwargs.items())
    param_str = ':'.join(f"{k}={v}" for k, v in sorted_params if v is not None)
    
    if param_str:
        return f"{prefix}:{param_str}"
    return prefix


def cache_analytics(timeout: Optional[int] = None, key_prefix: str = ''):
    """
    Decorator to cache analytics endpoint results.
    
    Usage:
        @cache_analytics(timeout=3600, key_prefix='top_destinations')
        def get_top_destinations(request):
            # Heavy database query
            return expensive_analytics_query()
    
    Args:
        timeout: Cache timeout in seconds (None = use default from settings)
        key_prefix: Prefix for cache key
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Extract request object (assume it's first arg or in kwargs)
            request = args[0] if args else kwargs.get('request')
            
            # Build cache key from query parameters
            cache_params = {}
            if request and hasattr(request, 'GET'):
                cache_params = dict(request.GET.items())
            
            cache_key = generate_cache_key(key_prefix or func.__name__, **cache_params)
            
            # Try to get from cache
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                print(f"📦 CACHE HIT: {cache_key}")
                return cached_result
            
            print(f"🔍 CACHE MISS: {cache_key} - Fetching from DB...")
            
            # Execute function (database query)
            result = func(*args, **kwargs)
            
            # Cache the result
            cache.set(cache_key, result, timeout)
            print(f"✅ CACHED: {cache_key} (timeout: {timeout}s)")
            
            return result
        
        return wrapper
    return decorator


def invalidate_cache(patterns: List[str]):
    """
    Invalidate cache keys matching given patterns.
    
    This is called after new data arrives (e.g., Celery scraping task).
    
    Usage:
        invalidate_cache(['destinations:*', 'social:*', 'sentiment:*'])
    
    Args:
        patterns: List of cache key patterns to invalidate (supports wildcards)
    """
    from django_redis import get_redis_connection
    
    try:
        conn = get_redis_connection("default")
        deleted_count = 0
        
        for pattern in patterns:
            # Add prefix from settings
            full_pattern = f"kedah_tourism:{pattern}"
            
            # Find matching keys
            keys = conn.keys(full_pattern)
            
            if keys:
                # Delete matching keys
                deleted_count += conn.delete(*keys)
                print(f"🗑️ Invalidated {len(keys)} keys matching '{pattern}'")
        
        print(f"✅ Total cache keys invalidated: {deleted_count}")
        return deleted_count
    
    except Exception as e:
        print(f"⚠️ Cache invalidation error: {e}")
        # Don't crash if cache is unavailable
        return 0


def invalidate_analytics_cache():
    """
    Invalidate all analytics-related cache.
    
    Called after Celery task completes scraping new social media data.
    """
    patterns = [
        'destinations:*',       # All destination queries
        'top_destinations:*',   # Top destinations rankings
        'social:*',             # Social media metrics
        'sentiment:*',          # Sentiment analysis
        'events:*',             # Event analytics
        'vendors:*',            # Restaurant analytics
        'stays:*',              # Accommodation analytics
        'overview:*',           # Dashboard overview
        'popular:*',            # Popular places
        'trending:*',           # Trending content
    ]
    
    return invalidate_cache(patterns)


def invalidate_vendor_cache(vendor_id: Optional[int] = None):
    """
    Invalidate restaurant/vendor cache.
    
    Called when vendor data is updated.
    
    Args:
        vendor_id: Specific vendor ID, or None to invalidate all
    """
    if vendor_id:
        patterns = [f'vendors:*vendor_id={vendor_id}*']
    else:
        patterns = ['vendors:*', 'popular:*']
    
    return invalidate_cache(patterns)


def invalidate_stay_cache(stay_id: Optional[int] = None):
    """
    Invalidate accommodation/stay cache.
    
    Called when stay data is updated.
    
    Args:
        stay_id: Specific stay ID, or None to invalidate all
    """
    if stay_id:
        patterns = [f'stays:*stay_id={stay_id}*']
    else:
        patterns = ['stays:*', 'trending:*']
    
    return invalidate_cache(patterns)


def invalidate_destination_cache(place_id: Optional[int] = None):
    """
    Invalidate destination/place cache.
    
    Called when place data is updated.
    
    Args:
        place_id: Specific place ID, or None to invalidate all
    """
    if place_id:
        patterns = [f'destinations:*place_id={place_id}*']
    else:
        patterns = ['destinations:*', 'top_destinations:*']
    
    return invalidate_cache(patterns)


def get_cache_stats():
    """
    Get cache statistics for monitoring.
    
    Returns dict with cache info (key count, hit rate, etc.)
    """
    from django_redis import get_redis_connection
    
    try:
        conn = get_redis_connection("default")
        info = conn.info('stats')
        
        return {
            'total_keys': conn.dbsize(),
            'hits': info.get('keyspace_hits', 0),
            'misses': info.get('keyspace_misses', 0),
            'hit_rate': info.get('keyspace_hits', 0) / max(info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0), 1),
        }
    except Exception as e:
        return {'error': str(e)}
