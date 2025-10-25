# backend/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.http import JsonResponse

# Import the viewsets from each app
from vendors.views import VendorViewSet
from events.views import EventViewSet
from stays.views import StayViewSet
from transport.views import PlaceViewSet, RouteViewSet

router = DefaultRouter()
# Top-level resources
router.register(r'vendors', VendorViewSet, basename='vendor')     # /api/vendors/
router.register(r'events', EventViewSet, basename='event')        # /api/events/
router.register(r'stays', StayViewSet, basename='stay')           # /api/stays/

# Transport sub-resources
router.register(r'transport/places', PlaceViewSet, basename='place')   # /api/transport/places/
router.register(r'transport/routes', RouteViewSet, basename='route')   # /api/transport/routes/

def api_root(request):
    """
    Simple API root for /api/ showing available endpoints.
    """
    return JsonResponse({
        "status": "ok",
        "endpoints": {
            "vendors": "/api/vendors/",
            "events": "/api/events/",
            "stays": "/api/stays/",
            "transport_places": "/api/transport/places/",
            "transport_routes": "/api/transport/routes/"
        }
    })

urlpatterns = [
    path("", api_root, name="api-root"),
    path("", include(router.urls)),
]
