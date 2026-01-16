from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from events.views_health import health_check

def healthz(_request):
    return HttpResponse("OK", content_type="text/plain")

def root(_request):
    return JsonResponse({
        "status": "ok",
        "endpoints": {
            "auth": {
                "register": "/api/auth/register/",
                "login": "/api/auth/login/",
                "refresh": "/api/auth/token/refresh/",
                "me": "/api/auth/me/",
            },
            "vendors": "/api/vendors/",
            "events": "/api/events/",
            "stays": "/api/stays/",
            "analytics_examples": [
                "/api/ping",
                "/api/metrics/visitors",
                "/api/timeseries/mentions",
                "/api/rankings/top-pois",
                "/api/metrics/engagement",
                "/api/places/suggest?q=Zahir",
            ],
        }
    }, content_type="application/json")

urlpatterns = [
    # health check (use this for ALB/EB health check path)
    path("healthz/", healthz),
    path("api/health/", health_check),  # Detailed health check with DB stats

    path("admin/", admin.site.urls),

    # Authentication & User Management
    path("api/auth/", include("users.urls")),

    # Include analytics FIRST so its routes are found (e.g., /api/places/suggest)
    path("api/", include("analytics.urls")),

    # Then your existing app's API routes (vendors/events/stays)
    path("api/", include("api.urls")),

    # Root: quick index of useful endpoints
    path("", root),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
