# Security Policy

## Supported Scope
This policy applies to the entire repository, including the public website, Decap CMS admin, and OAuth worker.

## Reporting a Vulnerability
If you find a security issue, **do not open a public GitHub issue**.

Please report privately to the maintainers with:
- Affected file/path
- Steps to reproduce
- Impact assessment
- Suggested mitigation (if known)

Maintainers should acknowledge within 72 hours and provide status updates until resolution.

## Enforced Repository Controls

The following controls are already implemented and active:

- Content Validation CI: `.github/workflows/validate-content.yml` (`scripts/validate-content.mjs`)
- Broken Link Check CI: `.github/workflows/check-links.yml` (`scripts/check-links.mjs`)
- JSON Sorting automation: `.github/workflows/sort-json-content.yml` (`scripts/sort-json-content.mjs`)
- PR quality checklist: `.github/pull_request_template.md`
- Dependabot for GitHub Actions: `.github/dependabot.yml`

## Public Repo Safety Rules
- Never commit credentials, tokens, or secrets.
- Keep OAuth secrets only in Cloudflare Worker secrets (`wrangler secret put ...`).
- Restrict OAuth origins to trusted production and explicit localhost entries only.
- Avoid unsafe HTML injection for content-driven rendering.
- Require review before merging content/model/schema changes.

## Mandatory Security Checks Before Merge
- [ ] No secrets in diff (`.env`, API keys, tokens, client secrets)
- [ ] External links use safe targets (`rel="noopener noreferrer"` for `target="_blank"`)
- [ ] User/content JSON is sanitized or rendered safely
- [ ] GitHub Actions use least privileges
- [ ] OAuth worker allows only approved origins
- [ ] `node scripts/validate-content.mjs` passes
- [ ] `node scripts/check-links.mjs` passes

## Incident Response (Minimal)
1. Revoke exposed credentials/tokens immediately.
2. Rotate secrets in provider dashboards.
3. Patch code and add regression checks.
4. Document timeline, impact, and preventive actions.
