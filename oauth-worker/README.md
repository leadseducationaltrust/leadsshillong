# Decap OAuth Proxy for GitHub Pages

This worker provides the OAuth endpoints Decap CMS needs when the main site is hosted on GitHub Pages.
It now also supports a career application API endpoint: `POST /api/career/apply`.

## 1) Create a GitHub OAuth App

In GitHub Settings → Developer settings → OAuth Apps → New OAuth App:

- **Application name**: LEADS CMS
- **Homepage URL**: `https://www.leadsshillong.com`
- **Authorization callback URL**: `https://YOUR-OAUTH-WORKER.workers.dev/callback`

Save and copy:
- Client ID
- Client Secret

## 2) Deploy Worker

Inside `oauth-worker/`:

1. Install Wrangler:
   - `npm i -g wrangler`
2. Login:
   - `wrangler login`
3. Set required secrets:
   - `wrangler secret put GITHUB_CLIENT_ID`
   - `wrangler secret put GITHUB_CLIENT_SECRET`
   - `wrangler secret put RESEND_API_KEY`
   - `wrangler secret put GOOGLE_SHEETS_WEBHOOK_SECRET`
   - `wrangler secret put TURNSTILE_SECRET_KEY`
4. Update `wrangler.toml`:
   - Set `ALLOWED_ORIGINS` with all accepted site origins (comma-separated), for example:
     - `https://www.leadsshillong.com,https://leadsshillong.com`
   - Set `CAREER_EMAIL_FROM` and `CAREER_EMAIL_TO`
   - Set `GOOGLE_SHEETS_WEBHOOK_URL` to your Apps Script web app URL
   - Optional: set `RESUME_PUBLIC_BASE_URL` if resumes are uploaded to R2 with a public/custom domain
5. Optional R2 binding for resume storage:

```toml
[[r2_buckets]]
binding = "RESUME_BUCKET"
bucket_name = "career-resumes"
```

Optional KV binding for per-IP rate limiting:

```toml
[[kv_namespaces]]
binding = "CAREER_RATE_LIMIT_KV"
id = "YOUR_KV_NAMESPACE_ID"
preview_id = "YOUR_KV_PREVIEW_ID"
```

6. Deploy:
   - `wrangler deploy`
Copy your deployed worker URL, e.g. `https://leadsshillong-cms-oauth.<subdomain>.workers.dev`.

## 3) Update Decap Config

In `admin/config.yml`, set:

```yml
backend:
  name: github
  repo: leadseducationaltrust/leadsshillong
  branch: main
  base_url: https://YOUR-OAUTH-WORKER.workers.dev
  auth_endpoint: auth
```

## 4) Test

1. Open `https://www.leadsshillong.com/admin/`
2. Click login
3. Complete GitHub auth popup
4. Confirm CMS loads and can save content

If popup shows `Not Found`, verify callback URL and `base_url` exactly match worker deployment URL.

## Career API setup (Google Sheets + Email)

### 1) Configure frontend endpoint

In `career.html`, set:

```html
<meta name="career-api-endpoint" content="https://YOUR-OAUTH-WORKER.workers.dev/api/career/apply">
<meta name="career-turnstile-site-key" content="YOUR_TURNSTILE_SITE_KEY">
```

If you later route the worker on the same domain, you can use `/api/career/apply`.

### 2) Google Sheets webhook

Create an Apps Script web app that appends each submission row and validates a shared secret.
Set:

- `GOOGLE_SHEETS_WEBHOOK_URL` (wrangler var)
- `GOOGLE_SHEETS_WEBHOOK_SECRET` (wrangler secret)

The worker calls this webhook after processing each application.

### 3) Email delivery

The worker uses Resend API and sends application details + attached resume to `CAREER_EMAIL_TO`.

Required:

- `RESEND_API_KEY` (secret)
- `CAREER_EMAIL_FROM` (verified sender)
- `CAREER_EMAIL_TO` (receiver inbox, e.g. `support@leadsshillong.com`)

### 4) Turnstile bot protection

Frontend sends `turnstile_token`; worker validates it when `TURNSTILE_SECRET_KEY` is configured.

Required:

- Site key in `career.html` meta tag `career-turnstile-site-key`
- Secret in worker: `TURNSTILE_SECRET_KEY`

### 5) Rate limiting (optional but recommended)

When `CAREER_RATE_LIMIT_KV` binding is configured, the worker enforces per-IP limits.

Config vars:

- `RATE_LIMIT_WINDOW_SECONDS` (default `60`)
- `RATE_LIMIT_MAX_PER_WINDOW` (default `8`)

### 6) Resume file storage (optional)

If `RESUME_BUCKET` is configured, resume files are uploaded to R2 under:

- `resumes/YYYY/MM/<application_id>-<filename>`

If `RESUME_PUBLIC_BASE_URL` is set, the stored URL is included in email/webhook payload.
