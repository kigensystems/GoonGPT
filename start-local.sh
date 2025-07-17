#!/bin/bash

echo "🚀 Starting GoonGPT local development..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found!"
    echo "Please copy .env.local.example to .env.local and add your API keys"
    exit 1
fi

# Check if MODELSLAB_API_KEY is set
if ! grep -q "MODELSLAB_API_KEY=" .env.local || grep -q "MODELSLAB_API_KEY=your_modelslab_api_key_here" .env.local; then
    echo "⚠️  Warning: MODELSLAB_API_KEY not configured in .env.local"
    echo "Image generation won't work without it!"
    echo ""
fi

# Start Netlify Dev
echo "Starting Netlify Dev..."
echo "Frontend: http://localhost:5173"
echo "Full app: http://localhost:8888"
echo ""
echo "Press Ctrl+C to stop"
echo ""

netlify dev