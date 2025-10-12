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
)

# Function-based analytics
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

    # Phase 1
    path("metrics/visitors", visitors_total, name="metrics-visitors"),
    path("metrics/top-attractions", top_attractions, name="metrics-top-attractions"),
    path("rankings/top-pois", top_pois, name="rankings-top-pois"),
    path("rankings/least-pois", least_pois, name="rankings-least-pois"),
    path("timeseries/mentions", mentions_timeseries, name="timeseries-mentions"),

    # Search
    path("search/pois", search_pois, name="search-pois"),

    # Part 3
    path("map/heat", MapHeatView.as_view(), name="map-heat"),
    path("trends/wordcloud", WordCloudView.as_view(), name="trends-wordcloud"),
    path("trends/hidden-gem", HiddenGemView.as_view(), name="trends-hidden-gem"),

    # Part 4: Attractions & Vendors (trailing-slash friendly)
    path("tabs/attractions", AttractionsListView.as_view(), name="tabs-attractions"),
    path("tabs/attractions/", AttractionsListView.as_view()),
    path("tabs/attractions/<int:pk>", AttractionDetailView.as_view(), name="tabs-attractions-detail"),
    path("tabs/attractions/<int:pk>/", AttractionDetailView.as_view()),

    path("tabs/vendors", VendorsListView.as_view(), name="tabs-vendors"),
    path("tabs/vendors/", VendorsListView.as_view()),
    path("tabs/vendors/<int:pk>", VendorDetailView.as_view(), name="tabs-vendors-detail"),
    path("tabs/vendors/<int:pk>/", VendorDetailView.as_view()),

    # Reports
    path("reports", ReportsExportView.as_view(), name="reports-export"),
]
