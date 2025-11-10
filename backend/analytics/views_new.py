from django.db.models import Q, Count, F, Case, When, IntegerField, Sum, Avg
from django.db.models.functions import Coalesce, TruncDate, ExtractHour
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime, timedelta
from .models import Place, SocialPost, PostRaw, PostClean, SentimentTopic
from .serializers import PlaceSerializer, SocialPostSerializer, PostCleanSerializer, SentimentTopicSerializer
def parse_range(request):
    """Helper to parse date range from request"""
    days = int(request.GET.get('range', '7').rstrip('d'))
    end = datetime.now().date()
    start = end - timedelta(days=days)
    return start, end

class CitiesListView(APIView):
    """Get list of all cities/places"""
    def get(self, request):
        places = Place.objects.all().order_by('name')
        return Response([{
            'id': place.id,
            'name': place.name,
            'slug': place.name.lower().replace(' ', '-')
        } for place in places])

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
                posts=Count('posts', filter=Q(
                    posts__created_at__date__range=[start, end]
                )),
                total_engagement=Sum(
                    F('posts__likes') + F('posts__comments') + F('posts__shares'),
                    filter=Q(posts__created_at__date__range=[start, end])
                )
            )
            .filter(posts__gt=0)
            .order_by('-total_engagement')[:10]
        )
        
        return Response(PlaceSerializer(places, many=True).data)

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
        
        # Calculate total visitors (approximation based on engagement)
        total_visitors = (metrics['total_likes'] or 0) + (metrics['total_comments'] or 0)
        social_engagement = (metrics['total_likes'] or 0) + (metrics['total_comments'] or 0) + (metrics['total_shares'] or 0)
        page_views = total_visitors * 2  # Rough estimation
        
        return Response({
            'total_visitors': total_visitors,
            'visitors_change': '+12.5%',
            'social_engagement': social_engagement,
            'engagement_change': '+23.1%',
            'total_posts': metrics['total_posts'] or 0,
            'posts_change': '+8.3%',
            'shares': metrics['total_shares'] or 0,
            'shares_change': '-3.2%',
            'page_views': page_views,
            'views_change': '+18.7%'
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