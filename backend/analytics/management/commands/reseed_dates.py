# backend/analytics/management/commands/reseed_dates.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random

from analytics.models import PostRaw, PostClean, SentimentTopic

class Command(BaseCommand):
    help = "Shift demo PostRaw/PostClean/SentimentTopic dates into the last 7 days"

    def handle(self, *args, **options):
        now = timezone.now()
        start = (now - timedelta(days=6)).replace(hour=9, minute=0, second=0, microsecond=0)

        raws = list(PostRaw.objects.all())
        cleans = list(PostClean.objects.select_related("raw_post").all())
        topics = list(SentimentTopic.objects.all())

        # Evenly distribute raw posts across last 7 days
        for i, rp in enumerate(raws):
            day = start + timedelta(days=i % 7, hours=random.randint(0, 9))
            rp.created_at = day
            rp.fetched_at = day + timedelta(minutes=random.randint(1, 30))
            rp.save(update_fields=["created_at", "fetched_at"])

        # Ensure any PostClean lines up with its raw_post
        for pc in cleans:
            rp = pc.raw_post
            # nothing to set on pc unless you added created_at; aligning via raw_post is enough

        # Distribute SentimentTopic daily counts across last 7 days
        for i, st in enumerate(topics):
            st.date = (start.date() + timedelta(days=i % 7))
            st.save(update_fields=["date"])

        self.stdout.write(self.style.SUCCESS("Demo dates nudged into the last 7 days."))
