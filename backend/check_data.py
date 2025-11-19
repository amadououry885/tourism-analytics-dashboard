#!/usr/bin/env python
"""Check database data for debugging city filtering"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')
django.setup()

from analytics.models import SocialPost, Place

print("=" * 60)
print("DATABASE CONTENT CHECK")
print("=" * 60)

print("\n=== SOCIAL POSTS ===")
posts = SocialPost.objects.all()
print(f"Total posts in database: {posts.count()}")
print()

total_likes = 0
total_comments = 0
total_shares = 0

for p in posts:
    print(f"Place: {p.place.name}")
    print(f"  Content: {p.content[:50]}...")
    print(f"  Likes: {p.likes}, Comments: {p.comments}, Shares: {p.shares}")
    print(f"  Created: {p.created_at}")
    print()
    
    total_likes += p.likes or 0
    total_comments += p.comments or 0
    total_shares += p.shares or 0

print(f"\n=== TOTALS (ALL CITIES) ===")
print(f"Total Likes: {total_likes}")
print(f"Total Comments: {total_comments}")
print(f"Total Shares: {total_shares}")
print(f"Total Posts: {posts.count()}")

print("\n=== PLACES ===")
places = Place.objects.all()
print(f"Total places: {places.count()}")
print()

for pl in places:
    place_posts = SocialPost.objects.filter(place=pl)
    post_count = place_posts.count()
    
    if post_count > 0:
        place_likes = sum(p.likes or 0 for p in place_posts)
        place_comments = sum(p.comments or 0 for p in place_posts)
        place_shares = sum(p.shares or 0 for p in place_posts)
        
        print(f"{pl.name}:")
        print(f"  Posts: {post_count}")
        print(f"  Likes: {place_likes}, Comments: {place_comments}, Shares: {place_shares}")
    else:
        print(f"{pl.name}: No posts")

print("\n" + "=" * 60)
