// ==========================================
// GALLERY DATA & LOGIC
// ==========================================

const galleryImages = [
    { url: 'images/gallery/photo_1_general_proficiency.jpg', desc: 'General Proficiency Award 2025', date: '2025-12-17' },
    { url: 'images/gallery/photo_2_student_visiting_art_gallery.jpg', desc: 'Students Visiting Art Gallery', date: '2025-11-17' },
    { url: 'images/gallery/photo_3_release_of_mosaic.jpg', desc: 'Release of School Magazine - The Mosaic', date: '2025-12-05' },
    { url: 'images/gallery/photo_4_independence_celebration.jpg', desc: 'Independence Day Celebration', date: '2025-08-14' },
    { url: 'images/gallery/photo_5_activity_kindergarten.jpg', desc: 'Activity with Kindergarten Students', date: '2025-10-17' },
    { url: 'images/gallery/photo_6_school_football_team.jpg', desc: 'School Football Team', date: '2025-07-17' },
    { url: 'images/gallery/photo_7_school_trip.jpg', desc: 'Students in School Trip to Kaziranga', date: '2025-11-22' },
    { url: 'images/gallery/photo_8_kidpreneurship.jpg', desc: 'Kidspreneurship 2025', date: '2025-10-28' },
    { url: 'images/gallery/photo_9_traditional_dress.jpg', desc: 'Children in Traditional Attire', date: '2025-08-15' },
    { url: 'images/gallery/photo_10_march_past.jpg', desc: 'Students in March Past Formation', date: '2025-03-17' },
    { url: 'images/gallery/photo_11_investiture.jpg', desc: 'Newly appointed Captains and Vice-Captains with the guest of honour', date: '2025-03-16' },
    { url: 'images/gallery/photo_12_school_achievements.jpg', desc: 'School Achievements Recognition: Mrs Miracle Syiem Awarded Teacher of the Year 2025', date: '2025-12-06' },
    { url: 'images/gallery/photo_13_student_in_custome.jpg', desc: 'Brewing big ideas! Creative costumes and clever business at Kidspreneurship', date: '2025-10-17' }
];

function loadGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;

    // 1. Sort the array by the 'date' property (Newest first)
    // 2. Slice to get only the top 12
    const latestImages = galleryImages
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 12);

    latestImages.forEach(imgData => {
        const item = document.createElement('div');
        item.className = 'masonry-item group cursor-pointer relative overflow-hidden rounded-xl shadow-md hover:shadow-2xl bg-gray-200';
        
        item.innerHTML = `
            <img src="${imgData.url}" alt="${imgData.desc}" class="w-full h-auto transform group-hover:scale-105 transition duration-700 ease-in-out">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p class="text-white text-sm font-bold tracking-wide">${imgData.desc}</p>
            </div>
        `;

        item.onclick = () => openLightbox(imgData.url, imgData.desc);
        container.appendChild(item);
    });
}

// Lightbox Functions
function openLightbox(url, desc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCap = document.getElementById('lightbox-caption');
    
    if(lightbox && lightboxImg && lightboxCap) {
        lightboxImg.src = url;
        lightboxCap.innerText = desc;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Stop scrolling
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if(lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    }
}

// Global Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load Gallery
    loadGallery();

    // Lightbox click-to-close listener
    const lightbox = document.getElementById('lightbox');
    if(lightbox) {
        lightbox.onclick = (e) => {
            if (e.target === lightbox) closeLightbox();
        };
    }

    // Escape key listener
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") closeLightbox();
    });

    // STANDARD MOBILE MENU LOGIC
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');

    if(menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle('active');
            
            if (!mobileMenu.classList.contains('active')) {
                menuIcon.classList.remove('fa-times');
                menuIcon.classList.add('fa-bars');
            } else {
                menuIcon.classList.remove('fa-bars');
                menuIcon.classList.add('fa-times');
            }
        });

        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                if(mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    menuIcon.classList.remove('fa-times');
                    menuIcon.classList.add('fa-bars');
                }
            }
        });
    }
});