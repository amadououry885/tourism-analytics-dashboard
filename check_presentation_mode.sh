#!/bin/bash
# Quick check for presentation mode font changes

echo "🔍 Verifying Presentation Mode Font Sizes..."
echo ""

# Check if CSS file has been updated
if grep -q "PRESENTATION MODE" /home/amadou-oury-diallo/tourism-analytics-dashboard/frontend/src/index.css; then
    echo "✅ PRESENTATION MODE CSS found in index.css"
    echo ""
    echo "📊 Font Size Overrides Applied:"
    echo "================================"
    grep "text-xs:" /home/amadou-oury-diallo/tourism-analytics-dashboard/frontend/src/index.css | head -1
    grep "text-sm:" /home/amadou-oury-diallo/tourism-analytics-dashboard/frontend/src/index.css | head -1
    grep "text-base:" /home/amadou-oury-diallo/tourism-analytics-dashboard/frontend/src/index.css | head -1
    grep "text-lg:" /home/amadou-oury-diallo/tourism-analytics-dashboard/frontend/src/index.css | head -1
    grep "text-xl:" /home/amadou-oury-diallo/tourism-analytics-dashboard/frontend/src/index.css | head -1
    echo ""
else
    echo "❌ PRESENTATION MODE CSS not found!"
    exit 1
fi

# Check if frontend is running
if pgrep -f "vite" > /dev/null; then
    echo "✅ Frontend dev server is running"
    echo "   Auto-reload enabled - changes are live!"
    echo ""
    echo "📱 Open your browser:"
    echo "   http://localhost:3000"
    echo ""
    echo "🎯 What to check:"
    echo "   1. All text should be 25-40% larger"
    echo "   2. Chart labels more readable"
    echo "   3. Buttons have bigger text"
    echo "   4. Table cells are easier to read"
    echo "   5. Metric numbers are prominent"
else
    echo "⚠️  Frontend is NOT running"
    echo "   Start with: cd frontend && npm run dev"
fi

echo ""
echo "✅ Presentation Mode Active!"
echo ""
echo "💡 Tips:"
echo "   - Refresh browser to see changes (Ctrl+R or Cmd+R)"
echo "   - Use Ctrl/Cmd + '+' to zoom further if needed"
echo "   - Test with your actual projector/screen"
echo ""
