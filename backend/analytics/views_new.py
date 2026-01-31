from django.db.models import Q, Count, F, Case, When, IntegerField, Sum, Avg
from django.db.models.functions import Coalesce, TruncDate, ExtractHour
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from datetime import datetime, timedelta
from .models import Place, SocialPost, PostRaw, PostClean, SentimentTopic
from .serializers import PlaceSerializer, SocialPostSerializer, PostCleanSerializer, SentimentTopicSerializer
from events.models import Event
from .cache_utils import generate_cache_key
from django.core.cache import cache

class PlacesListView(APIView):
    """Get all places/cities"""
    def get(self, request):
        places = Place.objects.all().order_by('name')
        return Response([{
            'id': p.id,
            'name': p.name,
            'city': p.city,
            'category': p.category,
            'slug': p.name.lower().replace(' ', '-'),
            'image_url': p.image_url or ''
        } for p in places])

def parse_range(request):
    """Helper to parse date range from request"""
    days = int(request.GET.get('range', '7').rstrip('d'))
    end = datetime.now().date()
    start = end - timedelta(days=days)
    return start, end

class SentimentSummaryView(APIView):
    """Get overall sentiment distribution and totals from social posts"""
    def get(self, request):
        # Generate cache key from query parameters
        cache_key = generate_cache_key(
            'sentiment_summary',
            range=request.GET.get('range', '7'),
            city=request.GET.get('city', 'all')
        )
        
        # Try to get from cache
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            print(f"📦 CACHE HIT: {cache_key}")
            return Response(cached_data)
        
        print(f"🔍 CACHE MISS: {cache_key} - Fetching from DB...")
        
        start, end = parse_range(request)
        
        # Use SocialPost with sentiment fields instead of PostClean
        qs = SocialPost.objects.filter(created_at__date__range=[start, end])
        
        # Filter by city if provided
        city_filter = request.GET.get('city', None)
        if city_filter and city_filter != 'all':
            qs = qs.filter(place__city__icontains=city_filter)
        
        agg = qs.aggregate(
            pos=Count(Case(When(sentiment='positive', then=1))),
            neu=Count(Case(When(sentiment='neutral', then=1))),
            neg=Count(Case(When(sentiment='negative', then=1)))
        )
        
        total = sum(agg.values())
        if total == 0:
            # Return placeholder data if no posts exist
            data = {
                "positive_pct": 60,
                "neutral_pct": 30,
                "negative_pct": 10,
                "positive": 0,
                "neutral": 0,
                "negative": 0,
                "mentions": 0,
                "message": "No sentiment data available yet. Data will be collected automatically."
            }
        else:
            data = {
                "positive_pct": round(agg['pos'] * 100 / total),
                "neutral_pct": round(agg['neu'] * 100 / total),
                "negative_pct": round(agg['neg'] * 100 / total),
                "positive": agg['pos'],
                "neutral": agg['neu'],
                "negative": agg['neg'],
                "mentions": total
            }
        
        # Cache for 2 hours
        timeout = getattr(settings, 'CACHE_TTL', {}).get('sentiment_summary', 60 * 60 * 2)
        cache.set(cache_key, data, timeout)
        print(f"✅ CACHED: {cache_key} (timeout: {timeout}s)")
        
        return Response(data)

class SentimentByCategoryView(APIView):
    """Get sentiment breakdown by place category from social posts"""
    def get(self, request):
        start, end = parse_range(request)
        
        # Filter by city if provided
        city_filter = request.GET.get('city', None)
        qs = SocialPost.objects.filter(created_at__date__range=[start, end])
        if city_filter and city_filter != 'all':
            qs = qs.filter(place__city__icontains=city_filter)
        
        results = (
            qs
            .values('place__category')
            .annotate(
                total=Count('id'),
                positive=Count(Case(When(sentiment='positive', then=1))),
                neutral=Count(Case(When(sentiment='neutral', then=1))),
                negative=Count(Case(When(sentiment='negative', then=1)))
            )
            .filter(total__gt=0)
        )
        
        if not results:
            # Return placeholder data if no posts exist
            return Response([
                {'category': 'Tourism', 'positive': 65, 'neutral': 25, 'negative': 10},
                {'category': 'Dining', 'positive': 70, 'neutral': 20, 'negative': 10},
                {'category': 'Accommodation', 'positive': 60, 'neutral': 30, 'negative': 10}
            ])
        
        categories = []
        for r in results:
            total = r['total']
            categories.append({
                'category': r['place__category'] or 'Uncategorized',
                'positive': round(r['positive'] * 100 / total),
                'neutral': round(r['neutral'] * 100 / total),
                'negative': round(r['negative'] * 100 / total),
                'total_posts': total
            })
            
        return Response(categories)

class TopKeywordsView(APIView):
    """Get most mentioned keywords with their sentiment"""
    def get(self, request):
        start, end = parse_range(request)
        
        topics = (
            SentimentTopic.objects
            .filter(date__range=[start, end])
            .values('topic', 'sentiment')
            .annotate(count=Sum('count'))
            .order_by('-count')[:10]
        )
        
        return Response([{
            'word': t['topic'],
            'count': t['count'],
            'sentiment': t['sentiment']
        } for t in topics])

class SocialMetricsView(APIView):
    """Get social media metrics summary"""
    def get(self, request):
        start, end = parse_range(request)
        
        metrics = SocialPost.objects.filter(
            created_at__date__range=[start, end]
        ).aggregate(
            total_posts=Count('id'),
            total_likes=Sum('likes'),
            total_comments=Sum('comments'),
            total_shares=Sum('shares')
        )
        
        return Response(metrics)

