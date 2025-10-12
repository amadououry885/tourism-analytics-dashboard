# backend/analytics/metrics.py
from django.db.models import Count
from django.db.models.functions import Coalesce
from django.http import JsonResponse
from rest_framework.decorators import api_view

from .models import PostClean
from .utils import get_date_range, int_param

@api_view(["GET"])
def visitors_total(request):
    """
    GET /api/metrics/visitors?date_from=&date_to=&poi_id=
    -> { "total": <int> }
    Uses PostRaw.created_at (fallback: fetched_at) via Coalesce.
    """
    start, end = get_date_range(request)

    qs = (
        PostClean.objects
        .annotate(ts=Coalesce("raw_post__created_at", "raw_post__fetched_at"))
        .filter(ts__gte=start, ts__lt=end)
    )

    poi_id = request.GET.get("poi_id")
    if poi_id:
        qs = qs.filter(poi_id=poi_id)

    return JsonResponse({"total": qs.count()})

@api_view(["GET"])
def top_attractions(request):
    """
    GET /api/metrics/top-attractions?date_from=&date_to=&limit=1
    -> { "items": [ { "poi_id": int, "name": str, "count": int }, ... ] }
    """
    start, end = get_date_range(request)
    limit = int_param(request, "limit", default=1, min_val=1, max_val=50)

    qs = (
        PostClean.objects
        .annotate(ts=Coalesce("raw_post__created_at", "raw_post__fetched_at"))
        .filter(ts__gte=start, ts__lt=end, poi__isnull=False)
        .values("poi_id", "poi__name")
        .annotate(count=Count("id"))
        .order_by("-count", "poi__name")[:limit]
    )

    items = [
        {"poi_id": r["poi_id"], "name": r["poi__name"], "count": r["count"]}
        for r in qs
    ]
    return JsonResponse({"items": items})
