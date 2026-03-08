// LEADS Programs Management Script
// Handles dynamic loading and rendering of academic programs

const DEFAULT_PROGRAM_IDS = [
  'preprimary',
  'primary',
  'middle',
  'secondary',
  'higher_secondary_science',
  'higher_secondary_arts',
  'intervention'
];

let allProgramsData = {};
let orderedProgramIds = [];

function isSafeProgramId(value) {
  return /^[a-zA-Z0-9_-]+$/.test(String(value || ''));
}

function uniqueProgramIds(values) {
  const seen = new Set();
  const result = [];

  for (const value of values) {
    const id = String(value || '').trim();
    if (!isSafeProgramId(id) || seen.has(id)) {
      continue;
    }
    seen.add(id);
    result.push(id);
  }

  return result;
}

function parseProgramOrder(value, fallback) {
  const number = Number(value);
  if (Number.isFinite(number)) {
    return number;
  }

  return fallback;
}

async function loadProgramIndexFromManifest() {
  try {
    const response = await fetch('programs/content.json', { cache: 'no-cache' });
    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    const entries = [];

    if (Array.isArray(payload)) {
      entries.push(...payload);
    } else if (Array.isArray(payload?.items)) {
      entries.push(...payload.items);
    } else if (Array.isArray(payload?.programs)) {
      entries.push(...payload.programs);
    }

    const normalized = entries.map((entry, index) => {
      if (typeof entry === 'string') {
        return {
          id: entry,
          order: index + 1
        };
      }

      if (entry && typeof entry === 'object') {
        return {
          id: entry.id,
          order: parseProgramOrder(entry.order, index + 1)
        };
      }

      return {
        id: '',
        order: index + 1
      };
    });

    const filtered = normalized
      .filter((item) => isSafeProgramId(item.id))
      .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));

    return uniqueProgramIds(filtered.map((item) => item.id));
  } catch {
    return [];
  }
}

async function discoverProgramIds() {
  const fromManifest = await loadProgramIndexFromManifest();
  if (fromManifest.length > 0) {
    return fromManifest;
  }

  return uniqueProgramIds(DEFAULT_PROGRAM_IDS);
}

function createElement(tag, className = '') {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  return element;
}

function hasExplicitScheme(value) {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value);
}

function getSafeUrl(value) {
  const text = String(value ?? '').trim();
  if (!text) {
    return '';
  }

  if (!hasExplicitScheme(text)) {
    return text;
  }

  try {
    const parsed = new URL(text);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return text;
    }
  } catch (error) {
  }

  return '';
}

function getSafeIconToken(value, fallback = 'book-open') {
  const token = String(value ?? '').trim().toLowerCase();
  return /^[a-z0-9-]+$/.test(token) ? token : fallback;
}

/**
 * Load all program data from JSON files
 */
async function loadAllProgramsData() {
  try {
    const programIds = await discoverProgramIds();
    allProgramsData = {};
    orderedProgramIds = [];

    for (const programId of programIds) {
      const response = await fetch(`programs/${programId}/content.json`);
      if (response.ok) {
        allProgramsData[programId] = await response.json();
        orderedProgramIds.push(programId);
      }
    }
    return allProgramsData;
  } catch (error) {
    console.error('Error loading programs data:', error);
    return {};
  }
}

/**
 * Render the academic programmes section on index.html
 */
function renderAcademicProgrammes() {
  const container = document.querySelector('.academic-programmes');
  if (!container) return;

  // Find or create the grid container
  let gridContainer = container.querySelector('.grid');
  if (!gridContainer) return;

  // Clear existing content
  gridContainer.replaceChildren();

  // Render each program card
  orderedProgramIds.forEach((programId) => {
    const program = allProgramsData[programId];
    if (!program) {
      return;
    }
    const card = createProgramCard(program);
    gridContainer.appendChild(card);
  });
}

/**
 * Create a program card element
 */