class SocialPlatformsView(APIView):
    """Get engagement breakdown by platform"""
    def get(self, request):
        start, end = parse_range(request)
        
        platforms = (
            SocialPost.objects
            .filter(created_at__date__range=[start, end])
            .values('platform')
            .annotate(
                posts=Count('id'),
                likes=Sum('likes'),
                comments=Sum('comments'),
                shares=Sum('shares')
            )
            .order_by('-posts')
        )
        
        return Response(list(platforms))

class SocialEngagementView(APIView):
    """Get hourly engagement patterns"""
    def get(self, request):
        start, end = parse_range(request)
        
        hourly = (
            SocialPost.objects
            .filter(created_at__date__range=[start, end])
            .annotate(hour=ExtractHour('created_at'))
            .values('hour')
            .annotate(
                posts=Count('id'),
                engagement=Sum(F('likes') + F('comments') + F('shares'))
            )
            .order_by('hour')
        )
        
        return Response(list(hourly))

class PopularPlacesView(APIView):
    """Get most popular places by social engagement with calculated metrics"""
    def get(self, request):
        start, end = parse_range(request)
        
        # Support city filtering via query parameter
        city_filter = request.GET.get('city', None)
        
        places_qs = Place.objects
        if city_filter:
            places_qs = places_qs.filter(city__icontains=city_filter)
        
        # Calculate previous period dates for trending
        period_days = (end - start).days
        prev_end = start
        prev_start = prev_end - timedelta(days=period_days)
        
        # Get ALL places with optional engagement metrics (not just those with posts)
        places = (
            places_qs
            .annotate(
                # Current period metrics
                posts_count=Count('posts', filter=Q(
                    posts__created_at__date__range=[start, end]
                )),
                total_engagement=Sum(
                    F('posts__likes') + F('posts__comments') + F('posts__shares'),
                    filter=Q(posts__created_at__date__range=[start, end])
                ),
                
                # Average sentiment score → Convert to star rating (1-5)
                avg_sentiment=Avg('posts__sentiment_score', filter=Q(
                    posts__created_at__date__range=[start, end]
                )),
                
                # Previous period engagement for trending calculation
                prev_engagement=Sum(
                    F('posts__likes') + F('posts__comments') + F('posts__shares'),
                    filter=Q(posts__created_at__date__range=[prev_start, prev_end])
                )
            )
            # Removed: .filter(posts_count__gt=0) - now returns ALL places
            .order_by('-total_engagement', '-posts_count', 'name')[:100]  # Increased limit to show all places
        )
        
        results = []
        for p in places:
            current_eng = getattr(p, 'total_engagement', 0) or 0
            prev_eng = getattr(p, 'prev_engagement', 0) or 0
            avg_sent = getattr(p, 'avg_sentiment', None)
            
            # Calculate trending percentage
            if prev_eng > 0:
                trend_pct = ((current_eng - prev_eng) / prev_eng) * 100
            else:
                trend_pct = 100.0 if current_eng > 0 else 0.0
            
            # Convert sentiment score (-1 to +1) to star rating (1 to 5)
            # Formula: rating = ((sentiment + 1) / 2) * 4 + 1
            if avg_sent is not None:
                rating = round(((avg_sent + 1) / 2) * 4 + 1, 1)
            else:
                rating = 4.5  # Default for places without sentiment data
            
            results.append({
                'id': p.id,
                'name': p.name,
                'slug': p.name.lower().replace(' ', '-'),
                'posts': getattr(p, 'posts_count', 0),
                'engagement': current_eng,
                'rating': rating,  # Calculated star rating (1-5)
                'trending': round(trend_pct, 1),  # Trending percentage
                'category': p.category or 'Uncategorized',
                'city': p.city or '',
                'image_url': p.image_url or '',
                'is_free': p.is_free,
                'is_open': p.is_open,  # ✅ Open/closed status
                'price': float(p.price) if p.price else None,
                'description': p.description or '',
                # ✅ Add new fields
                'wikipedia_url': p.wikipedia_url or '',
                'official_website': p.official_website or '',
                'tripadvisor_url': p.tripadvisor_url or '',
                'google_maps_url': p.google_maps_url or '',
                'contact_phone': p.contact_phone or '',
                'contact_email': p.contact_email or '',
                'address': p.address or '',
                'opening_hours': p.opening_hours or '',
                'best_time_to_visit': p.best_time_to_visit or '',
                'amenities': p.amenities
            })
        
        return Response(results)

class TrendingPlacesView(APIView):
    """Get places with rising engagement"""
    def get(self, request):
        current_end = datetime.now().date()
        current_start = current_end - timedelta(days=7)
        previous_end = current_start
        previous_start = previous_end - timedelta(days=7)
        
        def get_engagement(start, end):
            return (
                Place.objects
                .annotate(
                    engagement=Sum(
                        F('posts__likes') + F('posts__comments') + F('posts__shares'),
                        filter=Q(posts__created_at__date__range=[start, end])
                    )
                )
                .values('id')
                .filter(engagement__gt=0)
            )
        
        current = {
            item['id']: item['engagement']
            for item in get_engagement(current_start, current_end)
        }
        
        previous = {
            item['id']: item['engagement']
            for item in get_engagement(previous_start, previous_end)
        }
        
        trending = []
        for place_id in current.keys():
            prev_engagement = previous.get(place_id, 0) or 1
            curr_engagement = current.get(place_id, 0)
            change = ((curr_engagement - prev_engagement) / prev_engagement) * 100
            if change > 0:
                trending.append((place_id, change))
        
        trending.sort(key=lambda x: x[1], reverse=True)
        trending_places = Place.objects.filter(id__in=[p[0] for p in trending[:10]])
        
        return Response(PlaceSerializer(trending_places, many=True).data)

