// LEADS Programs Management Script
// Handles dynamic loading and rendering of academic programs

// All available programs
const programsList = [
  'preprimary',
  'primary',
  'middle',
  'secondary',
  'higher_secondary_science',
  'higher_secondary_arts'
];

let allProgramsData = {};

/**
 * Load all program data from JSON files
 */
async function loadAllProgramsData() {
  try {
    for (const programId of programsList) {
      const response = await fetch(`programs/${programId}/content.json`);
      if (response.ok) {
        allProgramsData[programId] = await response.json();
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
  gridContainer.innerHTML = '';

  // Render each program card
  Object.values(allProgramsData).forEach((program) => {
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

  const anchor = document.createElement('a');
  anchor.href = `programs.html?program=${id}`;
  anchor.className = 'p-8 border border-gray-100 rounded-3xl hover:shadow-2xl transition-all group hover:-translate-y-2 cursor-pointer';
  anchor.innerHTML = `
    <div class="w-16 h-16 ${colors.bg} ${colors.text} flex items-center justify-center rounded-2xl mb-6 mx-auto ${colors.hover} group-hover:text-white transition">
      <i class="fas fa-${iconType} text-2xl"></i>
    </div>
    <h3 class="text-xl font-bold mb-3 text-blue-900">${title}</h3>
    <p class="text-gray-500 text-sm leading-relaxed">${description}</p>
  `;

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
  updateCTASection(page.ctaText, page.ctaSubtext);
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
  if (pageTitle) pageTitle.innerHTML = capitalizeFirstLetter(page.title.split('The ')[1] || page.title);
  if (pageSubtitle) pageSubtitle.textContent = page.subtitle;
}

/**
 * Update Head of Department section
 */
function updateHeadOfDepartmentSection(hod) {
  const hodSection = document.querySelector('.head-of-department-section');
  if (!hodSection) return;

  hodSection.innerHTML = `
    <div class="max-w-4xl mx-auto bg-slate-50 rounded-[2rem] overflow-hidden shadow-xl flex flex-col md:flex-row items-center border border-gray-100">
      <div class="w-full md:w-1/3 pr-6 flex items-center justify-center">
        <div class="rounded-2xl overflow-hidden shadow-lg border-4 border-emerald-100">
          <img src="${hod.photo}" alt="${hod.name}" class="w-full h-full object-cover aspect-square">
        </div>
      </div>
      <div class="p-8 md:p-12 w-full md:w-2/3">
        <h4 class="text-emerald-600 font-black uppercase tracking-widest text-xs mb-2">Head of Department</h4>
        <h2 class="text-3xl font-black text-blue-900 mb-4">${hod.name}</h2>
        <p class="text-gray-600 italic mb-6">"${hod.quote}"</p>
        <div class="flex gap-4">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1">
            <span class="block text-blue-900 font-black text-xl">${hod.yearsOfExperience}</span>
            <span class="text-[10px] text-gray-400 uppercase font-bold">Years of Excellence</span>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1">
            <span class="block text-emerald-600 font-black text-xl">${hod.specialization.split(' ')[0]}</span>
            <span class="text-[10px] text-gray-400 uppercase font-bold">${hod.specialization.split(' ').slice(1).join(' ')}</span>
          </div>
        </div>
      </div>
    </div>
  `;
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

  let subProgramsHTML = `
    <div class="grid ${gridColsClass} gap-8">
  `;

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

  subPrograms.forEach((subProgram) => {
    const bgClass = colorBgMap[subProgram.iconBg] || 'bg-blue-50';
    const textClass = colorTextMap[subProgram.iconBg] || 'text-blue-600';
    const borderClass = colorBorderMap[subProgram.iconBg] || 'border-blue-500';

    subProgramsHTML += `
      <div class="bg-white p-8 rounded-3xl shadow-sm border-b-4 ${borderClass} hover:-translate-y-2 transition-transform duration-300">
        <div class="w-14 h-14 ${bgClass} rounded-2xl flex items-center justify-center ${textClass} text-2xl mb-6">
          <i class="fas fa-${subProgram.icon}"></i>
        </div>
        <h3 class="text-2xl font-black text-blue-900 mb-2">${subProgram.title}</h3>
        <p class="text-emerald-600 font-bold text-sm mb-4">${subProgram.ageGroup}</p>
        <p class="text-gray-500 text-sm leading-relaxed">${subProgram.description}</p>
      </div>
    `;
  });

  subProgramsHTML += `</div>`;
  subProgramsSection.innerHTML = subProgramsHTML;
}

/**
 * Update curriculum section
 */
function updateCurriculumSection(curriculum) {
  const curriculumSection = document.querySelector('.curriculum-section');
  if (!curriculumSection) return;

  let featuresHTML = '';
  curriculum.features.forEach((feature) => {
    featuresHTML += `
      <div class="flex items-start gap-3">
        <i class="fas fa-check-circle text-emerald-400 mt-1"></i>
        <div><span class="font-bold block">${feature.title}</span><span class="text-xs text-gray-400">${feature.subtitle}</span></div>
      </div>
    `;
  });

  curriculumSection.innerHTML = `
    <div class="container mx-auto px-4 flex flex-col lg:flex-row gap-16 items-center">
      <div class="lg:w-1/2">
        <h4 class="text-emerald-400 font-black uppercase tracking-widest text-xs mb-4">Why LEADS?</h4>
        <h2 class="text-4xl font-black mb-8 leading-tight">${curriculum.heading}</h2>
        <p class="text-gray-300 mb-8">${curriculum.intro}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          ${featuresHTML}
        </div>
      </div>
      <div class="lg:w-1/2 grid grid-cols-2 gap-4">
        <div class="rounded-2xl shadow-2xl mt-8 bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center min-h-[250px]">
          <div class="text-center">
            <i class="fas fa-palette text-6xl text-orange-500 mb-4 block"></i>
            <p class="font-bold text-blue-900">Creative Learning</p>
          </div>
        </div>
        <div class="rounded-2xl shadow-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center min-h-[250px]">
          <div class="text-center">
            <i class="fas fa-running text-6xl text-blue-600 mb-4 block"></i>
            <p class="font-bold text-blue-900">Activity & Sports</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Update CTA section
 */
function updateCTASection(ctaText, ctaSubtext) {
  const ctaSection = document.querySelector('.cta-section');
  if (!ctaSection) return;

  ctaSection.innerHTML = `
    <div class="container mx-auto px-4">
      <div class="bg-emerald-600 p-12 rounded-[3rem] text-white shadow-2xl">
        <h2 class="text-3xl font-black uppercase mb-4 text-center">${ctaText}</h2>
        <p class="mb-8 opacity-90 text-center">${ctaSubtext}</p>
        <div class="text-center">
          <a href="admissions.html" class="inline-block bg-white text-emerald-700 font-black px-10 py-4 rounded-full hover:bg-blue-900 hover:text-white transition-all transform hover:scale-105">
            Apply for Admission
          </a>
        </div>
      </div>
    </div>
  `;
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
