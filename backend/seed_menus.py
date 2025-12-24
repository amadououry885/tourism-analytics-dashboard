#!/usr/bin/env python3
"""
Seed menu items for restaurants in Kedah Tourism database
"""
import os
import sys
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tourism_api.settings')
django.setup()

from vendors.models import Vendor, MenuItem

# Sample menu items by cuisine type
MENU_TEMPLATES = {
    'Coffee Shop': [
        {'name': 'Kopi O', 'category': 'Hot Beverages', 'price': 2.50, 'description': 'Traditional black coffee'},
        {'name': 'Kopi C', 'category': 'Hot Beverages', 'price': 3.00, 'description': 'Coffee with evaporated milk'},
        {'name': 'Teh Tarik', 'category': 'Hot Beverages', 'price': 2.80, 'description': 'Pulled milk tea'},
        {'name': 'Milo Ais', 'category': 'Cold Beverages', 'price': 4.00, 'description': 'Iced chocolate malt drink'},
        {'name': 'Roti Bakar', 'category': 'Snacks', 'price': 3.50, 'description': 'Toasted bread with butter & kaya'},
        {'name': 'Nasi Lemak', 'category': 'Main Course', 'price': 6.00, 'description': 'Coconut rice with sambal, egg, anchovies'},
        {'name': 'Mee Goreng', 'category': 'Main Course', 'price': 7.00, 'description': 'Fried noodles with vegetables'},
    ],
    'Malaysian': [
        {'name': 'Nasi Lemak Special', 'category': 'Main Course', 'price': 12.00, 'description': 'Coconut rice with rendang, sambal, egg'},
        {'name': 'Char Kuey Teow', 'category': 'Main Course', 'price': 10.00, 'description': 'Stir-fried flat rice noodles'},
        {'name': 'Laksa Kedah', 'category': 'Main Course', 'price': 9.00, 'description': 'Local fish-based laksa'},
        {'name': 'Ayam Goreng Berempah', 'category': 'Main Course', 'price': 15.00, 'description': 'Spiced fried chicken'},
        {'name': 'Rendang Daging', 'category': 'Main Course', 'price': 18.00, 'description': 'Slow-cooked beef in coconut'},
        {'name': 'Teh O Ais Limau', 'category': 'Beverages', 'price': 4.00, 'description': 'Iced lime tea'},
        {'name': 'Air Sirap', 'category': 'Beverages', 'price': 3.50, 'description': 'Rose syrup drink'},
    ],
    'Thai': [
        {'name': 'Tom Yam Kung', 'category': 'Soup', 'price': 18.00, 'description': 'Spicy prawn soup with lemongrass', 'spiciness': 3},
        {'name': 'Pad Thai', 'category': 'Main Course', 'price': 15.00, 'description': 'Stir-fried rice noodles with prawns'},
        {'name': 'Green Curry Chicken', 'category': 'Main Course', 'price': 16.00, 'description': 'Chicken in green curry', 'spiciness': 2},
        {'name': 'Mango Sticky Rice', 'category': 'Dessert', 'price': 12.00, 'description': 'Sweet sticky rice with fresh mango'},
        {'name': 'Thai Iced Tea', 'category': 'Beverages', 'price': 6.50, 'description': 'Sweet orange milk tea'},
        {'name': 'Som Tam', 'category': 'Appetizer', 'price': 10.00, 'description': 'Green papaya salad', 'spiciness': 4},
    ],
    'Japanese': [
        {'name': 'Salmon Sashimi', 'category': 'Sashimi', 'price': 28.00, 'description': 'Fresh salmon slices (8 pcs)'},
        {'name': 'California Roll', 'category': 'Sushi', 'price': 18.00, 'description': 'Crab, avocado, cucumber (8 pcs)'},
        {'name': 'Chicken Teriyaki Don', 'category': 'Donburi', 'price': 22.00, 'description': 'Grilled chicken on rice'},
        {'name': 'Ramen Tonkotsu', 'category': 'Noodles', 'price': 25.00, 'description': 'Pork bone broth ramen'},
        {'name': 'Tempura Udon', 'category': 'Noodles', 'price': 20.00, 'description': 'Udon with shrimp tempura'},
        {'name': 'Green Tea', 'category': 'Beverages', 'price': 5.00, 'description': 'Hot Japanese green tea'},
    ],
    'Chinese': [
        {'name': 'Sweet & Sour Chicken', 'category': 'Main Course', 'price': 18.00, 'description': 'Crispy chicken in tangy sauce'},
        {'name': 'Kung Pao Chicken', 'category': 'Main Course', 'price': 20.00, 'description': 'Spicy chicken with peanuts', 'spiciness': 2},
        {'name': 'Fried Rice', 'category': 'Rice', 'price': 12.00, 'description': 'Wok-fried rice with egg & vegetables'},
        {'name': 'Dim Sum Platter', 'category': 'Appetizer', 'price': 25.00, 'description': 'Assorted steamed dumplings'},
        {'name': 'Wonton Noodle Soup', 'category': 'Noodles', 'price': 14.00, 'description': 'Egg noodles with wontons'},
        {'name': 'Chinese Tea', 'category': 'Beverages', 'price': 3.00, 'description': 'Traditional pu-erh tea'},
    ],
    'Cafe': [
        {'name': 'Americano', 'category': 'Coffee', 'price': 8.00, 'description': 'Espresso with hot water'},
        {'name': 'Cappuccino', 'category': 'Coffee', 'price': 10.00, 'description': 'Espresso with steamed milk foam'},
        {'name': 'Latte', 'category': 'Coffee', 'price': 11.00, 'description': 'Espresso with steamed milk'},
        {'name': 'Matcha Latte', 'category': 'Specialty', 'price': 13.00, 'description': 'Japanese green tea with milk'},
        {'name': 'Avocado Toast', 'category': 'Brunch', 'price': 16.00, 'description': 'Sourdough with smashed avocado'},
        {'name': 'Club Sandwich', 'category': 'Main', 'price': 18.00, 'description': 'Triple-decker with chicken & bacon'},
        {'name': 'Cheesecake', 'category': 'Dessert', 'price': 14.00, 'description': 'New York style cheesecake'},
    ],
    'Fast Food': [
        {'name': 'Crispy Chicken', 'category': 'Main', 'price': 12.00, 'description': '2 pcs crispy fried chicken'},
        {'name': 'Chicken Burger', 'category': 'Burgers', 'price': 10.00, 'description': 'Crispy chicken patty burger'},
        {'name': 'Fries (Regular)', 'category': 'Sides', 'price': 5.00, 'description': 'Golden crispy fries'},
        {'name': 'Coleslaw', 'category': 'Sides', 'price': 4.00, 'description': 'Creamy cabbage salad'},
        {'name': 'Soft Drink', 'category': 'Beverages', 'price': 4.00, 'description': 'Choice of Coke, Sprite, Fanta'},
        {'name': 'Ice Cream Sundae', 'category': 'Dessert', 'price': 6.00, 'description': 'Vanilla with chocolate sauce'},
    ],
    'Western': [
        {'name': 'Grilled Chicken Chop', 'category': 'Main Course', 'price': 22.00, 'description': 'Marinated chicken with black pepper sauce'},
        {'name': 'Fish & Chips', 'category': 'Main Course', 'price': 25.00, 'description': 'Battered fish with fries & coleslaw'},
        {'name': 'Spaghetti Carbonara', 'category': 'Pasta', 'price': 18.00, 'description': 'Creamy pasta with bacon'},
        {'name': 'Mushroom Soup', 'category': 'Soup', 'price': 10.00, 'description': 'Creamy mushroom soup with bread'},
        {'name': 'Caesar Salad', 'category': 'Salad', 'price': 15.00, 'description': 'Romaine lettuce with Caesar dressing'},
    ],
    'Seafood': [
        {'name': 'Butter Prawns', 'category': 'Seafood', 'price': 35.00, 'description': 'Crispy prawns in butter sauce'},
        {'name': 'Steamed Fish', 'category': 'Seafood', 'price': 45.00, 'description': 'Fresh fish steamed with ginger'},
        {'name': 'Chili Crab', 'category': 'Seafood', 'price': 60.00, 'description': 'Crab in spicy tomato sauce', 'spiciness': 3},
        {'name': 'Salt & Pepper Squid', 'category': 'Seafood', 'price': 28.00, 'description': 'Crispy fried squid'},
        {'name': 'Garlic Butter Clams', 'category': 'Seafood', 'price': 25.00, 'description': 'Clams in garlic butter'},
    ],
    'BBQ': [
        {'name': 'BBQ Pork Ribs', 'category': 'Main', 'price': 38.00, 'description': 'Slow-cooked ribs with BBQ sauce'},
        {'name': 'Grilled Lamb Chop', 'category': 'Main', 'price': 42.00, 'description': 'Herb-marinated lamb chops'},
        {'name': 'Satay (10 sticks)', 'category': 'Grill', 'price': 15.00, 'description': 'Grilled meat skewers with peanut sauce'},
        {'name': 'BBQ Chicken Wings', 'category': 'Appetizer', 'price': 18.00, 'description': 'Smoky BBQ glazed wings'},
    ],
}

