from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views
from . import views_api
from . import views_analytics

router = DefaultRouter()
router.register(r'places', views_api.PlaceViewSet)
router.register(r'routes', views_api.RouteViewSet)
router.register(r'schedules', views_api.ScheduleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('search/', views_api.RouteSearchView.as_view(), name='route-search'),
    # Analytics endpoints
    path('analytics/transport-modes/', views_analytics.transport_modes_summary, name='transport-modes-summary'),
    path('analytics/monthly-usage/', views_analytics.monthly_transport_usage, name='monthly-transport-usage'),
    path('analytics/popular-routes/', views_analytics.route_popularity, name='route-popularity'),
]
