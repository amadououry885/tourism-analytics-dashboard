from django.urls import re_path
from . import views_safe as v

urlpatterns = [
    # health
    re_path(r"^ping/?$", v.ping, name="analytics-ping"),
    re_path(r"^healthz/?$", v.ping, name="analytics-healthz"),

    # core (already working)
    re_path(r"^metrics/visitors/?$", v.visitors_metrics, name="metrics-visitors"),
    re_path(r"^timeseries/mentions/?$", v.mentions_timeseries, name="timeseries-mentions"),
    re_path(r"^rankings/top-pois/?$", v.top_pois, name="rankings-top-pois"),
    re_path(r"^rankings/least-pois/?$", v.least_pois, name="rankings-least-pois"),
    re_path(r"^metrics/engagement/?$", v.engagement_metrics, name="metrics-engagement"),

    # ✅ the four missing dashboard endpoints
    re_path(r"^metrics/totals/?$", v.metrics_totals, name="api-metrics-totals"),
    re_path(r"^attractions/top/?$", v.attractions_top, name="api-attractions-top"),
    re_path(r"^sentiment/trend/?$", v.sentiment_trend, name="api-sentiment-trend"),
    re_path(r"^metrics/top-attractions/?$", v.top_attractions, name="metrics-top-attractions"),

    # optional extras (safe empties)
    re_path(r"^map/heat/?$", v.map_heat, name="map-heat"),
    re_path(r"^trends/wordcloud/?$", v.wordcloud, name="trends-wordcloud"),
    re_path(r"^trends/hidden-gem/?$", v.hidden_gem, name="trends-hidden-gem"),
]
