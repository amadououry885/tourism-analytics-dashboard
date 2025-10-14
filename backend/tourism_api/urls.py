# backend/tourism_api/urls.py
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def healthz(_request):
    return HttpResponse('ok', content_type='text/plain')

urlpatterns = [
    path('healthz', healthz),
    path('admin/', admin.site.urls),

    # Expose all analytics routes at root (e.g., /metrics/engagement)
    path("", include("analytics.urls")),

    # Also expose them under /api/ (e.g., /api/metrics/engagement)
    path("api/", include("analytics.urls")),
]
