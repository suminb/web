#!/bin/bash

set -e

TARGET_REPO="git@github.com:suminb/web-pub.git"
BUILD_DIR="web/build"
LAST_COMMIT_MESSAGE=$(git log -1 --pretty=%B)

echo -n "Would you like to generate locations.js? (yes/no) "
read generate_locations_js

if [[ $generate_locations_js = "yes" ]]; then
    python web/__main__.py import-gspread "$GSPREAD_KEY" > web/static/locations.json
fi

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
