from django.db import models

class Vendor(models.Model):
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=120, db_index=True)
    cuisines = models.JSONField(default=list, blank=True)
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)   # ✅ auto timestamp
    updated_at = models.DateTimeField(auto_now=True)       # ✅ auto update timestamp

    class Meta:
        ordering = ["city", "name"]
        indexes = [models.Index(fields=["city"])]

    def __str__(self):
        return f"{self.name} — {self.city}"
