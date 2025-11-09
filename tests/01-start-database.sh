#!/bin/bash

echo "=================================================="
echo "TEST 1: Start Database (Docker)"
echo "=================================================="
echo ""

echo "Starting PostgreSQL and Adminer containers..."
docker-compose up -d

echo ""
echo "Waiting 5 seconds for containers to start..."
sleep 5

echo ""
echo "Checking container status..."
docker-compose ps

echo ""
echo "✅ TEST COMPLETE"
echo ""
echo "Expected: Both 'ecnl-db' and 'ecnl-adminer' should show 'Up'"
echo ""
echo "Database: localhost:5433"
echo "Adminer GUI: http://localhost:8080"
echo ""
