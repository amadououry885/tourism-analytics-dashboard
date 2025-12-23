#!/bin/bash

echo "=== Testing Frontend <-> Backend Integration ==="
echo ""

echo "1. Backend Direct (port 8000):"
echo "   Events: $(curl -s http://localhost:8000/api/events/ | jq -r '.count' 2>/dev/null || echo 'FAILED')"
echo "   Vendors: $(curl -s http://localhost:8000/api/vendors/ | jq -r '.count' 2>/dev/null || echo 'FAILED')"
echo "   Stays: $(curl -s http://localhost:8000/api/stays/ | jq -r '.count' 2>/dev/null || echo 'FAILED')"
echo "   Places: $(curl -s http://localhost:8000/api/places/ | jq -r '.count' 2>/dev/null || echo 'FAILED')"
echo ""

echo "2. Frontend Proxy (port 3000):"
timeout 5 curl -s http://localhost:3000/api/events/ > /tmp/frontend-events.json 2>&1
if [ $? -eq 0 ]; then
  echo "   Events: $(cat /tmp/frontend-events.json | jq -r '.count' 2>/dev/null || echo 'PARSING FAILED')"
else
  echo "   Events: TIMEOUT/FAILED"
fi

timeout 5 curl -s http://localhost:3000/api/vendors/ > /tmp/frontend-vendors.json 2>&1
if [ $? -eq 0 ]; then
  echo "   Vendors: $(cat /tmp/frontend-vendors.json | jq -r '.count' 2>/dev/null || echo 'PARSING FAILED')"
else
  echo "   Vendors: TIMEOUT/FAILED"
fi
echo ""

echo "3. Servers Running:"
ps aux | grep "python.*runserver" | grep -v grep | wc -l | xargs echo "   Backend processes:"
ps aux | grep -E "node.*vite|npm.*dev" | grep -v grep | wc -l | xargs echo "   Frontend processes:"
echo ""

echo "4. Open in browser: http://localhost:3000"
echo "   Check browser console for: [EventsTimeline], [RestaurantVendors], [MapView], [AccommodationStats] logs"
echo ""
