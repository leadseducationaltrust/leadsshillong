# Career Setup: Google Sheets + Google Drive Only

This setup stores career applications in Google Sheets and resumes in Google Drive using Google Apps Script.

## Overview

Flow:

1. `career.html` form collects applicant details and resume.
2. Frontend sends JSON payload to Google Apps Script Web App URL.
3. Apps Script:
   - saves resume file in Google Drive folder
   - appends applicant record to Google Sheet
4. Frontend shows success message.

No email notification is used in this mode.

## 1) Create Google Sheet

1. Create a new sheet named `Career Applications`.
2. In the first row, create these headers in order:

- `application_id`
- `applied_at`
- `job_code`
- `job_title`
- `department`
- `first_name`
- `last_name`
- `dob`
- `email`
- `phone`
- `qualification`
- `experience_years`
- `address`
- `cover_letter`
- `resume_file_name`
- `resume_drive_url`
- `status`

## 2) Create Google Drive folder

1. Create folder `Career Resumes` in Google Drive.
2. Copy the folder ID from URL:

`https://drive.google.com/drive/folders/<FOLDER_ID>`

## 3) Create Apps Script Web App

1. In the sheet, open `Extensions -> Apps Script`.
2. Replace script with this code:

```javascript
const SHEET_NAME = 'Sheet1'; // change if needed
const DRIVE_FOLDER_ID = 'PASTE_DRIVE_FOLDER_ID_HERE';

function makeJsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function toBlob(base64Data, mimeType, fileName) {
  const bytes = Utilities.base64Decode(base64Data);
  return Utilities.newBlob(bytes, mimeType || 'application/octet-stream', fileName || 'resume');
}

function generateApplicationId() {
  const now = new Date();
  const tz = Session.getScriptTimeZone() || 'Asia/Kolkata';
  const ymd = Utilities.formatDate(now, tz, 'yyyyMMdd');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LEADS-${ymd}-${rand}`;
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');

    const required = [
      'job_code', 'job_title', 'first_name', 'last_name', 'dob',
      'email', 'phone', 'qualification', 'experience_years', 'address',
      'cover_letter'
    ];

    for (var i = 0; i < required.length; i++) {
      const key = required[i];
      if (!String(payload[key] || '').trim()) {
        return makeJsonResponse({ status: 'error', message: `Missing field: ${key}` });
      }
    }

    const resume = payload.files && payload.files.resume;
    if (!resume || !resume.data) {
      return makeJsonResponse({ status: 'error', message: 'Resume is required.' });
    }

    const appId = generateApplicationId();
    const appliedAt = new Date().toISOString();

    const safeName = String(resume.name || `${appId}_Resume`)
      .replace(/[^a-zA-Z0-9._-]/g, '_');

    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const blob = toBlob(resume.data, resume.type, safeName);
    const file = folder.createFile(blob);
    const driveUrl = file.getUrl();

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

    sheet.appendRow([
      appId,
      appliedAt,
      payload.job_code || '',
      payload.job_title || '',
      payload.department || '',
      payload.first_name || '',
      payload.last_name || '',
      payload.dob || '',
      payload.email || '',
      payload.phone || '',
      payload.qualification || '',
      payload.experience_years || '',
      payload.address || '',
      payload.cover_letter || '',
      safeName,
      driveUrl,
      'new'
    ]);

    return makeJsonResponse({ status: 'success', application_id: appId });
  } catch (err) {
    return makeJsonResponse({ status: 'error', message: err.message || 'Submission failed.' });
  }
}
```

3. Update:
- `SHEET_NAME`
- `DRIVE_FOLDER_ID`

4. Click `Deploy -> New deployment`.
5. Type: `Web app`.
6. Execute as: `Me`.
7. Who has access: `Anyone`.
8. Deploy and copy the Web App URL.

## 4) Configure career.html

In `career.html`, set:

```html
<meta name="career-script-url" content="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec">
```

## 5) Deploy website changes

Commit/publish your website changes normally.

## 6) Test

1. Open `career.html`.
2. Click active job -> `Apply Now`.
3. Fill form and attach resume.
4. Submit.

Expected:

- Success message appears with application ID.
- A new file is created inside your Drive folder.
- A new row is appended in the sheet with the file URL.

## Notes

- This mode intentionally does not send email notifications.
- Resume upload size is currently validated on frontend (max 5MB).
- If CORS errors occur, redeploy Apps Script as `Anyone` and use latest deployment URL.
