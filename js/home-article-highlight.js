const escapeHtmlHome = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const normalizeImageUrlHome = (value) => {
    if (value === undefined || value === null) return '';
    const text = String(value).trim();
    if (!text) return '';
    const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(text);
    if (!hasScheme) return text;
    try {
        const parsed = new URL(text);
        return ['http:', 'https:'].includes(parsed.protocol) ? text : '';
    } catch {
        return '';
    }
};

const articleStore = window.LEADS_ARTICLES || {};
const formatArticleDateSafe = typeof articleStore.formatArticleDate === 'function'
    ? articleStore.formatArticleDate
    : (value) => String(value || '');

function renderLatestHighlight() {
    const container = document.getElementById('latest-article-highlight');
    const loaded = Array.isArray(articleStore.loaded) ? articleStore.loaded : [];
    if (!container || !Array.isArray(loaded) || loaded.length === 0) return;

    const latestArt = [...loaded].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const rawAuthor = String(latestArt.author || 'Unknown');
    const safeAuthor = escapeHtmlHome(rawAuthor);
    const safeCategory = escapeHtmlHome(latestArt.category || 'General');
    const safeTitle = escapeHtmlHome(latestArt.title || 'Untitled');
    const safeDescription = escapeHtmlHome(latestArt.description || '');
    const safeImage = normalizeImageUrlHome(latestArt.image);
    const safeAuthorImage = normalizeImageUrlHome(latestArt.authorImage);
    const safeArticleId = encodeURIComponent(String(latestArt.id || ''));
    const safeDate = escapeHtmlHome(formatArticleDateSafe(latestArt.date));
    const authorInitial = escapeHtmlHome(rawAuthor.charAt(0).toUpperCase() || 'A');

    const authorDisplay = safeAuthorImage
        ? `<img src="${safeAuthorImage}" alt="${safeAuthor}" class="w-10 h-10 rounded-full object-cover border border-emerald-200 shadow-sm">`
        : `<div class="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">${authorInitial}</div>`;

    container.innerHTML = `
        <div onclick="location.href='insights.html?article=${safeArticleId}'" class="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col md:flex-row group">
            <div class="md:w-1/2 overflow-hidden relative">
                <img src="${safeImage}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 min-h-[300px]" alt="Latest Article">
            </div>
            <div class="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <div class="flex items-center gap-4 mb-6">
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-widest rounded-full">${safeCategory}</span>
                    <span class="text-gray-400 text-[10px] font-bold uppercase tracking-widest">${safeDate}</span>
                </div>
                <h3 class="text-2xl md:text-4xl font-black text-blue-900 mb-6 group-hover:text-emerald-600 transition-colors leading-tight">
                    ${safeTitle}
                </h3>
                <p class="text-gray-600 text-sm md:text-base mb-8 leading-relaxed line-clamp-3">
                    ${safeDescription}
                </p>
                <div class="flex items-center gap-3">
                    ${authorDisplay}
                    <span class="text-sm font-bold text-slate-800">${safeAuthor}</span>
                </div>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof articleStore.loadAllArticlesData === 'function') {
        await articleStore.loadAllArticlesData();
    }
    renderLatestHighlight();
});
