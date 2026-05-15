#!/usr/bin/env bash

echo "=== SCANNING FOR MERGE CONFLICT MARKERS ==="

if grep -RInE '<<<<<<<|=======|>>>>>>>' \
  client server shared scripts . \
  --exclude-dir=node_modules \
  --exclude-dir=.git
then
  echo
  echo "❌ MERGE CONFLICT MARKERS DETECTED"
  exit 1
fi

echo
echo "✅ NO MERGE CONFLICT MARKERS FOUND"
