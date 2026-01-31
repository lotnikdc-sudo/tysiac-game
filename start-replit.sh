#!/bin/bash

# Install dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ../frontend
echo "📦 Installing frontend dependencies..."
npm install
cd ..

# Start backend in background
echo "🎴 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd ../frontend
BROWSER=none npm start

# Cleanup
kill $BACKEND_PID 2>/dev/null
