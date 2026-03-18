const articleStoreDetail = window.LEADS_ARTICLES || {};

function hasExplicitScheme(value) {
    return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(String(value || ''));
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
    } catch {
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
    } catch {
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
            border-radius: 0.75rem;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
            border: 1px solid #e2e8f0;
        }

        #cusdis_thread iframe {
            min-height: 720px !important;
            height: 720px !important;
            width: 100% !important;
            border: 0 !important;
            border-radius: 0.75rem !important;
        }

        .cusdis-comments-container {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 1rem;
            padding: 3rem 2rem;
            margin-top: 3rem;
            position: relative;
            overflow: hidden;
        }

        .cusdis-comments-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #059669 0%, #06b6d4 50%, #3b82f6 100%);
            border-radius: 1rem 1rem 0 0;
        }

        .cusdis-comments-header {
            margin-bottom: 2rem;
            position: relative;
            z-index: 1;
        }

        .cusdis-comments-header h3 {
            background: linear-gradient(135deg, #1e3a8a 0%, #059669 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .cusdis-comments-info {
            color: #475569;
            font-size: 0.95rem;
            line-height: 1.6;
        }

        .cusdis-thread-wrapper {
            background: white;
            border-radius: 0.75rem;
            overflow: hidden;
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        /* Cusdis Form Improvements */
        #cusdis_thread [data-cusdis-form-root] {
            padding: 2rem 2rem !important;
            display: flex;
            flex-direction: column;
            gap: 1.5rem !important;
        }

        #cusdis_thread input[type="text"],
        #cusdis_thread input[type="email"],
        #cusdis_thread textarea {
            padding: 0.875rem 1rem !important;
            margin: 0.5rem 0 !important;
            border-radius: 0.5rem !important;
            border: 1.5px solid #e2e8f0 !important;
            font-family: inherit !important;
            font-size: 0.95rem !important;
            transition: all 0.2s ease !important;
        }

        #cusdis_thread input[type="text"]:focus,
        #cusdis_thread input[type="email"]:focus,
        #cusdis_thread textarea:focus {
            outline: none !important;
            border-color: #059669 !important;
            box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1) !important;
        }

        #cusdis_thread textarea {
            min-height: 120px !important;
            resize: vertical !important;
            line-height: 1.6 !important;
        }

        #cusdis_thread label {
            font-weight: 600 !important;
            color: #1e293b !important;
            display: block !important;
            margin-bottom: 0.5rem !important;
            font-size: 0.95rem !important;
        }

        #cusdis_thread [data-cusdis-form-field] {
            display: flex !important;
            flex-direction: column !important;
            gap: 0.5rem !important;
            margin-bottom: 0.5rem !important;
        }

        #cusdis_thread button,
        #cusdis_thread [role="button"] {
            padding: 0.875rem 2rem !important;
            border-radius: 0.5rem !important;
            background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
            color: white !important;
            font-weight: 600 !important;
            border: none !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
            font-size: 0.95rem !important;
            margin-top: 1rem !important;
        }

        #cusdis_thread button:hover,
        #cusdis_thread [role="button"]:hover {
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3) !important;
            transform: translateY(-2px) !important;
        }

        /* Comments List Improvements */
        #cusdis_thread [data-cusdis-comments-root] {
            display: flex !important;
            flex-direction: column !important;
            gap: 2rem !important;
            padding-top: 1.5rem !important;
        }

        #cusdis_thread [data-cusdis-comment] {
            padding: 1.5rem !important;
            border-left: 4px solid #059669 !important;
            background: #f8fafc !important;
            border-radius: 0.5rem !important;
            transition: all 0.2s ease !important;
        }

        #cusdis_thread [data-cusdis-comment]:hover {
            background: #f1f5f9 !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
        }

        #cusdis_thread [data-cusdis-comment-author] {
            display: flex !important;
            align-items: center !important;
            gap: 0.75rem !important;
            margin-bottom: 0.75rem !important;
        }

        #cusdis_thread [data-cusdis-comment-author-name] {
            font-weight: 700 !important;
            color: #1e3a8a !important;
            font-size: 0.95rem !important;
        }

        #cusdis_thread [data-cusdis-comment-timestamp] {
            color: #64748b !important;
            font-size: 0.8rem !important;
            font-weight: 500 !important;
        }

        #cusdis_thread [data-cusdis-comment-content] {
            color: #334155 !important;
            line-height: 1.7 !important;
            font-size: 0.95rem !important;
            word-break: break-word !important;
        }

        #cusdis_thread [data-cusdis-comment-footer] {
            margin-top: 0.75rem !important;
            display: flex !important;
            gap: 1rem !important;
            align-items: center !important;
        }

        /* Improved spacing for nested elements */
        #cusdis_thread > div > div {
            margin-bottom: 1rem !important;
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
        } catch {
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
        } catch {
            return window.location.href;
        }
    })();

    const commentsSection = createElement('section', 'cusdis-comments-container');

    const headerDiv = createElement('div', 'cusdis-comments-header');
    const commentsHeading = createElement('h3', 'text-3xl md:text-4xl font-black mb-3 flex items-center gap-3');
    commentsHeading.appendChild(createIcon('far fa-comments text-emerald-600 text-3xl'));
    commentsHeading.appendChild(document.createTextNode('Community Thoughts'));
    
    const commentsInfo = createElement('p', 'cusdis-comments-info');
    commentsInfo.textContent = 'We\'d love to hear your perspective! Share your insights, questions, or feedback about this article below.';
    
    headerDiv.appendChild(commentsHeading);
    headerDiv.appendChild(commentsInfo);
    commentsSection.appendChild(headerDiv);

    const threadWrapper = createElement('div', 'cusdis-thread-wrapper');
    const thread = createElement('div');
    thread.id = 'cusdis_thread';
    thread.setAttribute('data-host', host);
    thread.setAttribute('data-app-id', appId);
    thread.setAttribute('data-page-id', String(article.id || ''));
    thread.setAttribute('data-page-url', canonicalArticleUrl);
    thread.setAttribute('data-page-title', String(article.title || ''));
    thread.setAttribute('data-page-size', '5');

    threadWrapper.appendChild(thread);
    commentsSection.appendChild(threadWrapper);
    return commentsSection;
}

function getURLParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

async function displayArticle(articleId) {
    if (typeof articleStoreDetail.getFullArticleById !== 'function') {
        return;
    }

    const article = await articleStoreDetail.getFullArticleById(articleId);
    if (!article) {
        console.error(`Article with ID "${articleId}" not found`);
        return;
    }

    const container = document.getElementById('articles-grid');
    if (!container) return;

    const formatDate = typeof articleStoreDetail.formatArticleDate === 'function'
        ? articleStoreDetail.formatArticleDate
        : (value) => String(value || '');

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
    backButton.addEventListener('click', () => {
        window.location.href = 'insights.html';
    });
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
    dateRow.appendChild(document.createTextNode(formatDate(article.date)));

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

    document.title = `${String(article.title || '').trim()} | LEADS Higher Secondary School`;
}

document.addEventListener('DOMContentLoaded', () => {
    const articleParam = getURLParameter('article');
    if (articleParam) {
        displayArticle(articleParam);
    }
});
