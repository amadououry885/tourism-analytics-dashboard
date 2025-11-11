from django.db import models
from django.conf import settings

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    location_name = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=120, blank=True)
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)  # ["festival","music"]
    is_published = models.BooleanField(default=True)
    
    # Attendance tracking
    expected_attendance = models.IntegerField(null=True, blank=True, help_text="Expected number of attendees")
    actual_attendance = models.IntegerField(null=True, blank=True, help_text="Actual number of attendees (for past events)")
    
    # Ownership tracking
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_events',
        help_text="Admin user who created this event"
    )

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return self.title
