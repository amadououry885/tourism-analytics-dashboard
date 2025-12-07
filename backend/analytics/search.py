# backend/analytics/search.py
from django.http import JsonResponse
from django.db.models import Q, Case, When, Value, IntegerField
from rest_framework.decorators import api_view

# Use the current Place model instead of legacy POI
from .models import Place

def _limit(request, default=20, max_val=100):
    try:
        v = int(request.GET.get("limit", default))
        return max(1, min(v, max_val))
    except Exception:
        return default

@api_view(["GET"])
def search_pois(request):
    """
    GET /api/search/pois?q=&limit=20
    -> { "items": [ { "id", "name", "category", "latitude", "longitude" }, ... ] }

    - Empty q returns first N alphabetically.
    - With q: prioritize names that *start with* q, then fall back to contains.
    - Auto-updates as DB changes (new places appear automatically).
    """
    q = (request.GET.get("q") or "").strip()
    limit = _limit(request)

    qs = Place.objects.all()

    if q:
        qs = qs.annotate(
            starts=Case(
                When(name__istartswith=q, then=Value(0)),
                default=Value(1),
                output_field=IntegerField(),
            )
        ).filter(
            Q(name__icontains=q) | Q(category__icontains=q)
        ).order_by("starts", "name")
    else:
        qs = qs.order_by("name")

    items = list(
        qs.values("id", "name", "category", "latitude", "longitude")[:limit]
    )
    return JsonResponse({"items": items})
