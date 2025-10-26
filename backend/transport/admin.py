from django.contrib import admin
from .models import Place, Route


@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ("name", "is_in_kedah", "lat", "lon")
    list_filter = ("is_in_kedah",)
    search_fields = ("name",)


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ("from_place", "to_place", "route_type", "options_count")
    list_filter = ("route_type",)
    search_fields = ("from_place__name", "to_place__name")

    def options_count(self, obj):
        return len(obj.options or [])
    options_count.short_description = "Options"
