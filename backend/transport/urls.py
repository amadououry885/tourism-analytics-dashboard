from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlaceViewSet, RouteViewSet

router = DefaultRouter()
router.register(r"places", PlaceViewSet, basename="place")   # /api/transport/places/
router.register(r"routes", RouteViewSet, basename="route")   # /api/transport/routes/

urlpatterns = [
    path("", include(router.urls)),
]
