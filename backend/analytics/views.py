
# backend/analytics/views.py

from collections import Counter
from datetime import datetime, timedelta
import csv
from io import StringIO, BytesIO

from django.http import HttpResponse
from django.db.models import Count, F
from django.db.models.functions import Coalesce, TruncDate
from django.utils.dateparse import parse_date

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import POI, PostRaw, PostClean, SentimentTopic
from .serializers import (
    POISerializer,
    PostRawSerializer,
    PostCleanSerializer,
    SentimentTopicSerializer,
)

# ─────────────────────────────────────────────────────────────
# Existing read-only endpoints
# ─────────────────────────────────────────────────────────────

class POIViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = POI.objects.all().order_by("name")
    serializer_class = POISerializer

class PostRawViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PostRaw.objects.all().order_by("-created_at")
    serializer_class = PostRawSerializer

class PostCleanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PostClean.objects.all().order_by("-id")
    serializer_class = PostCleanSerializer

class SentimentTopicViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SentimentTopic.objects.all().order_by("-date", "-count")
    serializer_class = SentimentTopicSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        p = self.request.query_params
        if p.get("topic"):
            qs = qs.filter(topic__iexact=p["topic"])
        if p.get("sentiment"):
            qs = qs.filter(sentiment__iexact=p["sentiment"])
        if p.get("date_from"):
            qs = qs.filter(date__gte=p["date_from"])
        if p.get("date_to"):
            qs = qs.filter(date__lte=p["date_to"])
        return qs

# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────

STOPWORDS = {
    "the","a","an","and","or","to","of","in","on","for","with","is","are","was","were",
    "this","that","it","at","by","from","as","be","been","will","shall","can","could",
    "about","into","over","under","up","down","out","not","no","yes","you","your","we","our",
}

def parse_range(request):
    df = request.GET.get("date_from")
    dt = request.GET.get("date_to")
    if df and dt:
        start = parse_date(df)
        end = parse_date(dt)
    else:
        end = datetime.utcnow().date()
        start = end - timedelta(days=6)
    return start, end

def _simple_tokenize(s: str):
    word = []
    for ch in (s or "").lower():
        if ch.isalnum():
            word.append(ch)
        else:
            if word:
                yield "".join(word); word = []
    if word:
        yield "".join(word)

# ─────────────────────────────────────────────────────────────
# Part 3 — Map Heat, Word Cloud, Hidden Gem
# ─────────────────────────────────────────────────────────────

class MapHeatView(APIView):
    """
    GET /api/map/heat?date_from=&date_to=&category=&sentiment=
    -> { items: [{ poi_id, name, category, lat, lon, count }] }
    """
    def get(self, request):
        category = request.GET.get("category")
        sentiment = request.GET.get("sentiment")
        start, end = parse_range(request)

        qs = (
            PostClean.objects
            .annotate(ts=Coalesce(F("raw_post__created_at"), F("raw_post__fetched_at")))
            .filter(ts__date__gte=start, ts__date__lte=end)
            .exclude(poi=None)
        )
        if sentiment:
            qs = qs.filter(sentiment=sentiment)
        if category:
            qs = qs.filter(poi__category=category)

        aggregated = (
          qs.values(
           "poi_id",                           # use the real field name, not an alias
           name=F("poi__name"),
           category=F("poi__category"),
           lat=F("poi__latitude"),
           lon=F("poi__longitude"),
    )
    .annotate(count=Count("id"))
    .order_by("-count")
    )

        return Response({"items": list(aggregated)})

class WordCloudView(APIView):
    """
    GET /api/trends/wordcloud?date_from=&date_to=&sentiment=&limit=50
    -> { items: [{ term, count }] }
    """
    def get(self, request):
        sentiment = request.GET.get("sentiment")
        limit = int(request.GET.get("limit", 50))
        start, end = parse_range(request)

        qs = (
            PostClean.objects
            .annotate(ts=Coalesce(F("raw_post__created_at"), F("raw_post__fetched_at")))
            .filter(ts__date__gte=start, ts__date__lte=end)
        )
        if sentiment:
            qs = qs.filter(sentiment=sentiment)

        texts = qs.values_list("clean_content", flat=True)

        counter = Counter()
        for text in texts:
            for token in _simple_tokenize(text):
                if token in STOPWORDS or len(token) <= 2:
                    continue
                counter[token] += 1

        items = [{"term": t, "count": c} for t, c in counter.most_common(limit)]
        return Response({"items": items})

