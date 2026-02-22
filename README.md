# LEADS Shillong Website

Static website for LEADS Higher Secondary School with JSON-driven content, Decap CMS editing, and GitHub Actions quality checks.

## Admin CMS

- Admin entry: `admin/index.html`
- CMS config: `admin/config.yml`
- Global site config used by frontend: `admin/config.json`

Open `/admin` on the deployed site to edit content.

## OAuth for CMS on GitHub Pages

When hosted on GitHub Pages, Decap CMS authentication is served by the Cloudflare Worker in `oauth-worker/`.

- Worker config: `oauth-worker/wrangler.toml`
- Worker code: `oauth-worker/src/worker.js`
- Setup guide: `oauth-worker/README.md`

In `admin/config.yml`, `backend.base_url` must point to your deployed worker URL.

## Content Sources

Primary content files:

- `news/content.json`
- `downloads/content.json`
- `calendar/content.json`
- `thought/content.json`
- `gallery/content.json`
- `faculty/content.json`
- `programs/*/content.json`
- `articles/*/content.json`

## Automation and CI

### 1) JSON Sorting

Date-based content files are auto-sorted on push to `main`.

- Workflow: `.github/workflows/sort-json-content.yml`
- Script: `scripts/sort-json-content.mjs`

### 2) Content Validation

Validates schema-like structure, required fields, date formats, URL/path safety, and duplicate guards.

- Workflow: `.github/workflows/validate-content.yml`
- Script: `scripts/validate-content.mjs`
- Includes duplicate checks:
  - News duplicate key: `date + title`
  - Gallery duplicate key: `url`
- Includes non-failing near-duplicate warning for similar news titles.

Threshold for near-duplicate warning:

- Env var: `NEWS_TITLE_SIMILARITY_THRESHOLD`
- Range: `0 < value <= 1`
- Default: `0.80`

### 3) Broken Link Check

Checks broken local links in HTML and selected media paths in JSON.

- Workflow: `.github/workflows/check-links.yml`
- Script: `scripts/check-links.mjs`

## Local quality commands

Run before opening a PR:

```bash
node scripts/validate-content.mjs
node scripts/check-links.mjs
```

Example with stricter near-duplicate warning threshold:

```bash
NEWS_TITLE_SIMILARITY_THRESHOLD=0.70 node scripts/validate-content.mjs
```

## Runtime hardening

- Gallery broken image handling: on `gallery.html`, failed image loads are removed from the rendered gallery.
- Frontend link safety and URL sanitization is enforced in JS renderers.

## Feature toggles

Feature flags live in `admin/config.json` under `featureToggles` and are applied by `js/config.js`.

Current keys:

- `showAdmissions`
- `showGallery`
- `showResults`
- `showNews`
- `showPrograms`
- `showFaculty`
- `showDownloads`
- `showCalendar`
- `showThoughtOfTheDay`
- `showContactForm`
- `showOnlinePayments`
- `showChatWidget`
