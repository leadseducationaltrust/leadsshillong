# Maintainability + Security Status

This document tracks accepted, implemented controls for this repository.

## Implemented Baseline

### Repository governance
- `.gitignore` is in place for local/system/secrets/tooling artifacts.
- PR checklist is enforced via `.github/pull_request_template.md`.
- Security policy is defined in `SECURITY.md`.

### Content and Link Quality Automation
- JSON Sorting automation:
  - Workflow: `.github/workflows/sort-json-content.yml`
  - Script: `scripts/sort-json-content.mjs`
- Content Validation automation:
  - Workflow: `.github/workflows/validate-content.yml`
  - Script: `scripts/validate-content.mjs`
  - Includes required fields, date checks, URL/path safety, duplicate checks, and near-duplicate warnings.
- Broken Link Check automation:
  - Workflow: `.github/workflows/check-links.yml`
  - Script: `scripts/check-links.mjs`

### Frontend hardening
- Content-driven rendering has been migrated to safe DOM-based patterns.
- URL sanitization and safe external link handling is enforced in frontend scripts.
- Gallery runtime behavior hides broken image entries on load error.

## Current Operating Rules

- Run before PR (or verify CI passes):
  - `node scripts/validate-content.mjs`
  - `node scripts/check-links.mjs`
- Keep OAuth secrets only in Cloudflare Worker secrets.
- Keep `oauth-worker/wrangler.toml` origins restricted to trusted production/local development origins.
- Keep PRs scoped: do not mix unrelated content, refactor, and policy changes.

## Optional Next Improvements

- Add configurable warning thresholds for additional near-duplicate fields.
- Add media dimension/size checks for uploaded assets.
- Add a lightweight release checklist for production deploys.
