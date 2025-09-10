#!/bin/bash
# 🎮 Kolossus AI Treasury - One-Command Termux Install
# Run this in Termux: curl -sL https://github.com/stackablevaults-ops/AwesomeSauce/raw/main/termux-install.sh | bash

echo "🎮 Installing Kolossus AI Treasury for Termux..."
echo "=" | tr '=' '-' | head -c 50; echo

# Update packages
echo "📦 Updating Termux packages..."
pkg update -y && pkg upgrade -y

# Install required packages
echo "🔧 Installing dependencies..."
pkg install -y nodejs npm git curl unzip

# Download and extract
echo "⬇️ Downloading Kolossus build..."
curl -L -o kolossus_build.zip https://github.com/stackablevaults-ops/AwesomeSauce/releases/download/kolossus-v1.0/kolossus_build.zip

echo "📁 Extracting files..."
unzip -q kolossus_build.zip
cd kolossus

# Install dependencies
echo "⚙️ Installing npm dependencies..."
npm install

# Create start script
cat > start.sh << 'EOF'
#!/bin/bash
echo "🎮 Starting Kolossus AI Treasury..."
echo "🌐 Web Dashboard: http://localhost:3000"
echo "🎯 API Server: http://localhost:8000"
echo "🎲 Games: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"

# Start all services
npm run dev &
cd apps/api && npm start &
cd ../games && npm run dev &

wait
EOF

chmod +x start.sh

echo ""
echo "✅ Installation Complete!"
echo ""
echo "🚀 To start Kolossus AI Treasury:"
echo "   cd kolossus && ./start.sh"
echo ""
echo "🎮 Features Ready:"
echo "   • AI-controlled treasury"
echo "   • 5 arcade games (Asteroids, Breakout, Pac-Man, etc.)"
echo "   • KOL token trading system"
echo "   • Daily rewards & leaderboards"
echo "   • 100% legal skill-based gaming"
echo ""
echo "📱 Access from your phone browser at localhost:3000"
