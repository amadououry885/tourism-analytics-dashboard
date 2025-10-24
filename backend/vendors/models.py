from django.db import models

class Vendor(models.Model):
    name = models.CharField(max_length=200)
    city = models.CharField(max_length=120, db_index=True)
    cuisines = models.JSONField(default=list, blank=True)  # ["Nasi Lemak", "Mee Goreng"]
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["city", "name"]
        indexes = [models.Index(fields=["city"])]

    def __str__(self):
        return f"{self.name} — {self.city}"
