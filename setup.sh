#!/usr/bin/env bash
# ==============================================================================
# ROOT Terminal — Setup & Run Script
# Automated environment setup and launcher for 24/7 Web Terminal
# ==============================================================================

set -e

echo "☠ Starting ROOT Terminal Setup..."

# 1. Ensure required system packages
if command -v apt-get >/dev/null 2>&1; then
    echo "📦 Checking system dependencies..."
    apt-get update -qq >/dev/null 2>&1 || true
    apt-get install -y -qq python3 python3-pip curl psmisc >/dev/null 2>&1 || true
fi

# 2. Install Cloudflare Tunnel if not installed
if ! command -v cloudflared >/dev/null 2>&1; then
    echo "🌐 Downloading cloudflared..."
    curl -sSL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
    chmod +x /usr/local/bin/cloudflared
fi

# 3. Create persistent directories
echo "📁 Setting up data directories..."
mkdir -p /data/work /data/home /data/.local/bin /data/.npm /data/.pylibs

# 4. Install Node.js packages
if [ -f "package.json" ]; then
    echo "📦 Installing npm packages..."
    npm install --silent
fi

# 5. Launch Server
echo "🚀 Launching ROOT Terminal server on port 3000..."
npm run dev
