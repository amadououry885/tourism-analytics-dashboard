from django.urls import re_path
from . import views_safe as v  # <-- safe JSON stubs so it won’t crash

urlpatterns = [
    # Quick checks
    re_path(r"^ping/?$", v.ping, name="analytics-ping"),
    re_path(r"^healthz/?$", v.ping, name="analytics-healthz"),

    # Endpoints your React dashboard calls (final URLs are /api/... because of the project include)
    re_path(r"^metrics/visitors/?$", v.visitors_metrics, name="metrics-visitors"),
    re_path(r"^timeseries/mentions/?$", v.mentions_timeseries, name="timeseries-mentions"),
    re_path(r"^rankings/top-pois/?$", v.top_pois, name="rankings-top-pois"),
    re_path(r"^rankings/least-pois/?$", v.least_pois, name="rankings-least-pois"),
    re_path(r"^metrics/engagement/?$", v.engagement_metrics, name="metrics-engagement"),
]
