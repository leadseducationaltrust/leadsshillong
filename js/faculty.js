/**
 * LEADS Higher Secondary School - Main Script
 * Combined Navigation & Faculty Logic
 */

// STAFF DATA IS LOADED FROM JSON FOR CMS EDITING
let staffMembers = [];

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
            container.innerHTML = filteredStaff.map(staff => `
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-lg hover:border-emerald-200 transition-all duration-300 group">
                    <img src="${staff.img}" alt="${staff.name}" class="w-28 h-28 rounded-full object-cover mb-4 border-4 border-emerald-50 group-hover:border-emerald-500 transition-all">
                    <h3 class="text-blue-900 font-bold text-lg leading-tight">${staff.name}</h3>
                    <p class="text-emerald-600 text-xs font-extrabold uppercase tracking-widest mt-1 mb-3">${staff.role}</p>
                    <p class="text-gray-600 text-xs font-semibold mb-3 line-clamp-2">${staff.qualifications}</p>
                    <p class="text-gray-500 text-sm leading-relaxed italic line-clamp-3">"${staff.bio}"</p>
                </div>
            `).join('');
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadFacultyData();
    loadFaculty();
});