#!/bin/sh
set -e
mkdir -p ./data
if [ ! -f ./data/blood_bank.sqlite ]; then
  echo "[entrypoint] Seeding database..."
  node src/seed.js
fi
echo "[entrypoint] Starting API on port ${PORT:-4000}..."
exec node server.js