# backend/analytics/views.py

import csv
import re
from collections import Counter
from datetime import datetime, timedelta, date
from io import StringIO, BytesIO

from django.db.models import Q, Count, F, Case, When, IntegerField, Sum, Avg
from django.db.models.functions import Coalesce, TruncDate, ExtractHour
from django.http import HttpResponse, JsonResponse
from django.utils.dateparse import parse_date
from django.views.decorators.http import require_GET

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view

from analytics.models import Place, SocialPost, PostRaw, PostClean, SentimentTopic
from analytics.serializers import (
    PlaceSerializer, 
    SocialPostSerializer,
    PostRawSerializer,
    PostCleanSerializer,
    SentimentTopicSerializer,
)

# ─────────────────────────────────────────────────────────────
# Existing read-only endpoints (models_old)
# ─────────────────────────────────────────────────────────────

class PlaceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Place.objects.all().order_by("name")
    serializer_class = PlaceSerializer

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
STOPWORDS2 = set("""
the a an and or for of in on to at is are was were be not no this that with from by about into as it its
""".split())

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
                yield "".join(word)
                word = []
    if word:
        yield "".join(word)

def _parse_days_or_dates(request):
    # Supports ?range=7d OR ?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
    rng = (request.GET.get("range") or "").strip().lower()
    if rng.endswith("d") and rng[:-1].isdigit():
        days = max(1, int(rng[:-1]))
        end = datetime.utcnow().date()
        start = end - timedelta(days=days - 1)
        return start, end, days
    start, end = parse_range(request)
    return start, end, (end - start).days + 1

def _range_from_or_date_params(request):
    fs = request.GET.get("from") or request.GET.get("date_from")
    ts = request.GET.get("to") or request.GET.get("date_to")
    today = date.today()
    start = parse_date(fs) if fs else (today - timedelta(days=30))
    end   = parse_date(ts) if ts else today
    if not start or not end or start > end:
        return None, None
    return start, end

# ─────────────────────────────────────────────────────────────
# API Views for Analytics Dashboard
# ─────────────────────────────────────────────────────────────

@api_view(['GET'])
def healthz(_request):
    # Lightweight liveness probe
    return HttpResponse("OK", content_type="text/plain")

class MetricsTotalsView(APIView):
    """
    GET /api/metrics/totals?range=7d
    -> { range_days, total_posts, unique_authors }
    (uses models_old.PostClean for demo compatibility)
    """

    def get(self, request):
        start, end, days = _parse_days_or_dates(request)
        try:
            base = (
                PostClean.objects
                .annotate(ts=Coalesce(F("raw_post__created_at"), F("raw_post__fetched_at")))
                .filter(ts__date__gte=start, ts__date__lte=end)
            )
            total_posts = base.count()
            try:
                unique_authors = base.values("raw_post__author").distinct().count()
                if unique_authors == 1 and base.filter(raw_post__author__isnull=True).count() == total_posts:
                    unique_authors = 0
            except Exception:
                unique_authors = None

            return Response({
                "range_days": days,
                "total_posts": total_posts,
                "unique_authors": unique_authors,
            })
        except Exception:
            return Response({"range_days": days, "total_posts": 0, "unique_authors": None})

class MetricsEngagementView(APIView):
    """
    GET /api/metrics/engagement?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD[&poi_id=123]
    -> {"likes": 1234, "comments": 567, "shares": 321}
    (Defensive: tolerates fields on PostClean OR PostRaw and missing columns.)
    """

    def get(self, request):
        start, end = parse_range(request)
        poi_id = request.GET.get("poi_id")

        qs = (
            PostClean.objects
            .select_related("raw_post")
            .annotate(ts=Coalesce(F("raw_post__created_at"), F("raw_post__fetched_at")))
            .filter(ts__date__gte=start, ts__date__lte=end)
        )
        if poi_id:
            qs = qs.filter(poi_id=poi_id)

        likes = comments = shares = 0

        def num(obj, *names):
            for n in names:
                try:
                    v = getattr(obj, n)
                except Exception:
                    v = None
                if isinstance(v, (int, float)) and v is not None:
                    return int(v)
            return 0

        for pc in qs:
            rp = getattr(pc, "raw_post", None)
            likes    += (num(pc, "likes", "likes_count", "like_count")
                         or (num(rp, "likes", "likes_count", "like_count") if rp else 0))
            comments += (num(pc, "comments", "comments_count", "comment_count")
                         or (num(rp, "comments", "comments_count", "comment_count") if rp else 0))
            shares   += (num(pc, "shares", "shares_count", "share_count", "reposts")
                         or (num(rp, "shares", "shares_count", "share_count", "reposts") if rp else 0))

        return Response({"likes": likes, "comments": comments, "shares": shares})

