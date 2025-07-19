#!/bin/bash

# 🚀 Status Page Deployment Script
echo "🚀 Starting deployment process..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Check if .env.example exists
if [ ! -f ".env.example" ]; then
    echo "❌ .env.example file not found. Please create it first."
    exit 1
fi

echo "📋 Next steps:"
echo ""
echo "1. 📝 Create a .env.local file with your environment variables:"
echo "   cp .env.example .env.local"
echo "   # Edit .env.local with your actual values"
echo ""
echo "2. 🌐 Set up external services:"
echo "   - Database (PostgreSQL): https://neon.tech or https://supabase.com"
echo "   - Authentication (Clerk): https://clerk.com"
echo ""
echo "3. 🚀 Deploy to Vercel:"
echo "   vercel login"
echo "   vercel"
echo ""
echo "4. ⚙️ Configure environment variables in Vercel dashboard"
echo "5. 🔄 Redeploy after setting environment variables"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🎉 Happy deploying!" 
 
 