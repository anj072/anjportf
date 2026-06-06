#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: ./deploy-github-pages.sh <github-repo-url>"
  echo "Example: ./deploy-github-pages.sh https://github.com/<username>/<repo>.git"
  exit 1
fi

REPO_URL="$1"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required but not installed."
  exit 1
fi

if [[ ! -d .git ]]; then
  git init -b main
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

git add .
if ! git diff --cached --quiet; then
  git commit -m "Publish site via GitHub Pages"
fi

git push -u origin main

echo "Done: code pushed to main."
echo "Next in GitHub repo settings:"
echo "1) Settings > Pages > Build and deployment > Source: GitHub Actions"
echo "2) Wait for the Deploy static site to GitHub Pages workflow to finish"
