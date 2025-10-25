from rest_framework import serializers
from .models import Vendor

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ["id", "name", "city", "cuisines", "lat", "lon", "is_active", "created_at", "updated_at"]