class NearbyPlacesView(APIView):
    """Get places near a given location"""
    def get(self, request):
        lat = float(request.GET.get('lat', 0))
        lon = float(request.GET.get('lon', 0))
        radius = float(request.GET.get('radius', 5))  # km
        
        # Simple distance calculation (not perfect but fast)
        places = (
            Place.objects
            .filter(
                latitude__range=(lat - radius/111, lat + radius/111),
                longitude__range=(lon - radius/111, lon + radius/111)
            )
            .annotate(
                posts_count=Count('posts'),
                avg_sentiment=Avg(Case(
                    When(posts__postclean__sentiment='positive', then=1),
                    When(posts__postclean__sentiment='neutral', then=0),
                    When(posts__postclean__sentiment='negative', then=-1),
                    output_field=IntegerField()
                ))
            )
            .order_by('-posts_count')[:20]
        )
        
        return Response(PlaceSerializer(places, many=True).data)


class OverviewMetricsView(APIView):
    """Get comprehensive overview metrics with all social media analytics"""
    def get(self, request):
        from datetime import datetime, timedelta
        
        # Parse filters
        city = request.GET.get('city', None)
        period = request.GET.get('period', 'month')
        
        # Calculate date range
        period_days = {
            'week': 7,
            'month': 30,
            'quarter': 90,
            'year': 365
        }
        days = period_days.get(period, 30)
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Calculate previous period for trending
        prev_end = start_date
        prev_start = prev_end - timedelta(days=days)
        
        # Base query
        posts_qs = SocialPost.objects.filter(created_at__date__range=[start_date, end_date])
        prev_posts_qs = SocialPost.objects.filter(created_at__date__range=[prev_start, prev_end])
        
        # Filter by city if specified
        if city and city != 'all':
            # Filter by place.city instead of place.name
            posts_qs = posts_qs.filter(place__city__icontains=city)
            prev_posts_qs = prev_posts_qs.filter(place__city__icontains=city)
        
        # === 1. BASIC METRICS ===
        metrics = posts_qs.aggregate(
            total_posts=Count('id'),
            total_likes=Sum('likes'),
            total_comments=Sum('comments'),
            total_shares=Sum('shares'),
            total_views=Sum('views')
        )
        
        total_visitors = (metrics['total_comments'] or 0)
        social_engagement = (metrics['total_likes'] or 0)
        page_views = total_visitors * 2
        
        # === 2. SENTIMENT ANALYSIS ===
        sentiment_agg = posts_qs.aggregate(
            positive_count=Count(Case(When(sentiment='positive', then=1))),
            neutral_count=Count(Case(When(sentiment='neutral', then=1))),
            negative_count=Count(Case(When(sentiment='negative', then=1))),
            avg_sentiment_score=Avg('sentiment_score')
        )
        
        total_sentiment_posts = (sentiment_agg['positive_count'] or 0) + (sentiment_agg['neutral_count'] or 0) + (sentiment_agg['negative_count'] or 0)
        
        if total_sentiment_posts > 0:
            sentiment_data = {
                'positive_pct': round((sentiment_agg['positive_count'] or 0) * 100 / total_sentiment_posts),
                'neutral_pct': round((sentiment_agg['neutral_count'] or 0) * 100 / total_sentiment_posts),
                'negative_pct': round((sentiment_agg['negative_count'] or 0) * 100 / total_sentiment_posts),
                'positive': sentiment_agg['positive_count'] or 0,
                'neutral': sentiment_agg['neutral_count'] or 0,
                'negative': sentiment_agg['negative_count'] or 0,
                'avg_score': round(sentiment_agg['avg_sentiment_score'] or 0, 2)
            }
        else:
            sentiment_data = {
                'positive_pct': 60, 'neutral_pct': 30, 'negative_pct': 10,
                'positive': 0, 'neutral': 0, 'negative': 0, 'avg_score': 0
            }
        
        # === 3. PLATFORM BREAKDOWN ===
        platforms = list(
            posts_qs.values('platform')
            .annotate(
                posts=Count('id'),
                likes=Sum('likes'),
                comments=Sum('comments'),
                shares=Sum('shares')
            )
            .order_by('-posts')
        )
        
        # === 4. HOURLY ENGAGEMENT PATTERN ===
        hourly_engagement = list(
            posts_qs.annotate(hour=ExtractHour('created_at'))
            .values('hour')
            .annotate(
                posts=Count('id'),
                engagement=Sum(F('likes') + F('comments') + F('shares'))
            )
            .order_by('hour')
        )
        
        # === 5. DAILY TRENDS (for chart) ===
        daily_trends = list(
            posts_qs.annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(
                likes=Sum('likes'),
                comments=Sum('comments'),
                shares=Sum('shares'),
                posts=Count('id')
            )
            .order_by('date')
        )
        
        # Format dates
        for item in daily_trends:
            item['date'] = item['date'].strftime('%Y-%m-%d')
        
        # === 6. TOP KEYWORDS (from extra field) ===
        keywords_data = []
        for post in posts_qs.filter(extra__isnull=False)[:100]:
            if 'keywords' in post.extra and isinstance(post.extra['keywords'], list):
                keywords_data.extend(post.extra['keywords'])
        
        from collections import Counter
        keyword_counts = Counter(keywords_data).most_common(10)
        top_keywords = [{'keyword': k, 'count': c} for k, c in keyword_counts]
        
        # === 7. SENTIMENT BY CATEGORY ===
        sentiment_by_category = list(
            posts_qs.values('place__category')
            .annotate(
                total=Count('id'),
                positive=Count(Case(When(sentiment='positive', then=1))),
                neutral=Count(Case(When(sentiment='neutral', then=1))),
                negative=Count(Case(When(sentiment='negative', then=1)))
            )
            .filter(total__gt=0)
            .order_by('-total')
        )
        
        # Format category data
        for item in sentiment_by_category:
            item['category'] = item.pop('place__category') or 'Uncategorized'
        
        # === 8. TRENDING CALCULATION ===
        prev_metrics = prev_posts_qs.aggregate(
            prev_engagement=Sum(F('likes') + F('comments') + F('shares'))
        )
        
        current_total_engagement = (metrics['total_likes'] or 0) + (metrics['total_comments'] or 0) + (metrics['total_shares'] or 0)
        prev_total_engagement = prev_metrics['prev_engagement'] or 0
        
        if prev_total_engagement > 0:
            trending_pct = round(((current_total_engagement - prev_total_engagement) / prev_total_engagement) * 100, 1)
        else:
            trending_pct = 100.0 if current_total_engagement > 0 else 0.0
        
        # === CONSOLIDATED RESPONSE ===
        return Response({
            # Basic Metrics
            'total_visitors': total_visitors,
            'social_engagement': social_engagement,
            'total_posts': metrics['total_posts'] or 0,
            'shares': metrics['total_shares'] or 0,
            'page_views': page_views,
            'total_likes': metrics['total_likes'] or 0,
            'total_comments': metrics['total_comments'] or 0,
            'total_views': metrics['total_views'] or 0,
            'trending_pct': trending_pct,
            
            # Sentiment Analysis
            'sentiment': sentiment_data,
            'sentiment_by_category': sentiment_by_category,
            
            # Platform Analytics
            'platforms': platforms,
            
            # Engagement Patterns
            'hourly_engagement': hourly_engagement,
            'daily_trends': daily_trends,
            
            # Keywords
            'top_keywords': top_keywords
        })


