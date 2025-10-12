
from django.urls import path
from . import views

urlpatterns = [
    # --- Existing endpoints (Phase 1 + 2) ---
    path("metrics/visitors", views.MetricsVisitorsView.as_view(), name="metrics-visitors"),
    path("metrics/top-attractions", views.TopAttractionsView.as_view(), name="metrics-top-attractions"),
    path("rankings/top-pois", views.TopPOIsView.as_view(), name="rankings-top-pois"),
    path("rankings/least-pois", views.LeastPOIsView.as_view(), name="rankings-least-pois"),
    path("timeseries/mentions", views.MentionsTimeSeriesView.as_view(), name="timeseries-mentions"),

    # --- New endpoints (Part 3: Map + Trends) ---
    path("map/heat", views.MapHeatView.as_view(), name="map-heat"),
    path("trends/wordcloud", views.WordCloudView.as_view(), name="trends-wordcloud"),
    path("trends/hidden-gem", views.HiddenGemView.as_view(), name="trends-hidden-gem"),
]
