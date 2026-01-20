"""
Add social media posts for new Alor Setar destinations
"""
import os
import django
from datetime import timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')
django.setup()

from django.utils import timezone
from analytics.models import Place, SocialPost

# Get all Alor Setar places that don't have posts yet
alor_setar_places = Place.objects.filter(city='Alor Setar')

# Sample social post templates
post_templates = {
    'Shopping': [
        "Amazing shopping experience at {name}! So many great stores 🛍️",
        "Spent the afternoon at {name}. Highly recommend! 🏬",
        "Great deals and variety at {name}! Perfect shopping destination 💯",
    ],
    'Religious Site': [
        "Beautiful architecture at {name}. A must-visit! 🕌",
        "Peaceful and serene atmosphere at {name} ☮️",
        "The {name} is absolutely stunning! Spiritual experience 🙏",
    ],
    'Museum': [
        "Learned so much at {name}! Great exhibits 📚",
        "Fascinating history at {name}. Worth the visit! 🏛️",
        "Amazing collection at {name}! Educational and fun 🎨",
    ],
    'Landmark': [
        "Breathtaking views from {name}! 🌆",
        "Visited {name} today. Absolutely spectacular! 📸",
        "The {name} is iconic! A must-see attraction ⭐",
    ],
    'Historical': [
        "Rich history at {name}. Very impressive! 🏰",
        "Stepping back in time at {name}. Wonderful experience 📜",
        "Cultural heritage at its finest - {name} 🎭",
    ],
    'Art & Culture': [
        "Beautiful art at {name}! Inspiring collection 🎨",
        "Loved the exhibits at {name}. So creative! 🖼️",
        "Cultural gem - {name} is fantastic! 👏",
    ],
    'Park & Recreation': [
        "Lovely afternoon at {name}! Great for families 🌳",
        "Beautiful scenery at {name}. Perfect for relaxation 🌺",
        "Enjoyed the peaceful atmosphere at {name} 🏞️",
    ],
    'Sports & Recreation': [
        "Great facilities at {name}! 🏟️",
        "Exciting match at {name} today! ⚽",
        "Amazing atmosphere at {name}! 🎉",
    ],
    'Market': [
        "Found some treasures at {name}! 🛒",
        "Great bargains at {name}. Love the local vibe! 💰",
        "Unique finds at {name}! A shopper's paradise 🎁",
    ],
}

default_templates = [
    "Had an amazing time at {name}! Highly recommend 👍",
    "Great place to visit - {name} ⭐⭐⭐⭐⭐",
    "Loved visiting {name}! Will come back again 💖",
]

print("Adding social posts for Alor Setar destinations...")
print("=" * 60)

total_posts = 0

for place in alor_setar_places:
    # Check if place already has posts
    existing_posts = SocialPost.objects.filter(place=place).count()
    
    if existing_posts > 0:
        print(f"⏭️  Skipped: {place.name} (already has {existing_posts} posts)")
        continue
    
    # Get templates for this category
    templates = post_templates.get(place.category, default_templates)
    
    # Create 2-5 posts for each place
    num_posts = random.randint(2, 5)
    
    for i in range(num_posts):
        # Pick a random template
        template = random.choice(templates)
        content = template.format(name=place.name)
        
        # Random date within last 30 days (timezone-aware)
        days_ago = random.randint(1, 30)
        post_date = timezone.now() - timedelta(days=days_ago)
        
        # Random engagement numbers
        likes = random.randint(50, 500)
        comments = random.randint(5, 50)
        shares = random.randint(2, 30)
        
        # Random platform
        platform = random.choice(['Instagram', 'Facebook', 'Twitter'])
        
        # Create post
        SocialPost.objects.create(
            platform=platform,
            post_id=f"{platform.lower()}_{place.id}_{i}_{int(post_date.timestamp())}",
            url=f"https://{platform.lower()}.com/posts/{place.id}/{i}",
            content=content,
            place=place,
            likes=likes,
            comments=comments,
            shares=shares,
            created_at=post_date
        )
        
        total_posts += 1
    
    print(f"✓ Added {num_posts} posts for: {place.name} ({place.category})")

print("=" * 60)
print(f"\n✅ Complete!")
print(f"   Total social posts added: {total_posts}")
print(f"\nNow all Alor Setar destinations will appear in the Popular Places list!")
