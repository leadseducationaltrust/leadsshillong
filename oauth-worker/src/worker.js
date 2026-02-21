function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach((part) => {
    const [key, ...rest] = part.trim().split('=');
    cookies[key] = decodeURIComponent(rest.join('='));
  });
  return cookies;
}

function randomState() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function getAllowedOrigins(env) {
  const listFromCsv = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (listFromCsv.length > 0) {
    return listFromCsv;
  }

  if (env.ALLOWED_ORIGIN && env.ALLOWED_ORIGIN.trim()) {
    return [env.ALLOWED_ORIGIN.trim()];
  }

  return [];
}

function normalizeOrigin(value) {
  if (!value || typeof value !== 'string') return null;
  const input = value.trim();
  if (!input) return null;

  try {
    return new URL(input).origin;
  } catch {
    try {
      return new URL(`https://${input}`).origin;
    } catch {
      return null;
    }
  }
}

function parseOriginParts(value) {
  try {
    const normalized = normalizeOrigin(value);
    if (!normalized) return null;

    const parsed = new URL(normalized);
    return {
      origin: parsed.origin,
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port
    };
  } catch {
    return null;
  }
}

function originsMatch(candidate, allowed) {
  const candidateParts = parseOriginParts(candidate);
  const allowedParts = parseOriginParts(allowed);
  if (!candidateParts || !allowedParts) return false;

  if (candidateParts.protocol !== allowedParts.protocol) return false;
  if (candidateParts.hostname !== allowedParts.hostname) return false;

  if (allowedParts.port) {
    return candidateParts.port === allowedParts.port;
  }

  return true;
}

function findAllowedOrigin(candidates, allowedOrigins) {
  if (!Array.isArray(candidates) || !Array.isArray(allowedOrigins) || allowedOrigins.length === 0) return null;

  for (const candidate of candidates) {
    const normalized = normalizeOrigin(candidate);
    if (!normalized) continue;

    const matched = allowedOrigins.some((allowedOrigin) => originsMatch(normalized, allowedOrigin));
    if (matched) {
      return normalized;
    }
  }

  return null;
}

function getOriginCandidates(url, request) {
  const origin = url.searchParams.get('origin');
  const siteId = url.searchParams.get('site_id');
  const referer = request.headers.get('Referer');
  const candidates = [origin, referer].filter(Boolean);

  if (siteId) {
    if (/^https?:\/\//i.test(siteId)) {
      candidates.push(siteId);
    } else {
      candidates.push(`http://${siteId}`, `https://${siteId}`);
    }
  }

  return candidates;
}

function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' }
  });
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const allowedOrigins = getAllowedOrigins(env);

      if (url.pathname === '/auth') {
        const originCandidates = getOriginCandidates(url, request);
        const normalizedOrigin = findAllowedOrigin(originCandidates, allowedOrigins);
        if (!normalizedOrigin) {
          return new Response(`Invalid origin: ${originCandidates.join(', ') || '(missing)'}`, { status: 400 });
        }

        const state = randomState();
        const redirectUri = `${url.origin}/callback`;
        const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
        githubAuthUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID || '');
        githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
        githubAuthUrl.searchParams.set('scope', 'repo');
        githubAuthUrl.searchParams.set('state', state);

        const authUrlJson = JSON.stringify(githubAuthUrl.toString());
        const provider = url.searchParams.get('provider') || 'github';
        const providerJson = JSON.stringify(provider);
        const handshakeHtml = `
<!doctype html>
<html>
  <body>
    <script>
      (function() {
        const provider = ${providerJson};
        const authUrl = ${authUrlJson};
        const message = 'authorizing:' + provider;
        let redirected = false;

        function proceed() {
          if (redirected) return;
          redirected = true;
          window.location.assign(authUrl);
        }

        function onMessage(event) {
          if (event.data === message) {
            window.removeEventListener('message', onMessage, false);
            proceed();
          }
        }

        window.addEventListener('message', onMessage, false);

        if (window.opener) {
          try {
            window.opener.postMessage(message, '*');
          } catch (error) {}
        }

        setTimeout(proceed, 1200);
      })();
    </script>
    <p>Connecting to GitHub…</p>
  </body>
</html>`;

        const response = htmlResponse(handshakeHtml);
        response.headers.append('Set-Cookie', `cms_oauth_state=${encodeURIComponent(state)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
        response.headers.append('Set-Cookie', `cms_oauth_origin=${encodeURIComponent(normalizedOrigin)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
        return response;
      }

      if (url.pathname === '/callback') {
        const cookies = parseCookies(request.headers.get('Cookie') || '');
        const state = url.searchParams.get('state');
        const code = url.searchParams.get('code');

        if (!state || !code || !cookies.cms_oauth_state || state !== cookies.cms_oauth_state) {
          return htmlResponse('<h3>OAuth state mismatch. Please close this window and try again.</h3>', 400);
        }

        const origin = cookies.cms_oauth_origin;
        const normalizedOrigin = findAllowedOrigin([origin], allowedOrigins);
        if (!normalizedOrigin) {
          return htmlResponse('<h3>Invalid origin.</h3>', 400);
        }

        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
            state,
            redirect_uri: `${url.origin}/callback`
          })
        });

        const tokenPayload = await tokenResponse.json();
        if (!tokenPayload.access_token) {
          return htmlResponse('<h3>GitHub token exchange failed. Check OAuth app settings and try again.</h3>', 400);
        }

        const token = tokenPayload.access_token;
        const tokenLiteral = JSON.stringify(token);
        const originJson = JSON.stringify(normalizedOrigin);
        const script = `
<!doctype html>
<html>
  <body>
    <script>
      (function() {
        function send() {
          let delivered = false;
          if (window.opener) {
            const message = 'authorization:github:success:' + JSON.stringify({ token: ${tokenLiteral}, provider: 'github' });
            try {
              window.opener.postMessage(message, ${originJson});
              delivered = true;
            } catch (error) {}
            try {
              window.opener.postMessage(message, '*');
              delivered = true;
            } catch (error) {}
            try {
              window.opener.location.hash = '#/';
            } catch (error) {}
            try {
              window.opener.focus();
            } catch (error) {}
          }
          if (delivered) {
            setTimeout(() => window.close(), 700);
          }
        }
        send();
      })();
    </script>
    <p>Authentication complete. You can close this window.</p>
  </body>
</html>`;

        const response = htmlResponse(script);
        response.headers.append('Set-Cookie', 'cms_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
        response.headers.append('Set-Cookie', 'cms_oauth_origin=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
        return response;
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return new Response(`Worker runtime error: ${message}`, { status: 500 });
    }
  }
};
