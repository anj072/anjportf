#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: ./deploy-cloudflare-pages.sh <cloudflare-project-name>"
  echo "Example: ./deploy-cloudflare-pages.sh anjali-portfolio"
  exit 1
fi

PROJECT_NAME="$1"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# First run will open Cloudflare auth if not logged in already.
npx --yes wrangler@latest pages deploy . --project-name "$PROJECT_NAME"