class SentimentTrendView(APIView):
    """
    GET /api/sentiment/trend?range=7d
    -> { range_days, series: [{ date, pos, neu, neg }] }
    """

    def get(self, request):
        start, end, days = _parse_days_or_dates(request)
        try:
            base = (
                PostClean.objects
                .annotate(ts=Coalesce(F("raw_post__created_at"), F("raw_post__fetched_at")))
                .filter(ts__date__gte=start, ts__date__lte=end)
            )
            agg = (
                base
                .annotate(day=TruncDate("ts"))
                .values("day")
                .annotate(
                    pos=Count(Case(When(sentiment__iexact="positive", then=1), output_field=IntegerField())),
                    neu=Count(Case(When(sentiment__iexact="neutral",  then=1), output_field=IntegerField())),
                    neg=Count(Case(When(sentiment__iexact="negative", then=1), output_field=IntegerField())),
                )
                .order_by("day")
            )
            by_day = {r["day"]: {"pos": r["pos"], "neu": r["neu"], "neg": r["neg"]} for r in agg}

            series = []
            d = start
            while d <= end:
                counts = by_day.get(d, {"pos": 0, "neu": 0, "neg": 0})
                series.append({"date": d.isoformat(), **counts})
                d += timedelta(days=1)

            return Response({"range_days": days, "series": series})
        except Exception:
            series = [{"date": (start + timedelta(days=i)).isoformat(), "pos": 0, "neu": 0, "neg": 0} for i in range(days)]
            return Response({"range_days": days, "series": series})

# --- NEW (Overview/Social glue): compact sentiment + platform endpoints -------

class SentimentSummaryView(APIView):
    """
    GET /api/sentiment/summary?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
    -> { positive_pct, neutral_pct, negative_pct, positive, neutral, negative, mentions }
    """

    def get(self, request):
        start, end = parse_range(request)

        qs = (
            PostClean.objects
            .select_related("raw_post")
            .annotate(ts=Coalesce(F("raw_post__created_at"), F("raw_post__fetched_at")))
            .filter(ts__date__gte=start, ts__date__lte=end)
        )

        agg = qs.aggregate(
            pos=Count(Case(When(sentiment__iexact="positive", then=1), output_field=IntegerField())),
            neu=Count(Case(When(sentiment__iexact="neutral",  then=1), output_field=IntegerField())),
            neg=Count(Case(When(sentiment__iexact="negative", then=1), output_field=IntegerField())),
        )

        pos = int(agg.get("pos") or 0)
        neu = int(agg.get("neu") or 0)
        neg = int(agg.get("neg") or 0)
        total = max(1, pos + neu + neg)

        return Response({
            "positive_pct": round(pos * 100 / total),
            "neutral_pct":  round(neu * 100 / total),
            "negative_pct": round(neg * 100 / total),
            "positive": pos,
            "neutral":  neu,
            "negative": neg,
            "mentions": pos + neu + neg,
        })

