#!/bin/bash

echo "=================================================="
echo "TEST 5: Start Backend Server"
echo "=================================================="
echo ""

cd backend

echo "Starting Express server with hot-reload..."
echo ""
echo "The server will keep running. Press Ctrl+C to stop."
echo ""

npm run dev
