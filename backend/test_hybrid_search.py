"""
Test hybrid search endpoint
Run with: python test_hybrid_search.py
"""
import os
import sys
import django
import json

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')
django.setup()

from stays.views import StayViewSet
from rest_framework.test import APIRequestFactory

# Create a request factory
factory = APIRequestFactory()

# Test 1: All stays
print("=" * 60)
print("TEST 1: Hybrid Search - All Stays")
print("=" * 60)
request = factory.get('/api/stays/hybrid_search/')
view = StayViewSet.as_view({'get': 'hybrid_search'})
response = view(request)
response.render()
data = json.loads(response.content)

print(f"✅ Total Count: {data['count']}")
print(f"✅ Internal Count: {data['internal_count']}")
print(f"✅ External Count: {data['external_count']}")
print(f"\n📋 Stays:")
for i, stay in enumerate(data['results'][:5], 1):
    stay_type = "🟢 Internal" if stay.get('is_internal') else "🔵 External"
    print(f"   {i}. {stay_type} - {stay['name']} ({stay['district']}) - RM {stay['priceNight']}/night")
    if stay.get('is_internal'):
        print(f"      📧 {stay.get('contact_email', 'N/A')}")
        print(f"      📞 {stay.get('contact_phone', 'N/A')}")

# Test 2: Filter by district
print("\n" + "=" * 60)
print("TEST 2: Filter by District - Langkawi")
print("=" * 60)
request = factory.get('/api/stays/hybrid_search/?district=Langkawi')
response = view(request)
response.render()
data = json.loads(response.content)

print(f"✅ Total Count: {data['count']}")
print(f"✅ Internal Count: {data['internal_count']}")
print(f"✅ External Count: {data['external_count']}")
print(f"\n📋 Stays in Langkawi:")
for i, stay in enumerate(data['results'], 1):
    stay_type = "🟢 Internal" if stay.get('is_internal') else "🔵 External"
    print(f"   {i}. {stay_type} - {stay['name']} - RM {stay['priceNight']}/night")

# Test 3: Filter by price range
print("\n" + "=" * 60)
print("TEST 3: Filter by Price Range - RM 100-200")
print("=" * 60)
request = factory.get('/api/stays/hybrid_search/?min_price=100&max_price=200')
response = view(request)
response.render()
data = json.loads(response.content)

print(f"✅ Total Count: {data['count']}")
print(f"✅ Internal Count: {data['internal_count']}")
print(f"✅ External Count: {data['external_count']}")
print(f"\n📋 Stays in RM 100-200 range:")
for i, stay in enumerate(data['results'], 1):
    stay_type = "🟢 Internal" if stay.get('is_internal') else "🔵 External"
    print(f"   {i}. {stay_type} - {stay['name']} - RM {stay['priceNight']}/night")

# Test 4: Filter by rating
print("\n" + "=" * 60)
print("TEST 4: Filter by Rating - 4+ Stars")
print("=" * 60)
request = factory.get('/api/stays/hybrid_search/?min_rating=4')
response = view(request)
response.render()
data = json.loads(response.content)

print(f"✅ Total Count: {data['count']}")
print(f"✅ Internal Count: {data['internal_count']}")
print(f"✅ External Count: {data['external_count']}")
print(f"\n📋 4+ Star Stays:")
for i, stay in enumerate(data['results'], 1):
    stay_type = "🟢 Internal" if stay.get('is_internal') else "🔵 External"
    rating = stay.get('rating', 0)
    print(f"   {i}. {stay_type} - {stay['name']} - ⭐ {rating} - RM {stay['priceNight']}/night")

print("\n" + "=" * 60)
print("🎉 All Tests Completed!")
print("=" * 60)
