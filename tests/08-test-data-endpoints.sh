#!/bin/bash

echo "=================================================="
echo "TEST 8: Test Data API Endpoints"
echo "=================================================="
echo ""

BASE_URL="http://localhost:3001"

echo "NOTE: Make sure backend is running (npm run dev)"
echo ""

echo "1. Testing GET /api/events"
echo "--------------------------------------------------"
curl -s "$BASE_URL/api/events" | jq '.'
echo ""
echo ""

echo "2. Testing GET /api/colleges (first 5)"
echo "--------------------------------------------------"
curl -s "$BASE_URL/api/colleges" | jq '.colleges[:5]'
echo ""
echo ""

echo "3. Testing GET /api/colleges?division=Division 1"
echo "--------------------------------------------------"
curl -s "$BASE_URL/api/colleges?division=Division%201" | jq '.count'
echo ""
echo ""

echo "4. Testing GET /api/coaches (first 5)"
echo "--------------------------------------------------"
curl -s "$BASE_URL/api/coaches" | jq '.coaches[:5]'
echo ""
echo ""

echo "5. Testing GET /api/events/:id/colleges (get event ID first)"
echo "--------------------------------------------------"
EVENT_ID=$(curl -s "$BASE_URL/api/events" | jq -r '.events[0].id')
echo "Event ID: $EVENT_ID"
curl -s "$BASE_URL/api/events/$EVENT_ID/colleges" | jq '.count'
echo ""
echo ""

echo "✅ TEST COMPLETE"
echo ""
echo "All endpoints should return JSON data."
echo "Verify:"
echo "  - Events count: 1"
echo "  - Colleges count: 76"
echo "  - Coaches count: 99"
echo ""
