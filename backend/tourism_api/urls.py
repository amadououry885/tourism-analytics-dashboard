from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse, JsonResponse

def healthz(_request):
    return HttpResponse("ok", content_type="text/plain")

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
            ],
        }
    })

urlpatterns = [
    path("healthz", healthz),
    path("admin/", admin.site.urls),

    # 🔑 include analytics FIRST under /api/
    path("api/", include("analytics.urls")),

    # then your existing DRF routes
    path("api/", include("api.urls")),

    path("", root),
]
