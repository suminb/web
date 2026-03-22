#!/bin/bash

set -e

TARGET_REPO="git@github.com:suminb/web-pub.git"
BUILD_DIR="dist"
LAST_COMMIT_MESSAGE=$(git log -1 --pretty=%B)

echo "Building static site with Astro → ${BUILD_DIR}/"
npm ci
npm run build

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Build failed: $BUILD_DIR not found"
  exit 1
fi

cp CNAME "$BUILD_DIR/" 2>/dev/null || true

pushd "$BUILD_DIR"
git init
git remote add origin "$TARGET_REPO"
git add .
git commit -m "$LAST_COMMIT_MESSAGE"
# New repos default to `main`; there is no local `master` unless you create it.
git branch -M main
git push -f origin main
popd
