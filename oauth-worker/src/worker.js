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

function isAllowedOrigin(origin, allowedOrigins) {
  if (!origin || !Array.isArray(allowedOrigins) || allowedOrigins.length === 0) return false;
  return allowedOrigins.includes(origin);
}

function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const allowedOrigins = getAllowedOrigins(env);

    if (url.pathname === '/auth') {
      const origin = url.searchParams.get('origin');
      if (!isAllowedOrigin(origin, allowedOrigins)) {
        return new Response('Invalid origin', { status: 400 });
      }

      const state = randomState();
      const redirectUri = `${url.origin}/callback`;
      const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
      githubAuthUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
      githubAuthUrl.searchParams.set('scope', 'repo');
      githubAuthUrl.searchParams.set('state', state);

      const response = Response.redirect(githubAuthUrl.toString(), 302);
      response.headers.append('Set-Cookie', `cms_oauth_state=${encodeURIComponent(state)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
      response.headers.append('Set-Cookie', `cms_oauth_origin=${encodeURIComponent(origin)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
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
      if (!isAllowedOrigin(origin, allowedOrigins)) {
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
      const script = `
<!doctype html>
<html>
  <body>
    <script>
      (function() {
        function send() {
          if (window.opener) {
            window.opener.postMessage('authorization:github:success:' + JSON.stringify({ token: '${token}' }), '${origin}');
          }
          window.close();
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
  }
};
