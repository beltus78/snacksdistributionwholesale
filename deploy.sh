#!/bin/bash
# Snacks Distribution Wholesale — publish the latest code by hand:  bash ~/websites/snacksdistributionwholesale/deploy.sh
# (Normally not needed: every push to main is built and published by Cloudflare Workers Builds.)
set -euo pipefail
cd "$(dirname "$0")"
npm install --no-audit --no-fund >/dev/null
npx wrangler d1 migrations apply snacksdistributionwholesale --remote
npx wrangler deploy
echo "Done. Open https://snacksdistributionwholesale.com"
