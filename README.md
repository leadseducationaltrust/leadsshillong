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

## Progressive Web App (PWA)

The site is configured as an installable PWA with offline support for key pages and local assets.

- Manifest: `manifest.webmanifest`
- Service worker: `service-worker.js`
- Registration script: `js/pwa.js`
- App icons: `icons/icon-192.png`, `icons/icon-512.png`

### Caching behavior

- App shell pages and core assets are pre-cached during service worker install.
- Navigations and update-sensitive files (`.html`, `.json`, `.js`, `.css`, `manifest.webmanifest`) use network-first with cache fallback.
- Other same-origin `GET` requests use cache-first with background runtime cache updates.
- `admin/*` and `oauth-worker/*` are excluded from service worker handling.
- Service worker updates are checked on load, periodically, and when the tab becomes active.
- New service worker versions are promoted immediately (`skipWaiting`) and pages auto-reload once control switches.

### Rolling out content/code updates

- Deploy content changes normally; online clients fetch fresh network responses first and cache fallback is used only when needed.
- When changing pre-cached shell behavior, bump `CACHE_VERSION` in `service-worker.js` to evict older caches cleanly.
- Service worker script updates are requested with `updateViaCache: 'none'`, so clients detect new worker code without waiting for stale browser cache.

### Verify PWA locally

Serve the project over `http://localhost` (or deployed `https`) and test in browser DevTools:

1. Open **Application** → verify manifest + icons are detected.
2. Confirm service worker is active and controlling the page.
3. Use **Lighthouse** (PWA category) to check installability.
4. Toggle offline mode and reload previously visited pages to confirm fallback works.

## Android APK/AAB for Play Store

Use Trusted Web Activity (TWA) to package this PWA as an Android app.

- Detailed guide: `docs/android-playstore-guide.md`
- Asset links generator: `scripts/generate-assetlinks.mjs`

Quick start:

```bash
npm install -g @bubblewrap/cli

bubblewrap init \
  --manifest https://www.leadsshillong.com/manifest.webmanifest \
  --domain www.leadsshillong.com \
  --applicationId com.leadsshillong.app \
  --name "LEADS Higher Secondary School" \
  --launcherName "LEADS"

cd twa-build
./gradlew bundleRelease
./gradlew assembleRelease
```

For Play Console upload, prefer the generated `.aab` from `bundleRelease`.

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

## Google Analytics (GA4)

Google Analytics is wired through `js/analytics.js` and reads settings from `admin/config.json` under `integrations`.

1. Create a GA4 web data stream in Google Analytics.
2. Copy your Measurement ID (format: `G-XXXXXXXXXX`).
3. Update `admin/config.json`:

```json
"integrations": {
  "googleAnalyticsEnabled": true,
  "googleAnalyticsMeasurementId": "G-XXXXXXXXXX",
  "googleAnalyticsDebug": false,
  "googleAnalyticsDedupeMs": 300
}
```

4. Deploy your site.
5. Verify in GA Realtime report by opening the website in a new browser tab.

Notes:

- Keep `googleAnalyticsEnabled` as `false` to disable tracking without removing script tags.
- If `googleAnalyticsMeasurementId` is empty/invalid, analytics initialization is skipped safely.
- `googleAnalyticsDebug` logs analytics initialization/events to console; localhost is always treated as debug.
- `googleAnalyticsDedupeMs` controls duplicate suppression for rapid repeat clicks (default `300`, clamped `0-2000`).

### GA test checklist

After deploy, verify in this order:

1. Open your site in an incognito/private window.
2. Open browser DevTools Console and confirm:
  - With `googleAnalyticsDebug: true` (or localhost), you see `[GA Debug] Analytics initialized`.
  - You see event logs when clicking tracked actions.
3. In GA4 **Realtime**, confirm:
  - Your active user appears.
  - `page_view` appears for visited pages.
4. Trigger key actions and confirm custom events appear:
  - `payment_click`
  - `admissions_click`
  - `contact_click`
  - `download_click`
5. (Optional) In GA4 **DebugView**, verify event payloads for parameters such as `payment_type`, `contact_type`, `link_text`, and `file_url`.
6. Set `googleAnalyticsDebug` back to `false` for production once validation is complete.

### Event dictionary

| Event name | When it fires | Parameters |
| --- | --- | --- |
| `payment_click` | Click on fee/payment CTAs (`#global-payment-regular`, `#global-payment-admission`, `#global-payment-events`, `#global-payment-uniforms`) | `payment_type`, `link_text` |
| `admissions_click` | Click on admissions links/buttons (`global-link-admissions*` IDs or links ending with `admissions.html`) | `link_text`, `link_url` |
| `contact_click` | Click on phone (`tel:`), email (`mailto:`), or map links | `contact_type` (`phone`/`email`/`maps`), `link_text` |
| `social_click` | Click on outbound social links (Facebook, Instagram, YouTube, Twitter/X) | `platform`, `link_url`, `link_text` |
| `download_click` | Click on anchors with `download` attribute or links ending in `.pdf` | `file_url`, `link_text` |

## Theme configuration

Theme settings live in `admin/config.json` under `theme` and are applied globally by `js/config.js`.

- `Universal` is the default baseline theme and preserves the original site look (including homepage/faculty styling).
- Popular themes are pre-listed in `theme.themes` and can stay inactive until needed.
- Activate exactly one theme at a time using `active: true`.
- If multiple themes are accidentally set active, runtime logic keeps one active theme automatically.
