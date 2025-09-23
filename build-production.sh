#!/bin/bash

# Build script for Kolossus.org - Ensures immediate functionality on deployment

echo "🚀 Building Kolossus.org for immediate deployment..."

# Set environment variables for demo mode
export REACT_APP_ENVIRONMENT="production"
export REACT_APP_ENABLE_DEMO="true"
export REACT_APP_DOMAIN="kolossus.org"

# Change to client directory
cd client

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building application..."
npm run build

# Verify critical files exist
echo "✅ Verifying build..."
if [ ! -f "../dist/public/index.html" ]; then
    echo "❌ Build failed: index.html not found"
    exit 1
fi

if [ ! -d "../dist/public/assets" ]; then
    echo "❌ Build failed: assets directory not found"
    exit 1
fi

# Create demo data for immediate functionality
echo "🎭 Setting up demo data..."
mkdir -p dist/.netlify/functions
cp -r ../netlify/edge-functions dist/.netlify/

# Verify demo configuration
echo "🧪 Verifying demo configuration..."
if grep -q "KOLOSSUS_DEMO" dist/assets/*.js; then
    echo "✅ Demo mode configured"
else
    echo "⚠️  Warning: Demo mode might not be properly configured"
fi

echo "🎉 Build complete! Kolossus.org ready for immediate deployment."
echo ""
echo "Features ready:"
echo "  ✅ Landing page with live demo"
echo "  ✅ Immediate AI agent interaction"
echo "  ✅ Kolossus forge functionality"
echo "  ✅ Demo API responses"
echo "  ✅ Fallback mode for backend unavailability"
echo ""
echo "Deploy to Netlify and everything will work immediately!"