from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StayViewSet, StayImageViewSet

router = DefaultRouter()
router.register(r"stays", StayViewSet, basename="stay")  # /api/stays/stays/
router.register(r"images", StayImageViewSet, basename="stay-image")  # /api/stays/images/

urlpatterns = [
    path("", include(router.urls)),
]
