#!/bin/bash

echo "Starting AI Interview Practice System..."
echo

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm run setup
    echo
fi

# Check if .env exists and has API key
if [ ! -f "server/.env" ]; then
    echo "Please add your Gemini API key to server/.env"
    echo "Visit https://aistudio.google.com/ to get an API key"
    exit 1
fi

if grep -q "your_gemini_api_key_here" "server/.env"; then
    echo "Please replace 'your_gemini_api_key_here' with your actual Gemini API key in server/.env"
    exit 1
fi

# Create data directory for MongoDB
mkdir -p data

echo "Starting MongoDB..."
mongod --dbpath ./data &
MONGO_PID=$!

sleep 3

echo "Seeding sample data..."
npm run seed

echo
echo "Starting application..."
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
echo

# Cleanup function
cleanup() {
    echo "Stopping MongoDB..."
    kill $MONGO_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

npm run dev