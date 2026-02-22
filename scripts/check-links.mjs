import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();

const htmlFiles = [
  'index.html',
  'about.html',
  'admissions.html',
  'contact.html',
  'downloads.html',
  'faculty.html',
  'gallery.html',
  'insights.html',
  'news.html',
  'programs.html',
  'terms.html',
  'admin/index.html'
];

const jsonTargets = [
  { filePath: 'gallery/content.json', pathFields: ['images[].url'] },
  { filePath: 'thought/content.json', pathFields: ['entries[].daily_focus.image'] },
  { filePath: 'faculty/content.json', pathFields: ['members[].img'] }
];

function hasExplicitScheme(value) {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value);
}

function shouldSkipLink(value) {
  const text = String(value || '').trim();
  if (!text) return true;
  if (text.includes('${')) return true;
  if (text.startsWith('#')) return true;
  if (text.startsWith('javascript:')) return true;
  if (text.startsWith('mailto:') || text.startsWith('tel:')) return true;
  if (text.startsWith('data:')) return true;
  if (hasExplicitScheme(text)) return true;
  return false;
}

function normalizeLocalPath(targetPath) {
  const clean = String(targetPath || '').trim();
  if (!clean) return '';
  const noQuery = clean.split('?')[0].split('#')[0];
  const withoutLeadingSlash = noQuery.replace(/^\/+/, '');
  return withoutLeadingSlash;
}

async function fileExists(relativePath) {
  try {
    await access(path.join(rootDir, relativePath));
    return true;
  } catch {
    return false;
  }
}

function extractHtmlLinks(html) {
  const links = [];
  const regex = /<(a|img|script|link|source|iframe)\b[^>]*(href|src)=(["'])(.*?)\3/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    links.push(match[4]);
  }

  return links;
}

function getByPath(root, pathExpression) {
  const segments = pathExpression.split('.');
  const values = [root];

  for (const segment of segments) {
    const next = [];
    const isArraySegment = segment.endsWith('[]');
    const key = isArraySegment ? segment.slice(0, -2) : segment;

    values.forEach((value) => {
      if (value === null || value === undefined) {
        return;
      }

      const picked = key ? value[key] : value;
      if (isArraySegment) {
        if (Array.isArray(picked)) {
          picked.forEach((entry) => next.push(entry));
        }
      } else {
        next.push(picked);
      }
    });

    values.splice(0, values.length, ...next);
  }

  return values;
}

async function checkHtmlFiles(errors) {
  for (const htmlPath of htmlFiles) {
    const raw = await readFile(path.join(rootDir, htmlPath), 'utf8');
    const links = extractHtmlLinks(raw);

    for (const link of links) {
      if (shouldSkipLink(link)) {
        continue;
      }

      const localPath = normalizeLocalPath(link);
      if (!localPath) {
        continue;
      }

      const exists = await fileExists(localPath);
      if (!exists) {
        errors.push(`${htmlPath}: broken local link/path -> ${link}`);
      }
    }
  }
}

async function checkJsonTargets(errors) {
  for (const target of jsonTargets) {
    const raw = await readFile(path.join(rootDir, target.filePath), 'utf8');
    const data = JSON.parse(raw);

    for (const fieldPath of target.pathFields) {
      const values = getByPath(data, fieldPath);

      for (const value of values) {
        const text = String(value || '').trim();
        if (!text || shouldSkipLink(text)) {
          continue;
        }

        const localPath = normalizeLocalPath(text);
        if (!localPath) {
          continue;
        }

        const exists = await fileExists(localPath);
        if (!exists) {
          errors.push(`${target.filePath}: broken local path at ${fieldPath} -> ${text}`);
        }
      }
    }
  }
}

async function main() {
  const errors = [];

  await checkHtmlFiles(errors);
  await checkJsonTargets(errors);

  if (errors.length > 0) {
    console.error('Link check failed:\n');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log('Link check passed.');
}

main().catch((error) => {
  console.error('Link check runtime error:', error);
  process.exit(1);
});
