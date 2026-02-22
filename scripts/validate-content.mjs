import { readFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_REGEX = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?(Z)?$/i;
const DEFAULT_NEWS_TITLE_SIMILARITY_THRESHOLD = 0.8;

const CALENDAR_CATEGORIES = new Set([
  'state_holiday',
  'national_holiday',
  'school_holiday',
  'school_event',
  'examination',
  'other_event'
]);

const CALENDAR_DAY_TYPES = new Set(['working_day', 'non_working_day']);

function parseJsonDate(value) {
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? null : parsed;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasExplicitScheme(value) {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(String(value || '').trim());
}

function isSafeLinkLike(value) {
  const text = String(value || '').trim();
  if (!text) return false;

  if (!hasExplicitScheme(text)) {
    return true;
  }

  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function loadJson(filePath) {
  return readFile(path.join(rootDir, filePath), 'utf8').then((raw) => JSON.parse(raw));
}

function assert(condition, message, errors) {
  if (!condition) {
    errors.push(message);
  }
}

function normalizeKey(value) {
  return String(value ?? '').trim().toLowerCase();
}

function getNewsSimilarityThreshold() {
  const raw = process.env.NEWS_TITLE_SIMILARITY_THRESHOLD;
  if (!raw || String(raw).trim() === '') {
    return DEFAULT_NEWS_TITLE_SIMILARITY_THRESHOLD;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 1) {
    return DEFAULT_NEWS_TITLE_SIMILARITY_THRESHOLD;
  }

  return parsed;
}

function normalizeTitleTokens(value) {
  return normalizeKey(value)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3);
}

function jaccardSimilarity(tokensA, tokensB) {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  if (setA.size === 0 && setB.size === 0) {
    return 1;
  }

  let intersection = 0;
  setA.forEach((token) => {
    if (setB.has(token)) {
      intersection += 1;
    }
  });

  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function validateNews(data, warnings) {
  const errors = [];
  const similarityThreshold = getNewsSimilarityThreshold();
  assert(data && typeof data === 'object' && !Array.isArray(data), 'news/content.json: root must be an object', errors);
  assert(Array.isArray(data?.items), 'news/content.json: "items" must be an array', errors);

  const seenDateTitlePairs = new Set();

  (data?.items || []).forEach((item, index) => {
    const prefix = `news/content.json: items[${index}]`;
    assert(isNonEmptyString(item?.title), `${prefix}.title must be a non-empty string`, errors);
    assert(isNonEmptyString(item?.message), `${prefix}.message must be a non-empty string`, errors);
    assert(isNonEmptyString(item?.description), `${prefix}.description must be a non-empty string`, errors);
    assert(isNonEmptyString(item?.date), `${prefix}.date must be a non-empty string`, errors);

    if (isNonEmptyString(item?.date)) {
      const dateText = item.date.trim();
      const matches = DATE_TIME_REGEX.test(dateText) || DATE_ONLY_REGEX.test(dateText);
      assert(matches, `${prefix}.date must be YYYY-MM-DD or YYYY-MM-DD HH:mm`, errors);
      assert(parseJsonDate(dateText.replace(' ', 'T')) !== null, `${prefix}.date must be a valid date`, errors);
    }

    if (item?.image !== undefined && String(item.image).trim() !== '') {
      assert(isSafeLinkLike(item.image), `${prefix}.image must be a relative path or http/https URL`, errors);
    }

    const dateTitleKey = `${normalizeKey(item?.date)}|${normalizeKey(item?.title)}`;
    if (dateTitleKey !== '|' && seenDateTitlePairs.has(dateTitleKey)) {
      errors.push(`${prefix} duplicates another entry with same date+title`);
    }
    seenDateTitlePairs.add(dateTitleKey);
  });

  const items = Array.isArray(data?.items) ? data.items : [];
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const left = items[i];
      const right = items[j];
      const leftTokens = normalizeTitleTokens(left?.title);
      const rightTokens = normalizeTitleTokens(right?.title);

      if (leftTokens.length === 0 || rightTokens.length === 0) {
        continue;
      }

      const similarity = jaccardSimilarity(leftTokens, rightTokens);
      if (similarity >= similarityThreshold && normalizeKey(left?.title) !== normalizeKey(right?.title)) {
        warnings.push(
          `news/content.json: items[${i}] and items[${j}] have highly similar titles (${Math.round(similarity * 100)}%, threshold ${Math.round(similarityThreshold * 100)}%)`
        );
      }
    }
  }

  return errors;
}

function validateGallery(data) {
  const errors = [];
  assert(data && typeof data === 'object' && !Array.isArray(data), 'gallery/content.json: root must be an object', errors);
  assert(Array.isArray(data?.images), 'gallery/content.json: "images" must be an array', errors);

  const seenUrls = new Set();

  (data?.images || []).forEach((image, index) => {
    const prefix = `gallery/content.json: images[${index}]`;

    assert(isNonEmptyString(image?.url), `${prefix}.url must be a non-empty string`, errors);
    assert(isNonEmptyString(image?.desc), `${prefix}.desc must be a non-empty string`, errors);

    if (isNonEmptyString(image?.url)) {
      assert(isSafeLinkLike(image.url), `${prefix}.url must be a relative path or http/https URL`, errors);
      const normalizedUrl = normalizeKey(image.url);
      if (seenUrls.has(normalizedUrl)) {
        errors.push(`${prefix}.url duplicates another gallery image URL`);
      }
      seenUrls.add(normalizedUrl);
    }

    if (image?.date !== undefined && String(image.date).trim() !== '') {
      assert(DATE_ONLY_REGEX.test(String(image.date).trim()), `${prefix}.date must be YYYY-MM-DD`, errors);
      assert(parseJsonDate(image.date) !== null, `${prefix}.date must be a valid date`, errors);
    }
  });

  return errors;
}

function validateDownloads(data) {
  const errors = [];
  assert(data && typeof data === 'object' && !Array.isArray(data), 'downloads/content.json: root must be an object', errors);
  assert(Array.isArray(data?.items), 'downloads/content.json: "items" must be an array', errors);

  (data?.items || []).forEach((item, index) => {
    const prefix = `downloads/content.json: items[${index}]`;
    assert(isNonEmptyString(item?.heading), `${prefix}.heading must be a non-empty string`, errors);
    assert(isNonEmptyString(item?.description), `${prefix}.description must be a non-empty string`, errors);
    assert(isNonEmptyString(item?.audience), `${prefix}.audience must be a non-empty string`, errors);
    assert(isNonEmptyString(item?.timestamp), `${prefix}.timestamp must be a non-empty string`, errors);
    assert(isNonEmptyString(item?.pdf_url), `${prefix}.pdf_url must be a non-empty string`, errors);

    if (isNonEmptyString(item?.timestamp)) {
      assert(parseJsonDate(item.timestamp) !== null, `${prefix}.timestamp must be a valid date/time`, errors);
    }

    if (isNonEmptyString(item?.pdf_url)) {
      assert(isSafeLinkLike(item.pdf_url), `${prefix}.pdf_url must be a relative path or http/https URL`, errors);
    }
  });

  return errors;
}

function validateCalendar(data) {
  const errors = [];
  assert(data && typeof data === 'object' && !Array.isArray(data), 'calendar/content.json: root must be an object', errors);
  assert(Array.isArray(data?.entries), 'calendar/content.json: "entries" must be an array', errors);

  (data?.entries || []).forEach((entry, index) => {
    const prefix = `calendar/content.json: entries[${index}]`;

    assert(isNonEmptyString(entry?.title), `${prefix}.title must be a non-empty string`, errors);
    assert(isNonEmptyString(entry?.category), `${prefix}.category must be a non-empty string`, errors);
    assert(isNonEmptyString(entry?.dayType), `${prefix}.dayType must be a non-empty string`, errors);

    if (isNonEmptyString(entry?.category)) {
      assert(CALENDAR_CATEGORIES.has(entry.category), `${prefix}.category must be one of: ${Array.from(CALENDAR_CATEGORIES).join(', ')}`, errors);
    }

    if (isNonEmptyString(entry?.dayType)) {
      assert(CALENDAR_DAY_TYPES.has(entry.dayType), `${prefix}.dayType must be one of: ${Array.from(CALENDAR_DAY_TYPES).join(', ')}`, errors);
    }

    const hasDate = isNonEmptyString(entry?.date);
    const hasRange = isNonEmptyString(entry?.startDate) && isNonEmptyString(entry?.endDate);

    assert(hasDate || hasRange, `${prefix} must have either date OR startDate/endDate`, errors);

    if (hasDate) {
      assert(DATE_ONLY_REGEX.test(entry.date), `${prefix}.date must be YYYY-MM-DD`, errors);
      assert(parseJsonDate(entry.date) !== null, `${prefix}.date must be a valid date`, errors);
    }

    if (entry?.startDate !== undefined || entry?.endDate !== undefined) {
      assert(hasRange, `${prefix}.startDate and .endDate must both be provided`, errors);
    }

    if (hasRange) {
      assert(DATE_ONLY_REGEX.test(entry.startDate), `${prefix}.startDate must be YYYY-MM-DD`, errors);
      assert(DATE_ONLY_REGEX.test(entry.endDate), `${prefix}.endDate must be YYYY-MM-DD`, errors);

      const start = parseJsonDate(entry.startDate);
      const end = parseJsonDate(entry.endDate);
      assert(start !== null, `${prefix}.startDate must be a valid date`, errors);
      assert(end !== null, `${prefix}.endDate must be a valid date`, errors);

      if (start !== null && end !== null) {
        assert(start <= end, `${prefix}.startDate must not be after .endDate`, errors);
      }
    }
  });

  return errors;
}

function getThoughtListItemText(item) {
  if (typeof item === 'string') {
    return item.trim();
  }

  if (item && typeof item === 'object') {
    const candidate = typeof item.item === 'string' ? item.item : item.value;
    return typeof candidate === 'string' ? candidate.trim() : '';
  }

  return '';
}

function hasThoughtContent(entry) {
  const textFields = [
    entry?.thought_of_the_day,
    entry?.principal_message,
    entry?.bible_verse,
    entry?.bible_reference,
    entry?.additional_notes
  ];

  const hasText = textFields.some((value) => isNonEmptyString(value));

  const list = Array.isArray(entry?.order_of_the_day) ? entry.order_of_the_day : [];
  const hasList = list.some((item) => getThoughtListItemText(item).length > 0);

  const focus = entry?.daily_focus && typeof entry.daily_focus === 'object' ? entry.daily_focus : null;
  const hasFocus = focus
    ? [focus.image, focus.description, focus.alt].some((value) => isNonEmptyString(value))
    : false;

  return hasText || hasList || hasFocus;
}

function validateThought(data) {
  const errors = [];
  assert(data && typeof data === 'object' && !Array.isArray(data), 'thought/content.json: root must be an object', errors);
  assert(Array.isArray(data?.entries), 'thought/content.json: "entries" must be an array', errors);

  (data?.entries || []).forEach((entry, index) => {
    const prefix = `thought/content.json: entries[${index}]`;

    assert(isNonEmptyString(entry?.date), `${prefix}.date must be a non-empty string`, errors);
    if (isNonEmptyString(entry?.date)) {
      assert(DATE_ONLY_REGEX.test(entry.date), `${prefix}.date must be YYYY-MM-DD`, errors);
      assert(parseJsonDate(entry.date) !== null, `${prefix}.date must be a valid date`, errors);
    }

    if (entry?.order_of_the_day !== undefined) {
      assert(Array.isArray(entry.order_of_the_day), `${prefix}.order_of_the_day must be an array when provided`, errors);
      if (Array.isArray(entry.order_of_the_day)) {
        entry.order_of_the_day.forEach((item, itemIndex) => {
          const text = getThoughtListItemText(item);
          assert(text.length > 0, `${prefix}.order_of_the_day[${itemIndex}] must be a non-empty string or object with item/value`, errors);
        });
      }
    }

    if (entry?.daily_focus !== undefined) {
      assert(entry.daily_focus && typeof entry.daily_focus === 'object' && !Array.isArray(entry.daily_focus), `${prefix}.daily_focus must be an object`, errors);
      if (entry.daily_focus && typeof entry.daily_focus === 'object') {
        ['image', 'alt', 'description'].forEach((key) => {
          const value = entry.daily_focus[key];
          if (value !== undefined && value !== null) {
            assert(typeof value === 'string', `${prefix}.daily_focus.${key} must be a string`, errors);
          }
        });

        if (isNonEmptyString(entry.daily_focus.image)) {
          assert(isSafeLinkLike(entry.daily_focus.image), `${prefix}.daily_focus.image must be a relative path or http/https URL`, errors);
        }
      }
    }

    assert(hasThoughtContent(entry), `${prefix} must include at least one content field`, errors);
  });

  return errors;
}

async function main() {
  const warnings = [];

  const [news, downloads, calendar, thought, gallery] = await Promise.all([
    loadJson('news/content.json'),
    loadJson('downloads/content.json'),
    loadJson('calendar/content.json'),
    loadJson('thought/content.json'),
    loadJson('gallery/content.json')
  ]);

  const errors = [
    ...validateNews(news, warnings),
    ...validateDownloads(downloads),
    ...validateCalendar(calendar),
    ...validateThought(thought),
    ...validateGallery(gallery)
  ];

  if (errors.length > 0) {
    console.error('Content validation failed:\n');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('Content validation warnings:\n');
    warnings.forEach((warning) => console.warn(`- ${warning}`));
  }

  const summary = {
    newsItems: Array.isArray(news?.items) ? news.items.length : 0,
    downloadsItems: Array.isArray(downloads?.items) ? downloads.items.length : 0,
    calendarEntries: Array.isArray(calendar?.entries) ? calendar.entries.length : 0,
    thoughtEntries: Array.isArray(thought?.entries) ? thought.entries.length : 0,
    galleryImages: Array.isArray(gallery?.images) ? gallery.images.length : 0,
    warnings: warnings.length
  };

  console.log(
    `Validation summary: news=${summary.newsItems}, downloads=${summary.downloadsItems}, calendar=${summary.calendarEntries}, thought=${summary.thoughtEntries}, gallery=${summary.galleryImages}, warnings=${summary.warnings}`
  );

  console.log('Content validation passed.');
}

main().catch((error) => {
  console.error('Validation runtime error:', error);
  process.exit(1);
});
