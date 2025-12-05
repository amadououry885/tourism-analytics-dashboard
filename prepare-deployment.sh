#!/bin/bash
# Deployment Preparation Script
# Prepares your project for Vercel + Render deployment

echo "════════════════════════════════════════════════════════════════"
echo "🚀 PREPARING FOR PRODUCTION DEPLOYMENT"
echo "════════════════════════════════════════════════════════════════"

cd /home/amadou-oury-diallo/tourism-analytics-dashboard

# Step 1: Check Git status
echo -e "\n📦 Step 1: Checking Git repository..."
if [ -d ".git" ]; then
    echo "✅ Git repository exists"
    echo "Current branch: $(git branch --show-current)"
    echo "Uncommitted changes: $(git status --short | wc -l) files"
else
    echo "⚠️  Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Tourism Analytics Dashboard with recurring events"
fi

# Step 2: Check if connected to GitHub
echo -e "\n🔗 Step 2: Checking GitHub remote..."
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ Connected to: $(git remote get-url origin)"
else
    echo "⚠️  Not connected to GitHub yet"
    echo "You'll need to:"
    echo "  1. Create repo at https://github.com/new"
    echo "  2. Run: git remote add origin YOUR_GITHUB_URL"
    echo "  3. Run: git push -u origin main"
fi

# Step 3: Create/Update production config files
echo -e "\n⚙️  Step 3: Creating production config files..."

# Create Vercel config for frontend
cat > frontend/vercel.json << 'EOL'
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-url.onrender.com/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
EOL
echo "✅ Created frontend/vercel.json"

# Create Render config for backend
cat > backend/render.yaml << 'EOL'
services:
  - type: web
    name: tourism-analytics-backend
    env: python
    buildCommand: "pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate"
    startCommand: "gunicorn tourism_api.wsgi:application"
    envVars:
      - key: DJANGO_SETTINGS_MODULE
        value: tourism_api.settings
      - key: PYTHON_VERSION
        value: 3.12.3
      - key: DATABASE_URL
        fromDatabase:
          name: tourism_analytics_db
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: false
      - key: ALLOWED_HOSTS
        value: ".onrender.com"

databases:
  - name: tourism_analytics_db
    databaseName: tourism_analytics
    user: tourism_user
EOL
echo "✅ Created backend/render.yaml"

# Update requirements.txt with production dependencies
echo -e "\n📋 Step 4: Updating backend dependencies..."
cat > backend/requirements-production.txt << 'EOL'
# Existing dependencies from requirements.txt
Django>=5.0
djangorestframework>=3.14
django-cors-headers>=4.0
celery>=5.3
redis>=4.5
psycopg2-binary>=2.9  # PostgreSQL adapter
gunicorn>=21.2  # Production WSGI server
whitenoise>=6.5  # Static file serving
python-dateutil>=2.8
dj-database-url>=2.1  # Database URL parsing
EOL
echo "✅ Created requirements-production.txt"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ PREPARATION COMPLETE!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1️⃣  PUSH TO GITHUB (if not already):"
echo "   git add ."
echo "   git commit -m 'Prepare for deployment'"
echo "   git push origin main"
echo ""
echo "2️⃣  DEPLOY BACKEND (Render.com):"
echo "   • Go to: https://dashboard.render.com/register"
echo "   • Click 'New +' → 'Web Service'"
echo "   • Connect your GitHub repo"
echo "   • Select 'tourism-analytics-dashboard/backend'"
echo "   • Render auto-detects Django!"
echo "   • Click 'Create Web Service'"
echo "   • Copy the backend URL (https://xxx.onrender.com)"
echo ""
echo "3️⃣  DEPLOY FRONTEND (Vercel.com):"
echo "   • Go to: https://vercel.com/new"
echo "   • Import your GitHub repo"
echo "   • Framework: Vite"
echo "   • Root directory: frontend"
echo "   • Add environment variable:"
echo "     VITE_API_URL = https://your-backend-url.onrender.com"
echo "   • Click Deploy"
echo ""
echo "4️⃣  UPDATE BACKEND CORS:"
echo "   • In Render dashboard → Environment"
echo "   • Add: ALLOWED_HOSTS = .vercel.app,.onrender.com"
echo "   • Add: CORS_ALLOWED_ORIGINS = https://your-app.vercel.app"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🎉 Your app will be live at:"
echo "   https://your-app.vercel.app"
echo "════════════════════════════════════════════════════════════════"
