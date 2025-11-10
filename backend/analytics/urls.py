# backend/analytics/urls.py
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from . import views_safe as vs
from . import views_new as vn
from . import views_crud as vc

# Router for CRUD endpoints
router = DefaultRouter()
router.register(r'places', vc.PlaceViewSet, basename='place')
router.register(r'posts', vc.SocialPostViewSet, basename='socialpost')
# Add routers for legacy views that are now handled by new views
router.register(r'pois', vc.PlaceViewSet, basename='poi')  # Legacy POI is now Place
router.register(r'posts-raw', vc.SocialPostViewSet, basename='post-raw')  # Legacy PostRaw is now SocialPost
router.register(r'posts-clean', vc.SocialPostViewSet, basename='post-clean')  # Legacy PostClean is now SocialPost

urlpatterns = [
    # Include CRUD routes
    path('', include(router.urls)),

    # Health checks
    re_path(r'^ping/?$', vs.ping, name='analytics-ping'),
    re_path(r'^healthz/?$', vs.ping, name='analytics-healthz'),

    # Basic metrics and rankings (function-based views)
    re_path(r'^metrics/visitors/?$', vs.visitors_metrics, name='metrics-visitors'),
    re_path(r'^metrics/engagement/?$', vs.engagement_metrics, name='metrics-engagement'),
    re_path(r'^metrics/totals/?$', vs.metrics_totals, name='metrics-totals'),
    re_path(r'^timeseries/mentions/?$', vs.mentions_timeseries, name='timeseries-mentions'),
    re_path(r'^rankings/top-pois/?$', vs.top_pois, name='rankings-top-pois'),
    re_path(r'^rankings/least-pois/?$', vs.least_pois, name='rankings-least-pois'),
    re_path(r'^metrics/top-attractions/?$', vs.top_attractions, name='metrics-top-attractions'),
    re_path(r'^map/heat/?$', vs.map_heat, name='map-heat'),

    # Modern analytics endpoints (from views_new.py)
    path('analytics/overview-metrics/', vn.OverviewMetricsView.as_view(), name='analytics-overview-metrics'),
    path('analytics/social-engagement/', vn.SocialEngagementTrendsView.as_view(), name='analytics-social-engagement-trends'),
    path('analytics/sentiment/summary/', vn.SentimentSummaryView.as_view(), name='analytics-sentiment-summary'),
    path('analytics/sentiment/categories/', vn.SentimentByCategoryView.as_view(), name='analytics-sentiment-categories'),
    path('analytics/keywords/top/', vn.TopKeywordsView.as_view(), name='analytics-keywords-top'),
    path('analytics/social/metrics/', vn.SocialMetricsView.as_view(), name='analytics-social-metrics'),
    path('analytics/social/platforms/', vn.SocialPlatformsView.as_view(), name='analytics-social-platforms'),
    path('analytics/social/engagement/', vn.SocialEngagementView.as_view(), name='analytics-social-engagement'),
    path('analytics/places/popular/', vn.PopularPlacesView.as_view(), name='analytics-places-popular'),
    path('analytics/places/trending/', vn.TrendingPlacesView.as_view(), name='analytics-places-trending'),
    path('analytics/places/nearby/', vn.NearbyPlacesView.as_view(), name='analytics-places-nearby'),

    # Optional legacy aliases for backward compatibility
    re_path(r'^sentiment/summary/?$', vn.SentimentSummaryView.as_view(), name='sentiment-summary'),
    re_path(r'^attractions/top/?$', vs.top_attractions, name='attractions-top'),
]
