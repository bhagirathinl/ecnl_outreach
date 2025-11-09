#!/bin/bash

echo "=================================================="
echo "TEST 7: Seed Database with Scraped Data"
echo "=================================================="
echo ""

cd backend

echo "Importing colleges, coaches, and event data..."
echo ""

npm run db:seed

echo ""
echo "✅ TEST COMPLETE"
echo ""
echo "Expected: 76 colleges and 99 coaches imported"
echo ""
echo "Verify in Adminer (http://localhost:8080):"
echo "  - College table should have ~76 rows"
echo "  - Coach table should have ~99 rows"
echo "  - Event table should have 1 row (ECNL Phoenix 2025)"
echo ""
