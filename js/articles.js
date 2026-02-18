const articles = [
    { id: "kidspreneurship_introduction" },
    { id: "ai_education" }
];

// Global variable to store fully loaded articles
let fullArticles = [];

// ==========================================
// LOAD ARTICLE CONTENT DYNAMICALLY
// ==========================================

/**
 * Load all articles with full metadata from content.json files
 * @returns {Promise<Array>} Array of complete article objects
 */
async function loadAllArticlesData() {
    fullArticles = [];
    
    for (const article of articles) {
        const fullArticle = await getFullArticleById(article.id);
        if (fullArticle) {
            fullArticles.push(fullArticle);
        }
    }
    
    return fullArticles;
}

/**
 * Load article content from JSON file
 * @param {string} articleId - Article ID
 * @returns {Promise<Object>} Article content data
 */
async function loadArticleContent(articleId) {
    try {
        const response = await fetch(`articles/${articleId}/content.json`);
        if (!response.ok) {
            throw new Error(`Failed to load article content: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error loading article content for ${articleId}:`, error);
        return null;
    }
}

/**
 * Get full article data including metadata and content
 * @param {string} id - Article ID
 * @returns {Promise<Object>} Complete article object
 */
async function getFullArticleById(id) {
    const metadata = articles.find(article => article.id === id);
    if (!metadata) {
        return null;
    }
    
    const content = await loadArticleContent(id);
    if (!content) {
        return null;
    }
    
    return {
        id: metadata.id,
        ...content
    };
}

// ==========================================
// DATE FORMATTING FUNCTION
// ==========================================

/**
 * Format ISO date string to "dd Month Year HH:MI AM/PM" format
 * @param {string} dateString - ISO format date string (YYYY-MM-DDTHH:MM:SS)
 * @returns {string} Formatted date string
 */
function formatArticleDate(dateString) {
    const date = new Date(dateString + 'Z');
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    
    let hours = date.getUTCHours();
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const displayHours = String(hours).padStart(2, '0');
    
    return `${day} ${month} ${year} ${displayHours}:${minutes} ${ampm}`;
}

// ==========================================
// DYNAMIC ARTICLE RENDERING
// ==========================================

/**
 * Get URL parameter value
 */
function getURLParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

/**
 * Find article by ID
 */
function getArticleById(id) {
    return articles.find(article => article.id === id);
}

/**
 * Render single article view
 */
async function displayArticle(articleId) {
    const article = await getFullArticleById(articleId);
    
    if (!article) {
        console.error(`Article with ID "${articleId}" not found`);
        return;
    }

    const container = document.getElementById('articles-grid');
    if (!container) return;

    // Build content HTML
    let contentHtml = '';
    if (article.content && Array.isArray(article.content)) {
        let i = 0;
        while (i < article.content.length) {
            const section = article.content[i];
            
            if (section.type === 'paragraph') {
                const nextSection = article.content[i + 1];
                
                // If next section is an image, create a side-by-side layout
                if (nextSection && nextSection.type === 'image') {
                    contentHtml += `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center my-8">
                        <div><p class="text-gray-700 leading-relaxed mb-6 text-base md:text-lg">${section.text}</p></div>
                        <figure class="rounded-lg overflow-hidden shadow-lg"><img src="${nextSection.src}" alt="${nextSection.alt}" class="w-full h-auto object-cover"><figcaption class="text-sm text-gray-600 mt-3 text-center">${nextSection.alt}</figcaption></figure>
                    </div>
                    `;
                    i += 2; // Skip both paragraph and image
                } else {
                    // Regular paragraph without following image
                    contentHtml += `<p class="text-gray-700 leading-relaxed mb-6 text-base md:text-lg">${section.text}</p>`;
                    i++;
                }
            } else if (section.type === 'pullquote') {
                contentHtml += `<blockquote class="border-l-4 border-emerald-600 pl-6 py-4 my-8 bg-emerald-50 italic text-lg text-emerald-900 font-semibold rounded-r-lg">"${section.text}"</blockquote>`;
                i++;
            } else if (section.type === 'image') {
                // Standalone image (not preceded by paragraph)
                contentHtml += `<figure class="my-8 rounded-lg overflow-hidden shadow-lg"><img src="${section.src}" alt="${section.alt}" class="w-full h-auto object-cover"><figcaption class="text-sm text-gray-600 mt-3 text-center">${section.alt}</figcaption></figure>`;
                i++;
            } else {
                i++;
            }
        }
    }

    // Build key statistics HTML
    let statsHtml = '';
    if (article.keyStatistics && Array.isArray(article.keyStatistics)) {
        statsHtml = `
        <div class="bg-gradient-to-r from-blue-50 to-emerald-50 p-8 rounded-xl border-2 border-gray-200 my-10">
            <h3 class="text-lg font-black text-blue-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <i class="fas fa-chart-bar text-emerald-600"></i> Key Statistics
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${article.keyStatistics.map(stat => `
                    <div class="bg-white p-5 rounded-lg border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
                        <p class="text-gray-600 font-semibold text-sm mb-2">${stat.label}</p>
                        <p class="text-3xl font-black text-emerald-600">${stat.value}</p>
                    </div>
                `).join('')}
            </div>
        </div>
        `;
    }

    // Build core argument HTML
    let argumentHtml = '';
    if (article.coreArgument) {
        argumentHtml = `
        <div class="bg-blue-900 text-white p-8 rounded-xl shadow-lg my-10 border-2 border-emerald-600">
            <h3 class="text-sm font-black uppercase tracking-widest mb-4 text-emerald-300 flex items-center gap-2">
                <i class="fas fa-lightbulb"></i> The Core Argument
            </h3>
            <p class="text-xl md:text-2xl font-bold leading-relaxed italic">"${article.coreArgument}"</p>
        </div>
        `;
    }

    // Build author avatar
    const authorDisplay = article.authorImage 
        ? `<img src="${article.authorImage}" alt="${article.author}" class="w-16 h-16 rounded-full object-cover border-4 border-emerald-600 shadow-md">`
        : `<div class="w-16 h-16 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-2xl border-4 border-emerald-600">${article.author.charAt(0)}</div>`;

    // Replace entire articles-grid with article view
    container.parentElement.innerHTML = `
    <article class="max-w-4xl mx-auto py-8">
        <!-- Back Button -->
        <button onclick="window.history.back()" class="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold mb-10 transition-colors group text-base md:text-lg">
            <i class="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
            <span>Back to Insights</span>
        </button>

        <!-- Article Header -->
        <div class="mb-10">
            <div class="mb-6">
                <span class="inline-block bg-emerald-600 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-4 shadow-md">
                    ${article.category}
                </span>
            </div>
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-black text-blue-900 mb-6 leading-tight">${article.title}</h1>
            <p class="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">${article.description}</p>
            
            <!-- Article Meta -->
            <div class="flex flex-col gap-6 py-8 border-t-2 border-b-2 border-gray-300">
                <div class="flex items-center gap-4">
                    ${authorDisplay}
                    <div>
                        <p class="font-bold text-gray-900 text-lg">${article.author}</p>
                        <p class="text-gray-600 font-medium">${article.role}</p>
                    </div>
                </div>
                <p class="text-gray-600 font-medium flex items-center gap-2">
                    <i class="far fa-calendar text-emerald-600"></i>${formatArticleDate(article.date)}
                </p>
            </div>
        </div>

        <!-- Hero Image -->
        <div class="mb-12 -mx-4 md:mx-0">
            <img src="${article.image}" alt="${article.title}" class="w-full h-96 md:h-[500px] object-cover rounded-xl shadow-xl">
        </div>

        <!-- Core Argument Section -->
        ${argumentHtml}

        <!-- Key Statistics Section -->
        ${statsHtml}

        <!-- Article Content -->
        <div class="prose prose-lg max-w-none mb-12 text-gray-800">
            ${contentHtml}
        </div>

        <!-- Author Bio Section -->
        <div class="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-900 p-8 rounded-r-xl mb-12 shadow-md">
            <div class="flex items-start gap-4 mb-4">
                <i class="fas fa-user-circle text-blue-900 text-3xl"></i>
                <h3 class="font-black text-blue-900 uppercase tracking-widest text-lg">About the Author</h3>
            </div>
            <p class="text-gray-700 text-base leading-relaxed ml-10">${article.authorBio}</p>
        </div>

        <!-- Divider -->
        <div class="border-t-2 border-gray-300 my-12"></div>

        <!-- Back to Insights Button -->
        <div class="text-center py-10">
            <a href="insights.html" class="inline-block bg-gradient-to-r from-blue-900 to-emerald-600 text-white px-8 md:px-12 py-4 rounded-full font-black uppercase tracking-widest hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-base md:text-lg">
                <i class="fas fa-arrow-left mr-3"></i>View More Insights
            </a>
        </div>
    </article>
    `;

    // Update page title
    document.title = `${article.title} | LEADS Higher Secondary School`;
}

/**
 * Initialize article rendering on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    const articleParam = getURLParameter('article');
    
    if (articleParam) {
        // Single article view
        displayArticle(articleParam);
    }
});
