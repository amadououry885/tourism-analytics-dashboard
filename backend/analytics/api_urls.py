from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import POIViewSet, PostRawViewSet, PostCleanViewSet, SentimentTopicViewSet

router = DefaultRouter()
router.register(r'pois', POIViewSet)
router.register(r'posts-raw', PostRawViewSet)
router.register(r'posts-clean', PostCleanViewSet)
router.register(r'sentiments', SentimentTopicViewSet, basename='sentiments')  # explicit basename

urlpatterns = [path('', include(router.urls))]
