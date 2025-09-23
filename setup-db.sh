#!/bin/bash

# AwesomeSauce Database Setup Script
echo "🚀 Setting up AwesomeSauce Database..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one based on .env.example"
    exit 1
fi

# Load environment variables
source .env

echo "📊 Pushing database schema..."
npm run db:push

if [ $? -eq 0 ]; then
    echo "✅ Database schema pushed successfully!"
    echo "🎉 Database setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Update your DATABASE_URL in .env with your actual database connection string"
    echo "2. Add your OpenAI API key to OPENAI_API_KEY in .env"
    echo "3. Add your Stripe keys to STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY in .env"
    echo "4. Run 'npm run dev' to start the development server"
    echo ""
    echo "🔗 Useful commands:"
    echo "  npm run dev      - Start development server"
    echo "  npm run build    - Build for production"
    echo "  npm run start    - Start production server"
    echo "  npm run db:push  - Update database schema"
else
    echo "❌ Database setup failed. Please check your DATABASE_URL and try again."
    exit 1
fi