function createProgramCard(program) {
  const { id, card } = program;
  const { title, description, iconColor, iconType } = card;

  // Map icon colors to Tailwind classes
  const colorMap = {
    'pink': { bg: 'bg-pink-100', text: 'text-pink-600', hover: 'group-hover:bg-pink-600' },
    'amber': { bg: 'bg-amber-100', text: 'text-amber-600', hover: 'group-hover:bg-amber-600' },
    'teal': { bg: 'bg-teal-100', text: 'text-teal-600', hover: 'group-hover:bg-teal-600' },
    'blue': { bg: 'bg-blue-100', text: 'text-blue-600', hover: 'group-hover:bg-blue-900' },
    'indigo': { bg: 'bg-indigo-100', text: 'text-indigo-600', hover: 'group-hover:bg-indigo-600' },
    'purple': { bg: 'bg-purple-100', text: 'text-purple-600', hover: 'group-hover:bg-purple-600' }
  };

  const colors = colorMap[iconColor] || colorMap['blue'];

  const anchor = createElement('a', 'p-8 border border-gray-100 rounded-3xl hover:shadow-2xl transition-all group hover:-translate-y-2 cursor-pointer');
  anchor.href = `programs.html?program=${id}`;

  const iconWrap = createElement('div', `w-16 h-16 ${colors.bg} ${colors.text} flex items-center justify-center rounded-2xl mb-6 mx-auto ${colors.hover} group-hover:text-white transition`);
  const icon = createElement('i', `fas fa-${getSafeIconToken(iconType)} text-2xl`);
  iconWrap.appendChild(icon);

  const heading = createElement('h3', 'text-xl font-bold mb-3 text-blue-900');
  heading.textContent = String(title || '');

  const desc = createElement('p', 'text-gray-500 text-sm leading-relaxed');
  desc.textContent = String(description || '');

  anchor.appendChild(iconWrap);
  anchor.appendChild(heading);
  anchor.appendChild(desc);

  return anchor;
}

/**
 * Render individual program page
 */
function renderProgramPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const programId = urlParams.get('program');

  if (!programId || !allProgramsData[programId]) {
    redirectToHome();
    return;
  }

  const program = allProgramsData[programId];
  const { page, card } = program;

  // Update page title
  document.title = `${card.title} | LEADS Higher Secondary School`;

  // Update header
  updatePageHeader(page, card);

  // Update content sections
  updateHeadOfDepartmentSection(page.headOfDepartment);
  updateSubProgramsSection(page.subPrograms);
  updateCurriculumSection(page.curriculum);
  updateCTASection(page.cta || {}, page.ctaText, page.ctaSubtext);
}

/**
 * Update page header
 */
function updatePageHeader(page, card) {
  const headerTagline = document.querySelector('.header-tagline');
  const pageTitleBadge = document.querySelector('.page-title-badge');
  const pageTitle = document.querySelector('.page-title-main');
  const pageSubtitle = document.querySelector('.page-subtitle');

  if (headerTagline) headerTagline.textContent = page.tagline;
  if (pageTitleBadge) pageTitleBadge.textContent = page.badge;
  if (pageTitle) pageTitle.textContent = capitalizeFirstLetter(String(page.title || '').split('The ')[1] || String(page.title || ''));
  if (pageSubtitle) pageSubtitle.textContent = page.subtitle;
}

/**
 * Update Head of Department section
 */
function updateHeadOfDepartmentSection(hod) {
  const hodSection = document.querySelector('.head-of-department-section');
  if (!hodSection) return;

  const specialization = String(hod.specialization || '');
  const specializationWords = specialization.split(' ').filter(Boolean);
  const specializationHead = specializationWords[0] || '';
  const specializationTail = specializationWords.slice(1).join(' ');

  const root = createElement('div', 'max-w-4xl mx-auto bg-slate-50 rounded-[2rem] overflow-hidden shadow-xl flex flex-col md:flex-row items-center border border-gray-100');

  const imageCol = createElement('div', 'w-full md:w-1/3 pr-6 flex items-center justify-center');
  const imageWrap = createElement('div', 'rounded-2xl overflow-hidden shadow-lg border-4 border-emerald-100');
  const image = createElement('img', 'w-full h-full object-cover aspect-square');
  image.src = getSafeUrl(hod.photo);
  image.alt = String(hod.name || 'Head of Department');
  imageWrap.appendChild(image);
  imageCol.appendChild(imageWrap);

  const contentCol = createElement('div', 'p-8 md:p-12 w-full md:w-2/3');
  const label = createElement('h4', 'text-emerald-600 font-black uppercase tracking-widest text-xs mb-2');
  label.textContent = 'Head of Department';
  const title = createElement('h2', 'text-3xl font-black text-blue-900 mb-4');
  title.textContent = String(hod.name || '');
  const quote = createElement('p', 'text-gray-600 italic mb-6');
  quote.textContent = `"${String(hod.quote || '')}"`;

  const stats = createElement('div', 'flex gap-4');
  const yearsCard = createElement('div', 'bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1');
  const years = createElement('span', 'block text-blue-900 font-black text-xl');
  years.textContent = String(hod.yearsOfExperience || '');
  const yearsLabel = createElement('span', 'text-[10px] text-gray-400 uppercase font-bold');
  yearsLabel.textContent = 'Years of Excellence';
  yearsCard.appendChild(years);
  yearsCard.appendChild(yearsLabel);

  const specCard = createElement('div', 'bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1');
  const specHead = createElement('span', 'block text-emerald-600 font-black text-xl');
  specHead.textContent = specializationHead;
  const specTail = createElement('span', 'text-[10px] text-gray-400 uppercase font-bold');
  specTail.textContent = specializationTail;
  specCard.appendChild(specHead);
  specCard.appendChild(specTail);

  stats.appendChild(yearsCard);
  stats.appendChild(specCard);

  contentCol.appendChild(label);
  contentCol.appendChild(title);
  contentCol.appendChild(quote);
  contentCol.appendChild(stats);

  root.appendChild(imageCol);
  root.appendChild(contentCol);

  hodSection.replaceChildren(root);
}

