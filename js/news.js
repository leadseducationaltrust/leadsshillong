// Array of news objects with dates (YYYY-MM-DD format is best for accurate sorting)
const newsAlerts = [
    { date: '2026-01-15', message: 'Admissions for the 2026-27 session are now open. Visit the Admissions office in Langkerding, Nongmensong for details.' },
    { date: '2026-01-20', message: 'Books and Uniforms are available from the 27th January, 2026 in Langkerding Office.' },
    { date: '2026-02-10', message: 'Classes I to X commence on 13th February, 2026.' },
    { date: '2025-12-10', message: 'Winter break begins from 15th December 2025 to 12th February 2026.' },
    { date: '2026-02-01', message: 'Orientation for teachers will be held on 13th February 2026.' },
    { date: '2025-11-05',message: 'Annual Sports Day will be held on 20th May 2025.' 
    } // This 6th older item will be automatically hidden by the script
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

// Run the script as soon as the HTML is fully loaded
document.addEventListener('DOMContentLoaded', loadNewsMarquee);