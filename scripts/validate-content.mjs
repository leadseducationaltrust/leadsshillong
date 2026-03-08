import { readFile, readdir } from 'node:fs/promises';
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

function isSafeProgramId(value) {
  return /^[a-zA-Z0-9_-]+$/.test(String(value || ''));
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

async function getProgramFolderIds() {
  const programsRoot = path.join(rootDir, 'programs');
  const entries = await readdir(programsRoot, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => name !== 'media' && isSafeProgramId(name));
}

function validateProgramsIndex(data) {
  const errors = [];
  assert(data && typeof data === 'object' && !Array.isArray(data), 'programs/content.json: root must be an object', errors);
  assert(Array.isArray(data?.items), 'programs/content.json: "items" must be an array', errors);

  const seenIds = new Set();
  const seenOrders = new Set();

  (data?.items || []).forEach((item, index) => {
    const prefix = `programs/content.json: items[${index}]`;
    assert(item && typeof item === 'object' && !Array.isArray(item), `${prefix} must be an object`, errors);
    assert(isNonEmptyString(item?.id), `${prefix}.id must be a non-empty string`, errors);
    assert(isNonEmptyString(item?.title), `${prefix}.title must be a non-empty string`, errors);
    assert(Number.isFinite(Number(item?.order)), `${prefix}.order must be a number`, errors);

    if (isNonEmptyString(item?.id)) {
      const id = String(item.id).trim();
      assert(isSafeProgramId(id), `${prefix}.id must contain only letters, numbers, underscore, or hyphen`, errors);
      if (seenIds.has(id)) {
        errors.push(`${prefix}.id duplicates another program ID`);
      }
      seenIds.add(id);
    }

    if (Number.isFinite(Number(item?.order))) {
      const order = Number(item.order);
      if (seenOrders.has(order)) {
        errors.push(`${prefix}.order duplicates another program order`);
      }
      seenOrders.add(order);
    }
  });

  return errors;
}

function validateProgramContent(programData, programId) {
  const errors = [];
  const base = `programs/${programId}/content.json`;

  assert(programData && typeof programData === 'object' && !Array.isArray(programData), `${base}: root must be an object`, errors);
  assert(isNonEmptyString(programData?.id), `${base}: "id" must be a non-empty string`, errors);
  assert(isNonEmptyString(programData?.name), `${base}: "name" must be a non-empty string`, errors);
  assert(programData?.id === programId, `${base}: "id" must match folder name "${programId}"`, errors);
  assert(Number.isFinite(Number(programData?.order)), `${base}: "order" must be a number`, errors);

  const card = programData?.card;
  assert(card && typeof card === 'object' && !Array.isArray(card), `${base}: "card" must be an object`, errors);
  assert(isNonEmptyString(card?.title), `${base}: card.title must be a non-empty string`, errors);
  assert(isNonEmptyString(card?.iconColor), `${base}: card.iconColor must be a non-empty string`, errors);
  assert(isNonEmptyString(card?.iconType), `${base}: card.iconType must be a non-empty string`, errors);
  assert(isNonEmptyString(card?.description), `${base}: card.description must be a non-empty string`, errors);

  const page = programData?.page;
  assert(page && typeof page === 'object' && !Array.isArray(page), `${base}: "page" must be an object`, errors);

  if (page && typeof page === 'object') {
    assert(isNonEmptyString(page?.title), `${base}: page.title must be a non-empty string`, errors);
    assert(isNonEmptyString(page?.subtitle), `${base}: page.subtitle must be a non-empty string`, errors);

    if (page?.badge !== undefined) {
      assert(typeof page.badge === 'string', `${base}: page.badge must be a string when provided`, errors);
    }

    if (page?.tagline !== undefined) {
      assert(typeof page.tagline === 'string', `${base}: page.tagline must be a string when provided`, errors);
    }

    const hod = page?.headOfDepartment;
    assert(hod && typeof hod === 'object' && !Array.isArray(hod), `${base}: page.headOfDepartment must be an object`, errors);

    if (hod && typeof hod === 'object') {
      assert(isNonEmptyString(hod?.name), `${base}: page.headOfDepartment.name must be a non-empty string`, errors);
      assert(isNonEmptyString(hod?.photo), `${base}: page.headOfDepartment.photo must be a non-empty string`, errors);
      assert(isNonEmptyString(hod?.quote), `${base}: page.headOfDepartment.quote must be a non-empty string`, errors);

      if (isNonEmptyString(hod?.photo)) {
        assert(isSafeLinkLike(hod.photo), `${base}: page.headOfDepartment.photo must be a relative path or http/https URL`, errors);
      }

      if (hod?.yearsOfExperience !== undefined) {
        assert(typeof hod.yearsOfExperience === 'string', `${base}: page.headOfDepartment.yearsOfExperience must be a string when provided`, errors);
      }

      if (hod?.specialization !== undefined) {
        assert(typeof hod.specialization === 'string', `${base}: page.headOfDepartment.specialization must be a string when provided`, errors);
      }
    }

    if (page?.qualifications !== undefined) {
      assert(Array.isArray(page.qualifications), `${base}: page.qualifications must be an array when provided`, errors);
      if (Array.isArray(page.qualifications)) {
        page.qualifications.forEach((entry, index) => {
          assert(isNonEmptyString(entry), `${base}: page.qualifications[${index}] must be a non-empty string`, errors);
        });
      }
    }

    if (page?.subPrograms !== undefined) {
      assert(Array.isArray(page.subPrograms), `${base}: page.subPrograms must be an array when provided`, errors);
      if (Array.isArray(page.subPrograms)) {
        page.subPrograms.forEach((entry, index) => {
          const prefix = `${base}: page.subPrograms[${index}]`;
          assert(entry && typeof entry === 'object' && !Array.isArray(entry), `${prefix} must be an object`, errors);
          assert(isNonEmptyString(entry?.title), `${prefix}.title must be a non-empty string`, errors);
          assert(isNonEmptyString(entry?.description), `${prefix}.description must be a non-empty string`, errors);

          if (entry?.ageGroup !== undefined) {
            assert(typeof entry.ageGroup === 'string', `${prefix}.ageGroup must be a string when provided`, errors);
          }

          if (entry?.icon !== undefined) {
            assert(typeof entry.icon === 'string', `${prefix}.icon must be a string when provided`, errors);
          }

          if (entry?.iconBg !== undefined) {
            assert(typeof entry.iconBg === 'string', `${prefix}.iconBg must be a string when provided`, errors);
          }
        });
      }
    }

    if (page?.curriculum !== undefined) {
      assert(page.curriculum && typeof page.curriculum === 'object' && !Array.isArray(page.curriculum), `${base}: page.curriculum must be an object when provided`, errors);
      if (page.curriculum && typeof page.curriculum === 'object') {
        if (page.curriculum?.heading !== undefined) {
          assert(typeof page.curriculum.heading === 'string', `${base}: page.curriculum.heading must be a string when provided`, errors);
        }

        if (page.curriculum?.intro !== undefined) {
          assert(typeof page.curriculum.intro === 'string', `${base}: page.curriculum.intro must be a string when provided`, errors);
        }

        if (page.curriculum?.features !== undefined) {
          assert(Array.isArray(page.curriculum.features), `${base}: page.curriculum.features must be an array when provided`, errors);
          if (Array.isArray(page.curriculum.features)) {
            page.curriculum.features.forEach((feature, index) => {
              const prefix = `${base}: page.curriculum.features[${index}]`;
              assert(feature && typeof feature === 'object' && !Array.isArray(feature), `${prefix} must be an object`, errors);
              assert(isNonEmptyString(feature?.title), `${prefix}.title must be a non-empty string`, errors);
              if (feature?.subtitle !== undefined) {
                assert(typeof feature.subtitle === 'string', `${prefix}.subtitle must be a string when provided`, errors);
              }
            });
          }
        }
      }
    }

    if (page?.outcomes !== undefined) {
      assert(Array.isArray(page.outcomes), `${base}: page.outcomes must be an array when provided`, errors);
      if (Array.isArray(page.outcomes)) {
        page.outcomes.forEach((entry, index) => {
          assert(isNonEmptyString(entry), `${base}: page.outcomes[${index}] must be a non-empty string`, errors);
        });
      }
    }

    if (page?.ctaText !== undefined) {
      assert(typeof page.ctaText === 'string', `${base}: page.ctaText must be a string when provided`, errors);
    }

    if (page?.ctaSubtext !== undefined) {
      assert(typeof page.ctaSubtext === 'string', `${base}: page.ctaSubtext must be a string when provided`, errors);
    }

    if (page?.cta !== undefined) {
      assert(page.cta && typeof page.cta === 'object' && !Array.isArray(page.cta), `${base}: page.cta must be an object when provided`, errors);
      if (page.cta && typeof page.cta === 'object') {
        if (page.cta?.heading !== undefined) {
          assert(typeof page.cta.heading === 'string', `${base}: page.cta.heading must be a string when provided`, errors);
        }

        if (page.cta?.description !== undefined) {
          assert(typeof page.cta.description === 'string', `${base}: page.cta.description must be a string when provided`, errors);
        }

        if (page.cta?.buttonText !== undefined) {
          assert(typeof page.cta.buttonText === 'string', `${base}: page.cta.buttonText must be a string when provided`, errors);
        }

        if (page.cta?.buttonLink !== undefined && String(page.cta.buttonLink).trim() !== '') {
          assert(isSafeLinkLike(page.cta.buttonLink), `${base}: page.cta.buttonLink must be a relative path or http/https URL`, errors);
        }
      }
    }
  }

  return errors;
}

async function main() {
  const warnings = [];

  const [news, downloads, calendar, thought, gallery, programsIndex] = await Promise.all([
    loadJson('news/content.json'),
    loadJson('downloads/content.json'),
    loadJson('calendar/content.json'),
    loadJson('thought/content.json'),
    loadJson('gallery/content.json'),
    loadJson('programs/content.json')
  ]);

  const programsIndexErrors = validateProgramsIndex(programsIndex);
  const indexedProgramIds = Array.isArray(programsIndex?.items)
    ? programsIndex.items.map((item) => String(item?.id || '').trim()).filter((id) => isSafeProgramId(id))
    : [];

  const folderProgramIds = await getProgramFolderIds();
  const indexIdSet = new Set(indexedProgramIds);
  const folderIdSet = new Set(folderProgramIds);

  folderProgramIds.forEach((id) => {
    if (!indexIdSet.has(id)) {
      programsIndexErrors.push(`programs/content.json: missing item for folder "${id}"`);
    }
  });

  indexedProgramIds.forEach((id) => {
    if (!folderIdSet.has(id)) {
      programsIndexErrors.push(`programs/content.json: item id "${id}" has no matching folder`);
    }
  });

  const programPayloads = await Promise.all(
    indexedProgramIds.map(async (id) => {
      try {
        const data = await loadJson(`programs/${id}/content.json`);
        return { id, data };
      } catch {
        return { id, data: null };
      }
    })
  );

  const programErrors = [];
  programPayloads.forEach(({ id, data }) => {
    if (!data) {
      programErrors.push(`programs/${id}/content.json: file not found or invalid JSON`);
      return;
    }

    programErrors.push(...validateProgramContent(data, id));
  });

  const errors = [
    ...validateNews(news, warnings),
    ...validateDownloads(downloads),
    ...validateCalendar(calendar),
    ...validateThought(thought),
    ...validateGallery(gallery),
    ...programsIndexErrors,
    ...programErrors
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
    programsItems: Array.isArray(programsIndex?.items) ? programsIndex.items.length : 0,
    warnings: warnings.length
  };

  console.log(
    `Validation summary: news=${summary.newsItems}, downloads=${summary.downloadsItems}, calendar=${summary.calendarEntries}, thought=${summary.thoughtEntries}, gallery=${summary.galleryImages}, programs=${summary.programsItems}, warnings=${summary.warnings}`
  );

  console.log('Content validation passed.');
}

main().catch((error) => {
  console.error('Validation runtime error:', error);
  process.exit(1);
});
