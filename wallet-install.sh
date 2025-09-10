#!/bin/bash
# 💳 Kolossus Professional Wallet - One-Command Termux Install
# Run this in Termux: curl -sL https://github.com/stackablevaults-ops/AwesomeSauce/raw/main/wallet-install.sh | bash

echo "💳 Installing Kolossus Professional Wallet for Termux..."
echo "=" | tr '=' '-' | head -c 50; echo

# Update packages
echo "📦 Updating Termux packages..."
pkg update -y && pkg upgrade -y

# Install required packages
echo "🔧 Installing dependencies..."
pkg install -y nodejs npm git curl unzip

# Download and extract wallet
echo "⬇️ Downloading Kolossus Wallet build..."
curl -L -o kolossus_wallet.zip https://github.com/stackablevaults-ops/AwesomeSauce/releases/download/wallet-v1.0/kolossus_wallet.zip

echo "📁 Extracting wallet files..."
unzip -q kolossus_wallet.zip
cd kolossus-wallet

# Install dependencies
echo "⚙️ Installing wallet dependencies..."
npm install

echo ""
echo "✅ Kolossus Professional Wallet Installation Complete!"
echo ""
echo "🚀 To start your wallet:"
echo "   cd kolossus-wallet && ./start-wallet.sh"
echo ""
echo "💳 Wallet Features Ready:"
echo "   • Multi-token support (KOL, ETH, MATIC)"
echo "   • Send & receive transactions"
echo "   • Treasury integration"
echo "   • Trading interface"
echo "   • Portfolio tracking"
echo "   • Secure key management"
echo ""
echo "📱 Access wallet at: http://localhost:3001"
echo "   Works perfectly in Termux browser!"
echo ""
echo "🔗 Connect to full Kolossus ecosystem:"
echo "   Treasury, arcade games, and trading system"
