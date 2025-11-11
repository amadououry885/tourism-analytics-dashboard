# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='expected_attendance',
            field=models.IntegerField(blank=True, help_text='Expected number of attendees', null=True),
        ),
        migrations.AddField(
            model_name='event',
            name='actual_attendance',
            field=models.IntegerField(blank=True, help_text='Actual number of attendees (for past events)', null=True),
        ),
    ]
