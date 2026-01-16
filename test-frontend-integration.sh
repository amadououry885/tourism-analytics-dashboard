#!/bin/bash
# Frontend Integration Test for Supervisor's Analytics Features

echo "🧪 Testing Frontend Integration for Supervisor's Analytics Features"
echo "=================================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2
    
    echo -n "Testing $description... "
    
    response=$(curl -s -w "\n%{http_code}" "http://localhost:8000$endpoint")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
        PASS=$((PASS + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $http_code)"
        echo "   Response: $body" | head -c 200
        FAIL=$((FAIL + 1))
        return 1
    fi
}

# Function to test JSON structure
test_json_structure() {
    local endpoint=$1
    local required_fields=$2
    local description=$3
    
    echo -n "Testing $description... "
    
    response=$(curl -s "http://localhost:8000$endpoint")
    
    # Check if all required fields exist
    all_found=true
    for field in $required_fields; do
        if ! echo "$response" | grep -q "\"$field\""; then
            all_found=false
            missing_field=$field
            break
        fi
    done
    
    if [ "$all_found" = true ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASS=$((PASS + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Missing field: $missing_field)"
        FAIL=$((FAIL + 1))
        return 1
    fi
}

echo "1️⃣  Backend API Endpoint Tests"
echo "--------------------------------"
test_endpoint "/api/analytics/sentiment/comparison/" "Sentiment Comparison API"
test_endpoint "/api/analytics/places/by-visit-level/?level=most" "Most Visited Places API"
test_endpoint "/api/analytics/places/by-visit-level/?level=least" "Least Visited Places API"
test_endpoint "/api/analytics/places/by-visit-level/?level=medium" "Medium Visited Places API"
test_endpoint "/api/analytics/places/7/sentiment/" "Place-Specific Sentiment API"
echo ""

echo "2️⃣  JSON Structure Tests"
echo "--------------------------------"
test_json_structure "/api/analytics/sentiment/comparison/" "comparison insights methodology" "Comparison response structure"
test_json_structure "/api/analytics/places/by-visit-level/?level=most" "level places aggregate_stats" "Visit level response structure"
test_json_structure "/api/analytics/places/7/sentiment/" "place_id sentiment_summary rating engagement_stats" "Place sentiment response structure"
echo ""

echo "3️⃣  Data Validation Tests"
echo "--------------------------------"

# Test that most visited has higher engagement than least visited
echo -n "Testing engagement logic (most > least)... "
most_engagement=$(curl -s "http://localhost:8000/api/analytics/places/by-visit-level/?level=most" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['aggregate_stats']['total_engagement'])")
least_engagement=$(curl -s "http://localhost:8000/api/analytics/places/by-visit-level/?level=least" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['aggregate_stats']['total_engagement'])")

if [ "$most_engagement" -gt "$least_engagement" ]; then
    echo -e "${GREEN}✅ PASS${NC} (Most: $most_engagement > Least: $least_engagement)"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ FAIL${NC} (Most: $most_engagement, Least: $least_engagement)"
    FAIL=$((FAIL + 1))
fi

# Test that insights are generated
echo -n "Testing AI insights generation... "
insights_count=$(curl -s "http://localhost:8000/api/analytics/sentiment/comparison/" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data['insights']))")
if [ "$insights_count" -gt 0 ]; then
    echo -e "${GREEN}✅ PASS${NC} ($insights_count insights generated)"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ FAIL${NC} (No insights generated)"
    FAIL=$((FAIL + 1))
fi

echo ""

echo "4️⃣  Frontend Component Check"
echo "--------------------------------"

# Check if SentimentComparison component exists
if [ -f "frontend/src/components/SentimentComparison.tsx" ]; then
    echo -e "${GREEN}✅ PASS${NC} SentimentComparison.tsx exists"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ FAIL${NC} SentimentComparison.tsx not found"
    FAIL=$((FAIL + 1))
fi

# Check if component is imported in Overview
if grep -q "SentimentComparison" "frontend/src/pages/Overview.tsx"; then
    echo -e "${GREEN}✅ PASS${NC} SentimentComparison imported in Overview.tsx"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ FAIL${NC} SentimentComparison not imported in Overview.tsx"
    FAIL=$((FAIL + 1))
fi

# Check if component is rendered in Overview
if grep -q "<SentimentComparison" "frontend/src/pages/Overview.tsx"; then
    echo -e "${GREEN}✅ PASS${NC} SentimentComparison rendered in Overview.tsx"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ FAIL${NC} SentimentComparison not rendered in Overview.tsx"
    FAIL=$((FAIL + 1))
fi

echo ""

echo "5️⃣  Configuration Check"
echo "--------------------------------"

# Check axios configuration
if grep -q "'/api'" "frontend/src/services/api.ts"; then
    echo -e "${GREEN}✅ PASS${NC} Axios configured with /api prefix"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ FAIL${NC} Axios not properly configured"
    FAIL=$((FAIL + 1))
fi

# Check Vite proxy configuration
if grep -q "'/api'" "frontend/vite.config.ts"; then
    echo -e "${GREEN}✅ PASS${NC} Vite proxy configured for /api"
    PASS=$((PASS + 1))
else
    echo -e "${RED}❌ FAIL${NC} Vite proxy not configured"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "=================================================================="
echo "📊 Test Results Summary"
echo "=================================================================="
echo -e "Total Tests: $((PASS + FAIL))"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Frontend integration is complete.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please review the errors above.${NC}"
    exit 1
fi
