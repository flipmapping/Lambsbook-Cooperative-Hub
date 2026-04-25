#!/bin/bash


echo
echo "5) API contract check..."

API_TEST=$(curl -s --max-time 2 "http://localhost:5000/api/notification-preferences?recipientId=test&recipientType=member" || true)

if echo "$API_TEST" | grep -q "<!DOCTYPE html>"; then
  echo "❌ API returned HTML (likely Vite interception)"
  exit 1
fi

echo "API response:"
echo "$API_TEST"

echo "✅ API route responding"

echo "======================================"
echo "🚀 RUNTIME GUARD — START"
echo "======================================"

echo
echo "1) Kill existing backend processes (server/index.ts)..."
PIDS=$(ps aux | grep "server/index.ts" | grep -v grep | awk '{print $2}')

if [ -n "$PIDS" ]; then
  echo "Killing: $PIDS"
  kill -9 $PIDS || true
else
  echo "No existing backend processes"
fi

sleep 1

echo
echo "2) Check if port 5000 is already serving..."
PRECHECK=$(curl -s --max-time 1 http://localhost:5000/api/__probe || true)

if [ -n "$PRECHECK" ]; then
  echo "⚠️  Something is already serving on :5000"
else
  echo "✅ Port appears free"
fi

echo
echo "3) Start backend..."
NODE_ENV=development npx tsx server/index.ts &
SERVER_PID=$!

echo
echo "4) Waiting for backend (retry up to 10s)..."

SUCCESS=false

for i in {1..10}; do
  sleep 1
  PROBE=$(curl -s --max-time 1 http://localhost:5000/api/__probe || true)

  if echo "$PROBE" | grep -q '"ok":true'; then
    SUCCESS=true
    echo "✅ Backend reachable (after $i s)"
    break
  fi

  echo "⏳ Retry $i..."
done

if [ "$SUCCESS" = false ]; then
  echo "❌ Backend NOT reachable after retries"
  echo "Last response:"
  echo "$PROBE"
  kill -9 $SERVER_PID || true
  exit 1
fi

echo
echo "======================================"
echo "✅ RUNTIME READY"
echo "======================================"
