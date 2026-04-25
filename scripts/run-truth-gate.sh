#!/bin/bash

echo "======================================"
echo "🚨 PRE-MUTATION TRUTH GATE REQUIRED"
echo "======================================"

echo
echo "You MUST run inspection before design:"
echo
echo "1. Inspect schema (SQL / Drizzle)"
echo "2. Inspect storage layer"
echo "3. Inspect identity model"
echo "4. Inspect related services"
echo
echo "If ANY of the above is missing → STOP"
echo

echo "Suggested command:"
echo
echo "npm run brain:search -- \"<feature domain> schema structure identity\""
echo
echo "======================================"
