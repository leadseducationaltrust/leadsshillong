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