class HiddenGemView(APIView):
    """
    Detect week-over-week spikes for low-baseline POIs.
    """
    def get(self, request):
        week = request.GET.get("week")
        top_n = int(request.GET.get("limit", 3))

        if week:
            year, w = week.split("-W")
            year = int(year); w = int(w)
            start_cur = datetime.fromisocalendar(year, w, 1).date()  # Monday
            end_cur = start_cur + timedelta(days=6)
        else:
            start_cur, end_cur = parse_range(request)

        span = (end_cur - start_cur).days + 1
        start_prev = start_cur - timedelta(days=span)
        end_prev = start_cur - timedelta(days=1)

        base = PostClean.objects.annotate(
            ts=Coalesce(F("raw_post__created_at"), F("raw_post__fetched_at"))
        ).exclude(poi=None)

        cur = (
            base.filter(ts__date__gte=start_cur, ts__date__lte=end_cur)
            .values("poi__id", "poi__name")
            .annotate(c=Count("id"))
        )
        cur_map = {(r["poi__id"], r["poi__name"]): r["c"] for r in cur}

        prev = (
            base.filter(ts__date__gte=start_prev, ts__date__lte=end_prev)
            .values("poi__id", "poi__name")
            .annotate(c=Count("id"))
        )
        prev_map = {(r["poi__id"], r["poi__name"]): r["c"] for r in prev}

        items = []
        for key, current in cur_map.items():
            baseline = prev_map.get(key, 0)
            if baseline <= 5 and ((baseline > 0 and current >= 2 * baseline) or (baseline == 0 and current >= 3)):
                growth = (current / baseline) if baseline > 0 else float("inf")
                poi_id, name = key
                items.append({
                    "poi_id": poi_id,
                    "name": name,
                    "baseline": baseline,
                    "current": current,
                    "growth": growth,
                })

        def sort_key(x):
            g = x["growth"]
            return (0 if g == float("inf") else 1, -(g if g != float("inf") else 1e9), -x["current"])

        items.sort(key=sort_key)
        return Response({"items": items[:top_n]})

# ─────────────────────────────────────────────────────────────
# Part 4 — Tabs + Reports
# ─────────────────────────────────────────────────────────────

class AttractionsListView(APIView):
    def get(self, request):
        start, end = parse_range(request)
        limit = int(request.GET.get("limit", 20))
        qs = (
            PostClean.objects
            .annotate(ts=Coalesce(F("raw_post__created_at"), F("raw_post__fetched_at")))
            .filter(ts__date__gte=start, ts__date__lte=end)
            .exclude(poi=None)
        )
        aggregated = (
            qs.values("poi__id", "poi__name", "poi__category")
              .annotate(count=Count("id"))
              .order_by("-count")[:limit]
        )
        items = [
            {"id": r["poi__id"], "name": r["poi__name"], "category": r["poi__category"], "count": r["count"]}
            for r in aggregated
        ]
        return Response({"items": items})

class AttractionDetailView(APIView):
    """
    Returns stats for a specific attraction (POI)
    between date_from and date_to.
    Example: /api/tabs/attractions/7?date_from=2025-10-01&date_to=2025-10-09
    """
    def get(self, request, pk):
        date_from = parse_date(request.GET.get("date_from"))
        date_to = parse_date(request.GET.get("date_to"))
        try:
            poi = POI.objects.get(pk=pk)
        except POI.DoesNotExist:
            return Response({"detail": "POI not found"}, status=404)

        qs = (
            PostClean.objects
            .filter(poi=poi)
            .annotate(ts=Coalesce(F("raw_post__created_at"), F("raw_post__fetched_at")))
        )

        if date_from:
            qs = qs.filter(ts__date__gte=date_from)
        if date_to:
            qs = qs.filter(ts__date__lte=date_to)

        timeseries = (
            qs.annotate(day=TruncDate("ts"))
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )

        total_mentions = sum(item["count"] for item in timeseries)

        data = {
            "id": poi.id,
            "name": poi.name,
            "category": poi.category,
            "total_mentions": total_mentions,
            "timeseries": [
                {"day": t["day"].isoformat(), "count": t["count"]}
                for t in timeseries
            ],
        }
        return Response(data)

