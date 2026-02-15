/**
 * LEADS Higher Secondary School - Main Script
 * Combined Navigation & Faculty Logic
 */

// --- STAFF DATA ---
const staffMembers = [
    { name: "Mrs. Barrilyne Lyngdoh", role: "Principal", bio: "Leading with vision and academic excellence since 2010.", img: "images/faculty/principal.jpg", category: "admin" },
    { name: "Mrs. Euginia Diana Mukhim", role: "Vice Principal", bio: "Specializing in student welfare and disciplinary management.", img: "images/faculty/euginia.jpg", category: "admin" },
    { name: "Mr. Makarious Sohlang", role: "Chief-Coordinator", bio: "Overseeing school coordination and students' welfare.", img: "images/faculty/makarious_sohlang.jpg", category: "admin" },
    { name: "Mrs. Heather Laureat Pyrbot", role: "Upper-Primary Coordinator", bio: "Overseeing curriculum alignment and teacher training.", img: "images/faculty/heather.jpg", category: "admin" },
    { name: "Mrs. Mayoranda Sohlang", role: "Primary Coordinator", bio: "Managing school administrative logistics and records.", img: "images/faculty/mayoranda.jpg", category: "admin" },
    { name: "Ms. Phriemtilin Wahlang", role: "Nursery Educator", bio: "Creating a joyful learning environment for our youngest learners.", img: "images/faculty/phriemtilin.jpg", category: "preprimary" },
    { name: "Mrs. Jenita Warjri", role: "Kindergarten Educator", bio: "Focusing on early literacy and motor skill development.", img: "images/faculty/jenita.jpg", category: "preprimary" },
    { name: "Mrs. Kmendahun Khriam", role: "Kindergarten Educator", bio: "Supporting classroom activities and individual child care.", img: "images/faculty/kmendahun_khriam.jpg", category: "preprimary" },
    { name: "Ms. Wanadeimaya Mukhim", role: "Art & Play Specialist", bio: "Encouraging creativity through hands-on learning.", img: "images/faculty/wanadeimaya_mukhim.jpg", category: "preprimary" },
    { name: "Ms. Ibawanhun Lyngdoh", role: "Kindergarten Educator", bio: "Dedicated to the comfort and safety of our kindergarten students.", img: "images/faculty/ibawanhun_lyngdoh.jpg", category: "preprimary" },
    { name: "Mrs. Annie Memory Khonglah", role: "Senior Primary Teacher", bio: "Building strong foundations in Social Science.", img: "images/faculty/annie_khonglah.jpg", category: "primary" },
    { name: "Mrs. Bandarishisha Dkhar", role: "Geography and Health Education Teacher", bio: "Specializing in Geography/Physical & Health Educations and MBOSE board prep.", img: "images/faculty/bandarishisha_dkhar.jpg", category: "secondary" },
    { name: "Mrs. Michellyne Syiem", role: "Biology Lecturer", bio: "Preparing students for competitive exams and higher education.", img: "images/faculty/michellyne_syiem.jpg", category: "higher" },
    { name: "Mrs. Badaaiphylla Kharmuti", role: "Head of Accounts", bio: "Ensuring transparent financial operations.", img: "images/faculty/badaaiphylla_kharmuti.jpg", category: "support" },
    { name: "Mrs.  Balarishisha Sohlang", role: "Account Manager", bio: "Overseeing account maintenance and financial teams.", img: "images/faculty/balarishisha_sohlang.jpg", category: "support" }
];

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
                    <p class="text-gray-500 text-sm leading-relaxed italic line-clamp-3">"${staff.bio}"</p>
                </div>
            `).join('');
        }
    });
}