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

    const card = document.createElement('div');
    card.className = 'bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col md:flex-row group';
    card.addEventListener('click', () => {
        window.location.href = `insights.html?article=${safeArticleId}`;
    });

    const mediaWrap = document.createElement('div');
    mediaWrap.className = 'md:w-1/2 overflow-hidden relative';

    const image = document.createElement('img');
    image.className = 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 min-h-[300px]';
    image.src = safeImage;
    image.alt = 'Latest Article';
    mediaWrap.appendChild(image);

    const content = document.createElement('div');
    content.className = 'md:w-1/2 p-8 md:p-12 flex flex-col justify-center';

    const meta = document.createElement('div');
    meta.className = 'flex items-center gap-4 mb-6';

    const category = document.createElement('span');
    category.className = 'px-3 py-1 bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-widest rounded-full';
    category.textContent = safeCategory;

    const date = document.createElement('span');
    date.className = 'text-gray-400 text-[10px] font-bold uppercase tracking-widest';
    date.textContent = safeDate;

    meta.appendChild(category);
    meta.appendChild(date);

    const title = document.createElement('h3');
    title.className = 'text-2xl md:text-4xl font-black text-blue-900 mb-6 group-hover:text-emerald-600 transition-colors leading-tight';
    title.textContent = safeTitle;

    const description = document.createElement('p');
    description.className = 'text-gray-600 text-sm md:text-base mb-8 leading-relaxed line-clamp-3';
    description.textContent = safeDescription;

    const authorRow = document.createElement('div');
    authorRow.className = 'flex items-center gap-3';

    if (safeAuthorImage) {
        const authorImage = document.createElement('img');
        authorImage.className = 'w-10 h-10 rounded-full object-cover border border-emerald-200 shadow-sm';
        authorImage.src = safeAuthorImage;
        authorImage.alt = safeAuthor;
        authorRow.appendChild(authorImage);
    } else {
        const initial = document.createElement('div');
        initial.className = 'w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm';
        initial.textContent = authorInitial;
        authorRow.appendChild(initial);
    }

    const authorName = document.createElement('span');
    authorName.className = 'text-sm font-bold text-slate-800';
    authorName.textContent = safeAuthor;
    authorRow.appendChild(authorName);

    content.appendChild(meta);
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(authorRow);

    card.appendChild(mediaWrap);
    card.appendChild(content);
    container.replaceChildren(card);
}

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof articleStore.loadAllArticlesData === 'function') {
        await articleStore.loadAllArticlesData();
    }
    renderLatestHighlight();
});
