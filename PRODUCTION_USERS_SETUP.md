# 🚀 Production User Setup Guide

## Problem
Your test accounts work locally (SQLite) but not in production (PostgreSQL on Render/Vercel) because the databases are separate.

## Solution
Run the user creation script on your production server.

---

## 📋 For Render Deployment

### Option 1: Using Render Shell (Recommended)

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your backend service
3. Click **Shell** tab (top right)
4. Run these commands:

```bash
# Navigate to backend directory
cd backend

# Run the user creation script
python create_production_users.py
```

### Option 2: Using Django Management Command

```bash
# In Render shell
cd backend
python manage.py shell < create_production_users.py
```

---

## 📋 For Vercel Deployment

Vercel doesn't provide direct shell access, so you need to:

### Option 1: Add to Build/Deploy Script

1. Update your `package.json` or create a post-deploy hook
2. Add this to run after migrations:

```json
{
  "scripts": {
    "deploy": "python backend/create_production_users.py"
  }
}
```

### Option 2: Use Vercel CLI Locally

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Run command on production
vercel env pull .env.production
# Then connect to production DB and run:
python backend/create_production_users.py
```

### Option 3: Connect to Production Database Locally

1. Get your production `DATABASE_URL` from Vercel/Render environment variables
2. Run locally:

```bash
# Set production database URL temporarily
export DATABASE_URL="your-production-database-url"

# Run the script
cd backend
python create_production_users.py

# Unset when done
unset DATABASE_URL
```

---

## ⚡ Quick Method (Recommended)

**Add to your seed data or migration:**

Create a Django management command:

```bash
# backend/users/management/commands/create_test_users.py
```

Then run on production:
```bash
python manage.py create_test_users
```

---

## 🔐 Credentials Created

After running the script, these accounts will be available in production:

**Admin:**
- Username: `admin` / Password: `admin123`

**Vendors:**
- Username: `vendor1` / Password: `vendor123`
- Username: `vendor2` / Password: `vendor123`
- Username: `OuryRestau` / Password: `vendor123`

**Stay Owners:**
- Username: `stayowner1` / Password: `stay123`
- Username: `stayowner2` / Password: `stay123`
- Username: `NaimFOOD` / Password: `stay123`

---

## ✅ Verification

After running the script, test login at your production URL:

```bash
curl -X POST https://your-production-url.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

Should return JWT tokens if successful!

---

## 📝 Alternative: Include in Seed Data

Add this to `backend/seed.py` so users are created whenever you seed the database:

```python
# At the top of seed.py, add the user creation code
# Then on production, run: python seed.py
```

This way users are created automatically with all other seed data.
