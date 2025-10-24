# backend/tourism_api/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

# Simple health check endpoint for AWS Elastic Beanstalk
def healthz(_request):
    return HttpResponse("ok", content_type="text/plain")


urlpatterns = [
    path("healthz", healthz),
    path("admin/", admin.site.urls),

    # ── API routes ─────────────────────────────────────────────
    path("api/analytics/", include("analytics.urls")),
    path("api/vendors/", include("vendors.urls")),
    path("api/events/", include("events.urls")),
    path("api/transport/", include("transport.urls")),
    path("api/stays/", include("stays.urls")),
]

# Optional root-level include for analytics (for backward compatibility)
urlpatterns += [
    path("", include("analytics.urls")),
]
