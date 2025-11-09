#!/bin/bash

echo "=================================================="
echo "TEST 3: Generate Prisma Client"
echo "=================================================="
echo ""

cd backend

echo "Generating Prisma client from schema..."
npm run db:generate

echo ""
echo "✅ TEST COMPLETE"
echo ""
echo "Expected: 'Generated Prisma Client to ./node_modules/@prisma/client'"
echo ""
