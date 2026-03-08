import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const programsDir = path.join(rootDir, 'programs');
const outputPath = path.join(programsDir, 'content.json');
const legacyOrder = [
  'preprimary',
  'primary',
  'middle',
  'secondary',
  'higher_secondary_science',
  'higher_secondary_arts',
  'intervention'
];

const legacyOrderMap = new Map(legacyOrder.map((id, index) => [id, index + 1]));

function isSafeProgramId(value) {
  return /^[a-zA-Z0-9_-]+$/.test(String(value || ''));
}

function parseOrder(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : Number.POSITIVE_INFINITY;
}

async function getProgramFolders() {
  const entries = await readdir(programsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => isSafeProgramId(name) && name !== 'media');
}

async function readProgramMetadata(programId) {
  const contentPath = path.join(programsDir, programId, 'content.json');

  try {
    const raw = await readFile(contentPath, 'utf8');
    const parsed = JSON.parse(raw);

    return {
      id: programId,
      title: typeof parsed?.card?.title === 'string' ? parsed.card.title.trim() : programId,
      order: Number.isFinite(Number(parsed?.order))
        ? parseOrder(parsed?.order)
        : parseOrder(legacyOrderMap.get(programId))
    };
  } catch {
    return null;
  }
}

function sortEntries(entries) {
  return [...entries].sort((left, right) => {
    if (left.order !== right.order) {
      return left.order - right.order;
    }

    return left.id.localeCompare(right.id);
  });
}

async function buildIndex() {
  const folderIds = await getProgramFolders();
  const metadata = await Promise.all(folderIds.map((id) => readProgramMetadata(id)));

  const items = sortEntries(
    metadata.filter((entry) => entry && isSafeProgramId(entry.id))
  ).map((entry) => ({
    id: entry.id,
    title: entry.title || entry.id,
    order: Number.isFinite(entry.order) ? entry.order : null
  }));

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
    console.log('programs/content.json is already up to date.');
    return;
  }

  await writeFile(outputPath, nextRaw, 'utf8');
  console.log(`Updated ${path.relative(rootDir, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
