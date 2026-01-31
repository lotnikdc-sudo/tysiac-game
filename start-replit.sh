#!/bin/bash

# Install dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ../frontend
echo "📦 Installing frontend dependencies..."
npm install
cd ..

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

# Start backend (frontend będzie servowany przez backend)
echo "🎴 Starting backend server..."
cd backend
npm run dev
