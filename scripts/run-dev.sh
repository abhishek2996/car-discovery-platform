#!/usr/bin/env bash
# Run Next.js dev on port 3000 (bypasses npm; use if "npm run dev" uses wrong command).
cd "$(dirname "$0")/.."
node scripts/run-dev.mjs
