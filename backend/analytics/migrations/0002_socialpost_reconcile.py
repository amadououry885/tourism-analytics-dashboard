# backend/analytics/migrations/0002_socialpost_reconcile.py
from django.db import migrations, models
from django.utils import timezone

def backfill_socialpost(apps, schema_editor):
    SocialPost = apps.get_model("analytics", "SocialPost")
    # Backfill rows safely
    for sp in SocialPost.objects.all():
        # If an older column "text" exists in the DB, Django ORM won't see it,
        # so we can't read it directly. We'll just ensure "content" has *something*.
        if not sp.content:
            sp.content = ""  # keep minimal; you'll edit in admin if needed

        if not sp.fetched_at:
            sp.fetched_at = timezone.now()

        if not sp.post_id:
            # ensure uniqueness per row
            sp.post_id = f"legacy-{sp.pk}"

        sp.save(update_fields=["content", "fetched_at", "post_id"])

class Migration(migrations.Migration):
    dependencies = [
        ("analytics", "0001_initial"),
    ]

    operations = [
        # 1) Make sure the three fields exist (add as nullable first so migration never prompts)
        migrations.AddField(
            model_name="socialpost",
            name="content",
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name="socialpost",
            name="fetched_at",
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name="socialpost",
            name="post_id",
            field=models.CharField(max_length=100, null=True, blank=True),
        ),

        # 2) Backfill safe defaults per row
        migrations.RunPython(backfill_socialpost, migrations.RunPython.noop),
    ]
