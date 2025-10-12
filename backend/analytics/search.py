# backend/analytics/search.py
from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.db.models import Q

from .models import POI
from .utils import int_param

@api_view(["GET"])
def search_pois(request):
    """
    GET /api/search/pois?q=&limit=10
    -> { "items": [ { "id": int, "name": str, "category": str, "latitude": float, "longitude": float }, ... ] }
    """
    q = (request.GET.get("q") or "").strip()
    limit = int_param(request, "limit", default=10, min_val=1, max_val=50)

    qs = POI.objects.all()
    if q:
        qs = qs.filter(Q(name__icontains=q) | Q(category__icontains=q))

    items = list(
        qs.order_by("name")[:limit].values("id", "name", "category", "latitude", "longitude")
    )
    return JsonResponse({"items": items})
