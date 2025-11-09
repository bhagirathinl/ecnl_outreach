#!/bin/bash

echo "=================================================="
echo "TEST 2: Install Backend Dependencies"
echo "=================================================="
echo ""

cd backend

echo "Installing npm packages (this takes 30-60 seconds)..."
npm install

echo ""
echo "✅ TEST COMPLETE"
echo ""
echo "Expected: 'added XXX packages' with no errors"
echo ""
