function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach((part) => {
    const [key, ...rest] = part.trim().split('=');
    cookies[key] = decodeURIComponent(rest.join('='));
  });
  return cookies;
}

function jsonResponse(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...extraHeaders
    }
  });
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

function getCorsAllowedOrigins(env) {
  const explicit = (env.CAREER_CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (explicit.length > 0) {
    return explicit;
  }

  return getAllowedOrigins(env);
}

function resolveCorsOrigin(request, env) {
  const requestOrigin = request.headers.get('Origin');
  if (!requestOrigin) {
    return null;
  }

  const allowedOrigins = getCorsAllowedOrigins(env);
  return findAllowedOrigin([requestOrigin], allowedOrigins);
}

function getCorsHeaders(request, env) {
  const allowedOrigin = resolveCorsOrigin(request, env);
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };

  if (allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin;
  }

  return headers;
}

function cleanText(value) {
  return String(value || '').trim();
}

function getClientIp(request) {
  return cleanText(request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
}

function sanitizeFileName(name) {
  return cleanText(name)
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 120) || 'resume';
}

function randomCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => chars[byte % chars.length]).join('');
}

function generateApplicationId(now = new Date()) {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `LEADS-${y}${m}${d}-${randomCode(6)}`;
}

function validateCareerFields(fields, resumeFile) {
  const requiredFieldNames = [
    'job_code',
    'job_title',
    'first_name',
    'last_name',
    'dob',
    'email',
    'phone',
    'qualification',
    'experience_years',
    'address',
    'cover_letter'
  ];

  for (const field of requiredFieldNames) {
    if (!cleanText(fields[field])) {
      return `Missing required field: ${field}`;
    }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanText(fields.dob))) {
    return 'Invalid DOB format. Expected YYYY-MM-DD.';
  }

  const email = cleanText(fields.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Invalid email address.';
  }

  const years = Number.parseFloat(cleanText(fields.experience_years));
  if (Number.isNaN(years) || years < 0 || years > 80) {
    return 'Invalid experience value.';
  }

  if (!(resumeFile instanceof File)) {
    return 'Resume file is required.';
  }

  const allowedMime = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]);
  const lowerName = String(resumeFile.name || '').toLowerCase();
  const validExtension = ['.pdf', '.doc', '.docx'].some((ext) => lowerName.endsWith(ext));

  if (!validExtension && !allowedMime.has(resumeFile.type)) {
    return 'Resume must be a PDF, DOC, or DOCX file.';
  }

  const maxBytes = 5 * 1024 * 1024;
  if (resumeFile.size > maxBytes) {
    return 'Resume exceeds 5MB limit.';
  }

  return null;
}

function arrayBufferToBase64(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  const chunk = 0x8000;

  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, i + chunk);
    binary += String.fromCharCode(...slice);
  }

  return btoa(binary);
}

function buildCareerEmailBody(payload) {
  const lines = [
    `Application ID: ${payload.application_id}`,
    `Applied At (UTC): ${payload.applied_at_utc}`,
    `Job Code: ${payload.job_code}`,
    `Job Title: ${payload.job_title}`,
    `Department: ${payload.department || 'N/A'}`,
    `Name: ${payload.first_name} ${payload.last_name}`,
    `DOB: ${payload.dob}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Qualification: ${payload.qualification}`,
    `Experience (years): ${payload.experience_years}`,
    `Address: ${payload.address}`,
    `Resume URL: ${payload.resume_url || 'Not available'}`,
    '',
    'Cover Letter:',
    payload.cover_letter
  ];

  return lines.join('\n');
}

async function sendCareerEmail(payload, resumeFile, env) {
  if (!env.RESEND_API_KEY || !env.CAREER_EMAIL_FROM || !env.CAREER_EMAIL_TO) {
    throw new Error('Email service is not configured. Set RESEND_API_KEY, CAREER_EMAIL_FROM, and CAREER_EMAIL_TO.');
  }

  const attachmentBuffer = await resumeFile.arrayBuffer();
  const attachmentBase64 = arrayBufferToBase64(attachmentBuffer);
  const safeFileName = sanitizeFileName(resumeFile.name || `${payload.application_id}-resume.pdf`);
  const textBody = buildCareerEmailBody(payload);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.CAREER_EMAIL_FROM,
      to: [env.CAREER_EMAIL_TO],
      reply_to: payload.email,
      subject: `New Job Application - ${payload.application_id} - ${payload.job_code}`,
      text: textBody,
      attachments: [
        {
          filename: safeFileName,
          content: attachmentBase64
        }
      ]
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Email delivery failed: ${details}`);
  }
}

async function uploadResumeIfConfigured(payload, resumeFile, env) {
  if (!env.RESUME_BUCKET || typeof env.RESUME_BUCKET.put !== 'function') {
    return '';
  }

  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const key = `resumes/${yyyy}/${mm}/${payload.application_id}-${sanitizeFileName(resumeFile.name)}`;

  await env.RESUME_BUCKET.put(key, resumeFile.stream(), {
    httpMetadata: {
      contentType: resumeFile.type || 'application/octet-stream'
    }
  });

  const baseUrl = cleanText(env.RESUME_PUBLIC_BASE_URL);
  if (!baseUrl) {
    return `r2://${key}`;
  }

  return `${baseUrl.replace(/\/$/, '')}/${key}`;
}

