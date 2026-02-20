#!/bin/bash
set -e

echo "🚀 Starting MTX deployment..."
echo "================================"

# Navigate to project directory
cd /var/www/mtx

# Pull latest changes
echo "📥 Pulling latest changes from Git..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Run any new database migrations
echo "🗄️ Running database migrations..."
node backend/run-all-migrations.js

# Build frontend
echo "🔨 Building frontend for production..."
npm run build

# Restart backend with PM2
echo "🔄 Restarting backend server..."
pm2 restart mtx-backend || pm2 start ecosystem.config.js --env production

# Show status
echo ""
echo "================================"
echo "✅ Deployment complete!"
echo ""
pm2 status
