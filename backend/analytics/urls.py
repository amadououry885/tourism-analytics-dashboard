
# backend/analytics/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # ─────────────────────────────────────────
    # Health
    # ─────────────────────────────────────────
    path("healthz", views.healthz, name="healthz"),

    # ─────────────────────────────────────────
    # Minimal dashboard APIs expected by frontend
    # ─────────────────────────────────────────
    path("api/metrics/totals", views.MetricsTotalsView.as_view(), name="api-metrics-totals"),
    path("api/attractions/top", views.TopAttractionsView.as_view(), name="api-attractions-top"),
    path("api/sentiment/trend", views.SentimentTrendView.as_view(), name="api-sentiment-trend"),

    # ─────────────────────────────────────────
    # Your existing endpoints (Phase 1 + 2)
    # (original paths kept)
    # ─────────────────────────────────────────
    path("metrics/visitors", views.MetricsVisitorsView.as_view(), name="metrics-visitors"),
    path("metrics/top-attractions", views.TopAttractionsView.as_view(), name="metrics-top-attractions"),
    path("rankings/top-pois", views.TopPOIsView.as_view(), name="rankings-top-pois"),
    path("rankings/least-pois", views.LeastPOIsView.as_view(), name="rankings-least-pois"),
    path("timeseries/mentions", views.MentionsTimeSeriesView.as_view(), name="timeseries-mentions"),

    # ─────────────────────────────────────────
    # New endpoints (Part 3: Map + Trends) — originals
    # ─────────────────────────────────────────
    path("map/heat", views.MapHeatView.as_view(), name="map-heat"),
    path("trends/wordcloud", views.WordCloudView.as_view(), name="trends-wordcloud"),
    path("trends/hidden-gem", views.HiddenGemView.as_view(), name="trends-hidden-gem"),

    # ─────────────────────────────────────────
    # API-prefixed aliases for consistency (optional but helpful)
    # ─────────────────────────────────────────
    path("api/metrics/visitors", views.MetricsVisitorsView.as_view(), name="api-metrics-visitors"),
    path("api/metrics/top-attractions", views.TopAttractionsView.as_view(), name="api-metrics-top-attractions"),
    path("api/rankings/top-pois", views.TopPOIsView.as_view(), name="api-rankings-top-pois"),
    path("api/rankings/least-pois", views.LeastPOIsView.as_view(), name="api-rankings-least-pois"),
    path("api/timeseries/mentions", views.MentionsTimeSeriesView.as_view(), name="api-timeseries-mentions"),
    path("api/map/heat", views.MapHeatView.as_view(), name="api-map-heat"),
    path("api/trends/wordcloud", views.WordCloudView.as_view(), name="api-trends-wordcloud"),
    path("api/trends/hidden-gem", views.HiddenGemView.as_view(), name="api-trends-hidden-gem"),
]
