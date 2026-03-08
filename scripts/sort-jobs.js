const fs = require('node:fs/promises');
const path = require('node:path');

const JOBS_FILE_PATH = path.join(process.cwd(), 'jobs', 'jobs.json');

function parseDate(value) {
  const timestamp = Date.parse(String(value || '').trim());
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getStatusPriority(status) {
  const normalized = String(status || '').trim().toLowerCase();
  return normalized === 'active' ? 0 : 1;
}

function sortJobsByStatusThenDatePostedDesc(jobs) {
  return jobs
    .map((job, index) => ({ job, index }))
    .sort((left, right) => {
      const leftStatus = getStatusPriority(left.job?.status);
      const rightStatus = getStatusPriority(right.job?.status);

      if (leftStatus !== rightStatus) {
        return leftStatus - rightStatus;
      }

      const leftDate = parseDate(left.job?.date_posted);
      const rightDate = parseDate(right.job?.date_posted);

      if (rightDate !== leftDate) {
        return rightDate - leftDate;
      }

      return left.index - right.index;
    })
    .map((item) => item.job);
}

async function main() {
  const raw = await fs.readFile(JOBS_FILE_PATH, 'utf8');
  const parsed = JSON.parse(raw);

  const isArrayRoot = Array.isArray(parsed);
  const isObjectRoot = parsed && typeof parsed === 'object' && !Array.isArray(parsed);
  const items = isArrayRoot ? parsed : isObjectRoot ? parsed.items : null;

  if (!Array.isArray(items)) {
    throw new Error('jobs/jobs.json must be an array or an object with an "items" array.');
  }

  const sorted = sortJobsByStatusThenDatePostedDesc(items);
  const nextPayload = isArrayRoot ? sorted : { ...parsed, items: sorted };
  const nextRaw = `${JSON.stringify(nextPayload, null, 2)}\n`;

  if (nextRaw === raw) {
    console.log('jobs/jobs.json is already sorted by status (active first) and date_posted (desc).');
    return;
  }

  await fs.writeFile(JOBS_FILE_PATH, nextRaw, 'utf8');
  console.log('Sorted jobs/jobs.json by status (active first) and date_posted in descending order.');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
