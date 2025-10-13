#!/usr/bin/env bash
# AlmaLinux deploy script for a Turborepo monorepo
# Mirrors your PowerShell script (with releases/, pnpm deploy, atomic symlink swap)

set -Eeuo pipefail

# -------------------- Config --------------------
REPO_PATH="."                                # use current folder
DEPLOY_PATH="${DEPLOY_PATH:-/opt/deploy}"    # releases/ and current symlink live here
BRANCH="${BRANCH:-main}"                   # branch to deploy

# Node / pnpm prerequisites:
#   - Node 20+ installed (via nvm or dnf module)
#   - pnpm installed (corepack enable && corepack prepare pnpm@latest --activate)

# -------------------- Derived --------------------
TIMESTAMP="$(date +%Y%m%d%H%M%S)"
RELEASES_DIR="$DEPLOY_PATH/releases"
NEW_RELEASE="$RELEASES_DIR/$TIMESTAMP"

# -------------------- Helpers --------------------
log(){ printf "\033[1;34m[deploy]\033[0m %s\n" "$*"; }
die(){ printf "\033[1;31m[error]\033[0m %s\n" "$*" >&2; exit 1; }

# -------------------- Prep --------------------
mkdir -p "$RELEASES_DIR"
OLD_RELEASE=""
if [[ -L "$DEPLOY_PATH/current" ]]; then
  OLD_RELEASE="$(readlink -f "$DEPLOY_PATH/current" || true)"
fi
mkdir -p "$NEW_RELEASE"

# -------------------- Update repo --------------------
log "Fetching latest code in $REPO_PATH"
git -C "$REPO_PATH" fetch --all --prune
git -C "$REPO_PATH" checkout "$BRANCH"
git -C "$REPO_PATH" pull --ff-only origin "$BRANCH"

# -------------------- Install & build --------------------
log "Installing dependencies"
pnpm --dir "$REPO_PATH" install --frozen-lockfile

log "Building with turbo"
pnpm --dir "$REPO_PATH" build

# -------------------- Copy artifacts --------------------
if [[ -f "$REPO_PATH/ecosystem.config.js" ]]; then
  cp "$REPO_PATH/ecosystem.config.js" "$NEW_RELEASE/"
fi

log "Deploying apps"
pnpm --dir "$REPO_PATH" --filter ./apps/rest-express deploy "$NEW_RELEASE/apps/rest-express"

# -------------------- Env files --------------------
if [[ -f "$REPO_PATH/apps/rest-express/.env" ]]; then
  cp "$REPO_PATH/apps/rest-express/.env" "$NEW_RELEASE/apps/rest-express/.env"
fi

# -------------------- Atomic symlink swap --------------------
ln -sfn "$NEW_RELEASE" "$DEPLOY_PATH/current"

log "Deploy complete: $NEW_RELEASE"
[[ -n "$OLD_RELEASE" ]] && log "Previous release: $OLD_RELEASE"
