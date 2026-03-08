# Career Application Smoke Test (5 Minutes)

Use this checklist after every production deployment of the Career submission pipeline.

## Prerequisites

Confirm these are already configured:

- `career.html` has `career-api-endpoint` set to your deployed Worker route.
- `career.html` has `career-turnstile-site-key` set.
- Worker secrets exist:
  - `RESEND_API_KEY`
  - `GOOGLE_SHEETS_WEBHOOK_SECRET`
  - `TURNSTILE_SECRET_KEY`
- Worker vars exist:
  - `CAREER_EMAIL_FROM`
  - `CAREER_EMAIL_TO` (should be `support@leadsshillong.com`)
  - `GOOGLE_SHEETS_WEBHOOK_URL`

## Test Data

Use this data for browser testing:

- First Name: `Smoke`
- Last Name: `Test`
- DOB: `1995-05-20`
- Email: `smoke.test@example.com`
- Phone: `9876543210`
- Qualification: `M.Ed`
- Experience Years: `4`
- Address: `Shillong`
- Cover Letter: `Career smoke test submission`
- Resume: small `.pdf` under 1 MB

## Browser Test (Primary)

1. Open `career.html` on production site.
2. Click any active job card.
3. In details modal, click `Apply Now`.
4. Fill all fields, complete Turnstile, attach resume, submit.

Expected:

- Success message appears.
- Success message contains `application_id` (format similar to `LEADS-YYYYMMDD-XXXXXX`).

## Delivery Validation

1. Check `support@leadsshillong.com` inbox.

Expected:

- New email arrives.
- Email subject includes application ID and job code.
- Resume is attached.

2. Check Google Sheet logging target.

Expected:

- New row is appended.
- `application_id`, applicant fields, and `status` are populated.

## Security Validation

### Turnstile enforcement

1. Open apply form.
2. Do not complete Turnstile.
3. Submit form.

Expected:

- Submission blocked in UI with security check message.

### Honeypot rejection (backend)

Run from terminal by replacing placeholders:

```bash
curl -i -X POST "https://YOUR-WORKER.workers.dev/api/career/apply" \
  -F "job_code=LEADS-CS-2026-002" \
  -F "job_title=Computer Science Teacher" \
  -F "department=STEM" \
  -F "first_name=Bot" \
  -F "last_name=Probe" \
  -F "dob=1990-01-01" \
  -F "email=bot@example.com" \
  -F "phone=9999999999" \
  -F "qualification=Any" \
  -F "experience_years=2" \
  -F "address=Nowhere" \
  -F "cover_letter=test" \
  -F "company_website=https://spam.example" \
  -F "resume=@/ABSOLUTE/PATH/TO/test.pdf"
```

Expected:

- HTTP `400` with spam detection error.

### Rate limit check (if KV binding enabled)

1. Submit the form repeatedly from same network/IP.

Expected:

- After threshold, API returns HTTP `429`.
- UI shows "Too many" style message.

## Quick Failure Map

- `Application endpoint is not configured`: missing/empty `career-api-endpoint` meta value.
- `Security verification failed`: Turnstile site key/secret mismatch or missing token.
- `Email delivery failed`: invalid Resend key or unverified sender domain.
- `Google Sheets logging failed`: bad Apps Script URL or secret mismatch.
- CORS error in browser console: origin missing in `CAREER_CORS_ALLOWED_ORIGINS`.

## Sign-off

Mark deployment as passed only when all checks below are true:

- Browser submit success: `PASS`
- Email received: `PASS`
- Sheet row logged: `PASS`
- Turnstile blocking works: `PASS`
- Rate limit behavior verified (if enabled): `PASS`
