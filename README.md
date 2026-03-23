Introduction
------------

This is a personal website for Sumin Byeon, built as a static site with [Astro](https://astro.build/). The live site is published with **GitHub Pages** from this repository (`github.com/suminb/web`): **branch `docs`**, **folder `/docs`**.

Content sources (YAML/Markdown under `data/`, read at build time):

- `data/projects.yml` — **Projects** highlights on the home page and `/projects.html`, plus “Previous works” rows; published entries from `data/experiences.yml` not already listed here are automatically appended as additional “more” projects
- `data/experiences.yml` plus long-form markdown (`data/projects/*.md` → `/projects/{slug}.html`, other published bodies → `/experience/{slug}.html`)
- `data/experience_summary.md` — résumé-style **Experience** page (`/experience.html`)
- `data/coding_expedition.md` — copy for **Coding Expedition** (`/coding-expedition.html`)
- `data/projects.yml` — single catalog: home/showcase rows (optional `featured`, `workplace`, `cta`, `experience_slug`, `url`) and archive rows (`archived: true`, required `year`) for the **Archive** grid and the combined tag list on `/projects.html`
- `data/talks.yml` — **Talks** highlights on the home page and full list on `/talks.html`

`public/` is copied into the build as-is (e.g. `public/.nojekyll` so GitHub Pages does not run Jekyll and skip `/_astro/` assets, `public/favicon.svg`, `public/static/`).

Build Status
------------

[![Coverage Status](https://coveralls.io/repos/suminb/web/badge.svg?branch=main&service=github)](https://coveralls.io/github/suminb/web?branch=main)
[![Sonar](https://sonarcloud.io/api/project_badges/measure?project=suminb_web&metric=alert_status)](https://sonarcloud.io/dashboard?id=suminb_web)

Prerequisites
-------------

- Node.js 18+ (for Astro 5)
- Optional: `PUBLIC_GOOGLE_MAPS_API_KEY` at build time for the **Coding Expedition** map (`/coding-expedition.html`)

Local development
-----------------

```bash
npm install
npm run dev
```

Production build
----------------

```bash
npm run build
```

Output goes to **`docs/`** (`outDir` in `astro.config.mjs`). That directory is listed in **`.gitignore`** on `main` so builds are not committed with source.

Preview the production build locally:

```bash
npm run preview
```

Trip markers for the Coding Expedition map load from `public/static/locations.js` (GeoJSON). Replace or regenerate that file if you use a separate export pipeline.

Deployment
----------

### GitHub Pages (`publish.sh`)

From the **repository root** (with `origin` pointing at this repo):

```bash
./publish.sh
```

The script:

1. Runs **`npm ci`** and **`npm run build`**
2. Copies **`CNAME`** into the build output when present (custom domain)
3. Stages the build under a **`docs/`** directory in a temporary tree and **force-pushes** that tree to **`origin`** as branch **`docs`**

On GitHub: **Settings → Pages → Build and deployment** — source **branch `docs`**, folder **`/docs`**. The branch tree is a top-level **`docs/`** directory (with `index.html`, `_astro/`, etc. inside it); GitHub serves that folder as the site root at your Pages URL.

Each deploy replaces the tip of **`docs`** with a fresh commit (unrelated history to `main` is normal for this flow).

### Configuration notes

- Set `site` in `astro.config.mjs` to your real origin (e.g. `https://shortbread.io`) for correct canonical URLs and sitemaps.
- **`CNAME`** in the repo root is copied into the build before publish when you use a custom domain on GitHub Pages.

### Legacy Python pipeline

The previous Flask app, `web import-gspread`, and `requirements.txt` have been removed. If you need to regenerate `locations.js` from Google Sheets, reintroduce a small script or use git history.
