#!/bin/bash
# Build a local preview of the site (same substitution as the GitHub Actions workflow).
# Usage: tools/preview-build.sh [SITE_URL] [OUT_DIR]
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE_URL="${1:-http://localhost:8765}"; SITE_URL="${SITE_URL%/}"
OUT="${2:-$ROOT/_site}"
rm -rf "$OUT" && mkdir -p "$OUT"
cp -R "$ROOT/site/." "$OUT/"
grep -rl '__SITE_URL__' "$OUT" | xargs sed -i "s#__SITE_URL__#${SITE_URL}#g"
echo "Preview built in $OUT for $SITE_URL"
echo "Serve with: python3 -m http.server 8765 --directory \"$OUT\""
