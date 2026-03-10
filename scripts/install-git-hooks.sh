#!/bin/sh
# Points git to use the .githooks/ directory for hooks.
# Run once after cloning: bash scripts/install-git-hooks.sh

git config core.hooksPath .githooks
echo "Git hooks installed. Pre-commit will run preflight on drift-relevant changes."
