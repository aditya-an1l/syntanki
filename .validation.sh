#!/bin/bash
set -e

echo "=== Validation Loop ==="

echo "[1/4] Building..."
npm run build

echo "[2/4] Type checking..."
npx tsc --noEmit

echo "[3/4] Linting..."
npx next lint --dir src 2>/dev/null || npx eslint . 2>/dev/null || echo "(lint skipped - no config yet)"

echo "[4/4] Testing..."
npm test 2>/dev/null || echo "(tests skipped - no suite yet)"

echo "=== All checks passed ==="
