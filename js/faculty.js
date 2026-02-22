/**
 * LEADS Higher Secondary School - Main Script
 * Combined Navigation & Faculty Logic
 */

// STAFF DATA IS LOADED FROM JSON FOR CMS EDITING
let staffMembers = [];

function hasExplicitScheme(value) {
    return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value);
}

function getSafeImageUrl(value) {
    if (value === undefined || value === null) {
        return '';
    }

    const text = String(value).trim();
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

function createFacultyCard(staff) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-lg hover:border-emerald-200 transition-all duration-300 group';

    const image = document.createElement('img');
    image.className = 'w-28 h-28 rounded-full object-cover mb-4 border-4 border-emerald-50 group-hover:border-emerald-500 transition-all';
    image.src = getSafeImageUrl(staff.img);
    image.alt = String(staff.name || 'Faculty member');

    const name = document.createElement('h3');
    name.className = 'text-blue-900 font-bold text-lg leading-tight';
    name.textContent = String(staff.name || '');

    const role = document.createElement('p');
    role.className = 'text-emerald-600 text-xs font-extrabold uppercase tracking-widest mt-1 mb-3';
    role.textContent = String(staff.role || '');

    const qualifications = document.createElement('p');
    qualifications.className = 'text-gray-600 text-xs font-semibold mb-3 line-clamp-2';
    qualifications.textContent = String(staff.qualifications || '');

    const bio = document.createElement('p');
    bio.className = 'text-gray-500 text-sm leading-relaxed italic line-clamp-3';
    bio.textContent = `"${String(staff.bio || '')}"`;

    card.appendChild(image);
    card.appendChild(name);
    card.appendChild(role);
    card.appendChild(qualifications);
    card.appendChild(bio);

    return card;
}

async function loadFacultyData() {
    try {
        const response = await fetch('faculty/content.json');
        if (!response.ok) {
            throw new Error('Failed to load faculty data');
        }

        const data = await response.json();
        staffMembers = Array.isArray(data)
            ? data
            : (Array.isArray(data.members) ? data.members : []);
    } catch (error) {
        console.error('Error loading faculty data:', error);
        staffMembers = [];
    }
}


/**
 * Renders staff cards into their respective category grids
 */
function loadFaculty() {
    const categoryMap = {
        'admin': 'admin-grid',
        'preprimary': 'preprimary-grid',
        'primary': 'primary-grid',
        'secondary': 'secondary-grid',
        'higher': 'higher-grid',
        'support': 'support-grid'
    };

    Object.keys(categoryMap).forEach(cat => {
        const container = document.getElementById(categoryMap[cat]);
        if (container) {
            const filteredStaff = staffMembers.filter(s => s.category === cat);
            container.replaceChildren();
            filteredStaff.forEach((staff) => {
                container.appendChild(createFacultyCard(staff));
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadFacultyData();
    loadFaculty();
});