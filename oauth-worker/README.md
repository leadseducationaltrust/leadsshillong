# Decap OAuth Proxy for GitHub Pages

This worker provides the OAuth endpoints Decap CMS needs when the main site is hosted on GitHub Pages.

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
4. Update `wrangler.toml`:
   - Set `ALLOWED_ORIGINS` with all accepted site origins (comma-separated), for example:
     - `https://www.leadsshillong.com,https://leadsshillong.com`
5. Deploy:
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