/**
 * Update sub-programs section
 */
function updateSubProgramsSection(subPrograms) {
  const subProgramsSection = document.querySelector('.sub-programmes-section');
  if (!subProgramsSection) return;

  let gridColsClass = 'md:grid-cols-2 lg:grid-cols-4';
  if (subPrograms.length === 2) {
    gridColsClass = 'md:grid-cols-2';
  } else if (subPrograms.length === 3) {
    gridColsClass = 'md:grid-cols-3';
  }

  const grid = createElement('div', `grid ${gridColsClass} gap-8`);

  const colorBgMap = {
    'pink': 'bg-pink-50',
    'blue-900': 'bg-blue-50',
    'emerald': 'bg-emerald-50',
    'amber': 'bg-amber-50',
    'teal': 'bg-teal-50',
    'indigo': 'bg-indigo-50',
    'purple': 'bg-purple-50'
  };

  const colorTextMap = {
    'pink': 'text-pink-600',
    'blue-900': 'text-blue-900',
    'emerald': 'text-emerald-600',
    'amber': 'text-amber-600',
    'teal': 'text-teal-600',
    'indigo': 'text-indigo-600',
    'purple': 'text-purple-600'
  };

  const colorBorderMap = {
    'pink': 'border-pink-500',
    'blue-900': 'border-blue-900',
    'emerald': 'border-emerald-500',
    'amber': 'border-amber-500',
    'teal': 'border-teal-500',
    'indigo': 'border-indigo-500',
    'purple': 'border-purple-500'
  };

  (Array.isArray(subPrograms) ? subPrograms : []).forEach((subProgram) => {
    const bgClass = colorBgMap[subProgram.iconBg] || 'bg-blue-50';
    const textClass = colorTextMap[subProgram.iconBg] || 'text-blue-600';
    const borderClass = colorBorderMap[subProgram.iconBg] || 'border-blue-500';

    const card = createElement('div', `bg-white p-8 rounded-3xl shadow-sm border-b-4 ${borderClass} hover:-translate-y-2 transition-transform duration-300`);
    const iconWrap = createElement('div', `w-14 h-14 ${bgClass} rounded-2xl flex items-center justify-center ${textClass} text-2xl mb-6`);
    iconWrap.appendChild(createElement('i', `fas fa-${getSafeIconToken(subProgram.icon)}`));

    const title = createElement('h3', 'text-2xl font-black text-blue-900 mb-2');
    title.textContent = String(subProgram.title || '');
    const ageGroup = createElement('p', 'text-emerald-600 font-bold text-sm mb-4');
    ageGroup.textContent = String(subProgram.ageGroup || '');
    const description = createElement('p', 'text-gray-500 text-sm leading-relaxed');
    description.textContent = String(subProgram.description || '');

    card.appendChild(iconWrap);
    card.appendChild(title);
    card.appendChild(ageGroup);
    card.appendChild(description);
    grid.appendChild(card);
  });

  subProgramsSection.replaceChildren(grid);
}

/**
 * Update curriculum section
 */
