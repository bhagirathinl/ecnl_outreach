#!/bin/bash

echo "=================================================="
echo "TEST 6: Test API Endpoints"
echo "=================================================="
echo ""

echo "NOTE: Run this in a NEW terminal while backend is running"
echo ""

echo "Testing health endpoint..."
echo "GET http://localhost:3001/health"
echo ""
curl http://localhost:3001/health
echo ""
echo ""

echo "Testing API info endpoint..."
echo "GET http://localhost:3001/api"
echo ""
curl http://localhost:3001/api
echo ""
echo ""

echo "✅ TEST COMPLETE"
echo ""
echo "Expected: JSON responses with status 'OK' and API info"
echo ""