class VendorsListView(APIView):
    """
    List vendor POIs ranked by mentions in the date range.
    (Currently same logic as AttractionsListView; filter by category later if needed.)
    """
    def get(self, request):
        start, end = parse_range(request)
        limit = int(request.GET.get("limit", 20))

        qs = (
            PostClean.objects
            .annotate(ts=Coalesce(F("raw_post__created_at"), F("raw_post__fetched_at")))
            .filter(ts__date__gte=start, ts__date__lte=end)
            .exclude(poi=None)
        )

        aggregated = (
            qs.values("poi__id", "poi__name", "poi__category")
              .annotate(count=Count("id"))
              .order_by("-count")[:limit]
        )
        items = [
            {"id": r["poi__id"], "name": r["poi__name"], "category": r["poi__category"], "count": r["count"]}
            for r in aggregated
        ]
        return Response({"items": items})

class VendorDetailView(AttractionDetailView):
    """Reuses AttractionDetailView logic for a specific vendor POI."""
    pass

class ReportsExportView(APIView):
    """
    POST /api/reports?date_from=&date_to=&format=csv|pdf
    Body optional: { poi_id?, sentiment?, category? }
    """
    def post(self, request):
        start, end = parse_range(request)
        fmt = request.GET.get("format", "csv").lower()
        poi_id = request.data.get("poi_id")
        sentiment = request.data.get("sentiment")
        category = request.data.get("category")

        qs = (
            PostClean.objects
            .annotate(ts=Coalesce(F("raw_post__created_at"), F("raw_post__fetched_at")))
            .filter(ts__date__gte=start, ts__date__lte=end)
        )
        if poi_id:
            qs = qs.filter(poi_id=poi_id)
        if sentiment:
            qs = qs.filter(sentiment=sentiment)
        if category:
            qs = qs.filter(poi__category=category)

        rows = (
            qs.select_related("poi", "raw_post")
              .values("ts", "poi__name", "poi__category", "sentiment", "clean_content")
              .order_by("-ts")[:5000]
        )

        if fmt == "csv":
            return self._export_csv(rows, start, end)
        elif fmt == "pdf":
            try:
                from reportlab.lib.pagesizes import A4  # noqa: F401
                from reportlab.pdfgen import canvas     # noqa: F401
            except Exception:
                return Response({
                    "detail": "PDF export requires 'reportlab'. Add it to requirements.txt and rebuild."
                }, status=400)
            return self._export_pdf(rows, start, end)
        else:
            return Response({"detail": "Unsupported format"}, status=400)

    def _export_csv(self, rows, start, end):
        buffer = StringIO()
        writer = csv.writer(buffer)
        writer.writerow(["date", "poi", "category", "sentiment", "content"])
        for r in rows:
            date_str = r["ts"].date().isoformat() if r["ts"] else ""
            writer.writerow([
                date_str,
                r.get("poi__name") or "",
                r.get("poi__category") or "",
                r.get("sentiment") or "",
                (r.get("clean_content") or "").replace("\n", " ").strip(),
            ])
        payload = buffer.getvalue()
        resp = HttpResponse(payload, content_type="text/csv")
        resp["Content-Disposition"] = f"attachment; filename=report_{start}_{end}.csv"
        return resp

    def _export_pdf(self, rows, start, end):
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        buf = BytesIO()
        c = canvas.Canvas(buf, pagesize=A4)
        width, height = A4
        y = height - 40
        c.setFont("Helvetica-Bold", 12)
        c.drawString(40, y, f"Tourism Report {start} to {end}")
        y -= 20
        c.setFont("Helvetica", 9)
        for r in rows:
            if y < 40:
                c.showPage()
                y = height - 40
                c.setFont("Helvetica", 9)
            date_str = r["ts"].date().isoformat() if r["ts"] else ""
            line = f"{date_str} | {r.get('poi__name') or ''} | {r.get('poi__category') or ''} | {r.get('sentiment') or ''} | {(r.get('clean_content') or '').replace('\\n',' ')[:140]}"
            c.drawString(40, y, line)
            y -= 14
        c.showPage()
        c.save()
        pdf = buf.getvalue()
        resp = HttpResponse(pdf, content_type="application/pdf")
        resp["Content-Disposition"] = f"attachment; filename=report_{start}_{end}.pdf"
        return resp
