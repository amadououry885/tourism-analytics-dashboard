# backend/analytics/views_safe.py
from django.http import JsonResponse

def ping(_request):
    """Simple health check for analytics include."""
    return JsonResponse({"ok": True})

def visitors_metrics(_request):
    """
    Minimal shape your dashboard expects.
    Example shape can be expanded later:
    { "total": 1234, "by_month": [{"month":"2025-01","count":123}, ...] }
    """
    return JsonResponse({"total": 0, "by_month": []})

def mentions_timeseries(_request):
    """
    Expected: list of {date, mentions}. Keep empty for now.
    Example later: [{"date":"2025-01-01","mentions":5}, ...]
    """
    return JsonResponse([], safe=False)

def top_pois(_request):
    """Expected: list of {name, score}"""
    return JsonResponse([], safe=False)

def least_pois(_request):
    """Expected: list of {name, score}"""
    return JsonResponse([], safe=False)

def engagement_metrics(_request):
    """
    Expected: totals for cards.
    Example later: {"likes": 120, "comments": 45, "shares": 9}
    """
    return JsonResponse({"likes": 0, "comments": 0, "shares": 0})
