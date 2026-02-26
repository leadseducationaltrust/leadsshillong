const articles = [
    { id: "kidspreneurship_introduction" },
    { id: "ai_education" }
];

// Global variable to store fully loaded articles
let fullArticles = [];

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function hasExplicitScheme(value) {
    return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value);
}

function getSafeUrl(value) {
    const text = String(value ?? '').trim();
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

function normalizeText(value) {
    if (value === undefined || value === null) {
        return '';
    }
    const text = String(value).trim();
    if (!text) {
        return '';
    }
    const lowered = text.toLowerCase();
    if (lowered === 'null' || lowered === 'undefined') {
        return '';
    }
    return text;
}

function getSafeAbsoluteHttpUrl(value) {
    const text = normalizeText(value);
    if (!text || !hasExplicitScheme(text)) {
        return '';
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

async function getCusdisSettings() {
    const schoolData = window.schoolConfigReady
        ? await window.schoolConfigReady
        : (window.schoolConfig || {});

    const integrations = schoolData && schoolData.integrations && typeof schoolData.integrations === 'object'
        ? schoolData.integrations
        : {};

    const appId = normalizeText(integrations.cusdisAppId);
    const configuredHost = normalizeText(integrations.cusdisHost);
    const safeHost = getSafeAbsoluteHttpUrl(configuredHost) || 'https://cusdis.com';

    return {
        enabled: Boolean(integrations.cusdisEnabled),
        appId,
        host: safeHost.replace(/\/$/, '')
    };
}

function ensureCusdisScript(host) {
    const scriptId = 'cusdis-script';
    const scriptSrc = `${host}/js/cusdis.es.js`;

    const waitForScriptLoad = (script) => new Promise((resolve) => {
        if (window.CUSDIS) {
            resolve();
            return;
        }

        script.addEventListener('load', () => resolve(), { once: true });
        script.addEventListener('error', () => resolve(), { once: true });
    });

    const existing = document.getElementById(scriptId);
    if (existing) {
        if (existing.getAttribute('src') !== scriptSrc) {
            existing.setAttribute('src', scriptSrc);
        }
        return waitForScriptLoad(existing);
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.defer = true;
    script.src = scriptSrc;
    document.body.appendChild(script);
    return waitForScriptLoad(script);
}

function ensureCusdisHeightOverride() {
    const styleId = 'cusdis-height-override';
    if (document.getElementById(styleId)) {
        return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        #cusdis_thread {
            min-height: 720px;
        }

        #cusdis_thread iframe {
            min-height: 720px !important;
            height: 720px !important;
            width: 100% !important;
            border: 0;
        }
    `;
    document.head.appendChild(style);
}

function refreshCusdisThread(host, appId, article) {
    const cusdis = window.CUSDIS;
    const thread = document.getElementById('cusdis_thread');
    if (!cusdis || !thread) {
        return;
    }

    const pageId = String(article.id || '');
    const pageUrl = (() => {
        try {
            const current = new URL(window.location.href);
            current.search = '';
            current.hash = '';
            current.searchParams.set('article', pageId);
            return current.toString();
        } catch (error) {
            return window.location.href;
        }
    })();
    const pageTitle = String(article.title || '');

    thread.setAttribute('data-host', host);
    thread.setAttribute('data-app-id', appId);
    thread.setAttribute('data-page-id', pageId);
    thread.setAttribute('data-page-url', pageUrl);
    thread.setAttribute('data-page-title', pageTitle);
    thread.setAttribute('data-page-size', '5');
    thread.replaceChildren();

    if (typeof cusdis.initial === 'function') {
        cusdis.initial();
    }
}

function buildCusdisSection(createElement, createIcon, article, host, appId) {
    const canonicalArticleUrl = (() => {
        try {
            const current = new URL(window.location.href);
            current.search = '';
            current.hash = '';
            current.searchParams.set('article', String(article.id || ''));
            return current.toString();
        } catch (error) {
            return window.location.href;
        }
    })();

    const commentsSection = createElement('section', 'mt-14');
    const commentsHeading = createElement('h3', 'text-2xl md:text-3xl font-black text-blue-900 mb-4 flex items-center gap-3');
    commentsHeading.appendChild(createIcon('far fa-comments text-emerald-600'));
    commentsHeading.appendChild(document.createTextNode('Comments'));

    const commentsInfo = createElement('p', 'text-sm text-gray-600 mb-6');
    commentsInfo.textContent = 'Share your thoughts about this article.';

    const thread = createElement('div');
    thread.id = 'cusdis_thread';
    thread.setAttribute('data-host', host);
    thread.setAttribute('data-app-id', appId);
    thread.setAttribute('data-page-id', String(article.id || ''));
    thread.setAttribute('data-page-url', canonicalArticleUrl);
    thread.setAttribute('data-page-title', String(article.title || ''));
    thread.setAttribute('data-page-size', '5');

    commentsSection.appendChild(commentsHeading);
    commentsSection.appendChild(commentsInfo);
    commentsSection.appendChild(thread);
    return commentsSection;
}

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

    const createElement = (tag, className = '') => {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        return element;
    };

    const createIcon = (className) => createElement('i', className);

    const articleRoot = createElement('article', 'max-w-4xl mx-auto py-8');

    const backButton = createElement('button', 'inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold mb-10 transition-colors group text-base md:text-lg');
    backButton.type = 'button';
    backButton.addEventListener('click', () => window.history.back());
    backButton.appendChild(createIcon('fas fa-arrow-left group-hover:-translate-x-1 transition-transform'));
    const backLabel = createElement('span');
    backLabel.textContent = 'Back to Insights';
    backButton.appendChild(backLabel);
    articleRoot.appendChild(backButton);

    const header = createElement('div', 'mb-10');
    const categoryWrap = createElement('div', 'mb-6');
    const category = createElement('span', 'inline-block bg-emerald-600 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-4 shadow-md');
    category.textContent = String(article.category || '');
    categoryWrap.appendChild(category);

    const title = createElement('h1', 'text-4xl md:text-5xl lg:text-6xl font-black text-blue-900 mb-6 leading-tight');
    title.textContent = String(article.title || '');
    const description = createElement('p', 'text-lg md:text-xl text-gray-700 mb-8 leading-relaxed');
    description.textContent = String(article.description || '');

    const meta = createElement('div', 'flex flex-col gap-6 py-8 border-t-2 border-b-2 border-gray-300');
    const authorRow = createElement('div', 'flex items-center gap-4');

    if (article.authorImage) {
        const authorImage = createElement('img', 'w-16 h-16 rounded-full object-cover border-4 border-emerald-600 shadow-md');
        authorImage.src = getSafeUrl(article.authorImage);
        authorImage.alt = String(article.author || 'Author');
        authorRow.appendChild(authorImage);
    } else {
        const fallbackAvatar = createElement('div', 'w-16 h-16 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-2xl border-4 border-emerald-600');
        fallbackAvatar.textContent = String(article.author || '').charAt(0);
        authorRow.appendChild(fallbackAvatar);
    }

    const authorText = createElement('div');
    const authorName = createElement('p', 'font-bold text-gray-900 text-lg');
    authorName.textContent = String(article.author || '');
    const authorRole = createElement('p', 'text-gray-600 font-medium');
    authorRole.textContent = String(article.role || '');
    authorText.appendChild(authorName);
    authorText.appendChild(authorRole);
    authorRow.appendChild(authorText);

    const dateRow = createElement('p', 'text-gray-600 font-medium flex items-center gap-2');
    dateRow.appendChild(createIcon('far fa-calendar text-emerald-600'));
    dateRow.appendChild(document.createTextNode(formatArticleDate(article.date)));

    meta.appendChild(authorRow);
    meta.appendChild(dateRow);

    header.appendChild(categoryWrap);
    header.appendChild(title);
    header.appendChild(description);
    header.appendChild(meta);
    articleRoot.appendChild(header);

    const heroWrap = createElement('div', 'mb-12 -mx-4 md:mx-0');
    const heroImage = createElement('img', 'w-full h-96 md:h-[500px] object-cover rounded-xl shadow-xl');
    heroImage.src = getSafeUrl(article.image);
    heroImage.alt = String(article.title || 'Article image');
    heroWrap.appendChild(heroImage);
    articleRoot.appendChild(heroWrap);

    if (article.coreArgument) {
        const argument = createElement('div', 'bg-blue-900 text-white p-8 rounded-xl shadow-lg my-10 border-2 border-emerald-600');
        const argumentLabel = createElement('h3', 'text-sm font-black uppercase tracking-widest mb-4 text-emerald-300 flex items-center gap-2');
        argumentLabel.appendChild(createIcon('fas fa-lightbulb'));
        argumentLabel.appendChild(document.createTextNode(' The Core Argument'));
        const argumentText = createElement('p', 'text-xl md:text-2xl font-bold leading-relaxed italic');
        argumentText.textContent = `"${String(article.coreArgument)}"`;
        argument.appendChild(argumentLabel);
        argument.appendChild(argumentText);
        articleRoot.appendChild(argument);
    }

    if (Array.isArray(article.keyStatistics) && article.keyStatistics.length > 0) {
        const stats = createElement('div', 'bg-gradient-to-r from-blue-50 to-emerald-50 p-8 rounded-xl border-2 border-gray-200 my-10');
        const statsTitle = createElement('h3', 'text-lg font-black text-blue-900 uppercase tracking-widest mb-6 flex items-center gap-2');
        statsTitle.appendChild(createIcon('fas fa-chart-bar text-emerald-600'));
        statsTitle.appendChild(document.createTextNode(' Key Statistics'));
        const statsGrid = createElement('div', 'grid grid-cols-1 md:grid-cols-2 gap-6');

        article.keyStatistics.forEach((stat) => {
            const statCard = createElement('div', 'bg-white p-5 rounded-lg border border-emerald-200 shadow-sm hover:shadow-md transition-shadow');
            const statLabel = createElement('p', 'text-gray-600 font-semibold text-sm mb-2');
            statLabel.textContent = String(stat.label || '');
            const statValue = createElement('p', 'text-3xl font-black text-emerald-600');
            statValue.textContent = String(stat.value || '');
            statCard.appendChild(statLabel);
            statCard.appendChild(statValue);
            statsGrid.appendChild(statCard);
        });

        stats.appendChild(statsTitle);
        stats.appendChild(statsGrid);
        articleRoot.appendChild(stats);
    }

    const content = createElement('div', 'prose prose-lg max-w-none mb-12 text-gray-800');
    if (Array.isArray(article.content)) {
        let i = 0;
        while (i < article.content.length) {
            const section = article.content[i] || {};

            if (section.type === 'paragraph') {
                const nextSection = article.content[i + 1];
                if (nextSection && nextSection.type === 'image') {
                    const row = createElement('div', 'grid grid-cols-1 md:grid-cols-2 gap-8 items-center my-8');
                    const textCol = createElement('div');
                    const paragraph = createElement('p', 'text-gray-700 leading-relaxed mb-6 text-base md:text-lg');
                    paragraph.textContent = String(section.text || '');
                    textCol.appendChild(paragraph);

                    const figure = createElement('figure', 'rounded-lg overflow-hidden shadow-lg');
                    const image = createElement('img', 'w-full h-auto object-cover');
                    image.src = getSafeUrl(nextSection.src);
                    image.alt = String(nextSection.alt || '');
                    const figCaption = createElement('figcaption', 'text-sm text-gray-600 mt-3 text-center');
                    figCaption.textContent = String(nextSection.alt || '');
                    figure.appendChild(image);
                    figure.appendChild(figCaption);

                    row.appendChild(textCol);
                    row.appendChild(figure);
                    content.appendChild(row);
                    i += 2;
                    continue;
                }

                const paragraph = createElement('p', 'text-gray-700 leading-relaxed mb-6 text-base md:text-lg');
                paragraph.textContent = String(section.text || '');
                content.appendChild(paragraph);
                i += 1;
                continue;
            }

            if (section.type === 'pullquote') {
                const quote = createElement('blockquote', 'border-l-4 border-emerald-600 pl-6 py-4 my-8 bg-emerald-50 italic text-lg text-emerald-900 font-semibold rounded-r-lg');
                quote.textContent = `"${String(section.text || '')}"`;
                content.appendChild(quote);
                i += 1;
                continue;
            }

            if (section.type === 'image') {
                const figure = createElement('figure', 'my-8 rounded-lg overflow-hidden shadow-lg');
                const image = createElement('img', 'w-full h-auto object-cover');
                image.src = getSafeUrl(section.src);
                image.alt = String(section.alt || '');
                const figCaption = createElement('figcaption', 'text-sm text-gray-600 mt-3 text-center');
                figCaption.textContent = String(section.alt || '');
                figure.appendChild(image);
                figure.appendChild(figCaption);
                content.appendChild(figure);
            }

            i += 1;
        }
    }
    articleRoot.appendChild(content);

    const authorBio = createElement('div', 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-900 p-8 rounded-r-xl mb-12 shadow-md');
    const bioHeader = createElement('div', 'flex items-start gap-4 mb-4');
    bioHeader.appendChild(createIcon('fas fa-user-circle text-blue-900 text-3xl'));
    const bioTitle = createElement('h3', 'font-black text-blue-900 uppercase tracking-widest text-lg');
    bioTitle.textContent = 'About the Author';
    bioHeader.appendChild(bioTitle);
    const bioText = createElement('p', 'text-gray-700 text-base leading-relaxed ml-10');
    bioText.textContent = String(article.authorBio || '');
    authorBio.appendChild(bioHeader);
    authorBio.appendChild(bioText);
    articleRoot.appendChild(authorBio);

    const cusdisSettings = await getCusdisSettings();
    let shouldInitCusdis = false;
    if (cusdisSettings.enabled && cusdisSettings.appId) {
        const commentsSection = buildCusdisSection(
            createElement,
            createIcon,
            article,
            cusdisSettings.host,
            cusdisSettings.appId
        );
        articleRoot.appendChild(commentsSection);
        shouldInitCusdis = true;
    }

    articleRoot.appendChild(createElement('div', 'border-t-2 border-gray-300 my-12'));

    const backWrap = createElement('div', 'text-center py-10');
    const backLink = createElement('a', 'inline-block bg-gradient-to-r from-blue-900 to-emerald-600 text-white px-8 md:px-12 py-4 rounded-full font-black uppercase tracking-widest hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-base md:text-lg');
    backLink.href = 'insights.html';
    backLink.appendChild(createIcon('fas fa-arrow-left mr-3'));
    backLink.appendChild(document.createTextNode('View More Insights'));
    backWrap.appendChild(backLink);
    articleRoot.appendChild(backWrap);

    const rootContainer = container.parentElement;
    if (rootContainer) {
        rootContainer.replaceChildren(articleRoot);

        if (shouldInitCusdis) {
            ensureCusdisHeightOverride();
            ensureCusdisScript(cusdisSettings.host)
                .then(() => {
                    refreshCusdisThread(cusdisSettings.host, cusdisSettings.appId, article);
                })
                .catch((error) => {
                    console.error('Failed to initialize Cusdis comments:', error);
                });
        }
    }

    // Update page title
    document.title = `${String(article.title || '').trim()} | LEADS Higher Secondary School`;
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
