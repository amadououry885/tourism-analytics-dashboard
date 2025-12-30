from django.db.models import Q, Count, F, Case, When, IntegerField, Sum, Avg
from django.db.models.functions import Coalesce, TruncDate, ExtractHour
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime, timedelta
from .models import Place, SocialPost, PostRaw, PostClean, SentimentTopic
from .serializers import PlaceSerializer, SocialPostSerializer, PostCleanSerializer, SentimentTopicSerializer
from events.models import Event

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
            return Response({
                "positive_pct": 60,
                "neutral_pct": 30,
                "negative_pct": 10,
                "positive": 0,
                "neutral": 0,
                "negative": 0,
                "mentions": 0,
                "message": "No sentiment data available yet. Data will be collected automatically."
            })
            
        return Response({
            "positive_pct": round(agg['pos'] * 100 / total),
            "neutral_pct": round(agg['neu'] * 100 / total),
            "negative_pct": round(agg['neg'] * 100 / total),
            "positive": agg['pos'],
            "neutral": agg['neu'],
            "negative": agg['neg'],
            "mentions": total
        })

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
            place = Place.objects.filter(name__iexact=city).first()
            if place:
                posts_qs = posts_qs.filter(place=place)
                prev_posts_qs = prev_posts_qs.filter(place=place)
        
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