class PlatformsEngagementView(APIView):
    """
    GET /api/analytics/platforms?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
    -> [{ "platform": "Instagram", "engagement": 145000 }, ...]
    """

    def get(self, request):
        start, end = parse_range(request)

        # Prefer live SocialPost, fall back to legacy if none
        try:
            has_socialpost = SocialPost.objects.filter(
                created_at__date__gte=start, created_at__date__lte=end
            ).exists()
        except Exception:
            has_socialpost = False

        items = []
        if has_socialpost:
            qs = (
                SocialPost.objects
                .filter(created_at__date__gte=start, created_at__date__lte=end)
                .values("platform")
                .annotate(
                    likes=Coalesce(Sum("likes"), 0),
                    comments=Coalesce(Sum("comments"), 0),
                    shares=Coalesce(Sum("shares"), 0),
                )
            )
            for r in qs:
                engagement = int(r["likes"]) + int(r["comments"]) + int(r["shares"])
                items.append({"platform": (r["platform"] or "Unknown"), "engagement": engagement})
        else:
            base = (
                PostClean.objects
                .select_related("raw_post")
                .annotate(ts=Coalesce(F("raw_post__created_at"), F("raw_post__fetched_at")))
                .filter(ts__date__gte=start, ts__date__lte=end)
            )

            buckets = {}
            for pc in base:
                rp = getattr(pc, "raw_post", None)
                platform = (getattr(rp, "platform", None) or "Unknown")

                def num(obj, *names):
                    for n in names:
                        try:
                            v = getattr(obj, n)
                        except Exception:
                            v = None
                        if isinstance(v, (int, float)) and v is not None:
                            return int(v)
                    return 0

                likes = (num(pc, "likes", "likes_count", "like_count")
                         or (num(rp, "likes", "likes_count", "like_count") if rp else 0))
                comments = (num(pc, "comments", "comments_count", "comment_count")
                            or (num(rp, "comments", "comments_count", "comment_count") if rp else 0))
                shares = (num(pc, "shares", "shares_count", "share_count", "reposts")
                          or (num(rp, "shares", "shares_count", "share_count", "reposts") if rp else 0))

                buckets[platform] = buckets.get(platform, 0) + likes + comments + shares

            items = [{"platform": k, "engagement": v} for k, v in buckets.items()]

        items.sort(key=lambda x: -x["engagement"])
        return Response(items)

# ─────────────────────────────────────────────────────────────
# Part 3 — Map Heat, Word Cloud, Hidden Gem (models_old)
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
                "poi_id",
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
# Part 4 — Tabs + Reports (models_old)
# ─────────────────────────────────────────────────────────────

