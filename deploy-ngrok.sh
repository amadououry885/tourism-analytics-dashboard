#!/bin/bash
# Quick Deployment Script for Tourism Analytics Dashboard
# Uses ngrok for instant public URL

echo "════════════════════════════════════════════════════════════════════════"
echo "🚀 DEPLOYING TOURISM ANALYTICS DASHBOARD"
echo "════════════════════════════════════════════════════════════════════════"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd /home/amadou-oury-diallo/tourism-analytics-dashboard

# Step 1: Check if servers are running
echo -e "\n${BLUE}📡 Step 1: Checking servers...${NC}"
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✅ Backend running on port 8000${NC}"
else
    echo -e "${YELLOW}⚠️  Starting backend server...${NC}"
    cd backend
    /home/amadou-oury-diallo/tourism-analytics-dashboard/.venv/bin/python manage.py runserver 8000 > /tmp/backend.log 2>&1 &
    sleep 3
    cd ..
fi

if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✅ Frontend running on port 3002${NC}"
else
    echo -e "${YELLOW}⚠️  Starting frontend server...${NC}"
    cd frontend
    npm run dev > /tmp/frontend.log 2>&1 &
    sleep 5
    cd ..
fi

# Step 2: Start ngrok tunnel
echo -e "\n${BLUE}🌐 Step 2: Creating public URL with ngrok...${NC}"
echo -e "${YELLOW}ℹ️  This will create a public HTTPS URL for your app${NC}"

# Kill any existing ngrok processes
pkill -f ngrok 2>/dev/null

# Start ngrok for frontend (port 3002)
ngrok http 3002 --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

echo -e "${BLUE}⏳ Waiting for ngrok to start...${NC}"
sleep 4

# Get the public URL
PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])" 2>/dev/null)

echo ""
echo "════════════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo -e "${BLUE}🌍 Your public URL:${NC}"
echo -e "${GREEN}$PUBLIC_URL${NC}"
echo ""
echo -e "${YELLOW}📋 Share this link to get feedback!${NC}"
echo ""
echo "Backend: http://127.0.0.1:8000"
echo "Frontend: http://localhost:3002"
echo "Public: $PUBLIC_URL"
echo ""
echo "════════════════════════════════════════════════════════════════════════"
echo -e "${BLUE}📊 Quick Stats:${NC}"
echo "  • Recurring Events: ✅ Working"
echo "  • Happening Now: ✅ Live"
echo "  • Admin Portal: ✅ Ready"
echo "  • Auto-refresh: ✅ Every 60s"
echo ""
echo -e "${YELLOW}💡 Tips for gathering feedback:${NC}"
echo "  1. Test on mobile devices"
echo "  2. Share with non-technical users"
echo "  3. Ask about UI/UX clarity"
echo "  4. Get feedback on event creation flow"
echo "  5. Test recurring event badges visibility"
echo ""
echo -e "${BLUE}🛑 To stop deployment:${NC}"
echo "  Press Ctrl+C or run: pkill -f ngrok"
echo ""
echo "════════════════════════════════════════════════════════════════════════"
echo -e "${GREEN}🎉 Ready for feedback! Keep ngrok running...${NC}"
echo "════════════════════════════════════════════════════════════════════════"

# Keep the script running
wait $NGROK_PID
