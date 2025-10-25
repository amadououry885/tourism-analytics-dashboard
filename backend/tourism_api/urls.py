# backend/tourism_api/urls.py
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
        }
    })

urlpatterns = [
    # System
    path("healthz", healthz),
    path("admin/", admin.site.urls),

    # APIs
    path("api/", include("api.urls")),
    path("api/analytics/", include("analytics.urls")),

    # Root (must NOT include analytics here)
    path("", root),
]
