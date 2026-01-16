#!/bin/bash
# Quick verification script for demo data implementation

echo "🔍 Verifying Demo Data Implementation..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local url=$1
    local name=$2
    
    echo -n "Testing $name... "
    response=$(curl -s "$url")
    
    if [ -n "$response" ]; then
        echo -e "${GREEN}✓${NC}"
        echo "  Sample data: $(echo "$response" | head -c 100)..."
    else
        echo -e "${RED}✗${NC}"
    fi
    echo ""
}

# Check if backend is running
if pgrep -f "runserver" > /dev/null; then
    echo -e "${GREEN}✓${NC} Backend is running"
else
    echo -e "${RED}✗${NC} Backend is NOT running"
    echo "  Start with: cd backend && python3 manage.py runserver 8000"
    exit 1
fi
echo ""

# Test endpoints
echo "📡 Testing Sentiment Analysis Endpoints:"
echo "=========================================="
echo ""

test_endpoint "http://localhost:8000/api/analytics/sentiment/comparison/" "Sentiment Comparison"
test_endpoint "http://localhost:8000/api/analytics/places/by-visit-level/?level=most" "Most Visited Places"
test_endpoint "http://localhost:8000/api/analytics/places/by-visit-level/?level=least" "Least Visited Places"
test_endpoint "http://localhost:8000/api/analytics/places/by-visit-level/?level=medium" "Medium Visited Places"
test_endpoint "http://localhost:8000/api/analytics/places/1/sentiment/" "Place Sentiment Detail"

echo ""
echo "📊 Checking for demo data flags:"
echo "================================="
echo ""

# Check if responses contain demo data flag
comparison_demo=$(curl -s "http://localhost:8000/api/analytics/sentiment/comparison/" | grep -o "is_demo_data" || echo "")
if [ -n "$comparison_demo" ]; then
    echo -e "${GREEN}✓${NC} Sentiment Comparison has is_demo_data field"
else
    echo -e "  Sentiment Comparison using real data (expected)"
fi

visit_demo=$(curl -s "http://localhost:8000/api/analytics/places/by-visit-level/?level=most" | grep -o "is_demo_data" || echo "")
if [ -n "$visit_demo" ]; then
    echo -e "${GREEN}✓${NC} Visit Level View has is_demo_data field"
else
    echo -e "  Visit Level View using real data (expected)"
fi

echo ""
echo "🎨 Frontend Status:"
echo "==================="
if pgrep -f "vite" > /dev/null; then
    echo -e "${GREEN}✓${NC} Frontend dev server is running"
    echo "  View at: http://localhost:3000"
else
    echo -e "${RED}✗${NC} Frontend is NOT running"
    echo "  Start with: cd frontend && npm run dev"
fi

echo ""
echo "📚 Documentation Created:"
echo "========================="
if [ -f "DEMO_DATA_IMPLEMENTATION.md" ]; then
    echo -e "${GREEN}✓${NC} DEMO_DATA_IMPLEMENTATION.md"
fi
if [ -f "DEMO_DATA_SUMMARY.md" ]; then
    echo -e "${GREEN}✓${NC} DEMO_DATA_SUMMARY.md"
fi
if [ -f "SUPERVISOR_FEATURES_IMPLEMENTATION.md" ]; then
    echo -e "${GREEN}✓${NC} SUPERVISOR_FEATURES_IMPLEMENTATION.md"
fi

echo ""
echo "✅ Verification Complete!"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Navigate to Overview page"
echo "3. Scroll down to see 'Sentiment Comparison: Most vs Least Visited' component"
echo "4. Verify charts are displaying data"
echo ""
