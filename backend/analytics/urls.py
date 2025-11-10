# backend/analytics/urls.py
from django.urls import re_path
from . import views as v

urlpatterns = [
    # health
    re_path(r"^ping/?$", v.healthz, name="analytics-ping"),
    re_path(r"^healthz/?$", v.healthz, name="analytics-healthz"),

    # ---- minimal dashboard (models_old) ----
    re_path(r"^metrics/visitors/?$", v.MetricsVisitorsView.as_view(), name="metrics-visitors"),
    re_path(r"^timeseries/mentions/?$", v.MentionsTimeSeriesView.as_view(), name="timeseries-mentions"),
    re_path(r"^rankings/top-pois/?$", v.TopPOIsView.as_view(), name="rankings-top-pois"),
    re_path(r"^rankings/least-pois/?$", v.LeastPOIsView.as_view(), name="rankings-least-pois"),
    re_path(r"^metrics/engagement/?$", v.MetricsEngagementView.as_view(), name="metrics-engagement"),

    # ---- additional dashboard endpoints (models_old) ----
    re_path(r"^metrics/totals/?$", v.MetricsTotalsView.as_view(), name="api-metrics-totals"),
    re_path(r"^attractions/top/?$", v.TopAttractionsView.as_view(), name="api-attractions-top"),
    re_path(r"^sentiment/trend/?$", v.SentimentTrendView.as_view(), name="api-sentiment-trend"),
    re_path(r"^metrics/top-attractions/?$", v.TopAttractionsView.as_view(), name="metrics-top-attractions"),

    # ---- map / wordcloud / hidden-gem (models_old) ----
    re_path(r"^map/heat/?$", v.MapHeatView.as_view(), name="map-heat"),
    re_path(r"^trends/wordcloud/?$", v.WordCloudView.as_view(), name="trends-wordcloud"),
    re_path(r"^trends/hidden-gem/?$", v.HiddenGemView.as_view(), name="trends-hidden-gem"),

    # ---- new analytics (Place + SocialPost) ----
    re_path(r"^analytics/summary/?$", v.analytics_summary, name="analytics-summary"),
    re_path(r"^analytics/timeseries/?$", v.analytics_timeseries, name="analytics-timeseries"),
    re_path(r"^analytics/heatmap/?$", v.analytics_heatmap, name="analytics-heatmap"),

    # ---- search autosuggest ----
    re_path(r"^search/pois/?$", v.search_pois, name="search-pois"),
    re_path(r"^places/suggest/?$", v.search_pois, name="places-suggest"),  # legacy alias

    # ---- OVERVIEW ----
    re_path(r"^overview/metrics/?$", v.overview_metrics, name="overview-metrics"),

    # ---- DESTINATIONS ----
    re_path(r"^destinations/top/?$", v.destinations_top, name="destinations-top"),
    re_path(r"^destinations/distribution/?$", v.destinations_distribution, name="destinations-distribution"),
    re_path(r"^destinations/comparison/?$", v.destinations_comparison, name="destinations-comparison"),
    re_path(r"^destinations/undervisited/?$", v.destinations_undervisited, name="destinations-undervisited"),

    # ---- SOCIAL ----
    re_path(r"^social/trends/?$", v.social_trends, name="social-trends"),
    re_path(r"^social/platforms/?$", v.social_platforms, name="social-platforms"),
    re_path(r"^social/sentiment/summary/?$", v.social_sentiment_summary, name="social-sentiment-summary"),
    re_path(r"^social/sentiment/by-category/?$", v.social_sentiment_by_category, name="social-sentiment-by-category"),
    re_path(r"^social/keywords/?$", v.social_keywords, name="social-keywords"),

    # ---- direct alias expected by your frontend ----
    re_path(r"^sentiment/summary/?$", v.social_sentiment_summary, name="sentiment-summary"),
]
