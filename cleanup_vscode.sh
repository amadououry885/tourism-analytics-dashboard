#!/bin/bash
# VS Code Memory Cleanup Script
# Run this when VS Code becomes slow or crashes

echo "🧹 VS Code Memory Cleanup Script"
echo "================================="
echo ""

# Close VS Code first
echo "⚠️  Please close VS Code before running this script!"
read -p "Press Enter when VS Code is closed..."

echo ""
echo "📊 Current sizes:"
du -sh ~/.config/Code/Cache 2>/dev/null
du -sh ~/.config/Code/CachedExtensionVSIXs 2>/dev/null
du -sh ~/.config/Code/User/workspaceStorage 2>/dev/null
du -sh ~/.config/Code/User/globalStorage 2>/dev/null

echo ""
echo "🗑️  Cleaning up..."

# Clean VS Code caches (safe to delete)
rm -rf ~/.config/Code/Cache/* 2>/dev/null
echo "✓ Cleared Code/Cache"

rm -rf ~/.config/Code/CachedData/* 2>/dev/null
echo "✓ Cleared CachedData"

rm -rf ~/.config/Code/GPUCache/* 2>/dev/null
echo "✓ Cleared GPUCache"

# Clean old workspace storage (keeps recent workspaces)
find ~/.config/Code/User/workspaceStorage -type d -mtime +30 -exec rm -rf {} + 2>/dev/null
echo "✓ Cleared old workspace storage (>30 days)"

# Clean TypeScript cache
rm -rf /tmp/vscode-typescript* 2>/dev/null
echo "✓ Cleared TypeScript cache"

# Clean node_modules/.cache in project
rm -rf frontend/node_modules/.cache 2>/dev/null
rm -rf frontend/.vite 2>/dev/null
echo "✓ Cleared frontend cache"

echo ""
echo "📊 New sizes:"
du -sh ~/.config/Code/Cache 2>/dev/null
du -sh ~/.config/Code/CachedExtensionVSIXs 2>/dev/null
du -sh ~/.config/Code/User/workspaceStorage 2>/dev/null
du -sh ~/.config/Code/User/globalStorage 2>/dev/null

echo ""
echo "✅ Cleanup complete!"
echo "💡 Now you can reopen VS Code - it should be faster and more stable."