async function logCareerApplicationToSheets(payload, env) {
  const webhookUrl = cleanText(env.GOOGLE_SHEETS_WEBHOOK_URL);
  if (!webhookUrl) {
    return;
  }

  const endpoint = new URL(webhookUrl);
  if (env.GOOGLE_SHEETS_WEBHOOK_SECRET) {
    endpoint.searchParams.set('secret', env.GOOGLE_SHEETS_WEBHOOK_SECRET);
  }

  const response = await fetch(endpoint.toString(), {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Google Sheets logging failed: ${details}`);
  }
}

async function verifyTurnstileToken(token, ip, env) {
  if (!env.TURNSTILE_SECRET_KEY) {
    return;
  }

  const normalizedToken = cleanText(token);
  if (!normalizedToken) {
    throw new Error('Security check failed. Turnstile token missing.');
  }

  const body = new URLSearchParams();
  body.set('secret', env.TURNSTILE_SECRET_KEY);
  body.set('response', normalizedToken);
  body.set('remoteip', ip || '');

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  const result = await response.json().catch(() => ({ success: false }));
  if (!response.ok || !result.success) {
    throw new Error('Security verification failed. Please retry and submit again.');
  }
}

async function enforceRateLimit(request, env) {
  if (!env.CAREER_RATE_LIMIT_KV || typeof env.CAREER_RATE_LIMIT_KV.get !== 'function') {
    return;
  }

  const windowSeconds = Math.max(30, Number.parseInt(cleanText(env.RATE_LIMIT_WINDOW_SECONDS || '60'), 10) || 60);
  const limit = Math.max(1, Number.parseInt(cleanText(env.RATE_LIMIT_MAX_PER_WINDOW || '8'), 10) || 8);

  const ip = getClientIp(request);
  const nowEpoch = Math.floor(Date.now() / 1000);
  const windowId = Math.floor(nowEpoch / windowSeconds);
  const key = `career-rate:${ip}:${windowId}`;

  const currentRaw = await env.CAREER_RATE_LIMIT_KV.get(key);
  const current = Number.parseInt(cleanText(currentRaw || '0'), 10) || 0;

  if (current >= limit) {
    throw new Error('Too many application attempts from this network. Please try again shortly.');
  }

  await env.CAREER_RATE_LIMIT_KV.put(key, String(current + 1), {
    expirationTtl: windowSeconds + 5
  });
}

async function handleCareerApplication(request, env) {
  const corsHeaders = getCorsHeaders(request, env);

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405, corsHeaders);
  }

  const contentType = cleanText(request.headers.get('content-type')).toLowerCase();
  if (!contentType.includes('multipart/form-data')) {
    return jsonResponse({ ok: false, error: 'Expected multipart/form-data request.' }, 400, corsHeaders);
  }

  const formData = await request.formData();
  const resume = formData.get('resume');
  const companyWebsite = cleanText(formData.get('company_website'));
  const turnstileToken = cleanText(formData.get('turnstile_token'));

  if (companyWebsite) {
    return jsonResponse({ ok: false, error: 'Spam detection triggered.' }, 400, corsHeaders);
  }

  try {
    await enforceRateLimit(request, env);
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message || 'Too many requests.' }, 429, corsHeaders);
  }

  const fields = {
    job_code: formData.get('job_code'),
    job_title: formData.get('job_title'),
    department: formData.get('department'),
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    dob: formData.get('dob'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    qualification: formData.get('qualification'),
    experience_years: formData.get('experience_years'),
    address: formData.get('address'),
    cover_letter: formData.get('cover_letter')
  };

  const validationError = validateCareerFields(fields, resume);
  if (validationError) {
    return jsonResponse({ ok: false, error: validationError }, 400, corsHeaders);
  }

  const now = new Date();
  const clientIp = getClientIp(request);

  try {
    await verifyTurnstileToken(turnstileToken, clientIp, env);
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message || 'Security verification failed.' }, 400, corsHeaders);
  }

  const payload = {
    application_id: generateApplicationId(now),
    applied_at_utc: now.toISOString(),
    job_code: cleanText(fields.job_code),
    job_title: cleanText(fields.job_title),
    department: cleanText(fields.department),
    first_name: cleanText(fields.first_name),
    last_name: cleanText(fields.last_name),
    dob: cleanText(fields.dob),
    email: cleanText(fields.email),
    phone: cleanText(fields.phone),
    qualification: cleanText(fields.qualification),
    experience_years: cleanText(fields.experience_years),
    address: cleanText(fields.address),
    cover_letter: cleanText(fields.cover_letter),
    resume_url: ''
  };

  try {
    payload.resume_url = await uploadResumeIfConfigured(payload, resume, env);
    await sendCareerEmail(payload, resume, env);
    await logCareerApplicationToSheets(payload, env);

    return jsonResponse({
      ok: true,
      application_id: payload.application_id
    }, 200, corsHeaders);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Application processing failed.';
    return jsonResponse({ ok: false, error: message }, 500, corsHeaders);
  }
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const allowedOrigins = getAllowedOrigins(env);

      if (url.pathname === '/api/career/apply') {
        return handleCareerApplication(request, env);
      }

      if (url.pathname === '/auth') {
        const originCandidates = getOriginCandidates(url, request);
        const normalizedOrigin = findAllowedOrigin(originCandidates, allowedOrigins);
        if (!normalizedOrigin) {
          return new Response('Origin not allowed.', { status: 400 });
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
        const handshakeOriginJson = JSON.stringify(normalizedOrigin);
        const handshakeHtml = `
<!doctype html>
<html>
  <body>
    <script>
      (function() {
        const provider = ${providerJson};
        const authUrl = ${authUrlJson};
        const targetOrigin = ${handshakeOriginJson};
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
            window.opener.postMessage(message, targetOrigin);
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
