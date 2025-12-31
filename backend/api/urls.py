from django.urls import path, include
from rest_framework.routers import DefaultRouter

from vendors.views import VendorViewSet, MenuItemViewSet, OpeningHoursViewSet, ReviewViewSet, PromotionViewSet, ReservationViewSet
from events.views import EventViewSet
from stays.views import StayViewSet
from analytics.views_crud import PlaceViewSet

# Main router
router = DefaultRouter()
router.register(r'vendors', VendorViewSet, basename='vendor')
router.register(r'menu-items', MenuItemViewSet, basename='menuitem')
router.register(r'opening-hours', OpeningHoursViewSet, basename='openinghours')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'promotions', PromotionViewSet, basename='promotion')
router.register(r'reservations', ReservationViewSet, basename='reservation')
router.register(r'events', EventViewSet, basename='event')
router.register(r'stays', StayViewSet, basename='stay')
router.register(r'places', PlaceViewSet, basename='place')

urlpatterns = [
    path('', include(router.urls)),
]
