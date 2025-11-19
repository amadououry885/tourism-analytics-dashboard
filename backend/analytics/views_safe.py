# backend/analytics/views_safe.py

from datetime import date, timedelta
from django.http import JsonResponse, HttpResponse
from django.db.models import Count, Sum
from django.db.models.functions import Coalesce, TruncDate
from django.utils.dateparse import parse_date
from django.views.decorators.http import require_GET
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Your current models
from .models import Place, SocialPost


# ────────────────────────── Helpers ──────────────────────────

@require_GET
def ping(_req):
    """Lightweight health check used by /api/ping and /api/healthz"""
    return HttpResponse("OK", content_type="text/plain")


def _range_from_request(request):
    """
    Accepts ?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
    Defaults to last 30 days if missing.
    Returns (start_date, end_date) or (None, None) if invalid.
    """
    fs = request.GET.get("date_from")
    ts = request.GET.get("date_to")
    today = date.today()
    start = parse_date(fs) if fs else (today - timedelta(days=30))
    end = parse_date(ts) if ts else today
    if not start or not end or start > end:
        return None, None
    return start, end


# ───────────────────── Metrics used by UI ─────────────────────

@require_GET
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


@require_GET
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
    return JsonResponse({
        "likes": int(agg["likes"]),
        "comments": int(agg["comments"]),
        "shares": int(agg["shares"]),
    })


@require_GET
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


@require_GET
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


@require_GET
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


@require_GET
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


@require_GET
def metrics_totals(request):
    """
    GET /api/metrics/totals?date_from=&date_to=
    -> {"range_days":N,"total_posts":int,"unique_authors":null}
       (unique_authors unknown in SocialPost, so null)
    """
    start, end = _range_from_request(request)
    if not start:
        return JsonResponse({"range_days": 0, "total_posts": 0, "unique_authors": None})

    qs = SocialPost.objects.filter(created_at__date__gte=start,
                                   created_at__date__lte=end)
    days = (end - start).days + 1
    return JsonResponse({"range_days": days, "total_posts": qs.count(), "unique_authors": None})


# ───────────────────── Map & Trends (UI cards) ─────────────────────

@require_GET
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


# ───────────── Optional light stubs so UI won’t crash if called ─────────────

@require_GET
def sentiment_trend(_request):
    return JsonResponse({"range_days": 0, "series": []})


@require_GET
def wordcloud(_request):
    return JsonResponse({"items": []})


@require_GET
def hidden_gem(_request):
    return JsonResponse({"items": []})


# Alias to match older naming (kept for compatibility)
@require_GET
def attractions_top(request):
    return top_attractions(request)


# ─────────────────────────────────────────────────────────────
# Helper function from views.py
# ─────────────────────────────────────────────────────────────

def _range_from_or_date_params(request):
    """Helper function to parse date range parameters from request"""
    fs = request.GET.get("from") or request.GET.get("date_from")
    ts = request.GET.get("to") or request.GET.get("date_to")
    today = date.today()
    start = parse_date(fs) if fs else (today - timedelta(days=30))
    end = parse_date(ts) if ts else today
    if not start or not end or start > end:
        return None, None
    return start, end


# ─────────────────────────────────────────────────────────────
# Overview metrics endpoint
# ─────────────────────────────────────────────────────────────

@api_view(["GET"])
def overview_metrics(request):
    """
    GET /api/overview-metrics?from=&to=&city=
    -> {
         "totals": {"visitors", "engagement", "posts", "shares", "page_views"},
         "changes": {"visitors_pct": null, ...}
       }
    """
    start, end = _range_from_or_date_params(request)
    if not start or not end:
        return Response({"detail": "Invalid date range"}, status=400)

    city = (request.GET.get("city") or "").strip() or None

    qs = SocialPost.objects.filter(created_at__date__gte=start, created_at__date__lte=end)
    if city:
        qs = qs.filter(place__city__iexact=city)

    agg = qs.aggregate(
        posts=Count("id"),
        engagement=Coalesce(Sum("likes"), 0) + Coalesce(Sum("comments"), 0) + Coalesce(Sum("shares"), 0),
        likes=Coalesce(Sum("likes"), 0),
        comments=Coalesce(Sum("comments"), 0),
        shares=Coalesce(Sum("shares"), 0),
    )

    totals = {
        "visitors": int(agg["posts"]),        # proxy for now
        "engagement": int(agg["engagement"]),
        "posts": int(agg["posts"]),
        "shares": int(agg["shares"]),
        "page_views": None,                   # not tracked yet
    }
    return Response({"totals": totals, "changes": {
        "visitors_pct": None, "engagement_pct": None, "posts_pct": None, "shares_pct": None, "page_views_pct": None
    }})
