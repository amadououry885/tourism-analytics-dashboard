# backend/analytics/timeseries.py
from django.db.models import Count
from django.db.models.functions import TruncDate, Coalesce
from django.http import JsonResponse
from rest_framework.decorators import api_view

from .models_old import PostClean
from .utils import get_date_range

@api_view(["GET"])
def mentions_timeseries(request):
    """
    GET /api/timeseries/mentions?date_from=&date_to=&poi_id=
    -> { "items": [ { "date": "YYYY-MM-DD", "count": int }, ... ] }
    Uses ts = Coalesce(raw_post.created_at, raw_post.fetched_at).
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

    rows = (
        qs.annotate(day=TruncDate("ts"))
          .values("day")
          .annotate(count=Count("id"))
          .order_by("day")
    )
    items = [{"date": r["day"].isoformat(), "count": r["count"]} for r in rows]
    return JsonResponse({"items": items})
