Introduction
-------------

This is a personal website for Sumin Byeon, built as a static site with [Astro](https://astro.build/).

Content sources (same as the former Flask/Frozen-Flask setup):

- `data/experiences.yml` and included `data/*.md` — long-form “experience” write-ups
- `data/experience_summary.md` — résumé-style **Experience** page (migrated from the old Jinja template)
- `data/coding_expedition.md` — long-form copy for **Coding Expedition** (`/coding-expedition.html`)
- `data/archived_projects.yml` — project archive used on the home page (includes the Coding Expedition card metadata)

Build Status
------------

[![Coverage Status](https://coveralls.io/repos/suminb/web/badge.svg?branch=develop&service=github)](https://coveralls.io/github/suminb/web?branch=develop)
[![Sonar](https://sonarcloud.io/api/project_badges/measure?project=suminb_web&metric=alert_status)](https://sonarcloud.io/dashboard?id=suminb_web)

Prerequisites
-------------

- Node.js 18+ (for Astro)
- Optional: `PUBLIC_GOOGLE_MAPS_API_KEY` at build time for the **Coding Expedition** map (`/coding-expedition.html`)

Local development
------------------

```bash
npm install
npm run dev
```

Production build
----------------

```bash
npm run build
```

Output is written to `dist/`. Trip markers for the map load from `public/static/locations.js` (GeoJSON). Replace or regenerate that file if you still use a spreadsheet export pipeline.

Deployment
----------

### Publish to GitHub Pages (web-pub)

```bash
./publish.sh
```

The script runs `npm ci`, `npm run build`, copies `CNAME` into `dist/`, and force-pushes `dist/` to the publishing repository.

### Legacy Python pipeline

The previous Flask app, `web import-gspread`, and `requirements.txt` have been removed. If you need to regenerate `locations.js` from Google Sheets, reintroduce a small script or use the historical commit history.
