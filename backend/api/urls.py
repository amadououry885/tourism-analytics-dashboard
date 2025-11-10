from django.urls import path, include
from rest_framework.routers import DefaultRouter

from vendors.views import VendorViewSet
from events.views import EventViewSet
from stays.views import StayViewSet

router = DefaultRouter()
router.register(r'vendors', VendorViewSet, basename='vendor')
router.register(r'events', EventViewSet, basename='event')
router.register(r'stays', StayViewSet, basename='stay')

urlpatterns = [
    path('', include(router.urls)),
]
