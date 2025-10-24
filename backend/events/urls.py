# urls.py (same content for vendors/events/transport/stays)
from django.urls import path
from django.http import JsonResponse

def placeholder(_):
    return JsonResponse({"status": "ok", "app": __package__ or "app"})

urlpatterns = [ path("", placeholder) ]
