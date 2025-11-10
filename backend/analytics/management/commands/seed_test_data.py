from django.core.management.base import BaseCommand
from django.utils import timezone
from analytics.models import Place, SocialPost
from datetime import datetime, timedelta
import random
from django.db.models import Sum

class Command(BaseCommand):
    help = 'Seeds test data for Langkawi with last 30 days of social media activity'

    def handle(self, *args, **kwargs):
        # Create or get Langkawi place
        langkawi, created = Place.objects.get_or_create(
            name='Langkawi',
            defaults={
                'description': 'Beautiful island in Kedah, Malaysia',
                'category': 'Island',
                'latitude': 6.3500,
                'longitude': 99.8000,
                'is_in_kedah': True
            }
        )
        
        self.stdout.write(f'Using place: {langkawi.name}')
        
        # Generate data for last 30 days
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)
        
        # Clear existing test data for Langkawi in this period
        SocialPost.objects.filter(
            place=langkawi,
            created_at__gte=start_date
        ).delete()
        
        posts_created = 0
        current_date = start_date
        
        # Create posts for each day
        while current_date <= end_date:
            # Number of posts per day (random between 100-300)
            daily_posts = random.randint(100, 300)
            
            for i in range(daily_posts):
                # Random time during the day
                random_hour = random.randint(0, 23)
                random_minute = random.randint(0, 59)
                post_time = timezone.make_aware(
                    datetime(
                        current_date.year, current_date.month, current_date.day,
                        random_hour, random_minute
                    )
                )
                
                # Random engagement metrics
                likes = random.randint(10, 500)
                comments = random.randint(5, 100)
                shares = random.randint(2, 50)
                
                # Random platform
                platform = random.choice(['Instagram', 'Facebook', 'TikTok', 'Twitter'])
                
                SocialPost.objects.create(
                    place=langkawi,
                    platform=platform,
                    post_id=f'test_post_{current_date.strftime("%Y%m%d")}_{i}',
                    content=f'Amazing visit to Langkawi! #{langkawi.name.lower()}',
                    likes=likes,
                    comments=comments,
                    shares=shares,
                    created_at=post_time
                )
                posts_created += 1
            
            current_date += timedelta(days=1)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {posts_created} social posts for {langkawi.name} over last 30 days'
            )
        )
        
        # Print summary statistics
        total_likes = SocialPost.objects.filter(place=langkawi).aggregate(total=Sum('likes'))['total'] or 0
        total_comments = SocialPost.objects.filter(place=langkawi).aggregate(total=Sum('comments'))['total'] or 0
        total_shares = SocialPost.objects.filter(place=langkawi).aggregate(total=Sum('shares'))['total'] or 0
        
        self.stdout.write(f'\nSummary for Langkawi:')
        self.stdout.write(f'Total Posts: {posts_created}')
        self.stdout.write(f'Total Likes: {total_likes:,}')
        self.stdout.write(f'Total Comments: {total_comments:,}')
        self.stdout.write(f'Total Shares: {total_shares:,}')
        self.stdout.write(f'Total Engagement: {(total_likes + total_comments + total_shares):,}')

