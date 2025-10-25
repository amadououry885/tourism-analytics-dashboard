from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StayViewSet

router = DefaultRouter()
router.register(r"", StayViewSet, basename="stay")  # /api/stays/

urlpatterns = [
    path("", include(router.urls)),
]
