"""
Background Tasks (Celery)
==========================
Orchestrates the social media data collection process.
Runs automatically on a schedule (e.g., every hour).
"""

from celery import shared_task  # ✅ ADD THIS IMPORT

# For Django projects, you would use Celery like this:
# from celery import shared_task

# For now, this is a standalone script you can run manually or schedule with cron

import os
import sys
import django
from datetime import datetime

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')
django.setup()

from analytics.scraper import SocialMediaScraper
from analytics.classifier import PostClassifier
from analytics.models import Place, SocialPost


@shared_task  # ✅ ADD THIS DECORATOR
def collect_and_process_social_posts():
    """
    Main function that:
    1. Fetches posts from social media
    2. Classifies them with AI
    3. Stores them in the database
    
    This runs automatically based on the schedule in celery.py
    """
    print("=" * 60)
    print("🚀 STARTING SOCIAL MEDIA COLLECTION TASK")
    print("=" * 60)
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Step 1: Get all places from database to use as keywords
    places = Place.objects.all()
    keywords = [place.name for place in places]
    
    if not keywords:
        print("⚠️ No places found in database! Add some places first.")
        return
    
    print(f"📍 Found {len(keywords)} places in database:")
    for keyword in keywords:
        print(f"   - {keyword}")
    print()
    
    # Step 2: Initialize scraper and classifier
    scraper = SocialMediaScraper()
    classifier = PostClassifier(places_list=keywords)
    
    # Step 3: Scrape posts from all platforms
    print("🕷️ Scraping social media posts...")
    raw_posts = scraper.search_all_platforms(keywords, max_results_per_platform=10)
    print(f"✅ Collected {len(raw_posts)} raw posts from social media.\n")
    
    # Step 4: Process each post
    tourism_posts_added = 0
    non_tourism_posts_skipped = 0
    
    for post_data in raw_posts:
        print(f"\n{'='*60}")
        print(f"📝 Processing {post_data['platform'].upper()} post...")
        print(f"   Content: {post_data['content'][:80]}...")
        
        # Step 4a: Classify with AI
        classification = classifier.classify_post(post_data['content'])
        
        if classification['is_tourism']:
            print(f"   ✅ Tourism: YES (confidence: {classification['confidence']})")
            print(f"   📍 Place: {classification['place_name']}")
            print(f"   😊 Sentiment: {classification['sentiment']}")
            
            # Step 4b: Find the Place object in database
            try:
                if classification['place_name']:
                    place_obj = Place.objects.get(name__iexact=classification['place_name'])
                else:
                    print("   ⚠️ No specific place identified. Skipping.")
                    non_tourism_posts_skipped += 1
                    continue
                
                # Step 4c: Store in database (update if already exists)
                social_post, created = SocialPost.objects.update_or_create(
                    platform=post_data['platform'],
                    post_id=post_data['post_id'],
                    defaults={
                        'place': place_obj,
                        'content': post_data['content'],
                        'url': post_data['url'],
                        'created_at': post_data['created_at'],
                        'likes': post_data['likes'],
                        'comments': post_data['comments'],
                        'shares': post_data['shares'],
                        'views': post_data['views'],
                        'is_tourism': True,
                        'extra': {
                            'sentiment': classification['sentiment'],
                            'confidence': classification['confidence']
                        }
                    }
                )
                
                if created:
                    print(f"   ✨ NEW POST SAVED to database!")
                    tourism_posts_added += 1
                else:
                    print(f"   🔄 Post already exists. Updated metrics.")
                
            except Place.DoesNotExist:
                print(f"   ⚠️ Place '{classification['place_name']}' not found in database. Skipping.")
                non_tourism_posts_skipped += 1
                
        else:
            print(f"   ❌ Tourism: NO (not relevant)")
            non_tourism_posts_skipped += 1
    
    # Step 5: Summary
    print("\n" + "=" * 60)
    print("📊 TASK COMPLETED!")
    print("=" * 60)
    print(f"✅ Tourism posts added: {tourism_posts_added}")
    print(f"❌ Non-tourism posts skipped: {non_tourism_posts_skipped}")
    print(f"📦 Total posts processed: {len(raw_posts)}")
    print(f"⏰ Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)


# Run the task when this script is executed
if __name__ == "__main__":
    try:
        collect_and_process_social_posts()
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

