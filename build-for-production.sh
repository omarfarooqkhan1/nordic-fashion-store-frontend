#!/bin/bash

echo "Building React frontend for production..."

# Copy production environment file
if [ -f "env.production" ]; then
    echo "Copying production environment file..."
    cp env.production .env
else
    echo "Warning: env.production file not found. Using default environment."
fi

# Install dependencies
npm install

# Build the application in production mode
echo "Building frontend in production mode..."
npm run build

# Create the build directory in the backend public folder
echo "Copying build files to backend public directory..."

# Create the build directory structure (create parent directories if they don't exist)
mkdir -p ../nordic-fashion-store-backend/public/build

# Copy the built files
cp -r dist/* ../nordic-fashion-store-backend/public/build/

echo "Frontend build completed and copied to backend public directory!"
echo "Build files are now in: ../nordic-fashion-store-backend/public/build/"

# Clean up temporary .env file if it was created
if [ -f ".env" ] && [ -f "env.production" ]; then
    rm .env
    echo "Cleaned up temporary .env file"
fi
