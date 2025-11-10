from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse, JsonResponse

def healthz(_request):
    return HttpResponse("OK", content_type="text/plain")

def root(_request):
    return JsonResponse({
        "status": "ok",
        "endpoints": {
            "vendors": "/api/vendors/",
            "events": "/api/events/",
            "stays": "/api/stays/",
            "transport_places": "/api/transport/places/",
            "transport_routes": "/api/transport/routes/",
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

    path("admin/", admin.site.urls),

    # Include analytics FIRST so its routes are found (e.g., /api/places/suggest)
    path("api/", include("analytics.urls")),

    # Then your existing app’s API routes (vendors/events/stays/transport, etc.)
    path("api/", include("api.urls")),

    # Root: quick index of useful endpoints
    path("", root),
]
