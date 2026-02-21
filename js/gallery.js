// ==========================================
// GALLERY DATA & LOGIC
// ==========================================

let galleryImages = [];

const GALLERY_BATCH_SIZE = 12;
let galleryCursor = 0;
let sortedGalleryImages = [];

function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-gallery');
    if (!loadMoreBtn) return;

    if (galleryCursor >= sortedGalleryImages.length) {
        loadMoreBtn.classList.add('hidden');
    } else {
        loadMoreBtn.classList.remove('hidden');
    }
}

function renderGalleryBatch() {
    const container = document.getElementById('gallery-container');
    if (!container) return;

    const nextBatch = sortedGalleryImages.slice(galleryCursor, galleryCursor + GALLERY_BATCH_SIZE);

    nextBatch.forEach((imgData) => {
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

    galleryCursor += nextBatch.length;
    updateLoadMoreButton();
}

function loadGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;

    container.innerHTML = '';
    galleryCursor = 0;
    sortedGalleryImages = galleryImages
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    renderGalleryBatch();
}

async function loadGalleryData() {
    try {
        const response = await fetch('gallery/content.json');
        if (!response.ok) {
            throw new Error('Failed to load gallery data');
        }

        const data = await response.json();
        galleryImages = Array.isArray(data)
            ? data
            : (Array.isArray(data.images) ? data.images : []);
    } catch (error) {
        console.error('Error loading gallery data:', error);
        galleryImages = [];
    }
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
document.addEventListener('DOMContentLoaded', async () => {
    await loadGalleryData();

    // Load Gallery
    loadGallery();

    const loadMoreBtn = document.getElementById('load-more-gallery');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', renderGalleryBatch);
    }

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