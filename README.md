Introduction
-------------

This is a personal website for Sumin Byeon.

Build Status
------------

[![Build Status](https://travis-ci.org/suminb/web.svg?branch=develop)](https://travis-ci.org/suminb/web)
[![Coverage Status](https://coveralls.io/repos/suminb/web/badge.svg?branch=develop&service=github)](https://coveralls.io/github/suminb/web?branch=develop)

Prerequisites
-------------

- A Google Sheet document and its ID. The ID is expected to be stored in `GSPREAD_KEY` environment variable.
- A Google API key (refer [this page](https://developers.google.com/maps/documentation/geocoding/get-api-key) for details).

Deployment
----------

Since this is essentially a collection of static web resources (i.e., HTML,
CSS, JavaScript) , deployment is quite straightfoward. We could use a
*traditional* web hosting service or AWS S3, but we determined GitHub Pages
is more than enough for a low-traffic static web site.

### Publish to GitHub Pages

There is a shell script for that.

    ./publish.sh


### Compile a list of geocoordinates from Google Spreadsheet

    python web/__main__.py import_gspread (gspread_key) > web/static/locations.json
