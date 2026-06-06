#!/usr/bin/env zsh
set -euo pipefail

cd "$(dirname "$0")"

SITE_ID="1bf4815a-bce9-4d96-865d-2978afab3e4d"
SITE_URL="https://anjali-goel-portfolio-20260606.netlify.app"

echo "Deploying current folder to Netlify production..."
npx --yes netlify-cli deploy --prod --dir . --no-build --site "$SITE_ID"

echo "Done. Live URL: $SITE_URL"
