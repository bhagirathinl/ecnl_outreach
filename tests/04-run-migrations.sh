#!/bin/bash

echo "=================================================="
echo "TEST 4: Run Database Migrations"
echo "=================================================="
echo ""

cd backend

echo "Creating database tables..."
echo "When prompted for migration name, type: init"
echo ""

npm run db:migrate

echo ""
echo "✅ TEST COMPLETE"
echo ""
echo "Expected: 'Database synchronized with Prisma schema'"
echo "Expected: 15 tables created (PlayerProfile, College, Coach, etc.)"
echo ""
