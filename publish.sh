#!/bin/bash

set -e

TARGET_REPO="git@github.com:suminb/web-pub.git"
BUILD_DIR="web/build"
LAST_COMMIT_MESSAGE=$(git log -1 --pretty=%B)

rm -rf $BUILD_DIR
python web/__main__.py build
cp CNAME $BUILD_DIR/
pushd $BUILD_DIR
git init
git remote add origin $TARGET_REPO
git add .
git commit -m "$LAST_COMMIT_MESSAGE"
git push -f origin master
popd
