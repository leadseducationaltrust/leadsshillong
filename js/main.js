/**
 * LEADS Higher Secondary School - Main Script
 * Combined Navigation & Faculty Logic
 */

// --- STAFF DATA ---
const staffMembers = [
    { name: "Mrs. Barrilyne Lyngdoh", role: "Principal", bio: "Leading with vision and academic excellence since 2010.", img: "images/faculty/principal.jpg", category: "admin" },
    { name: "Mrs. Euginia Diana Mukhim", role: "Vice Principal", bio: "Specializing in student welfare and disciplinary management.", img: "images/faculty/euginia.jpg", category: "admin" },
    { name: "Mrs. Heather Laureat Pyrbot", role: "Upper-Primary Coordinator", bio: "Overseeing curriculum alignment and teacher training.", img: "images/faculty/heather.jpg", category: "admin" },
    { name: "Mrs. Mayoranda Sohlang", role: "Primary Coordinator", bio: "Managing school administrative logistics and records.", img: "images/faculty/mayoranda.jpg", category: "admin" },
    { name: "Ms. Phriemtilin Wahlang", role: "Nursery Teacher", bio: "Creating a joyful learning environment for our youngest learners.", img: "images/faculty/phriemtilin.jpg", category: "preprimary" },
    { name: "Ms. Teacher Two", role: "KG Educator", bio: "Focusing on early literacy and motor skill development.", img: "https://ui-avatars.com/api/?name=Teacher+Two", category: "preprimary" },
    { name: "Ms. Teacher Three", role: "Assistant Teacher", bio: "Supporting classroom activities and individual child care.", img: "https://ui-avatars.com/api/?name=Teacher+Three", category: "preprimary" },
    { name: "Ms. Teacher Four", role: "Art & Play Specialist", bio: "Encouraging creativity through hands-on learning.", img: "https://ui-avatars.com/api/?name=Teacher+Four", category: "preprimary" },
    { name: "Ms. Teacher Five", role: "Nursery Assistant", bio: "Dedicated to the comfort and safety of our toddlers.", img: "https://ui-avatars.com/api/?name=Teacher+Five", category: "preprimary" },
    { name: "Mr. Primary One", role: "Grade 1 Teacher", bio: "Building strong foundations in Mathematics and English.", img: "https://ui-avatars.com/api/?name=Primary+One", category: "primary" },
    { name: "Mr. Secondary One", role: "Mathematics HOD", bio: "Specializing in advanced algebra and MBOSE board prep.", img: "https://ui-avatars.com/api/?name=Secondary+One", category: "secondary" },
    { name: "Ms. Higher Sec One", role: "Physics Lecturer", bio: "Preparing students for competitive exams and higher education.", img: "https://ui-avatars.com/api/?name=Higher+Sec+One", category: "higher" },
    { name: "Mr. S. Kharkongor", role: "Head of Accounts", bio: "Ensuring transparent financial operations.", img: "https://ui-avatars.com/api/?name=S+Kharkongor", category: "support" },
    { name: "Mr. Staff Two", role: "Estate Manager", bio: "Overseeing campus maintenance and housekeeper teams.", img: "https://ui-avatars.com/api/?name=Staff+Two", category: "support" }
];

//menu toggle in mobile-ui
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Toggle the 'active' class we defined in CSS
            mobileMenu.classList.toggle('active');
            
            // Swap icons and manage the 'hidden' class for desktop consistency
            if (mobileMenu.classList.contains('active')) {
                menuIcon.classList.replace('fa-bars', 'fa-times');
                mobileMenu.classList.remove('hidden');
            } else {
                menuIcon.classList.replace('fa-times', 'fa-bars');
                // Re-add hidden only if on mobile screens
                if (window.innerWidth < 1024) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });

        // Close menu when clicking on a link
        const links = mobileMenu.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenu.classList.add('hidden');
                menuIcon.classList.replace('fa-times', 'fa-bars');
            });
        });
    }
});

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