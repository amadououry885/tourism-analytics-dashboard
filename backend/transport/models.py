from django.db import models


class Place(models.Model):
    name = models.CharField(max_length=150, unique=True)  # "Alor Setar", "Kuala Lumpur"
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)
    is_in_kedah = models.BooleanField(default=False)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["is_in_kedah"]),
        ]

    def __str__(self):
        return self.name


class Route(models.Model):
    TYPE_CHOICES = [
        ("intra_kedah", "Intra-Kedah"),
        ("coming_to_kedah", "Coming to Kedah"),
        ("leaving_kedah", "Leaving Kedah"),
    ]

    from_place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name="routes_from")
    to_place   = models.ForeignKey(Place, on_delete=models.CASCADE, related_name="routes_to")
    route_type = models.CharField(max_length=20, choices=TYPE_CHOICES)

    # Same structure as your frontend mock: list of {mode, durationMin, priceMin, priceMax, provider}
    options = models.JSONField(default=list, blank=True)

    # Optional path preview: [[lat, lng], ...]
    polyline = models.JSONField(null=True, blank=True)

    class Meta:
        # allow multiple route types between the same pair
        unique_together = ("from_place", "to_place", "route_type")
        indexes = [
            models.Index(fields=["route_type"]),
            models.Index(fields=["from_place", "to_place"]),
        ]

    def __str__(self):
        return f"{self.from_place} → {self.to_place} ({self.route_type})"


class Schedule(models.Model):
    """Regular transport schedules for routes"""
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='schedules')
    provider = models.CharField(max_length=100)  # e.g., "Malaysia Airlines", "KTM", "Grab"
    transport_mode = models.CharField(max_length=50)  # e.g., "flight", "train", "bus", "taxi"
    departure_time = models.TimeField()
    arrival_time = models.TimeField()
    days_of_week = models.JSONField(help_text="Array of days when this schedule runs [0-6], 0=Monday")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="MYR")
    seats_available = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['departure_time']
        indexes = [
            models.Index(fields=['route', 'transport_mode']),
            models.Index(fields=['provider']),
            models.Index(fields=['departure_time']),
        ]

    def __str__(self):
        return f"{self.provider} {self.transport_mode}: {self.route} at {self.departure_time}"


class RouteDelay(models.Model):
    """Real-time delay information for scheduled transport"""
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='delays')
    date = models.DateField()
    delay_minutes = models.IntegerField(default=0)
    reason = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=50, choices=[
        ('on-time', 'On Time'),
        ('delayed', 'Delayed'),
        ('cancelled', 'Cancelled')
    ], default='on-time')
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-last_updated']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['status']),
            models.Index(fields=['schedule']),
        ]

    def __str__(self):
        return f"{self.schedule} - {self.date}: {self.status}"


class RouteOccupancy(models.Model):
    """Real-time occupancy tracking for routes"""
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='occupancy')
    date = models.DateField()
    seats_total = models.IntegerField()
    seats_taken = models.IntegerField()
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-last_updated']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['schedule']),
        ]
        verbose_name_plural = 'route occupancies'

    def __str__(self):
        return f"{self.schedule} - {self.date}: {self.seats_taken}/{self.seats_total}"


class MaintenanceSchedule(models.Model):
    """Planned maintenance affecting routes"""
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='maintenance_schedules')
    start_date = models.DateField()
    end_date = models.DateField()
    description = models.TextField()
    impact_level = models.CharField(max_length=50, choices=[
        ('low', 'Low Impact'),
        ('medium', 'Medium Impact'),
        ('high', 'High Impact')
    ])
    status = models.CharField(max_length=50, choices=[
        ('scheduled', 'Scheduled'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ], default='scheduled')

    class Meta:
        ordering = ['start_date', '-impact_level']
        indexes = [
            models.Index(fields=['start_date', 'end_date']),
            models.Index(fields=['impact_level']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.route} maintenance: {self.start_date} to {self.end_date}"
