# backend/analytics/rankings.py
from django.db.models import Count
from django.db.models.functions import Coalesce
from django.http import JsonResponse
from rest_framework.decorators import api_view

from .models_old import PostClean, POI
from .utils import get_date_range, int_param

def _rank_counts(start, end):
    return (
        PostClean.objects
        .annotate(ts=Coalesce("raw_post__created_at", "raw_post__fetched_at"))
        .filter(ts__gte=start, ts__lt=end, poi__isnull=False)
        .values("poi_id", "poi__name")
        .annotate(count=Count("id"))
    )

@api_view(["GET"])
def top_pois(request):
    """
    GET /api/rankings/top-pois?date_from=&date_to=&limit=5
    -> { "items": [ {poi_id, name, count}, ... ] }
    """
    start, end = get_date_range(request)
    limit = int_param(request, "limit", default=5, min_val=1, max_val=50)

    qs = _rank_counts(start, end).order_by("-count", "poi__name")[:limit]
    items = [{"poi_id": r["poi_id"], "name": r["poi__name"], "count": r["count"]} for r in qs]
    return JsonResponse({"items": items})

@api_view(["GET"])
def least_pois(request):
    """
    GET /api/rankings/least-pois?date_from=&date_to=&limit=5
    -> { "items": [ {poi_id, name, count}, ... ] }
    Includes POIs with zero mentions as well.
    """
    start, end = get_date_range(request)
    limit = int_param(request, "limit", default=5, min_val=1, max_val=50)

    # counts for POIs that have mentions
    counts = {
        (r["poi_id"], r["poi__name"]): r["count"]
        for r in _rank_counts(start, end)
    }

    # include zeros
    items_all = []
    for poi in POI.objects.all().values("id", "name"):
        key = (poi["id"], poi["name"])
        c = counts.get(key, 0)
        items_all.append({"poi_id": poi["id"], "name": poi["name"], "count": c})

    items_all.sort(key=lambda x: (x["count"], x["name"]))  # ascending
    return JsonResponse({"items": items_all[:limit]})
