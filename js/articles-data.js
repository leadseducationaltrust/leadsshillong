const DEFAULT_ARTICLE_IDS = [
    'kidspreneurship_introduction',
    'ai_education'
];

let fullArticles = [];

window.LEADS_ARTICLES = window.LEADS_ARTICLES || {};
window.LEADS_ARTICLES.loaded = fullArticles;

function isSafeArticleId(value) {
    return /^[a-zA-Z0-9_-]+$/.test(String(value || ''));
}

function uniqueArticleIds(values) {
    const seen = new Set();
    const result = [];

    for (const value of values) {
        const id = String(value || '').trim();
        if (!isSafeArticleId(id) || seen.has(id)) {
            continue;
        }
        seen.add(id);
        result.push(id);
    }

    return result;
}

async function loadArticleIndexFromManifest() {
    try {
        const response = await fetch('articles/content.json', { cache: 'no-cache' });
        if (!response.ok) {
            return [];
        }

        const payload = await response.json();
        const entries = [];

        if (Array.isArray(payload)) {
            entries.push(...payload);
        } else if (Array.isArray(payload?.items)) {
            entries.push(...payload.items);
        } else if (Array.isArray(payload?.articles)) {
            entries.push(...payload.articles);
        }

        const ids = entries.map((entry) => {
            if (typeof entry === 'string') {
                return entry;
            }
            if (entry && typeof entry === 'object') {
                return entry.id;
            }
            return '';
        });

        const safeIds = uniqueArticleIds(ids);
        if (response.ok && safeIds.length === 0) {
            console.warn('articles/content.json loaded but contained no article IDs. New Insights articles may require regenerating the manifest with scripts/generate-articles-index.mjs.');
        }
        return safeIds;
    } catch {
        console.warn('Unable to load articles/content.json manifest; falling back to starter articles.');
        return [];
    }
}

async function discoverArticleIds() {
    const fromManifest = await loadArticleIndexFromManifest();
    if (fromManifest.length > 0) {
        return fromManifest;
    }

    return uniqueArticleIds(DEFAULT_ARTICLE_IDS);
}

async function loadArticleContent(articleId) {
    if (!isSafeArticleId(articleId)) {
        return null;
    }

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

async function getFullArticleById(id) {
    if (!isSafeArticleId(id)) {
        return null;
    }

    const content = await loadArticleContent(id);
    if (!content) {
        return null;
    }

    return {
        id,
        ...content
    };
}

async function loadAllArticlesData() {
    const articleIds = await discoverArticleIds();
    fullArticles = [];

    for (const articleId of articleIds) {
        const fullArticle = await getFullArticleById(articleId);
        if (fullArticle) {
            fullArticles.push(fullArticle);
        }
    }

    window.LEADS_ARTICLES.loaded = fullArticles;
    return fullArticles;
}

function formatArticleDate(dateString) {
    const date = new Date(`${dateString}Z`);

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

window.LEADS_ARTICLES.loadAllArticlesData = loadAllArticlesData;
window.LEADS_ARTICLES.formatArticleDate = formatArticleDate;
window.LEADS_ARTICLES.getFullArticleById = getFullArticleById;