class SocialEngagementTrendsView(APIView):
    """Get social engagement trends over time, grouped by date"""
    def get(self, request):
        from datetime import datetime, timedelta
        
        # Parse filters
        city = request.GET.get('city', None)
        period = request.GET.get('period', 'month')
        
        # Calculate date range
        period_days = {
            'week': 7,
            'month': 30,
            'quarter': 90,
            'year': 365
        }
        days = period_days.get(period, 30)
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Base query
        posts_qs = SocialPost.objects.filter(created_at__date__range=[start_date, end_date])
        
        # Filter by city if specified
        if city and city != 'all':
            place = Place.objects.filter(name__iexact=city).first()
            if place:
                posts_qs = posts_qs.filter(place=place)
        
        # Group by date and aggregate
        engagement_by_date = (
            posts_qs
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(
                likes=Sum('likes'),
                comments=Sum('comments'),
                shares=Sum('shares')
            )
            .order_by('date')
        )
        
        # Format for frontend chart
        chart_data = []
        for item in engagement_by_date:
            chart_data.append({
                'date': item['date'].strftime('%Y-%m-%d'),
                'likes': item['likes'] or 0,
                'comments': item['comments'] or 0,
                'shares': item['shares'] or 0
            })
        
        return Response(chart_data)


class LeastVisitedDestinationsView(APIView):
    """Get least visited destinations based on social post count"""
    def get(self, request):
        start, end = parse_range(request)
        limit = int(request.GET.get('limit', '5'))
        
        # Get places with their post counts in the date range
        places_with_counts = Place.objects.annotate(
            post_count=Count(
                'posts',
                filter=Q(posts__created_at__date__range=[start, end])
            )
        ).filter(
            post_count__gt=0  # Only include places with at least some posts
        ).order_by('post_count')[:limit]
        
        result = []
        for place in places_with_counts:
            # Calculate engagement metrics
            posts = SocialPost.objects.filter(
                place=place,
                created_at__date__range=[start, end]
            )
            
            total_engagement = posts.aggregate(
                total_likes=Sum('likes'),
                total_comments=Sum('comments'),
                total_shares=Sum('shares')
            )
            
            result.append({
                'id': place.id,
                'name': place.name,
                'posts': place.post_count,
                'visitors': place.post_count * 150,  # Estimate based on posts
                'engagement': (
                    (total_engagement['total_likes'] or 0) +
                    (total_engagement['total_comments'] or 0) +
                    (total_engagement['total_shares'] or 0)
                ),
                'rating': 3.5 + (place.post_count / 100),  # Simple rating estimate
                'city': place.city or 'Kedah'
            })
        
        return Response(result)


class EventAttendanceTrendView(APIView):
    """Get event attendance trends over time"""
    def get(self, request):
        from django.utils import timezone
        
        # Get all past events with actual attendance (no date range limit)
        events = Event.objects.filter(
            start_date__lt=timezone.now(),
            actual_attendance__isnull=False
        ).order_by('start_date')
        
        # Group by month for trend chart
        from collections import defaultdict
        monthly_data = defaultdict(lambda: {'expected': 0, 'actual': 0, 'events': 0})
        
        for event in events:
            month_key = event.start_date.strftime('%Y-%m')
            monthly_data[month_key]['expected'] += event.expected_attendance or 0
            monthly_data[month_key]['actual'] += event.actual_attendance or 0
            monthly_data[month_key]['events'] += 1
        
        # Format for chart
        result = []
        for month, data in sorted(monthly_data.items()):
            result.append({
                'month': month,
                'expected': data['expected'],
                'actual': data['actual'],
                'events': data['events'],
                'variance': data['actual'] - data['expected'] if data['expected'] > 0 else 0
            })
        
        return Response(result)


