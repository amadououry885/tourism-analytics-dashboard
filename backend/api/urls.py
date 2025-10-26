from django.urls import path, include
from rest_framework.routers import DefaultRouter

from vendors.views import VendorViewSet
from events.views import EventViewSet
from stays.views import StayViewSet
from transport.views import PlaceViewSet, RouteViewSet

router = DefaultRouter()
router.register(r'vendors', VendorViewSet, basename='vendor')
router.register(r'events', EventViewSet, basename='event')
router.register(r'stays', StayViewSet, basename='stay')
router.register(r'transport/places', PlaceViewSet, basename='place')
router.register(r'transport/routes', RouteViewSet, basename='route')

urlpatterns = [
    path('', include(router.urls)),
]
