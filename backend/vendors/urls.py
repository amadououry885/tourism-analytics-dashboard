from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"vendors", views.VendorViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("search/", views.VendorSearchView.as_view(), name="vendor-search"),
    path("analytics/", views.VendorAnalyticsView.as_view(), name="vendor-analytics"),
]
