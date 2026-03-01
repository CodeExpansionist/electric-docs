#!/bin/bash
# Electric Project Bootstrap
# Run this from the root of the electric repo:
#   bash bootstrap.sh
#
# Or tell Claude Code: "Run bash bootstrap.sh"
#
# This copies all project docs and reference screenshots into the repo,
# commits them, and pushes to GitHub.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(pwd)"

echo "=== Electric Project Bootstrap ==="
echo "Source: $SCRIPT_DIR"
echo "Target: $REPO_ROOT"
echo ""

# Copy docs
echo "Copying PROJECT_SPEC.md..."
cp "$SCRIPT_DIR/PROJECT_SPEC.md" "$REPO_ROOT/PROJECT_SPEC.md"

echo "Copying CLAUDE.md..."
cp "$SCRIPT_DIR/CLAUDE.md" "$REPO_ROOT/CLAUDE.md"

# Copy reference screenshots
echo "Copying 18 reference screenshots..."
mkdir -p "$REPO_ROOT/reference-screenshots"
cp "$SCRIPT_DIR/reference-screenshots/"*.png "$REPO_ROOT/reference-screenshots/"

echo ""
echo "=== Files copied ==="
ls -1 "$REPO_ROOT/CLAUDE.md" "$REPO_ROOT/PROJECT_SPEC.md"
ls -1 "$REPO_ROOT/reference-screenshots/"
echo ""

# Git commit and push
echo "Staging files..."
git add CLAUDE.md PROJECT_SPEC.md reference-screenshots/

echo "Committing..."
git commit -m "$(cat <<'EOF'
Add project spec, Claude Code instructions, and 18 reference screenshots

- PROJECT_SPEC.md: Full blueprint for pixel-perfect Curry's TV & Audio clone
- CLAUDE.md: Claude Code behavioral instructions and build workflow
- reference-screenshots/: 18 annotated screenshots covering all page types
  (homepage, TV & Audio hub, category listing, product page, basket, checkout)
EOF
)"

echo "Pushing to GitHub..."
git push

echo ""
echo "=== Bootstrap complete ==="
echo "Open Claude Code in this repo and tell it:"
echo '  "Read CLAUDE.md and PROJECT_SPEC.md. Start at Phase 0."'
