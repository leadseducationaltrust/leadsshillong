# Maintainability + Security Roadmap

This roadmap is designed for this repository and prioritizes fast risk reduction first.

## Phase 1 (Do this week)
1. **Repository hygiene**
   - Keep `.gitignore` in place and never commit local/secret files.
   - Use branch protection on `main` (required PR review, no force-push, signed commits optional).
2. **Security guardrails**
   - Keep OAuth secrets only in Worker secrets.
   - Restrict OAuth origins in `oauth-worker/wrangler.toml` to production + localhost only.
   - Enforce PR checklist (`.github/pull_request_template.md`).
3. **Link safety**
   - Ensure `target="_blank"` links include `rel="noopener noreferrer"`.
4. **Public repo readiness check**
   - Run a secret scan before opening repository (e.g., `gitleaks`).

## Phase 2 (Next 1-2 weeks)
1. **XSS risk reduction (high priority)**
   - Replace dynamic `innerHTML` rendering in:
     - `js/news.js`
     - `js/downloads.js`
     - `js/programs.js`
     - `js/faculty.js`
     - `js/gallery.js`
     - `js/calendar.js`
   - Prefer `textContent` + `createElement` for user/content JSON fields.
2. **Content schema validation**
   - Add JSON schema checks in CI for:
     - `news/content.json`
     - `downloads/content.json`
     - `calendar/content.json`
     - `thought/content.json`
3. **Pin external dependencies**
   - Reduce CDN runtime risk by pinning versions and integrity where possible.

## Phase 3 (Next month)
1. **HTML partial strategy**
   - Remove repeated header/footer blocks by moving to reusable partial generation (build step).
2. **Single content API layer**
   - Centralize fetch + validation in one utility module to avoid duplicated logic.
3. **Automated checks**
   - Add CI checks for broken internal links and JSON format consistency.

## Operational Rules
- Any config/data model change must include README update.
- Keep one owner for CMS schema (`admin/config.yml`) and one backup reviewer.
- Use small PRs: content, security, and refactor changes should not be mixed.

## Suggested Working Order With Copilot
1. Harden one JS file at a time (start with `js/news.js`).
2. Run a quick browser smoke test.
3. Commit with focused message.
4. Repeat for next file.

---

If you want, we can now execute **Phase 2, Step 1** together by refactoring `js/news.js` to remove unsafe HTML injection first.
