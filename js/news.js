// Array of news objects with dates (YYYY-MM-DD HH:MM format) and expanded details
const newsAlerts = [
    { 
        date: '2026-02-10 09:30', 
        title: 'Classes Commence',
        message: 'Classes I to X commence on 13th February, 2026.', 
        description: 'All classes from Class I to X will resume their regular schedule starting from 13th February, 2026. Students should report to their respective classrooms by 9:00 AM. Parents are requested to ensure their children are on time.',
        image: 'https://images.unsplash.com/photo-1427504494785-cdba93c3e6c9?auto=format&fit=crop&w=500&h=300'
    },
    { 
        date: '2026-02-01 14:00', 
        title: 'Teacher Orientation',
        message: 'Orientation for teachers will be held on 13th February 2026.', 
        description: 'An orientation session for all teaching staff will be conducted on 13th February, 2026. The session will cover curriculum updates, teaching methodologies, and school policies for the academic year. Attendance is mandatory for all faculty members.',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=500&h=300'
    },
    { 
        date: '2026-01-20 10:15', 
        title: 'Books & Uniforms Available',
        message: 'Books and Uniforms are available from the 27th January, 2026 in Langkerding Office.', 
        description: 'All textbooks and uniforms for the 2026-27 session are now available for purchase. Students and parents can collect them from our Langkerding Office from 27th January onwards. Timings: 9:00 AM - 3:00 PM. For bulk orders, please contact the office in advance.',
        image: 'https://images.unsplash.com/photo-1497633762265-ecc187fde957?auto=format&fit=crop&w=500&h=300'
    },
    { 
        date: '2026-01-15 08:45', 
        title: 'Admissions Open',
        message: 'Admissions for the 2026-27 session are now open. Visit the Admissions office in Langkerding, Nongmensong for details.', 
        description: 'We are pleased to announce that admissions for the 2026-27 academic session are now open for all classes. Interested parents and students are welcome to visit our admission office. Application forms and prospectus are available online and at the office. Early bird discounts available for registrations submitted by 28th February 2026.',
        image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=500&h=300'
    },
    { 
        date: '2025-12-10 11:20', 
        title: 'Winter Break',
        message: 'Winter break begins from 15th December 2025 to 12th February 2026.', 
        description: 'The winter vacation period for all students from Class Pre-Primary to X is scheduled from 15th December 2025 to 12th February 2026. Online learning resources and assignments will be shared for engaged learning during this period. School office remains open for administrative work and admissions.',
        image: 'https://images.unsplash.com/photo-1542229881-46a822d00c30?auto=format&fit=crop&w=500&h=300'
    },
    { 
        date: '2025-11-05 15:30',
        title: 'Annual Sports Day',
        message: 'Annual Sports Day will be held on 20th May 2025.', 
        description: 'Our Annual Sports Day celebration bringing together students, teachers, and parents for a day of athletic excellence and sportsmanship. Various events including track and field, relay races, and inter-house competitions. Participation is open to all students. More details will be shared soon.',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=500&h=300'
    }
];

function loadNewsMarquee() {
    const marqueeElement = document.getElementById('news-marquee');
    
    // Safety check in case the element isn't on the current page
    if (!marqueeElement) return;

    const latestNewsString = newsAlerts
        // 1. Sort by date descending (Newest first)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        
        // 2. Keep only the top 5
        .slice(0, 5)
        
        // 3. Extract just the message text from the object
        .map(item => item.message)
        
        // 4. Join them together with the " | " separator
        .join(" | ");

    // Inject the combined string into the HTML
    marqueeElement.innerText = latestNewsString;
}

// Function to populate and open the news alerts modal
function openNewsModal() {
    const modal = document.getElementById('news-alerts-modal');
    const containerDiv = document.getElementById('news-alerts-container');
    
    if (!modal || !containerDiv) return;

    // Sort by date descending (Newest first) and get the top 5
    const topNews = newsAlerts
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    // Generate HTML for news alerts
    let newsHTML = '';
    topNews.forEach((news, index) => {
        const dateObj = new Date(news.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        const formattedTime = dateObj.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        });

        newsHTML += `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow mb-4">
                ${news.image ? `<img src="${news.image}" alt="${news.title}" class="w-full h-48 object-cover" onerror="this.src='https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=500&h=300'">` : ''}
                <div class="p-6">
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="text-lg font-bold text-blue-900">${news.title}</h3>
                        <span class="text-xs text-gray-400 font-semibold whitespace-nowrap">${formattedDate} ${formattedTime}</span>
                    </div>
                    <p class="text-gray-700 font-medium mb-3">${news.message}</p>
                    <p class="text-gray-600 text-sm leading-relaxed">${news.description}</p>
                </div>
            </div>
        `;
    });

    containerDiv.innerHTML = newsHTML;
    modal.classList.remove('hidden');
}

// Function to close the news alerts modal
function closeNewsModal() {
    const modal = document.getElementById('news-alerts-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Run the script as soon as the HTML is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    loadNewsMarquee();
    
    // Add click handler to alert banner to open modal
    const newsBanner = document.querySelector('.bg-blue-900');
    if (newsBanner) {
        newsBanner.style.cursor = 'pointer';
        newsBanner.addEventListener('click', openNewsModal);
    }

    // Add close button handler
    const closeBtn = document.getElementById('close-news-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeNewsModal);
    }

    // Close modal when clicking outside of it
    const modal = document.getElementById('news-alerts-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeNewsModal();
            }
        });
    }

    // Close modal when ESC key is pressed
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeNewsModal();
        }
    });
});