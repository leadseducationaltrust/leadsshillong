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

    const cards = visibleArticles.map((art) => {
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

        const card = document.createElement('div');
        card.className = 'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col cursor-pointer';
        card.addEventListener('click', () => {
            window.location.href = `insights.html?article=${safeArticleId}`;
        });

        const mediaWrap = document.createElement('div');
        mediaWrap.className = 'relative overflow-hidden h-56';

        const image = document.createElement('img');
        image.className = 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500';
        image.src = safeImage;
        image.alt = safeTitle;

        const categoryBadge = document.createElement('div');
        categoryBadge.className = 'absolute top-4 left-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md';
        categoryBadge.textContent = safeCategory;

        mediaWrap.appendChild(image);
        mediaWrap.appendChild(categoryBadge);

        const body = document.createElement('div');
        body.className = 'p-6 flex flex-col flex-grow';

        const date = document.createElement('span');
        date.className = 'text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2 block';
        date.textContent = safeDate;

        const title = document.createElement('h3');
        title.className = 'text-xl font-bold text-blue-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug';
        title.textContent = safeTitle;

        const description = document.createElement('p');
        description.className = 'text-gray-600 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed';
        description.textContent = safeDescription;

        const authorRow = document.createElement('div');
        authorRow.className = 'flex items-center gap-3 mt-auto pt-4 border-t border-gray-50';

        if (safeAuthorImage) {
            const authorImage = document.createElement('img');
            authorImage.className = 'w-8 h-8 rounded-full object-cover border border-emerald-100';
            authorImage.src = safeAuthorImage;
            authorImage.alt = safeAuthor;
            authorRow.appendChild(authorImage);
        } else {
            const initial = document.createElement('div');
            initial.className = 'w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs';
            initial.textContent = authorInitial;
            authorRow.appendChild(initial);
        }

        const authorName = document.createElement('span');
        authorName.className = 'text-xs font-bold text-slate-800';
        authorName.textContent = safeAuthor;
        authorRow.appendChild(authorName);

        body.appendChild(date);
        body.appendChild(title);
        body.appendChild(description);
        body.appendChild(authorRow);

        card.appendChild(mediaWrap);
        card.appendChild(body);
        return card;
    });

    grid.replaceChildren(...cards);

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
