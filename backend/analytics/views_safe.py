from django.http import JsonResponse

def ping(_request):
    return JsonResponse({"ok": True})

# ---- core cards/charts your dashboard uses ----
def visitors_metrics(_request):
    return JsonResponse({"total": 0, "by_month": []})

def mentions_timeseries(_request):
    return JsonResponse([], safe=False)

def top_pois(_request):
    return JsonResponse([], safe=False)

def least_pois(_request):
    return JsonResponse([], safe=False)

def engagement_metrics(_request):
    return JsonResponse({"likes": 0, "comments": 0, "shares": 0})

# ---- the four key endpoints your dashboard needed ----
def metrics_totals(_request):
    # overall quick totals used by some tiles
    return JsonResponse({"visitors": 0, "mentions": 0})

def attractions_top(_request):
    # used by the “Top attraction” (non-metrics alias)
    return JsonResponse({"items": []})

def sentiment_trend(_request):
    # used by the sentiment card/mini-chart
    return JsonResponse({"series": []})

def top_attractions(_request):
    # alias under /metrics/top-attractions
    return JsonResponse({"items": []})

# ---- optional extras (map/trends) kept empty to avoid 404s ----
def map_heat(_request):
    return JsonResponse({"points": []})

def wordcloud(_request):
    return JsonResponse({"keywords": []})

def hidden_gem(_request):
    return JsonResponse({"message": "No hidden gems detected in this period."})
