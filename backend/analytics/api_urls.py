from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    POIViewSet,
    PostRawViewSet,
    PostCleanViewSet,
    SentimentTopicViewSet,
    MapHeatView,
    WordCloudView,
    HiddenGemView,
    AttractionsListView,
    AttractionDetailView,
    VendorsListView,
    VendorDetailView,
    ReportsExportView,
    # NEW: dashboard endpoints
    MetricsTotalsView,
    SentimentTrendView,
    TopAttractionsView,  # class alias you already use
)

# Import from views_new
from .views_new import (
    PlacesListView,
    SentimentSummaryView,
    SentimentByCategoryView,
    TopKeywordsView,
    SocialMetricsView,
    SocialPlatformsView,
    SocialEngagementView,
    PopularPlacesView,
    TrendingPlacesView,
    NearbyPlacesView,
    OverviewMetricsView,
    SocialEngagementTrendsView,
)

# Function-based analytics (existing)
from .metrics import visitors_total, top_attractions
from .rankings import top_pois, least_pois
from .timeseries import mentions_timeseries
from .search import search_pois

router = DefaultRouter()
router.register(r"pois", POIViewSet)
router.register(r"posts-raw", PostRawViewSet)
router.register(r"posts-clean", PostCleanViewSet)
router.register(r"sentiments", SentimentTopicViewSet, basename="sentiments")

urlpatterns = [
    path("", include(router.urls)),

    # ---- Minimal dashboard APIs expected by the React app ----
    path("metrics/totals",  MetricsTotalsView.as_view(), name="api-metrics-totals"),
    path("metrics/totals/", MetricsTotalsView.as_view()),
    path("attractions/top",  TopAttractionsView.as_view(), name="api-attractions-top"),
    path("attractions/top/", TopAttractionsView.as_view()),
    path("sentiment/trend",  SentimentTrendView.as_view(), name="api-sentiment-trend"),
    path("sentiment/trend/", SentimentTrendView.as_view()),
    
    # Places/Cities List
    path("places/list", PlacesListView.as_view(), name="api-places-list"),
    path("places/list/", PlacesListView.as_view()),
    
    # Sentiment Analysis Endpoints
    path("sentiment/summary", SentimentSummaryView.as_view(), name="api-sentiment-summary"),
    path("sentiment/by-category", SentimentByCategoryView.as_view(), name="api-sentiment-by-category"),
    path("sentiment/keywords", TopKeywordsView.as_view(), name="api-sentiment-keywords"),
    
    # Social Media Analytics Endpoints
    path("social/metrics", SocialMetricsView.as_view(), name="api-social-metrics"),
    path("social/platforms", SocialPlatformsView.as_view(), name="api-social-platforms"),
    path("social/engagement", SocialEngagementView.as_view(), name="api-social-engagement"),

    # Popular Places and Rankings
    path("places/popular", PopularPlacesView.as_view(), name="api-places-popular"),
    path("places/trending", TrendingPlacesView.as_view(), name="api-places-trending"),
    path("places/nearby", NearbyPlacesView.as_view(), name="api-places-nearby"),

    # ---- Phase 1 (existing, kept) ----
    path("metrics/visitors",        visitors_total,     name="metrics-visitors"),
    path("metrics/top-attractions", top_attractions,    name="metrics-top-attractions"),
    path("rankings/top-pois",       top_pois,           name="rankings-top-pois"),
    path("rankings/least-pois",     least_pois,         name="rankings-least-pois"),
    path("timeseries/mentions",     mentions_timeseries,name="timeseries-mentions"),

    # Search
    path("search/pois", search_pois, name="search-pois"),

    # ---- Part 3 ----
    path("map/heat",            MapHeatView.as_view(),     name="map-heat"),
    path("trends/wordcloud",    WordCloudView.as_view(),   name="trends-wordcloud"),
    path("trends/hidden-gem",   HiddenGemView.as_view(),   name="trends-hidden-gem"),

    # ---- Part 4: Attractions & Vendors (trailing-slash friendly) ----
    path("tabs/attractions",                 AttractionsListView.as_view(),  name="tabs-attractions"),
    path("tabs/attractions/",                AttractionsListView.as_view()),
    path("tabs/attractions/<int:pk>",        AttractionDetailView.as_view(), name="tabs-attractions-detail"),
    path("tabs/attractions/<int:pk>/",       AttractionDetailView.as_view()),
    path("tabs/vendors",                     VendorsListView.as_view(),      name="tabs-vendors"),
    path("tabs/vendors/",                    VendorsListView.as_view()),
    path("tabs/vendors/<int:pk>",            VendorDetailView.as_view(),     name="tabs-vendors-detail"),
    path("tabs/vendors/<int:pk>/",           VendorDetailView.as_view()),

    # Reports
    path("reports", ReportsExportView.as_view(), name="reports-export"),
]
