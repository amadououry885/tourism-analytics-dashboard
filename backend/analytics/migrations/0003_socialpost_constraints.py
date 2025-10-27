# backend/analytics/migrations/0003_socialpost_constraints.py
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ("analytics", "0002_socialpost_reconcile"),
    ]

    operations = [
        # lock the final schema to match your models.py
        migrations.AlterField(
            model_name="socialpost",
            name="content",
            field=models.TextField(),  # non-null
        ),
        migrations.AlterField(
            model_name="socialpost",
            name="fetched_at",
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name="socialpost",
            name="post_id",
            field=models.CharField(max_length=100, unique=True),
        ),
    ]