class AttractionsListView(APIView):
    """
    List top attractions/POIs for the given date range.
    Used by the old Dashboard.jsx (models_old).
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

class TopAttractionsView(AttractionsListView):
    # Alias so routes can reference TopAttractionsView consistently
    pass

class AttractionDetailView(APIView):
    # Returns stats for a specific attraction (POI) between the given date range
    def get(self, request, pk):
        date_from = parse_date(request.GET.get("date_from"))
        date_to = parse_date(request.GET.get("date_to"))
        try:
            place = Place.objects.get(pk=pk)
        except Place.DoesNotExist:
            return Response({"detail": "Place not found"}, status=404)

        qs = (
            PostClean.objects
            .filter(place=place)
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
            "id": place.id,
            "name": place.name,
            "category": place.category,
            "total_mentions": total_mentions,
            "timeseries": [
                {"day": t["day"].isoformat(), "count": t["count"]}
                for t in timeseries
            ],
        }
        return Response(data)

class VendorsListView(APIView):
    # List vendor POIs ranked by mentions in the date range.
    # (Currently same logic as AttractionsListView; filter by category later if needed.)

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
    # POST /api/reports?date_from=&date_to=&format=csv|pdf
    # Body optional: { poi_id?, sentiment?, category? }

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

# ─────────────────────────────────────────────────────────────
# Minimal endpoints used directly by the old Dashboard.jsx (models_old)
# ─────────────────────────────────────────────────────────────

class MetricsVisitorsView(APIView):
    """GET /metrics/visitors?date_from=&date_to=&poi_id= -> { "total": <int> }"""

    def get(self, request):
        start, end = parse_range(request)
        poi_id = request.GET.get("poi_id")

        qs = (
            PostClean.objects
            .annotate(ts=Coalesce(F("raw_post__created_at"), F("raw_post__fetched_at")))
            .filter(ts__date__gte=start, ts__date__lte=end)
        )
        if poi_id:
            qs = qs.filter(poi_id=poi_id)

        return Response({"total": qs.count()})

class MentionsTimeSeriesView(APIView):
    """GET /timeseries/mentions?date_from=&date_to=&poi_id= -> series"""

    def get(self, request):
        start, end = parse_range(request)
        poi_id = request.GET.get("poi_id")

        base = (
            PostClean.objects
            .annotate(ts=Coalesce(F("raw_post__created_at"), F("raw_post__fetched_at")))
            .filter(ts__date__gte=start, ts__date__lte=end)
        )
        if poi_id:
            base = base.filter(poi_id=poi_id)

        agg = (
            base.annotate(day=TruncDate("ts"))
                .values("day")
                .annotate(count=Count("id"))
                .order_by("day")
        )

        by_day = {r["day"]: r["count"] for r in agg}
        items = []
        d = start
        while d <= end:
            items.append({"date": d.isoformat(), "count": by_day.get(d, 0)})
            d += timedelta(days=1)
        return Response({"items": items})

class TopPOIsView(APIView):
    """GET /rankings/top-pois?date_from=&date_to=&limit=5 -> ranked items"""

    def get(self, request):
        start, end = parse_range(request)
        limit = int(request.GET.get("limit", 5))

        qs = (
            PostClean.objects
            .annotate(ts=Coalesce(F("raw_post__created_at"), F("raw_post__fetched_at")))
            .filter(ts__date__gte=start, ts__date__lte=end)
            .exclude(poi=None)
        )
        rows = (
            qs.values("poi_id", "poi__name")
              .annotate(count=Count("id"))
              .order_by("-count")[:limit]
        )
        items = [{"poi_id": r["poi_id"], "name": r["poi__name"], "count": r["count"]} for r in rows]
        return Response({"items": items})

class LeastPOIsView(APIView):
    """GET /rankings/least-pois?date_from=&date_to=&limit=5 -> ranked items"""

    def get(self, request):
        start, end = parse_range(request)
        limit = int(request.GET.get("limit", 5))

        qs = (
            PostClean.objects
            .annotate(ts=Coalesce(F("raw_post__created_at"), F("raw_post__fetched_at")))
            .filter(ts__date__gte=start, ts__date__lte=end)
            .exclude(poi=None)
        )
        rows = (
            qs.values("poi_id", "poi__name")
              .annotate(count=Count("id"))
              .order_by("count", "poi__name")[:limit]
        )
        items = [{"poi_id": r["poi_id"], "name": r["poi__name"], "count": r["count"]} for r in rows]
        return Response({"items": items})

# ─────────────────────────────────────────────────────────────
# New analytics backed by Place + SocialPost (your live data)
# ─────────────────────────────────────────────────────────────

def analytics_summary(request):
    start, end = _range_from_or_date_params(request)
    if not start or not end:
        return JsonResponse({"detail": "Invalid date range"}, status=400)

    place_q = (request.GET.get("place") or "").strip() or None
    qs = SocialPost.objects.select_related("place").filter(
        created_at__date__gte=start,
        created_at__date__lte=end,
    )
    if place_q:
        qs = qs.filter(place__name__icontains=place_q)

    agg = qs.aggregate(
        mentions=Count("id"),
        likes=Coalesce(Sum("likes"), 0),
        comments=Coalesce(Sum("comments"), 0),
        shares=Coalesce(Sum("shares"), 0),
    )
    engagement = int(agg["likes"]) + int(agg["comments"]) + int(agg["shares"])

    top = (qs.values("place_id", "place__name")
             .annotate(mentions=Count("id"),
                       engagement=Coalesce(Sum(F("likes")+F("comments")+F("shares")), 0))
             .order_by("-engagement", "-mentions")
             .first())

    hidden = (qs.values("place_id", "place__name")
                .annotate(mentions=Count("id"),
                          engagement=Coalesce(Sum(F("likes")+F("comments")+F("shares")), 0))
                .filter(mentions__lte=2, mentions__gte=1)
                .annotate(avg_engagement=F("engagement") * 1.0 / F("mentions"))
                .order_by("-avg_engagement")
                .first())

    texts = qs.values_list("content", flat=True)
    counter = Counter()
    for t in texts:
        if not t:
            continue
        tokens = re.findall(r"[A-Za-z]{3,}", t.lower())
        counter.update(w for w in tokens if w not in STOPWORDS2)
    keywords = [{"word": w, "count": c} for w, c in counter.most_common(15)]

    return JsonResponse({
        "range": {"from": str(start), "to": str(end)},
        "totals": {**agg, "engagement": engagement},
        "top_attraction": top,
        "hidden_gem": hidden,
        "keywords": keywords,
    })

def analytics_timeseries(request):
    start, end = _range_from_or_date_params(request)
    if not start or not end:
        return JsonResponse({"detail": "Invalid date range"}, status=400)
    place_q = (request.GET.get("place") or "").strip() or None

    qs = SocialPost.objects.select_related("place").filter(
        created_at__date__gte=start, created_at__date__lte=end
    )
    if place_q:
        qs = qs.filter(place__name__icontains=place_q)

    rows = (qs.annotate(d=TruncDate("created_at"))
              .values("d")
              .annotate(
                  mentions=Count("id"),
                  likes=Coalesce(Sum("likes"), 0),
                  comments=Coalesce(Sum("comments"), 0),
                  shares=Coalesce(Sum("shares"), 0),
              )
              .order_by("d"))
    return JsonResponse(list(rows), safe=False)

def analytics_heatmap(request):
    start, end = _range_from_or_date_params(request)
    if not start or not end:
        return JsonResponse({"detail": "Invalid date range"}, status=400)
    place_q = (request.GET.get("place") or "").strip() or None

    qs = SocialPost.objects.select_related("place").filter(
        created_at__date__gte=start, created_at__date__lte=end
    )
    if place_q:
        qs = qs.filter(place__name__icontains=place_q)

    rows = (qs.values("place_id", "place__name", "place__latitude", "place__longitude")
              .annotate(
                  mentions=Count("id"),
                  engagement=Coalesce(Sum(F("likes")+F("comments")+F("shares")), 0),
              )
              .filter(place__latitude__isnull=False, place__longitude__isnull=False)
              .order_by("-engagement"))

    data = [{
        "place_id": r["place_id"],
        "name": r["place__name"],
        "lat": r["place__latitude"],
        "lon": r["place__longitude"],
        "mentions": r["mentions"],
        "engagement": r["engagement"],
    } for r in rows]
    return JsonResponse(data, safe=False)

# ─────────────────────────────────────────────────────────────
# 🔍 POI search used by POISearchAutosuggest.jsx
#   GET /api/search/pois?q=...&limit=20
# ─────────────────────────────────────────────────────────────

class PlaceSuggestView(APIView):
    # GET /api/search/pois?q=...&limit=20 -> { items: [...] }

    def get(self, request):
        q = (request.GET.get("q") or "").strip()
        try:
            limit = min(50, max(1, int(request.GET.get("limit", 20))))
        except ValueError:
            limit = 20

        qs = Place.objects.all()
        if q:
            qs = qs.filter(
                Q(name__icontains=q) |
                Q(city__icontains=q) |
                Q(category__icontains=q)
            )

        qs = qs.order_by("name")[:limit]
        items = [
            {
                "id": p.id,
                "name": p.name,
                "category": p.category or "",
                "latitude": p.latitude,
                "longitude": p.longitude,
            }
            for p in qs
        ]
        return JsonResponse({"items": items})

@require_GET
def search_pois(request):
    """Shim for /api/search/pois -> class-based PlaceSuggestView"""
    return PlaceSuggestView.as_view()(request)

# Legacy alias kept for backward compatibility (/api/places/suggest)
places_suggest = search_pois

# ─────────────────────────────────────────────────────────────
# New endpoints powering: Overview, Destinations, Social tabs
# Uses live models: Place + SocialPost
# ─────────────────────────────────────────────────────────────

def _engagement_expr():
    return Coalesce(F("likes"), 0) + Coalesce(F("comments"), 0) + Coalesce(F("shares"), 0)

# ---------- OVERVIEW ----------------------------------------------------------

@api_view(["GET"])
def overview_metrics(request):
    # GET /api/overview/metrics?from=&to=&city=
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

# ---------- DESTINATIONS ------------------------------------------------------

@api_view(["GET"])
def destinations_top(request):
    # GET /api/destinations/top?from=&to=&city=&limit=5
    start, end = _range_from_or_date_params(request)
    if not start or not end:
        return Response({"detail": "Invalid date range"}, status=400)

    limit = max(1, min(20, int(request.GET.get("limit", 5))))
    city = (request.GET.get("city") or "").strip() or None

    qs = (SocialPost.objects
          .filter(created_at__date__gte=start, created_at__date__lte=end, place__isnull=False)
          .values("place_id", "place__name")
          .annotate(
              visitors=Count("id"),
              posts=Count("id"),
              engagement=Sum(_engagement_expr()),
          )
          .order_by("-engagement", "-visitors")[:limit])

    items = []
    for r in qs:
        items.append({
            "name": r["place__name"],
            "visitors": int(r["visitors"]),
            "posts": int(r["posts"]),
            "rating": None,
            "change": None,
            "trend": "up",
        })
    return Response(items)

@api_view(["GET"])
def destinations_distribution(request):
    # GET /api/destinations/distribution?from=&to=&limit=5
    start, end = _range_from_or_date_params(request)
    if not start or not end:
        return Response({"detail": "Invalid date range"}, status=400)
    limit = max(1, min(10, int(request.GET.get("limit", 5))))

    base = (SocialPost.objects
            .filter(created_at__date__gte=start, created_at__date__lte=end, place__isnull=False)
            .values("place__name")
            .annotate(count=Count("id"))
            .order_by("-count"))

    top = list(base[:limit])
    other_total = base[limit:].aggregate(c=Coalesce(Sum("count"), 0))["c"] or 0
    total = (sum(r["count"] for r in top) + other_total) or 1

    out = [{"name": r["place__name"], "value": int(r["count"]),
            "percentage": round(r["count"] * 100.0 / total, 1)} for r in top]
    if other_total:
        out.append({"name": "Others", "value": int(other_total),
                    "percentage": round(other_total * 100.0 / total, 1)})
    return Response(out)

@api_view(["GET"])
def destinations_comparison(request):
    # GET /api/destinations/comparison?from=&to=&limit=5
    start, end = _range_from_or_date_params(request)
    if not start or not end:
        return Response({"detail": "Invalid date range"}, status=400)
    limit = max(1, min(12, int(request.GET.get("limit", 5))))

    rows = (SocialPost.objects
            .filter(created_at__date__gte=start, created_at__date__lte=end, place__isnull=False)
            .values("place__name")
            .annotate(visitors=Count("id"), posts=Count("id"))
            .order_by("-visitors")[:limit])

    return Response([{"name": r["place__name"], "visitors": int(r["visitors"]), "posts": int(r["posts"])}
                     for r in rows])

@api_view(["GET"])
def destinations_undervisited(request):
    # Hidden/under-visited: low mentions but present in period.
    # GET /api/destinations/undervisited?from=&to=&limit=4
    start, end = _range_from_or_date_params(request)
    if not start or not end:
        return Response({"detail": "Invalid date range"}, status=400)
    limit = max(1, min(12, int(request.GET.get("limit", 4))))

    span = (end - start).days + 1
    prev_start = start - timedelta(days=span)
    prev_end = start - timedelta(days=1)

    base = SocialPost.objects.filter(place__isnull=False)

    cur = (base.filter(created_at__date__gte=start, created_at__date__lte=end)
           .values("place__name").annotate(c=Count("id")))
    prev = (base.filter(created_at__date__gte=prev_start, created_at__date__lte=prev_end)
            .values("place__name").annotate(c=Count("id")))

    prev_map = {r["place__name"]: r["c"] for r in prev}
    items = []
    for r in cur:
        name, c_now = r["place__name"], r["c"]
        if c_now <= 200:
            c_prev = prev_map.get(name, 0)
            change = None
            trend = "up"
            if c_prev > 0:
                change_val = (c_now - c_prev) * 100.0 / c_prev
                change = f"{change_val:+.1f}%"
                trend = "up" if change_val >= 0 else "down"
            items.append({"name": name, "visitors": int(c_now), "posts": int(c_now),
                          "change": change, "trend": trend})
    items.sort(key=lambda x: (x["trend"] == "up", -x["visitors"]), reverse=True)
    return Response(items[:limit])

# ---------- SOCIAL ------------------------------------------------------------

@api_view(["GET"])
def social_trends(request):
    # GET /api/social/trends?from=&to=
    # -> [{ date:'YYYY-MM-DD', likes, comments, shares }]
    start, end = _range_from_or_date_params(request)
    if not start or not end:
        return Response({"detail": "Invalid date range"}, status=400)

    rows = (SocialPost.objects
            .filter(created_at__date__gte=start, created_at__date__lte=end)
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(
                likes=Coalesce(Sum("likes"), 0),
                comments=Coalesce(Sum("comments"), 0),
                shares=Coalesce(Sum("shares"), 0),
            )
            .order_by("day"))

    out = []
    for r in rows:
        d = r["day"]
        out.append({
            "date": d.isoformat(),
            "likes": int(r["likes"]),
            "comments": int(r["comments"]),
            "shares": int(r["shares"]),
        })
    return Response(out)

@api_view(["GET"])
def social_platforms(request):
    # GET /api/social/platforms?from=&to=
    # -> [{ platform, engagement }]
    start, end = _range_from_or_date_params(request)
    if not start or not end:
        return Response({"detail": "Invalid date range"}, status=400)

    rows = (SocialPost.objects
            .filter(created_at__date__gte=start, created_at__date__lte=end)
            .values("platform")
            .annotate(engagement=Sum(Coalesce(F("likes"), 0) + Coalesce(F("comments"), 0) + Coalesce(F("shares"), 0)))
            .order_by("-engagement"))

    return Response([{"platform": r["platform"] or "Unknown", "engagement": int(r["engagement"] or 0)}
                     for r in rows])

@api_view(["GET"])
def social_sentiment_summary(request):
    # Uses models_old.PostClean where sentiment exists.
    # -> {"positive_pct": 68, "neutral_pct": 23, "negative_pct": 9, "counts": {...}}
    start, end = _range_from_or_date_params(request)
    if not start or not end:
        return Response({"detail": "Invalid date range"}, status=400)

    base = (PostClean.objects
            .annotate(ts=Coalesce(F("raw_post__created_at"), F("raw_post__fetched_at")))
            .filter(ts__date__gte=start, ts__date__lte=end))

    counts = {
        "positive": base.filter(sentiment__iexact="positive").count(),
        "neutral":  base.filter(sentiment__iexact="neutral").count(),
        "negative": base.filter(sentiment__iexact="negative").count(),
    }
    total = max(1, sum(counts.values()))
    resp = {
        "positive_pct": round(counts["positive"] * 100.0 / total),
        "neutral_pct":  round(counts["neutral"]  * 100.0 / total),
        "negative_pct": round(counts["negative"] * 100.0 / total),
        "counts": counts,
    }
    return Response(resp)

@api_view(["GET"])
def social_sentiment_by_category(request):
    # -> [{ category, positive_pct, neutral_pct, negative_pct }]
    start, end = _range_from_or_date_params(request)
    if not start or not end:
        return Response({"detail": "Invalid date range"}, status=400)

    base = (PostClean.objects
            .exclude(poi=None)
            .annotate(ts=Coalesce(F("raw_post__created_at"), F("raw_post__fetched_at")))
            .filter(ts__date__gte=start, ts__date__lte=end))

    cats = {}
    for r in (base.values("poi__category", "sentiment").annotate(c=Count("id"))):
        cat = r["poi__category"] or "Unknown"
        cats.setdefault(cat, {"positive": 0, "neutral": 0, "negative": 0})
        s = (r["sentiment"] or "").lower()
        if s in cats[cat]:
            cats[cat][s] += r["c"]

    out = []
    for cat, cdict in cats.items():
        tot = max(1, sum(cdict.values()))
        out.append({
            "category": cat,
            "positive_pct": round(cdict["positive"] * 100.0 / tot),
            "neutral_pct":  round(cdict["neutral"]  * 100.0 / tot),
            "negative_pct": round(cdict["negative"] * 100.0 / tot),
        })
    out.sort(key=lambda x: x["category"])
    return Response(out)

@api_view(["GET"])
def social_keywords(request):
    # GET /api/social/keywords?from=&to=&limit=12 -> [{ term, count }]
    start, end = _range_from_or_date_params(request)
    if not start or not end:
        return Response({"detail": "Invalid date range"}, status=400)
    limit = max(5, min(50, int(request.GET.get("limit", 12))))

    texts = (SocialPost.objects
             .filter(created_at__date__gte=start, created_at__date__lte=end)
             .values_list("content", flat=True))

    counter = Counter()
    for t in texts:
        if not t:
            continue
        for token in re.findall(r"[A-Za-z]{3,}", t.lower()):
            if token not in STOPWORDS2:
                counter[token] += 1

    items = [{"term": term, "count": cnt} for term, cnt in counter.most_common(limit)]
    return Response(items)
