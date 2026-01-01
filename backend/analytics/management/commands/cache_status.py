"""
Management command to view and manage cache
============================================
python manage.py cache_status - View cache statistics
python manage.py cache_status --clear - Clear all cache
python manage.py cache_status --invalidate - Invalidate analytics cache
"""

from django.core.management.base import BaseCommand
from django.core.cache import cache
from analytics.cache_utils import (
    invalidate_analytics_cache,
    invalidate_vendor_cache,
    invalidate_stay_cache,
    get_cache_stats
)


class Command(BaseCommand):
    help = 'View cache statistics and manage cache'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all cache',
        )
        parser.add_argument(
            '--invalidate',
            action='store_true',
            help='Invalidate analytics cache (simulates Celery task completion)',
        )
        parser.add_argument(
            '--vendors',
            action='store_true',
            help='Invalidate vendor cache only',
        )
        parser.add_argument(
            '--stays',
            action='store_true',
            help='Invalidate stay cache only',
        )

    def handle(self, *args, **options):
        self.stdout.write("=" * 60)
        self.stdout.write(self.style.SUCCESS("📊 KEDAH TOURISM CACHE MANAGER"))
        self.stdout.write("=" * 60)
        
        # Clear all cache
        if options['clear']:
            self.stdout.write("\n🗑️ Clearing ALL cache...")
            cache.clear()
            self.stdout.write(self.style.SUCCESS("✅ All cache cleared!"))
            return
        
        # Invalidate analytics cache
        if options['invalidate']:
            self.stdout.write("\n🗑️ Invalidating analytics cache...")
            deleted = invalidate_analytics_cache()
            self.stdout.write(self.style.SUCCESS(f"✅ Invalidated {deleted} keys!"))
            return
        
        # Invalidate vendor cache
        if options['vendors']:
            self.stdout.write("\n🗑️ Invalidating vendor/restaurant cache...")
            deleted = invalidate_vendor_cache()
            self.stdout.write(self.style.SUCCESS(f"✅ Invalidated {deleted} vendor keys!"))
            return
        
        # Invalidate stay cache
        if options['stays']:
            self.stdout.write("\n🗑️ Invalidating stay/accommodation cache...")
            deleted = invalidate_stay_cache()
            self.stdout.write(self.style.SUCCESS(f"✅ Invalidated {deleted} stay keys!"))
            return
        
        # Display cache stats (default)
        self.stdout.write("\n📈 Cache Statistics:")
        self.stdout.write("-" * 60)
        
        try:
            stats = get_cache_stats()
            
            if 'error' in stats:
                self.stdout.write(self.style.ERROR(f"❌ Error: {stats['error']}"))
                self.stdout.write(self.style.WARNING("\n💡 Make sure Redis is running:"))
                self.stdout.write("   redis-server")
                return
            
            self.stdout.write(f"Total Keys: {stats['total_keys']}")
            self.stdout.write(f"Cache Hits: {stats['hits']}")
            self.stdout.write(f"Cache Misses: {stats['misses']}")
            self.stdout.write(f"Hit Rate: {stats['hit_rate']:.2%}")
            
            # Interpret hit rate
            if stats['hit_rate'] > 0.8:
                self.stdout.write(self.style.SUCCESS("\n✅ Excellent cache performance!"))
            elif stats['hit_rate'] > 0.5:
                self.stdout.write(self.style.WARNING("\n⚠️ Good cache performance"))
            else:
                self.stdout.write(self.style.WARNING("\n⚠️ Cache could be more effective"))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"\n❌ Error: {e}"))
            self.stdout.write(self.style.WARNING("\n💡 Make sure Redis is running and django-redis is installed:"))
            self.stdout.write("   redis-server")
            self.stdout.write("   pip install django-redis")
        
        # Usage examples
        self.stdout.write("\n" + "=" * 60)
        self.stdout.write("📝 Usage Examples:")
        self.stdout.write("-" * 60)
        self.stdout.write("python manage.py cache_status           # View stats")
        self.stdout.write("python manage.py cache_status --clear   # Clear all")
        self.stdout.write("python manage.py cache_status --invalidate  # Invalidate analytics")
        self.stdout.write("python manage.py cache_status --vendors # Invalidate vendors")
        self.stdout.write("python manage.py cache_status --stays   # Invalidate stays")
        self.stdout.write("=" * 60)
