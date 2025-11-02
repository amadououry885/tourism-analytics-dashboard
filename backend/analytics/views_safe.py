# backend/analytics/views_safe.py

from datetime import date, timedelta
from collections import Counter
import re

from django.http import JsonResponse, HttpResponse
from django.db.models import Count, Sum, F
from django.db.models.functions import Coalesce, TruncDate
from django.utils.dateparse import parse_date

# 👉 use your current models
from .models import Place, SocialPost


# ───────────────────────── helpers ─────────────────────────

def ping(_req):
    return HttpResponse("OK", content_type="text/plain")

def _range_from_request(request):
    """Accepts ?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
       If missing, default to last 30 days."""
    fs = request.GET.get("date_from")
    ts = request.GET.get("date_to")
    today = date.today()
    start = parse_date(fs) if fs else (today - timedelta(days=30))
    end   = parse_date(ts) if ts else today
    if not start or not end or start > end:
        # return a 400 so caller sees it's a bad range
        return None, None
    return start, end


# ───────────────── metrics used by UI ─────────────────

def visitors_metrics(request):
    """
    GET /api/metrics/visitors?date_from=&date_to=&poi_id=
    -> {"total": int}
    """
    start, end = _range_from_request(request)
    if not start:
        return JsonResponse({"detail": "Invalid date range"}, status=400)

    poi_id = request.GET.get("poi_id")
    qs = SocialPost.objects.filter(created_at__date__gte=start,
                                   created_at__date__lte=end)
    if poi_id:
        qs = qs.filter(place_id=poi_id)

    return JsonResponse({"total": qs.count()})


def engagement_metrics(request):
    """
    GET /api/metrics/engagement?date_from=&date_to=&poi_id=
    -> {"likes": int, "comments": int, "shares": int}
    """
    start, end = _range_from_request(request)
    if not start:
        return JsonResponse({"detail": "Invalid date range"}, status=400)

    poi_id = request.GET.get("poi_id")
    qs = SocialPost.objects.filter(created_at__date__gte=start,
                                   created_at__date__lte=end)
    if poi_id:
        qs = qs.filter(place_id=poi_id)

    agg = qs.aggregate(
        likes=Coalesce(Sum("likes"), 0),
        comments=Coalesce(Sum("comments"), 0),
        shares=Coalesce(Sum("shares"), 0),
    )
    # cast to int in case DB returns Decimal
    return JsonResponse({
        "likes": int(agg["likes"]),
        "comments": int(agg["comments"]),
        "shares": int(agg["shares"]),
    })


def mentions_timeseries(request):
    """
    GET /api/timeseries/mentions?date_from=&date_to=&poi_id=
    -> {"items":[{"date":"YYYY-MM-DD","count":int}, ...]}
    """
    start, end = _range_from_request(request)
    if not start:
        return JsonResponse({"detail": "Invalid date range"}, status=400)

    poi_id = request.GET.get("poi_id")

    base = SocialPost.objects.filter(created_at__date__gte=start,
                                     created_at__date__lte=end)
    if poi_id:
        base = base.filter(place_id=poi_id)

    rows = (base.annotate(day=TruncDate("created_at"))
                 .values("day")
                 .annotate(count=Count("id"))
                 .order_by("day"))

    by_day = {r["day"]: r["count"] for r in rows}
    items = []
    d = start
    while d <= end:
        items.append({"date": d.isoformat(), "count": by_day.get(d, 0)})
        d += timedelta(days=1)

    return JsonResponse({"items": items})


def top_pois(request):
    """
    GET /api/rankings/top-pois?date_from=&date_to=&limit=5
    -> {"items":[{"poi_id","name","count"}]}
    """
    start, end = _range_from_request(request)
    if not start:
        return JsonResponse({"detail": "Invalid date range"}, status=400)
    limit = int(request.GET.get("limit", 5))

    qs = SocialPost.objects.filter(created_at__date__gte=start,
                                   created_at__date__lte=end,
                                   place__isnull=False)

    rows = (qs.values("place_id", "place__name")
              .annotate(count=Count("id"))
              .order_by("-count", "place__name")[:limit])

    items = [{"poi_id": r["place_id"], "name": r["place__name"], "count": r["count"]} for r in rows]
    return JsonResponse({"items": items})


def least_pois(request):
    """
    GET /api/rankings/least-pois?date_from=&date_to=&limit=5
    -> {"items":[{"poi_id","name","count"}]}
    """
    start, end = _range_from_request(request)
    if not start:
        return JsonResponse({"detail": "Invalid date range"}, status=400)
    limit = int(request.GET.get("limit", 5))

    qs = SocialPost.objects.filter(created_at__date__gte=start,
                                   created_at__date__lte=end,
                                   place__isnull=False)

    rows = (qs.values("place_id", "place__name")
              .annotate(count=Count("id"))
              .order_by("count", "place__name")[:limit])

    items = [{"poi_id": r["place_id"], "name": r["place__name"], "count": r["count"]} for r in rows]
    return JsonResponse({"items": items})


def top_attractions(request):
    """
    GET /api/metrics/top-attractions?date_from=&date_to=&limit=1
    -> {"items":[{"name","count"}]}
    """
    start, end = _range_from_request(request)
    if not start:
        return JsonResponse({"items": []})

    limit = int(request.GET.get("limit", 1))
    qs = SocialPost.objects.filter(created_at__date__gte=start,
                                   created_at__date__lte=end,
                                   place__isnull=False)
    rows = (qs.values("place__name")
              .annotate(count=Count("id"))
              .order_by("-count", "place__name")[:limit])
    items = [{"name": r["place__name"], "count": r["count"]} for r in rows]
    return JsonResponse({"items": items})


def metrics_totals(request):
    """
    GET /api/metrics/totals?date_from=&date_to=
    -> {"range_days":N,"total_posts":int,"unique_authors":null}
    (unique_authors unknown in SocialPost, return null)
    """
    start, end = _range_from_request(request)
    if not start:
        return JsonResponse({"range_days": 0, "total_posts": 0, "unique_authors": None})

    qs = SocialPost.objects.filter(created_at__date__gte=start,
                                   created_at__date__lte=end)
    days = (end - start).days + 1
    return JsonResponse({"range_days": days, "total_posts": qs.count(), "unique_authors": None})


# ───────────────── map & trends (UI cards) ─────────────────

def map_heat(request):
    """
    GET /api/map/heat?date_from=&date_to=
    -> {"items":[{poi_id,name,category,lat,lon,count}]}
    """
    start, end = _range_from_request(request)
    if not start:
        return JsonResponse({"items": []})

    qs = (SocialPost.objects
          .filter(created_at__date__gte=start,
                  created_at__date__lte=end,
                  place__isnull=False,
                  place__latitude__isnull=False,
                  place__longitude__isnull=False))

    rows = (qs.values("place_id",
                      "place__name",
                      "place__category",
                      "place__latitude",
                      "place__longitude")
              .annotate(count=Count("id"))
              .order_by("-count"))

    items = [{
        "poi_id": r["place_id"],
        "name": r["place__name"],
        "category": r["place__category"],
        "lat": r["place__latitude"],
        "lon": r["place__longitude"],
        "count": r["count"],
    } for r in rows]

    return JsonResponse({"items": items})


# Optional light stubs so UI won’t crash if called
def sentiment_trend(_request):
    return JsonResponse({"range_days": 0, "series": []})

def wordcloud(_request):
    return JsonResponse({"items": []})

def hidden_gem(_request):
    return JsonResponse({"items": []})


# Alias to match older URL name expected by urls.py
def attractions_top(request):
    return top_attractions(request)