# Default menu for any cuisine not listed
DEFAULT_MENU = [
    {'name': 'House Special', 'category': 'Signature', 'price': 20.00, 'description': 'Chef\'s recommendation'},
    {'name': 'Set Meal A', 'category': 'Set Meals', 'price': 15.00, 'description': 'Main dish with rice & drink'},
    {'name': 'Set Meal B', 'category': 'Set Meals', 'price': 18.00, 'description': 'Main dish with sides & drink'},
    {'name': 'Fresh Juice', 'category': 'Beverages', 'price': 7.00, 'description': 'Orange, watermelon or mixed'},
    {'name': 'Hot Tea', 'category': 'Beverages', 'price': 3.00, 'description': 'Selection of teas'},
]

def get_menu_for_vendor(vendor):
    """Get appropriate menu items based on vendor's cuisines"""
    cuisines = vendor.cuisines or []
    menu_items = []
    
    for cuisine in cuisines:
        if cuisine in MENU_TEMPLATES:
            menu_items.extend(MENU_TEMPLATES[cuisine])
            break  # Use first matching cuisine
    
    # If no matching cuisine found, use default
    if not menu_items:
        menu_items = DEFAULT_MENU
    
    return menu_items

def seed_menus():
    """Seed menu items for all vendors that don't have menus"""
    vendors = Vendor.objects.filter(is_active=True)
    
    created_count = 0
    skipped_count = 0
    
    for vendor in vendors:
        # Skip if vendor already has menu items
        if vendor.menu_items.exists():
            skipped_count += 1
            continue
        
        menu_items = get_menu_for_vendor(vendor)
        
        for item_data in menu_items:
            # Add some price variation
            price_variation = random.uniform(0.9, 1.1)
            price = round(float(item_data['price']) * price_variation, 2)
            
            MenuItem.objects.create(
                vendor=vendor,
                name=item_data['name'],
                description=item_data.get('description', ''),
                category=item_data['category'],
                price=price,
                is_available=True,
                is_halal=True,
                spiciness_level=item_data.get('spiciness', 0),
            )
            created_count += 1
        
        print(f"✅ Added {len(menu_items)} menu items for {vendor.name}")
    
    print(f"\n{'='*50}")
    print(f"✅ Created {created_count} new menu items")
    print(f"⏭️  Skipped {skipped_count} vendors (already had menus)")

if __name__ == '__main__':
    print("🍽️  Seeding restaurant menus...")
    print("="*50)
    seed_menus()
    print("\n✅ Done!")
