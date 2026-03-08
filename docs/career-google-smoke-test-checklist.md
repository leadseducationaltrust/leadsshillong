# Career Google-Only Smoke Test (Sheets + Drive)

Use this checklist when Career uses Google Apps Script directly (no worker/email flow).

## Preconditions

- `career.html` has:
  - `<meta name="career-script-url" content="https://script.google.com/macros/s/.../exec">`
- Apps Script Web App deployment is active.
- Drive folder ID in Apps Script is correct.
- Target Google Sheet and headers are created.

## Quick Test

1. Open `career.html` on production.
2. Open an active job and click `Apply Now`.
3. Fill all fields and upload a resume (`pdf/doc/docx` under 5MB).
4. Submit.

Expected:

- Success message appears.
- Optional application id is shown if returned by Apps Script.

## Data Verification

1. Open the target Google Sheet.

Expected:

- New row added with applicant fields.
- `job_code`, `job_title`, `department` are present.

2. Open the target Google Drive folder.

Expected:

- Resume file is uploaded.
- File name includes applicant and job context.

## Failure Map

- `Career script URL is not configured yet`: `career-script-url` meta is blank.
- Network/CORS error: Apps Script deployment access is not set to `Anyone`.
- Missing row/file: wrong `SHEET_NAME` or `DRIVE_FOLDER_ID` in Apps Script.
- Submission error from server: inspect Apps Script execution logs.
