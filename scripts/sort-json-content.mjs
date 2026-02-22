import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();

const targets = [
  {
    filePath: 'news/content.json',
    arrayPath: ['items'],
    dateField: 'date',
  },
  {
    filePath: 'thought/content.json',
    arrayPath: ['entries'],
    dateField: 'date',
  },
  {
    filePath: 'downloads/content.json',
    arrayPath: ['items'],
    dateField: 'timestamp',
  },
  {
    filePath: 'gallery/content.json',
    arrayPath: ['images'],
    dateField: 'date',
  },
  {
    filePath: 'calendar/content.json',
    arrayPath: ['entries'],
    dateFields: ['date', 'startDate', 'endDate'],
  },
];

function parseTimestamp(value) {
  if (!value) return 0;
  const text = String(value).trim();
  if (!text) return 0;

  // Handles values like "YYYY-MM-DD HH:mm" in news data
  const normalized = text.includes(' ') && !text.includes('T')
    ? text.replace(' ', 'T')
    : text;

  const parsed = Date.parse(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getArrayContainer(root, keyPath) {
  let cursor = root;
  for (let index = 0; index < keyPath.length - 1; index += 1) {
    if (!cursor || typeof cursor !== 'object') {
      return null;
    }
    cursor = cursor[keyPath[index]];
  }
  return cursor;
}

function getItemTimestamp(item, target) {
  if (Array.isArray(target.dateFields) && target.dateFields.length > 0) {
    for (const field of target.dateFields) {
      const value = parseTimestamp(item?.[field]);
      if (value > 0) {
        return value;
      }
    }
    return 0;
  }

  return parseTimestamp(item?.[target.dateField]);
}

function sortByDateDesc(items, target) {
  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const leftTime = getItemTimestamp(left.item, target);
      const rightTime = getItemTimestamp(right.item, target);

      if (rightTime !== leftTime) {
        return rightTime - leftTime;
      }

      return left.index - right.index;
    })
    .map((entry) => entry.item);
}

async function processTarget(target) {
  const absolutePath = path.join(rootDir, target.filePath);
  const originalRaw = await readFile(absolutePath, 'utf8');
  const parsed = JSON.parse(originalRaw);

  const container = getArrayContainer(parsed, target.arrayPath);
  const leafKey = target.arrayPath[target.arrayPath.length - 1];

  if (!container || !Array.isArray(container[leafKey])) {
    return false;
  }

  const sorted = sortByDateDesc(container[leafKey], target);
  container[leafKey] = sorted;

  const nextRaw = `${JSON.stringify(parsed, null, 2)}\n`;
  if (nextRaw === originalRaw) {
    return false;
  }

  await writeFile(absolutePath, nextRaw, 'utf8');
  return true;
}

async function main() {
  let changedAny = false;

  for (const target of targets) {
    const changed = await processTarget(target);
    if (changed) {
      changedAny = true;
      console.log(`Sorted ${target.filePath}`);
    }
  }

  if (!changedAny) {
    console.log('No sorting changes needed.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
