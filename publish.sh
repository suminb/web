#!/bin/bash

set -e

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo "Run ./publish.sh from a clone of github.com/suminb/web (git repo root)."
  exit 1
}

cd "$REPO_ROOT"

ORIGIN_URL="$(git remote get-url origin 2>/dev/null)" || {
  echo "No git remote named 'origin'. Add it, then retry."
  exit 1
}

BUILD_DIR="docs"
PAGES_BRANCH="docs"
# GitHub Pages: branch `docs`, folder `/docs` → remote tree must be docs/index.html, …
PAGES_ROOT_IN_BRANCH="docs"
LAST_COMMIT_MESSAGE="$(git log -1 --pretty=%B)"

echo "Building static site with Astro → ${BUILD_DIR}/"
npm ci
npm run build

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Build failed: $BUILD_DIR not found"
  exit 1
fi

cp CNAME "$BUILD_DIR/" 2>/dev/null || true
# Older publish runs may have left a nested repo inside the build dir.
rm -rf "$BUILD_DIR/.git"

STAGE="$(mktemp -d)"
cleanup() {
  rm -rf "$STAGE"
}
trap cleanup EXIT

mkdir -p "$STAGE/$PAGES_ROOT_IN_BRANCH"
# Copy build output including dotfiles (e.g. .nojekyll)
( cd "$BUILD_DIR" && tar cf - . ) | ( cd "$STAGE/$PAGES_ROOT_IN_BRANCH" && tar xf - )

echo "Publishing to origin branch ${PAGES_BRANCH} (${ORIGIN_URL}), root /${PAGES_ROOT_IN_BRANCH}/"

pushd "$STAGE" >/dev/null
git init
git remote add origin "$ORIGIN_URL"
git add .
git commit -m "$LAST_COMMIT_MESSAGE"
git branch -M "$PAGES_BRANCH"
git push -f origin "$PAGES_BRANCH"
popd >/dev/null

echo "Done. In github.com/suminb/web → Settings → Pages: Source = branch ${PAGES_BRANCH}, folder /docs."