class PlaceSentimentDetailView(APIView):
    """
    GET /api/analytics/places/{id}/sentiment/
    Detailed sentiment analysis for a specific place.
    Returns sentiment breakdown, time-based trends, and engagement insights.
    """
    permission_classes = [AllowAny]
    
    def get(self, request, place_id):
        from django.db.models import Count, Avg, Sum, Q
        from django.db.models.functions import TruncMonth
        from collections import defaultdict
        
        try:
            place = Place.objects.get(id=place_id)
        except Place.DoesNotExist:
            return Response(
                {'error': 'Place not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get all social posts for this place
        posts = SocialPost.objects.filter(place=place)
        
        if not posts.exists():
            # Return demo data for presentation purposes
            return Response({
                'place_id': place_id,
                'place_name': place.name,
                'category': place.category,
                'has_data': True,
                'is_demo_data': True,
                'sentiment_summary': {
                    'positive': 45,
                    'neutral': 28,
                    'negative': 12,
                    'total_posts': 85,
                    'positive_percentage': 52.9,
                    'neutral_percentage': 32.9,
                    'negative_percentage': 14.1,
                    'average_score': 0.42,
                    'rating': 4.2
                },
                'timeline': [
                    {'date': '2024-01', 'positive': 8, 'neutral': 5, 'negative': 2, 'total': 15},
                    {'date': '2024-02', 'positive': 7, 'neutral': 6, 'negative': 2, 'total': 15},
                    {'date': '2024-03', 'positive': 9, 'neutral': 4, 'negative': 2, 'total': 15},
                    {'date': '2024-04', 'positive': 8, 'neutral': 5, 'negative': 2, 'total': 15},
                    {'date': '2024-05', 'positive': 7, 'neutral': 4, 'negative': 2, 'total': 13},
                    {'date': '2024-06', 'positive': 6, 'neutral': 4, 'negative': 2, 'total': 12}
                ],
                'engagement_stats': {
                    'total_likes': 4850,
                    'total_comments': 1240,
                    'total_shares': 680,
                    'total_engagement': 6770,
                    'average_engagement_per_post': 79.6,
                    'engagement_trend': 'increasing'
                },
                'platform_breakdown': [
                    {'platform': 'Instagram', 'posts': 35, 'avg_sentiment': 0.48, 'engagement': 3200},
                    {'platform': 'Facebook', 'posts': 28, 'avg_sentiment': 0.38, 'engagement': 2150},
                    {'platform': 'Twitter', 'posts': 22, 'avg_sentiment': 0.35, 'engagement': 1420}
                ],
                'top_positive_themes': [
                    {'theme': 'Beautiful scenery', 'count': 18},
                    {'theme': 'Great experience', 'count': 15},
                    {'theme': 'Family friendly', 'count': 12}
                ],
                'top_negative_themes': [
                    {'theme': 'Crowded', 'count': 5},
                    {'theme': 'Parking issues', 'count': 4},
                    {'theme': 'Expensive', 'count': 3}
                ],
                'recommendation': 'This destination has strong positive sentiment (52.9%) and growing engagement. Consider promoting during peak seasons.'
            })
        
        # Sentiment summary
        sentiment_counts = posts.values('sentiment').annotate(count=Count('id'))
        total_posts = posts.count()
        sentiment_summary = {
            'total_posts': total_posts,
            'positive': 0,
            'neutral': 0,
            'negative': 0,
            'positive_percentage': 0,
            'neutral_percentage': 0,
            'negative_percentage': 0
        }
        
        for item in sentiment_counts:
            sentiment_type = item['sentiment'] or 'neutral'
            count = item['count']
            sentiment_summary[sentiment_type] = count
            sentiment_summary[f'{sentiment_type}_percentage'] = round((count / total_posts) * 100, 1)
        
        # Average sentiment score and confidence
        avg_metrics = posts.aggregate(
            avg_sentiment_score=Avg('sentiment_score'),
            avg_confidence=Avg('confidence')
        )
        
        # Convert sentiment score to rating
        avg_score = avg_metrics['avg_sentiment_score'] or 0
        rating = ((avg_score + 1) / 2) * 4 + 1
        
        # Sentiment over time (monthly breakdown)
        monthly_sentiment = posts.annotate(
            month=TruncMonth('created_at')
        ).values('month', 'sentiment').annotate(
            count=Count('id')
        ).order_by('month')
        
        # Organize by month
        sentiment_timeline = defaultdict(lambda: {'positive': 0, 'neutral': 0, 'negative': 0})
        for item in monthly_sentiment:
            month_key = item['month'].strftime('%Y-%m')
            sentiment_type = item['sentiment'] or 'neutral'
            sentiment_timeline[month_key][sentiment_type] = item['count']
        
        timeline_data = [
            {
                'month': month,
                'positive': data['positive'],
                'neutral': data['neutral'],
                'negative': data['negative']
            }
            for month, data in sorted(sentiment_timeline.items())
        ]
        
        # Engagement metrics
        engagement_stats = posts.aggregate(
            total_engagement=Sum(F('likes') + F('comments') + F('shares')),
            total_likes=Sum('likes'),
            total_comments=Sum('comments'),
            total_shares=Sum('shares'),
            total_views=Sum('views')
        )
        
        # Platform breakdown
        platform_data = posts.values('platform').annotate(
            count=Count('id'),
            avg_sentiment=Avg('sentiment_score')
        ).order_by('-count')
        
        # Top keywords (from content if available)
        # This is a simplified version - in production you'd use NLP
        top_keywords = []
        
        # Recommendation text based on sentiment
        if sentiment_summary['positive_percentage'] > 70:
            recommendation = "Highly recommended - visitors love this place!"
        elif sentiment_summary['positive_percentage'] > 50:
            recommendation = "Recommended - mostly positive visitor experiences"
        elif sentiment_summary['negative_percentage'] > 50:
            recommendation = "Mixed reviews - check recent feedback before visiting"
        else:
            recommendation = "Limited sentiment data - check other sources"
        
        return Response({
            'place_id': place_id,
            'place_name': place.name,
            'place_category': place.category,
            'place_city': place.city,
            'has_data': True,
            'sentiment_summary': sentiment_summary,
            'rating': round(rating, 2),
            'average_sentiment_score': round(avg_score, 3),
            'average_confidence': round(avg_metrics['avg_confidence'] or 0, 1),
            'sentiment_over_time': timeline_data,
            'engagement_stats': engagement_stats,
            'platform_breakdown': list(platform_data),
            'top_keywords': top_keywords,
            'recommendation': recommendation
        })


class PlacesByVisitLevelView(APIView):
    """
    GET /api/analytics/places/by-visit-level/?level=most|least|medium&city=<city>
    Categorizes places by visit frequency with sentiment analysis.
    Uses engagement percentiles to define most/medium/least visited tiers.
    Supports optional city filtering.
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        from django.db.models import Count, Avg, Sum, Q
        import numpy as np
        
        level = request.GET.get('level', 'most')  # most, least, medium
        city_filter = request.GET.get('city', None)  # optional city filter
        
        if level not in ['most', 'least', 'medium']:
            return Response(
                {'error': 'Invalid level. Must be "most", "least", or "medium"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get all places with their engagement metrics
        places = Place.objects.annotate(
            posts_count=Count('posts'),
            total_engagement=Sum(F('posts__likes') + F('posts__comments') + F('posts__shares')),
            avg_sentiment=Avg('posts__sentiment_score'),
            positive_count=Count('posts', filter=Q(posts__sentiment='positive')),
            neutral_count=Count('posts', filter=Q(posts__sentiment='neutral')),
            negative_count=Count('posts', filter=Q(posts__sentiment='negative'))
        ).filter(posts_count__gt=0)
        
        # Apply city filter if provided
        if city_filter and city_filter != 'all':
            places = places.filter(city__icontains=city_filter)
        
        if not places.exists():
            # Return demo data for presentation purposes
            demo_places = {
                'most': [
                    {
                        'id': 1,
                        'name': 'Menara Alor Setar',
                        'category': 'Landmark',
                        'city': 'Alor Setar',
                        'state': 'Kedah',
                        'total_engagement': 5840,
                        'posts_count': 42,
                        'estimated_visitors': 6300,
                        'sentiment': {
                            'positive': 28,
                            'neutral': 10,
                            'negative': 4,
                            'positive_percentage': 66.7,
                            'neutral_percentage': 23.8,
                            'negative_percentage': 9.5,
                            'average_score': 0.52,
                            'rating': 4.52
                        },
                        'price': 5.0,
                        'is_free': False,
                        'latitude': 6.1245,
                        'longitude': 100.3673
                    },
                    {
                        'id': 2,
                        'name': 'Zahir Mosque',
                        'category': 'Religious Site',
                        'city': 'Alor Setar',
                        'state': 'Kedah',
                        'total_engagement': 4920,
                        'posts_count': 38,
                        'estimated_visitors': 5700,
                        'sentiment': {
                            'positive': 30,
                            'neutral': 6,
                            'negative': 2,
                            'positive_percentage': 78.9,
                            'neutral_percentage': 15.8,
                            'negative_percentage': 5.3,
                            'average_score': 0.68,
                            'rating': 4.68
                        },
                        'price': None,
                        'is_free': True,
                        'latitude': 6.1198,
                        'longitude': 100.3652
                    }
                ],
                'medium': [
                    {
                        'id': 3,
                        'name': 'Pekan Rabu Complex',
                        'category': 'Shopping',
                        'city': 'Alor Setar',
                        'state': 'Kedah',
                        'total_engagement': 2350,
                        'posts_count': 24,
                        'estimated_visitors': 3600,
                        'sentiment': {
                            'positive': 15,
                            'neutral': 7,
                            'negative': 2,
                            'positive_percentage': 62.5,
                            'neutral_percentage': 29.2,
                            'negative_percentage': 8.3,
                            'average_score': 0.45,
                            'rating': 4.45
                        },
                        'price': None,
                        'is_free': True,
                        'latitude': 6.1187,
                        'longitude': 100.3688
                    }
                ],
                'least': [
                    {
                        'id': 4,
                        'name': 'Nobat Tower',
                        'category': 'Historical',
                        'city': 'Alor Setar',
                        'state': 'Kedah',
                        'total_engagement': 680,
                        'posts_count': 12,
                        'estimated_visitors': 1800,
                        'sentiment': {
                            'positive': 8,
                            'neutral': 3,
                            'negative': 1,
                            'positive_percentage': 66.7,
                            'neutral_percentage': 25.0,
                            'negative_percentage': 8.3,
                            'average_score': 0.48,
                            'rating': 4.48
                        },
                        'price': None,
                        'is_free': True,
                        'latitude': 6.1209,
                        'longitude': 100.3640
                    },
                    {
                        'id': 5,
                        'name': 'Royal Museum',
                        'category': 'Museum',
                        'city': 'Alor Setar',
                        'state': 'Kedah',
                        'total_engagement': 520,
                        'posts_count': 9,
                        'estimated_visitors': 1350,
                        'sentiment': {
                            'positive': 6,
                            'neutral': 2,
                            'negative': 1,
                            'positive_percentage': 66.7,
                            'neutral_percentage': 22.2,
                            'negative_percentage': 11.1,
                            'average_score': 0.42,
                            'rating': 4.42
                        },
                        'price': 3.0,
                        'is_free': False,
                        'latitude': 6.1220,
                        'longitude': 100.3658
                    }
                ]
            }
            
            selected_places = demo_places.get(level, [])
            total_engagement = sum(p['total_engagement'] for p in selected_places)
            avg_sentiment = sum(p['sentiment']['average_score'] for p in selected_places) / len(selected_places) if selected_places else 0
            avg_rating = sum(p['sentiment']['rating'] for p in selected_places) / len(selected_places) if selected_places else 0
            
            pos_total = sum(p['sentiment']['positive'] for p in selected_places)
            neu_total = sum(p['sentiment']['neutral'] for p in selected_places)
            neg_total = sum(p['sentiment']['negative'] for p in selected_places)
            total_sent = pos_total + neu_total + neg_total
            
            descriptions = {
                'most': 'Most visited places (top 33% by engagement, ≥4500 engagement points)',
                'medium': 'Moderately visited places (middle 33%, 1500-4500 engagement points)',
                'least': 'Least visited places (bottom 33%, ≤1500 engagement points)'
            }
            
            return Response({
                'level': level,
                'description': descriptions.get(level, 'Demo data'),
                'total_places': len(selected_places),
                'is_demo_data': True,
                'aggregate_stats': {
                    'total_engagement': total_engagement,
                    'average_sentiment_score': round(avg_sentiment, 3),
                    'average_rating': round(avg_rating, 2),
                    'sentiment_distribution': {
                        'positive': pos_total,
                        'neutral': neu_total,
                        'negative': neg_total,
                        'positive_percentage': round((pos_total / total_sent) * 100, 1) if total_sent > 0 else 0,
                        'neutral_percentage': round((neu_total / total_sent) * 100, 1) if total_sent > 0 else 0,
                        'negative_percentage': round((neg_total / total_sent) * 100, 1) if total_sent > 0 else 0
                    }
                },
                'places': selected_places
            })
        
        # Calculate engagement percentiles
        engagements = [p.total_engagement or 0 for p in places]
        p33 = np.percentile(engagements, 33)
        p67 = np.percentile(engagements, 67)
        
        # Filter by level
        if level == 'most':
            filtered_places = [p for p in places if (p.total_engagement or 0) >= p67]
            description = f"Most visited places (top 33% by engagement, ≥{int(p67)} engagement points)"
        elif level == 'least':
            filtered_places = [p for p in places if (p.total_engagement or 0) <= p33]
            description = f"Least visited places (bottom 33% by engagement, ≤{int(p33)} engagement points)"
        else:  # medium
            filtered_places = [p for p in places if p33 < (p.total_engagement or 0) < p67]
            description = f"Moderately visited places (middle 33%, {int(p33)}-{int(p67)} engagement points)"
        
        # Format response
        results = []
        for place in filtered_places:
            total_posts = place.posts_count or 1
            sentiment_score = place.avg_sentiment or 0
            rating = ((sentiment_score + 1) / 2) * 4 + 1
            
            results.append({
                'id': place.id,
                'name': place.name,
                'category': place.category,
                'city': place.city,
                'state': place.state,
                'total_engagement': place.total_engagement or 0,
                'posts_count': place.posts_count,
                'estimated_visitors': place.posts_count * 150,
                'sentiment': {
                    'positive': place.positive_count,
                    'neutral': place.neutral_count,
                    'negative': place.negative_count,
                    'positive_percentage': round((place.positive_count / total_posts) * 100, 1),
                    'neutral_percentage': round((place.neutral_count / total_posts) * 100, 1),
                    'negative_percentage': round((place.negative_count / total_posts) * 100, 1),
                    'average_score': round(sentiment_score, 3),
                    'rating': round(rating, 2)
                },
                'price': float(place.price) if place.price else None,
                'is_free': place.is_free,
                'latitude': float(place.latitude) if place.latitude else None,
                'longitude': float(place.longitude) if place.longitude else None
            })
        
        # Sort by engagement descending
        results.sort(key=lambda x: x['total_engagement'], reverse=True)
        
        # Calculate aggregate stats for this level
        total_engagement = sum(p['total_engagement'] for p in results)
        avg_sentiment_score = np.mean([p['sentiment']['average_score'] for p in results]) if results else 0
        avg_rating = np.mean([p['sentiment']['rating'] for p in results]) if results else 0
        
        positive_total = sum(p['sentiment']['positive'] for p in results)
        neutral_total = sum(p['sentiment']['neutral'] for p in results)
        negative_total = sum(p['sentiment']['negative'] for p in results)
        total_sentiment_posts = positive_total + neutral_total + negative_total
        
        return Response({
            'level': level,
            'description': description,
            'total_places': len(results),
            'aggregate_stats': {
                'total_engagement': total_engagement,
                'average_sentiment_score': round(avg_sentiment_score, 3),
                'average_rating': round(avg_rating, 2),
                'sentiment_distribution': {
                    'positive': positive_total,
                    'neutral': neutral_total,
                    'negative': negative_total,
                    'positive_percentage': round((positive_total / total_sentiment_posts) * 100, 1) if total_sentiment_posts > 0 else 0,
                    'neutral_percentage': round((neutral_total / total_sentiment_posts) * 100, 1) if total_sentiment_posts > 0 else 0,
                    'negative_percentage': round((negative_total / total_sentiment_posts) * 100, 1) if total_sentiment_posts > 0 else 0
                }
            },
            'places': results
        })


class SentimentComparisonView(APIView):
    """
    GET /api/analytics/sentiment/comparison/
    Compares sentiment distribution between most and least visited places.
    Provides insights into how visitor sentiment correlates with visit frequency.
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        from django.db.models import Count, Avg, Sum, Q
        import numpy as np
        
        # Get all places with engagement metrics
        places = Place.objects.annotate(
            posts_count=Count('posts'),
            total_engagement=Sum(F('posts__likes') + F('posts__comments') + F('posts__shares')),
            avg_sentiment=Avg('posts__sentiment_score'),
            positive_count=Count('posts', filter=Q(posts__sentiment='positive')),
            neutral_count=Count('posts', filter=Q(posts__sentiment='neutral')),
            negative_count=Count('posts', filter=Q(posts__sentiment='negative'))
        ).filter(posts_count__gt=0)
        
        if not places.exists():
            # Return demo data for presentation purposes
            return Response({
                'is_demo_data': True,
                'comparison': {
                    'most_visited': {
                        'category': 'Most Visited',
                        'total_places': 2,
                        'total_posts': 80,
                        'total_engagement': 10760,
                        'average_engagement_per_place': 5380.0,
                        'sentiment_distribution': {
                            'positive': 58,
                            'neutral': 16,
                            'negative': 6,
                            'positive_percentage': 72.5,
                            'neutral_percentage': 20.0,
                            'negative_percentage': 7.5
                        },
                        'average_sentiment_score': 0.60,
                        'average_rating': 4.60
                    },
                    'least_visited': {
                        'category': 'Least Visited',
                        'total_places': 2,
                        'total_posts': 21,
                        'total_engagement': 1200,
                        'average_engagement_per_place': 600.0,
                        'sentiment_distribution': {
                            'positive': 14,
                            'neutral': 5,
                            'negative': 2,
                            'positive_percentage': 66.7,
                            'neutral_percentage': 23.8,
                            'negative_percentage': 9.5
                        },
                        'average_sentiment_score': 0.45,
                        'average_rating': 4.45
                    }
                },
                'insights': [
                    'Most visited places have 15.0% higher sentiment scores, suggesting visitor satisfaction drives popularity.',
                    'Most visited places have 5.8% more positive reviews.',
                    'Most visited places average 5380 engagement points vs 600 for least visited.',
                    'Despite lower visit numbers, least visited places maintain strong positive sentiment (66.7%), indicating potential hidden gems.'
                ],
                'methodology': {
                    'most_visited_threshold': '≥4500 engagement points (top 33%)',
                    'least_visited_threshold': '≤1500 engagement points (bottom 33%)',
                    'total_places_analyzed': 5,
                    'engagement_calculation': 'likes + comments + shares',
                    'rating_formula': '((sentiment_score + 1) / 2) * 4 + 1'
                }
            })
        
        # Calculate engagement percentiles
        engagements = [p.total_engagement or 0 for p in places]
        p33 = np.percentile(engagements, 33)
        p67 = np.percentile(engagements, 67)
        
        # Categorize places
        most_visited = [p for p in places if (p.total_engagement or 0) >= p67]
        least_visited = [p for p in places if (p.total_engagement or 0) <= p33]
        
        def calculate_stats(place_list, category_name):
            if not place_list:
                return {
                    'category': category_name,
                    'total_places': 0,
                    'message': 'No data available'
                }
            
            positive_total = sum(p.positive_count for p in place_list)
            neutral_total = sum(p.neutral_count for p in place_list)
            negative_total = sum(p.negative_count for p in place_list)
            total_posts = positive_total + neutral_total + negative_total
            
            avg_sentiment = np.mean([p.avg_sentiment for p in place_list if p.avg_sentiment is not None])
            avg_rating = ((avg_sentiment + 1) / 2) * 4 + 1
            
            total_engagement = sum(p.total_engagement or 0 for p in place_list)
            
            return {
                'category': category_name,
                'total_places': len(place_list),
                'total_posts': total_posts,
                'total_engagement': total_engagement,
                'average_engagement_per_place': round(total_engagement / len(place_list), 1),
                'sentiment_distribution': {
                    'positive': positive_total,
                    'neutral': neutral_total,
                    'negative': negative_total,
                    'positive_percentage': round((positive_total / total_posts) * 100, 1) if total_posts > 0 else 0,
                    'neutral_percentage': round((neutral_total / total_posts) * 100, 1) if total_posts > 0 else 0,
                    'negative_percentage': round((negative_total / total_posts) * 100, 1) if total_posts > 0 else 0
                },
                'average_sentiment_score': round(avg_sentiment, 3),
                'average_rating': round(avg_rating, 2)
            }
        
        most_stats = calculate_stats(most_visited, 'Most Visited')
        least_stats = calculate_stats(least_visited, 'Least Visited')
        
        # Calculate insights
        insights = []
        
        if most_stats['total_places'] > 0 and least_stats['total_places'] > 0:
            # Sentiment comparison
            sentiment_diff = most_stats['average_sentiment_score'] - least_stats['average_sentiment_score']
            if sentiment_diff > 0.1:
                insights.append(f"Most visited places have {abs(sentiment_diff):.1%} higher sentiment scores, suggesting visitor satisfaction drives popularity.")
            elif sentiment_diff < -0.1:
                insights.append(f"Least visited places have {abs(sentiment_diff):.1%} higher sentiment scores, indicating hidden gems with great reviews.")
            else:
                insights.append("Sentiment scores are similar across visit levels, suggesting factors beyond visitor satisfaction drive popularity.")
            
            # Positive sentiment comparison
            pos_diff = most_stats['sentiment_distribution']['positive_percentage'] - least_stats['sentiment_distribution']['positive_percentage']
            if pos_diff > 10:
                insights.append(f"Most visited places have {pos_diff:.1f}% more positive reviews.")
            elif pos_diff < -10:
                insights.append(f"Least visited places have {abs(pos_diff):.1f}% more positive reviews despite lower visit numbers.")
            
            # Engagement correlation
            insights.append(f"Most visited places average {most_stats['average_engagement_per_place']:.0f} engagement points vs {least_stats['average_engagement_per_place']:.0f} for least visited.")
        
        return Response({
            'comparison': {
                'most_visited': most_stats,
                'least_visited': least_stats
            },
            'insights': insights,
            'methodology': {
                'most_visited_threshold': f'≥{int(p67)} engagement points (top 33%)',
                'least_visited_threshold': f'≤{int(p33)} engagement points (bottom 33%)',
                'total_places_analyzed': places.count(),
                'engagement_calculation': 'likes + comments + shares',
                'rating_formula': '((sentiment_score + 1) / 2) * 4 + 1'
            }
        })
