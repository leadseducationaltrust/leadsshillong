import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const articlesDir = path.join(rootDir, 'articles');
const outputPath = path.join(articlesDir, 'content.json');

function isSafeArticleId(value) {
  return /^[a-zA-Z0-9_-]+$/.test(String(value || ''));
}

function parseDate(value) {
  if (!value) return 0;
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function getArticleFolders() {
  const entries = await readdir(articlesDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => isSafeArticleId(name));
}

async function readArticleMetadata(articleId) {
  const contentPath = path.join(articlesDir, articleId, 'content.json');

  try {
    const raw = await readFile(contentPath, 'utf8');
    const parsed = JSON.parse(raw);

    return {
      id: articleId,
      title: typeof parsed?.title === 'string' ? parsed.title.trim() : '',
      date: typeof parsed?.date === 'string' ? parsed.date.trim() : ''
    };
  } catch {
    return null;
  }
}

function sortEntries(entries) {
  return [...entries].sort((left, right) => {
    const rightTime = parseDate(right.date);
    const leftTime = parseDate(left.date);

    if (rightTime !== leftTime) {
      return rightTime - leftTime;
    }

    return left.id.localeCompare(right.id);
  });
}

async function buildIndex() {
  const folderIds = await getArticleFolders();
  const metadata = await Promise.all(folderIds.map((id) => readArticleMetadata(id)));

  const items = sortEntries(
    metadata
      .filter((entry) => entry && isSafeArticleId(entry.id))
      .map((entry) => ({
        id: entry.id,
        title: entry.title || entry.id,
        date: entry.date || ''
      }))
  );

  return {
    items
  };
}

async function main() {
  const indexData = await buildIndex();
  const nextRaw = `${JSON.stringify(indexData, null, 2)}\n`;

  let currentRaw = '';
  try {
    currentRaw = await readFile(outputPath, 'utf8');
  } catch {
    currentRaw = '';
  }

  if (currentRaw === nextRaw) {
    console.log('articles/content.json is already up to date.');
    return;
  }

  await writeFile(outputPath, nextRaw, 'utf8');
  console.log(`Updated ${path.relative(rootDir, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
