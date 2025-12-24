from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"vendors", views.VendorViewSet)
router.register(r"menu-items", views.MenuItemViewSet, basename='menuitem')
router.register(r"opening-hours", views.OpeningHoursViewSet, basename='openinghours')
router.register(r"reviews", views.ReviewViewSet, basename='review')
router.register(r"promotions", views.PromotionViewSet, basename='promotion')
router.register(r"reservations", views.ReservationViewSet, basename='reservation')

urlpatterns = [
    path("", include(router.urls)),
    path("search/", views.VendorSearchView.as_view(), name="vendor-search"),
    path("analytics/", views.VendorAnalyticsView.as_view(), name="vendor-analytics"),
]
