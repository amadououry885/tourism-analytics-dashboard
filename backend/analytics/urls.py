# backend/analytics/urls.py
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from . import views_safe as vs
from . import views_new as vn
from . import views_crud as vc
from .search import search_pois

# Router for CRUD endpoints
router = DefaultRouter()
router.register(r'places', vc.PlaceViewSet, basename='place')
router.register(r'posts', vc.SocialPostViewSet, basename='socialpost')
router.register(r'pois', vc.PlaceViewSet, basename='poi')  # Legacy alias
router.register(r'posts-raw', vc.SocialPostViewSet, basename='post-raw')  # Legacy alias
router.register(r'posts-clean', vc.SocialPostViewSet, basename='post-clean')  # Legacy alias

urlpatterns = [
    # CRUD routes
    path('', include(router.urls)),

    # Health checks
    path('ping', vs.ping, name='analytics-ping'),
    path('ping/', vs.ping),
    path('healthz', vs.ping, name='analytics-healthz'),
    path('healthz/', vs.ping),

    # === OVERVIEW & DASHBOARD ===
    path('overview-metrics', vn.OverviewMetricsView.as_view(), name='overview-metrics'),
    path('overview-metrics/', vn.OverviewMetricsView.as_view()),
    path('analytics/overview-metrics', vn.OverviewMetricsView.as_view()),  # Frontend alias
    path('analytics/overview-metrics/', vn.OverviewMetricsView.as_view()),
    path('metrics/totals', vs.metrics_totals, name='metrics-totals'),
    path('metrics/totals/', vs.metrics_totals),
    path('metrics/visitors', vs.visitors_metrics, name='metrics-visitors'),
    path('metrics/visitors/', vs.visitors_metrics),
    path('metrics/engagement', vs.engagement_metrics, name='metrics-engagement'),
    path('metrics/engagement/', vs.engagement_metrics),
    path('metrics/top-attractions', vs.top_attractions, name='metrics-top-attractions'),
    path('metrics/top-attractions/', vs.top_attractions),
    path('attractions/top', vs.top_attractions, name='attractions-top'),
    path('attractions/top/', vs.top_attractions),

    # === PLACES ANALYTICS (prefixed with analytics/ to avoid CRUD conflict) ===
    path('analytics/places/list', vn.PlacesListView.as_view(), name='analytics-places-list'),
    path('analytics/places/list/', vn.PlacesListView.as_view()),
    path('analytics/places/popular', vn.PopularPlacesView.as_view(), name='analytics-places-popular'),
    path('analytics/places/popular/', vn.PopularPlacesView.as_view()),
    path('analytics/places/trending', vn.TrendingPlacesView.as_view(), name='analytics-places-trending'),
    path('analytics/places/trending/', vn.TrendingPlacesView.as_view()),
    path('analytics/places/nearby', vn.NearbyPlacesView.as_view(), name='analytics-places-nearby'),
    path('analytics/places/nearby/', vn.NearbyPlacesView.as_view()),
    path('analytics/places/least-visited', vn.LeastVisitedDestinationsView.as_view(), name='analytics-places-least-visited'),
    path('analytics/places/least-visited/', vn.LeastVisitedDestinationsView.as_view()),

    # === SENTIMENT ANALYSIS ===
    path('sentiment/summary', vn.SentimentSummaryView.as_view(), name='sentiment-summary'),
    path('sentiment/summary/', vn.SentimentSummaryView.as_view()),
    path('analytics/sentiment/summary', vn.SentimentSummaryView.as_view()),  # Frontend alias
    path('analytics/sentiment/summary/', vn.SentimentSummaryView.as_view()),
    path('sentiment/by-category', vn.SentimentByCategoryView.as_view(), name='sentiment-by-category'),
    path('sentiment/by-category/', vn.SentimentByCategoryView.as_view()),
    path('sentiment/keywords', vn.TopKeywordsView.as_view(), name='sentiment-keywords'),
    path('sentiment/keywords/', vn.TopKeywordsView.as_view()),

    # === SOCIAL MEDIA ===
    path('social/metrics', vn.SocialMetricsView.as_view(), name='social-metrics'),
    path('social/metrics/', vn.SocialMetricsView.as_view()),
    path('analytics/social/metrics', vn.SocialMetricsView.as_view()),  # Frontend alias
    path('analytics/social/metrics/', vn.SocialMetricsView.as_view()),
    path('social/platforms', vn.SocialPlatformsView.as_view(), name='social-platforms'),
    path('social/platforms/', vn.SocialPlatformsView.as_view()),
    path('analytics/social/platforms', vn.SocialPlatformsView.as_view()),  # Frontend alias
    path('analytics/social/platforms/', vn.SocialPlatformsView.as_view()),
    path('social/engagement', vn.SocialEngagementView.as_view(), name='social-engagement'),
    path('social/engagement/', vn.SocialEngagementView.as_view()),
    path('social-platforms', vn.SocialPlatformsView.as_view()),  # Hyphenated alias
    path('social-platforms/', vn.SocialPlatformsView.as_view()),
    path('social-engagement', vn.SocialEngagementTrendsView.as_view()),  # Hyphenated alias
    path('social-engagement/', vn.SocialEngagementTrendsView.as_view()),
    path('analytics/social-engagement', vn.SocialEngagementTrendsView.as_view()),  # Frontend alias
    path('analytics/social-engagement/', vn.SocialEngagementTrendsView.as_view()),
    path('social-metrics', vn.SocialMetricsView.as_view()),  # Hyphenated alias
    path('social-metrics/', vn.SocialMetricsView.as_view()),

    # === EVENTS ===
    path('events/attendance-trend', vn.EventAttendanceTrendView.as_view(), name='events-attendance-trend'),
    path('events/attendance-trend/', vn.EventAttendanceTrendView.as_view()),

    # === RANKINGS ===
    path('rankings/top-pois', vs.top_pois, name='rankings-top-pois'),
    path('rankings/top-pois/', vs.top_pois),
    path('rankings/least-pois', vs.least_pois, name='rankings-least-pois'),
    path('rankings/least-pois/', vs.least_pois),

    # === TIME SERIES ===
    path('timeseries/mentions', vs.mentions_timeseries, name='timeseries-mentions'),
    path('timeseries/mentions/', vs.mentions_timeseries),

    # === SEARCH ===
    path('search/pois', search_pois, name='search-pois'),
    path('search/pois/', search_pois),

    # === MAP & TRENDS ===
    path('map/heat', vs.map_heat, name='map-heat'),
    path('map/heat/', vs.map_heat),
    path('trends/wordcloud', vs.wordcloud, name='trends-wordcloud'),
    path('trends/wordcloud/', vs.wordcloud),
    path('trends/hidden-gem', vs.hidden_gem, name='trends-hidden-gem'),
    path('trends/hidden-gem/', vs.hidden_gem),

    # Note: tabs/attractions, tabs/vendors, and reports endpoints
    # are legacy and cause model conflicts - removed for clean code
]