function updateCurriculumSection(curriculum) {
  const curriculumSection = document.querySelector('.curriculum-section');
  if (!curriculumSection) return;

  const wrapper = createElement('div', 'container mx-auto px-4 flex flex-col lg:flex-row gap-16 items-center');

  const left = createElement('div', 'lg:w-1/2');
  const label = createElement('h4', 'text-emerald-400 font-black uppercase tracking-widest text-xs mb-4');
  label.textContent = 'Why LEADS?';
  const heading = createElement('h2', 'text-4xl font-black mb-8 leading-tight');
  heading.textContent = String(curriculum.heading || '');
  const intro = createElement('p', 'text-gray-300 mb-8');
  intro.textContent = String(curriculum.intro || '');
  const featuresGrid = createElement('div', 'grid grid-cols-1 sm:grid-cols-2 gap-6');

  (Array.isArray(curriculum.features) ? curriculum.features : []).forEach((feature) => {
    const featureRow = createElement('div', 'flex items-start gap-3');
    featureRow.appendChild(createElement('i', 'fas fa-check-circle text-emerald-400 mt-1'));
    const textWrap = createElement('div');
    const title = createElement('span', 'font-bold block');
    title.textContent = String(feature.title || '');
    const subtitle = createElement('span', 'text-xs text-gray-400');
    subtitle.textContent = String(feature.subtitle || '');
    textWrap.appendChild(title);
    textWrap.appendChild(subtitle);
    featureRow.appendChild(textWrap);
    featuresGrid.appendChild(featureRow);
  });

  left.appendChild(label);
  left.appendChild(heading);
  left.appendChild(intro);
  left.appendChild(featuresGrid);

  const right = createElement('div', 'lg:w-1/2 grid grid-cols-2 gap-4');

  const creative = createElement('div', 'rounded-2xl shadow-2xl mt-8 bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center min-h-[250px]');
  const creativeInner = createElement('div', 'text-center');
  creativeInner.appendChild(createElement('i', 'fas fa-palette text-6xl text-orange-500 mb-4 block'));
  const creativeLabel = createElement('p', 'font-bold text-blue-900');
  creativeLabel.textContent = 'Creative Learning';
  creativeInner.appendChild(creativeLabel);
  creative.appendChild(creativeInner);

  const sports = createElement('div', 'rounded-2xl shadow-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center min-h-[250px]');
  const sportsInner = createElement('div', 'text-center');
  sportsInner.appendChild(createElement('i', 'fas fa-running text-6xl text-blue-600 mb-4 block'));
  const sportsLabel = createElement('p', 'font-bold text-blue-900');
  sportsLabel.textContent = 'Activity & Sports';
  sportsInner.appendChild(sportsLabel);
  sports.appendChild(sportsInner);

  right.appendChild(creative);
  right.appendChild(sports);

  wrapper.appendChild(left);
  wrapper.appendChild(right);
  curriculumSection.replaceChildren(wrapper);
}

/**
 * Update CTA section
 */
function updateCTASection(cta, fallbackHeading, fallbackDescription) {
  const ctaSection = document.querySelector('.cta-section');
  if (!ctaSection) return;

  const heading = String(cta?.heading || fallbackHeading || '').trim();
  const description = String(cta?.description || fallbackDescription || '').trim();
  const buttonText = String(cta?.buttonText || 'Apply for Admission').trim() || 'Apply for Admission';
  const buttonLink = getSafeUrl(cta?.buttonLink) || 'admissions.html';

  const container = createElement('div', 'container mx-auto px-4');
  const panel = createElement('div', 'bg-emerald-600 p-12 rounded-[3rem] text-white shadow-2xl');
  const title = createElement('h2', 'text-3xl font-black uppercase mb-4 text-center');
  title.textContent = heading;
  const subtitle = createElement('p', 'mb-8 opacity-90 text-center');
  subtitle.textContent = description;

  const actionWrap = createElement('div', 'text-center');
  const action = createElement('a', 'inline-block bg-white text-emerald-700 font-black px-10 py-4 rounded-full hover:bg-blue-900 hover:text-white transition-all transform hover:scale-105');
  action.href = buttonLink;
  action.textContent = buttonText;
  actionWrap.appendChild(action);

  panel.appendChild(title);
  panel.appendChild(subtitle);
  panel.appendChild(actionWrap);
  container.appendChild(panel);

  ctaSection.replaceChildren(container);
}

/**
 * Redirect to home page
 */
function redirectToHome() {
  window.location.href = 'index.html';
}

/**
 * Capitalize first letter of string
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Initialize programs when DOM is loaded
 */
window.addEventListener('DOMContentLoaded', async function() {
  await loadAllProgramsData();

  // Check if this is index.html or programs.html
  const isIndexPage = document.querySelector('.academic-programmes');
  const isProgramPage = document.querySelector('.head-of-department-section');

  if (isIndexPage && Object.keys(allProgramsData).length > 0) {
    renderAcademicProgrammes();
  }

  if (isProgramPage && Object.keys(allProgramsData).length > 0) {
    renderProgramPage();
  }
});
