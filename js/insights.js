let visibleCount = 6;
const grid = document.getElementById('articles-grid');
const loadMoreBtn = document.getElementById('load-more-btn');
const articleStore = window.LEADS_ARTICLES || {};
const formatArticleDateSafe = typeof articleStore.formatArticleDate === 'function'
    ? articleStore.formatArticleDate
    : (value) => String(value || '');

const escapeHtmlInsights = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const normalizeImageUrlInsights = (value) => {
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

function renderArticles() {
    const loaded = Array.isArray(articleStore.loaded) ? articleStore.loaded : [];
    if (!grid || !Array.isArray(loaded)) return;

    const sortedArticles = [...loaded].sort((a, b) => new Date(b.date) - new Date(a.date));
    const visibleArticles = sortedArticles.slice(0, visibleCount);

    grid.innerHTML = visibleArticles.map((art) => {
        const rawAuthor = String(art.author || 'Unknown');
        const safeAuthor = escapeHtmlInsights(rawAuthor);
        const safeTitle = escapeHtmlInsights(art.title || 'Untitled');
        const safeCategory = escapeHtmlInsights(art.category || 'General');
        const safeDescription = escapeHtmlInsights(art.description || '');
        const safeDate = escapeHtmlInsights(formatArticleDateSafe(art.date));
        const safeImage = normalizeImageUrlInsights(art.image);
        const safeAuthorImage = normalizeImageUrlInsights(art.authorImage);
        const safeArticleId = encodeURIComponent(String(art.id || ''));
        const authorInitial = escapeHtmlInsights(rawAuthor.charAt(0).toUpperCase() || 'A');

        const authorDisplay = safeAuthorImage
            ? `<img src="${safeAuthorImage}" alt="${safeAuthor}" class="w-8 h-8 rounded-full object-cover border border-emerald-100">`
            : `<div class="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs">${authorInitial}</div>`;

        return `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col cursor-pointer" onclick="window.location.href='insights.html?article=${safeArticleId}'">
                <div class="relative overflow-hidden h-56">
                    <img src="${safeImage}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="${safeTitle}">
                    <div class="absolute top-4 left-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                        ${safeCategory}
                    </div>
                </div>
                <div class="p-6 flex flex-col flex-grow">
                    <span class="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2 block">${safeDate}</span>
                    <h3 class="text-xl font-bold text-blue-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">${safeTitle}</h3>
                    <p class="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">${safeDescription}</p>
                    <div class="flex items-center gap-3 mt-auto pt-4 border-t border-gray-50">
                        ${authorDisplay}
                        <span class="text-xs font-bold text-slate-800">${safeAuthor}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (!loadMoreBtn) {
        return;
    }

    if (visibleCount >= sortedArticles.length) {
        loadMoreBtn.classList.add('hidden');
    } else {
        loadMoreBtn.classList.remove('hidden');
    }
}

if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        visibleCount += 6;
        renderArticles();
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof articleStore.loadAllArticlesData === 'function') {
        await articleStore.loadAllArticlesData();
    }
    renderArticles();
});
