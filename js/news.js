// News is loaded from JSON so it can be managed by a CMS
let newsAlerts = [];

// Global variable to track current page for pagination
let currentNewsPage = 0;
const newsPerPage = 5;

// Sort all news once loaded for consistent ordering
let sortedNewsAlerts = [];

async function loadNewsData() {
    try {
        const response = await fetch('news/content.json');
        if (!response.ok) {
            throw new Error(`Failed to load news data: ${response.statusText}`);
        }

        const data = await response.json();
        newsAlerts = Array.isArray(data)
            ? data
            : (Array.isArray(data.items) ? data.items : []);
        sortedNewsAlerts = [...newsAlerts].sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
        console.error('Error loading news data:', error);
        newsAlerts = [];
        sortedNewsAlerts = [];
    }
}

function createElement(tag, className = '') {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    return element;
}

function appendParsedTextWithLinks(container, rawText) {
    const text = String(rawText || '');
    const tokenRegex = /(https?:\/\/[^\s]+)|(\+91\s?\d{5}\s?\d{5}|\+91\s?\d{10})/g;
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(text)) !== null) {
        const token = match[0];
        const start = match.index;

        if (start > lastIndex) {
            container.appendChild(document.createTextNode(text.slice(lastIndex, start)));
        }

        if (match[1]) {
            let cleanUrl = token;
            let trailingChar = '';

            if (/[.,;:!?]$/.test(token)) {
                trailingChar = token[token.length - 1];
                cleanUrl = token.slice(0, -1);
            }

            const link = createElement('a', 'inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-sm mx-1');
            link.href = cleanUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = 'Visit Portal';
            link.addEventListener('click', (event) => event.stopPropagation());
            container.appendChild(link);

            if (trailingChar) {
                container.appendChild(document.createTextNode(trailingChar));
            }
        } else {
            const phoneLink = createElement('a', 'inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm mx-1 cursor-pointer');
            phoneLink.href = `tel:${token.replace(/\s/g, '')}`;
            phoneLink.textContent = token;
            phoneLink.addEventListener('click', (event) => event.stopPropagation());
            container.appendChild(phoneLink);
        }

        lastIndex = start + token.length;
    }

    if (lastIndex < text.length) {
        container.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
}

function createNewsCard(news) {
    const card = createElement('div', 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow mb-4');

    if (news.image) {
        const image = createElement('img', 'w-full h-48 object-cover');
        image.src = news.image;
        image.alt = news.title || 'News image';
        image.addEventListener('error', () => {
            image.src = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=500&h=300';
        });
        card.appendChild(image);
    }

    const content = createElement('div', 'p-4 sm:p-6');
    const header = createElement('div', 'flex justify-between items-start gap-3 mb-3');

    const title = createElement('h3', 'text-lg font-bold text-blue-900 flex-1 min-w-0');
    title.textContent = news.title || '';

    const dateInfo = createElement('span', 'text-xs text-gray-400 font-semibold whitespace-nowrap flex-shrink-0');
    const dateObj = new Date(news.date);
    const formattedDate = Number.isNaN(dateObj.getTime())
        ? ''
        : dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const formattedTime = Number.isNaN(dateObj.getTime())
        ? ''
        : dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    dateInfo.textContent = `${formattedDate} ${formattedTime}`.trim();

    header.appendChild(title);
    header.appendChild(dateInfo);

    const message = createElement('p', 'text-gray-700 font-medium mb-3');
    message.textContent = news.message || '';

    const description = createElement('div', 'text-gray-600 text-sm leading-relaxed');
    appendParsedTextWithLinks(description, news.description);

    content.appendChild(header);
    content.appendChild(message);
    content.appendChild(description);
    card.appendChild(content);

    return card;
}

function createPaginationControls(page, totalPages, hasNext) {
    const wrapper = createElement('div', 'mt-8 flex gap-3 justify-between items-center');

    if (page > 0) {
        const previousButton = createElement('button', 'flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2');
        previousButton.type = 'button';
        const previousIcon = createElement('i', 'fas fa-arrow-up');
        const previousText = document.createTextNode(' Previous');
        previousButton.appendChild(previousIcon);
        previousButton.appendChild(previousText);
        previousButton.addEventListener('click', loadPreviousNews);
        wrapper.appendChild(previousButton);
    } else {
        wrapper.appendChild(createElement('div', 'flex-1'));
    }

    const indicator = createElement('span', 'text-sm text-gray-500 font-semibold px-4 text-center whitespace-nowrap');
    indicator.textContent = `Page ${page + 1} of ${totalPages}`;
    wrapper.appendChild(indicator);

    if (hasNext) {
        const moreButton = createElement('button', 'flex-1 py-3 px-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2');
        moreButton.type = 'button';
        moreButton.appendChild(document.createTextNode('More News... '));
        moreButton.appendChild(createElement('i', 'fas fa-arrow-down'));
        moreButton.addEventListener('click', loadMoreNews);
        wrapper.appendChild(moreButton);
    } else {
        wrapper.appendChild(createElement('div', 'flex-1'));
    }

    return wrapper;
}

function loadNewsMarquee() {
    const marqueeElement = document.getElementById('news-marquee');
    
    // Safety check in case the element isn't on the current page
    if (!marqueeElement) return;

    const latestNewsString = sortedNewsAlerts
        // Keep only the top 5
        .slice(0, 5)
        
        // Extract just the message text from the object
        .map(item => item.message)
        
        // Join them together with the " | " separator
        .join(" | ");

    // Inject the combined string into the HTML
    marqueeElement.innerText = latestNewsString;
}

// Function to render news items at a specific page
function renderNewsPage(page = 0) {
    const containerDiv = document.getElementById('news-alerts-container');
    
    if (!containerDiv) return;

    // Calculate start and end indices
    const startIndex = page * newsPerPage;
    const endIndex = startIndex + newsPerPage;
    const pageNews = sortedNewsAlerts.slice(startIndex, endIndex);

    containerDiv.replaceChildren();
    pageNews.forEach((news) => {
        containerDiv.appendChild(createNewsCard(news));
    });

    // Add pagination buttons
    const totalPages = Math.ceil(sortedNewsAlerts.length / newsPerPage);
    const hasNext = endIndex < sortedNewsAlerts.length;
    if (page > 0 || hasNext) {
        containerDiv.appendChild(createPaginationControls(page, totalPages, hasNext));
    }
}

// Function to load the next page of news
function loadMoreNews() {
    currentNewsPage++;
    renderNewsPage(currentNewsPage);
    
    // Scroll to top of container to show new content
    const containerDiv = document.getElementById('news-alerts-container');
    if (containerDiv) {
        containerDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Function to load the previous page of news
function loadPreviousNews() {
    if (currentNewsPage > 0) {
        currentNewsPage--;
        renderNewsPage(currentNewsPage);
        
        // Scroll to top of container to show new content
        const containerDiv = document.getElementById('news-alerts-container');
        if (containerDiv) {
            containerDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Function to populate and open the news alerts modal
function openNewsModal() {
    const modal = document.getElementById('news-alerts-modal');
    const containerDiv = document.getElementById('news-alerts-container');
    
    if (!modal || !containerDiv) return;

    // Reset pagination to first page
    currentNewsPage = 0;
    renderNewsPage(0);
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
document.addEventListener('DOMContentLoaded', async () => {
    await loadNewsData();
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