#!/bin/bash
# Script to start the Django backend server

echo "🚀 Starting Tourism Analytics Backend..."
echo "============================================"

cd "$(dirname "$0")/backend" || exit 1

echo "📍 Current directory: $(pwd)"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "📥 Installing dependencies..."
pip install --quiet --upgrade pip
pip install --quiet django djangorestframework django-cors-headers pillow

echo ""
echo "✅ Dependencies installed!"
echo ""

# Start server
echo "🌐 Starting Django server on http://localhost:8000..."
echo "============================================"
python manage.py runserver 8000
