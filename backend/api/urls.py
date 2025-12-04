from django.urls import path, include
from rest_framework.routers import DefaultRouter

from vendors.views import VendorViewSet, MenuItemViewSet, OpeningHoursViewSet, ReviewViewSet, PromotionViewSet
from events.views import EventViewSet
from stays.views import StayViewSet
from analytics.views_crud import PlaceViewSet

# Main router
router = DefaultRouter()
router.register(r'vendors', VendorViewSet, basename='vendor')
router.register(r'events', EventViewSet, basename='event')
router.register(r'stays', StayViewSet, basename='stay')
router.register(r'places', PlaceViewSet, basename='place')

# Vendor sub-resources router
vendor_router = DefaultRouter()
vendor_router.register(r'menu-items', MenuItemViewSet, basename='menuitem')
vendor_router.register(r'opening-hours', OpeningHoursViewSet, basename='openinghours')
vendor_router.register(r'reviews', ReviewViewSet, basename='review')
vendor_router.register(r'promotions', PromotionViewSet, basename='promotion')

urlpatterns = [
    path('', include(router.urls)),
    path('vendors/', include(vendor_router.urls)),
]
