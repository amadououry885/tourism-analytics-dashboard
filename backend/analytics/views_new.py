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
            'slug': p.name.lower().replace(' ', '-')
        } for p in places])

def parse_range(request):
    """Helper to parse date range from request"""
    days = int(request.GET.get('range', '7').rstrip('d'))
    end = datetime.now().date()
    start = end - timedelta(days=days)
    return start, end

class SentimentSummaryView(APIView):
    """Get overall sentiment distribution and totals"""
    def get(self, request):
        start, end = parse_range(request)
        
        qs = PostClean.objects.filter(created_at__date__range=[start, end])
        agg = qs.aggregate(
            pos=Count(Case(When(sentiment='positive', then=1))),
            neu=Count(Case(When(sentiment='neutral', then=1))),
            neg=Count(Case(When(sentiment='negative', then=1)))
        )
        
        total = sum(agg.values())
        if total == 0:
            total = 1  # Avoid division by zero
            
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
    """Get sentiment breakdown by place category"""
    def get(self, request):
        start, end = parse_range(request)
        
        results = (
            PostClean.objects
            .filter(created_at__date__range=[start, end])
            .values('poi__category')
            .annotate(
                total=Count('id'),
                positive=Count(Case(When(sentiment='positive', then=1))),
                neutral=Count(Case(When(sentiment='neutral', then=1))),
                negative=Count(Case(When(sentiment='negative', then=1)))
            )
            .filter(total__gt=0)
        )
        
        categories = []
        for r in results:
            total = r['total']
            categories.append({
                'category': r['poi__category'] or 'Uncategorized',
                'positive': round(r['positive'] * 100 / total),
                'neutral': round(r['neutral'] * 100 / total),
                'negative': round(r['negative'] * 100 / total)
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
    """Get most popular places by social engagement"""
    def get(self, request):
        start, end = parse_range(request)
        
        places = (
            Place.objects
            .annotate(
                posts_count=Count('posts', filter=Q(
                    posts__created_at__date__range=[start, end]
                )),
                total_engagement=Sum(
                    F('posts__likes') + F('posts__comments') + F('posts__shares'),
                    filter=Q(posts__created_at__date__range=[start, end])
                )
            )
            .filter(posts_count__gt=0)
            .order_by('-total_engagement')[:10]
        )
        
        results = []
        for p in places:
            results.append({
                'id': p.id,
                'name': p.name,
                'slug': p.name.lower().replace(' ', '-'),
                'posts': getattr(p, 'posts_count', 0),
                'engagement': getattr(p, 'total_engagement', 0) or 0,
                'category': p.category or 'Uncategorized'
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
    """Get overview metrics filtered by city and period"""
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
        
        # Calculate metrics
        metrics = posts_qs.aggregate(
            total_posts=Count('id'),
            total_likes=Sum('likes'),
            total_comments=Sum('comments'),
            total_shares=Sum('shares')
        )
        
        # Calculate total visitors (now just comments count)
        total_visitors = (metrics['total_comments'] or 0)
        social_engagement = (metrics['total_likes'] or 0)  # Now just likes
        page_views = total_visitors * 2  # Rough estimation
        
        return Response({
            'total_visitors': total_visitors,  # This is Comments count
            'social_engagement': social_engagement,  # This is Likes count
            'total_posts': metrics['total_posts'] or 0,
            'shares': metrics['total_shares'] or 0,
            'page_views': page_views
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