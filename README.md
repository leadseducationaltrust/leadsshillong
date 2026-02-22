# leadsshillong

This is school website of LEADS Higher Secondary School.

## Headless CMS Migration (Step-by-Step)

This project is being migrated to a Git-based headless CMS using Decap CMS.

### Step 1: Externalize editable content into JSON

- Completed for news: `news/content.json`
- Existing JSON-backed sections: `calendar/content.json`, `downloads/content.json`, `thought/content.json`, `programs/*/content.json`, `articles/*/content.json`
- Pending extraction from hardcoded JS: faculty (`js/faculty.js`) and gallery (`js/gallery.js`)

### Step 2: Add CMS admin panel

- Admin UI entry: `admin/index.html`
- CMS config: `admin/config.yml`

Open `/admin` on your deployed site to access the editor.

### Step 3: Configure repository access

Update this block in `admin/config.yml`:

```yml
backend:
	name: github
	repo: YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME
	branch: main
```

Replace:
- `YOUR_GITHUB_USERNAME` with your GitHub username/org
- `YOUR_REPOSITORY_NAME` with your repo name
- `branch` if your default branch is not `main`

### Step 4: Local CMS testing

1. Serve the site locally (any static server)
2. Open `/admin`
3. Edit content and save
4. Confirm JSON files are updated

### Step 5: Deploy and publishing workflow

- Deploy your site to Netlify/Vercel/GitHub Pages
- Use CMS at `https://your-domain/admin`
- Content edits become Git commits/PRs

## Current CMS Collections

- News (`news/content.json`)
- Thought of the Day (`thought/content.json`)
- Downloads (`downloads/content.json`)
- Academic Calendar (`calendar/content.json`)

## Next Migration Steps

1. Move faculty data from `js/faculty.js` to `faculty/content.json`
2. Move gallery data from `js/gallery.js` to `gallery/content.json`
3. Add both as CMS collections in `admin/config.yml`
4. Optionally add collections for each program/article file with structured editors

## GitHub Pages CMS Login Fix

If `/admin` login popup shows `Not Found` on GitHub Pages, configure the OAuth proxy worker described in:

- `oauth-worker/README.md`

Then set `backend.base_url` in `admin/config.yml` to your deployed worker URL.

## Automatic JSON Sorting

Date-based content files are auto-sorted (latest first) on every push to `main`.

- Workflow: `.github/workflows/sort-json-content.yml`
- Script: `scripts/sort-json-content.mjs`
- Sorted files:
	- `news/content.json` by `date`
	- `thought/content.json` by `date`
	- `downloads/content.json` by `timestamp`
	- `gallery/content.json` by `date`
	- `calendar/content.json` by `date`, then `startDate`, then `endDate`

If you manually reorder entries, the workflow will normalize ordering after push.

## Content Validation (CI)

JSON content is validated on every pull request and push to `main`.

- Workflow: `.github/workflows/validate-content.yml`
- Validator script: `scripts/validate-content.mjs`
- Validated files:
	- `news/content.json`
	- `downloads/content.json`
	- `calendar/content.json`
	- `thought/content.json`
	- `gallery/content.json`

Run it locally before opening a PR:

```bash
node scripts/validate-content.mjs
```

The validator checks required fields, date formats, URL/path safety, expected object/array shapes, and duplicate content guards (e.g., duplicate news `date+title` or duplicate gallery URLs).

It also emits non-failing warnings for highly similar news titles (near-duplicates) so editors can review possible accidental repeats.

Near-duplicate threshold is configurable via `NEWS_TITLE_SIMILARITY_THRESHOLD` (0-1, default `0.80`).

Example local run with stricter threshold:

```bash
NEWS_TITLE_SIMILARITY_THRESHOLD=0.70 node scripts/validate-content.mjs
```

## Broken Link Check (CI)

Local path checks run on every pull request and push to `main`.

- Workflow: `.github/workflows/check-links.yml`
- Checker script: `scripts/check-links.mjs`
- Current strict scope:
	- Local `href/src` file paths in HTML pages
	- Media paths in `gallery/content.json`, `thought/content.json`, and `faculty/content.json`

Run it locally:

```bash
node scripts/check-links.mjs
```

### Gallery broken image behavior

On `gallery.html`, if an image URL is invalid or the image fails to load, that gallery card is removed automatically and not displayed.

## Feature Matrix (Config Toggles)

Feature flags are defined in `admin/config.json` under `featureToggles` and applied globally by `js/config.js`.

| Toggle Key | Controls |
|---|---|
| `showAdmissions` | Admissions nav/footer links, home hero "Apply Now", admissions form blocks |
| `showGallery` | Gallery nav/footer links and gallery-marked blocks |
| `showResults` | Result-related links/blocks (`result` URLs and `data-feature="results"`) |
| `showNews` | Home news alert bar, news modal, and news-marked blocks |
| `showPrograms` | Programs nav links, home academic programmes section, program-page sections |
| `showFaculty` | Faculty nav/footer links and faculty-marked blocks |
| `showDownloads` | Downloads nav/footer links and downloads-marked blocks |
| `showCalendar` | Home calendar panel and calendar-marked blocks |
| `showThoughtOfTheDay` | Home thought panel and thought-marked blocks |
| `showContactForm` | Contact form (`#contact-form`) and contact-form-marked blocks |
| `showOnlinePayments` | Pay-fee buttons (`#global-payment-*`) and online-payments-marked blocks |
| `showChatWidget` | Tawk.to chat widget initialization |

### Adding toggle support to a new block

1. Add a marker in HTML, e.g. `data-feature="programs"`.
2. Reuse an existing toggle key in `admin/config.json`.
3. If needed, map a new selector rule in `js/config.js` under the `toggleRules` object.
