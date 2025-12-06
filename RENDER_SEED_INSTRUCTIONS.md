# Populate Render Production Database with All Kedah Places

## Current Status
- **Local DB:** 20 places (from Django admin screenshot)
- **Render Production:** Only 5 places
- **Problem:** Visitors to your site only see 5 places instead of all 20 Kedah tourism spots

## Solution: Run Seed Script on Render

### Step 1: Access Render Shell
1. Go to: https://dashboard.render.com
2. Click on "tourism-analytics-backend" service
3. Click the **"Shell"** button at the top right
4. A terminal will open

### Step 2: Run the Seed Script
In the Render Shell terminal, run:

```bash
python seed.py
```

This will:
- Create all 20+ Kedah tourism places
- Generate social media posts for each place
- Calculate engagement metrics
- Set up proper analytics data

### Step 3: Verify
After seeding, check the data:

```bash
python manage.py shell -c "from analytics.models import Place, SocialPost; print(f'Places: {Place.objects.count()}'); print(f'Posts: {SocialPost.objects.count()}')"
```

Expected output:
- Places: 20+
- Posts: 60+

### Step 4: Test Frontend
Go to: https://tourism-analytics-dashboard.vercel.app/

Click the **"Destinations"** tab and you should see all 20 Kedah places!

## Alternative: Add Specific Alor Setar Places

If seed.py doesn't have all places, you can add them manually in Render Shell:

```bash
python add_alor_setar_places.py
python add_alor_setar_social_posts.py
```

These scripts add famous Kedah landmarks like:
- Al-Bukhary Mosque
- Alor Setar Tower
- Zahir Mosque  
- Royal Museum
- And more...

## Troubleshooting

**If seed.py fails:**
Try running migrations first:
```bash
python manage.py migrate
```

**If you see "command not found":**
The file might not exist. Check with:
```bash
ls -la *.py
```

**To see what places are currently in production:**
```bash
python manage.py shell -c "from analytics.models import Place; [print(f'{p.id}: {p.name} - {p.city}') for p in Place.objects.all()]"
```

