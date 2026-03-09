document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('thought-panel');
    if (!section) {
        return;
    }

    const dailyFocusCard = document.getElementById('daily-focus-card');
    const dailyFocusImage = document.getElementById('daily-focus-image');
    const dailyFocusVideo = document.getElementById('daily-focus-video');
    const dailyFocusEmbed = document.getElementById('daily-focus-embed');
    const dailyFocusMediaStatus = document.getElementById('daily-focus-media-status');
    const dailyFocusDescription = document.getElementById('daily-focus-description');
    const thoughtText = document.getElementById('thought-text');
    const thoughtCard = document.getElementById('thought-card');
    const thoughtDate = document.getElementById('thought-date');
    const orderList = document.getElementById('order-list');
    const orderCard = document.getElementById('order-card');
    const principalCard = document.getElementById('principal-message-card');
    const principalMessage = document.getElementById('principal-message');
    const bibleCard = document.getElementById('bible-verse-card');
    const bibleVerse = document.getElementById('bible-verse');
    const bibleReference = document.getElementById('bible-reference');
    const notesCard = document.getElementById('additional-notes-card');
    const additionalNotes = document.getElementById('additional-notes');

    const hideElement = (element) => {
        if (element) {
            element.style.display = 'none';
        }
    };

    const normalizeText = (value) => {
        if (value === null || value === undefined) {
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
    };

    const getListItemText = (item) => {
        if (item && typeof item === 'object') {
            if ('item' in item) {
                return normalizeText(item.item);
            }
            if ('value' in item) {
                return normalizeText(item.value);
            }
            return '';
        }
        return normalizeText(item);
    };

    const setTextOrHide = (element, value, container) => {
        const text = normalizeText(value);
        if (text.length > 0) {
            if (element) {
                element.textContent = text;
            }
            return true;
        }
        hideElement(container || element);
        return false;
    };

    const parseDateOnly = (value) => {
        if (!value || typeof value !== 'string') {
            return null;
        }
        const parts = value.split('-').map(Number);
        if (parts.length !== 3 || parts.some(Number.isNaN)) {
            return null;
        }
        return new Date(parts[0], parts[1] - 1, parts[2]);
    };

    const isTodayOrFuture = (value) => {
        const contentDate = parseDateOnly(value);
        if (!contentDate) {
            return false;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return contentDate >= today;
    };

    const isTodayOrPast = (value) => {
        const contentDate = parseDateOnly(value);
        if (!contentDate) {
            return false;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return contentDate <= today;
    };

    const getEntryTime = (entry) => {
        const time = new Date(entry && entry.date ? entry.date : '').getTime();
        return Number.isNaN(time) ? 0 : time;
    };

    const formatDisplayDate = (value) => {
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '';
        }
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const hasRenderableText = (value) => normalizeText(value).length > 0;

    const hasExplicitScheme = (value) => /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value);

    const getSafeImageUrl = (value) => {
        const text = normalizeText(value);
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
    };

    const getFirstSafeMediaUrl = (candidates) => {
        if (!Array.isArray(candidates)) {
            return '';
        }
        for (let index = 0; index < candidates.length; index += 1) {
            const url = getSafeImageUrl(candidates[index]);
            if (url) {
                return url;
            }
        }
        return '';
    };

    const normalizeMediaType = (value) => {
        const type = normalizeText(value).toLowerCase();
        if (type === 'video' || type === 'image') {
            return type;
        }
        return '';
    };

    const inferMediaTypeFromUrl = (value) => {
        const text = normalizeText(value);
        if (!text) {
            return 'image';
        }
        if (getYouTubeEmbedUrl(text)) {
            return 'video';
        }
        const clean = text.split('#')[0].split('?')[0].toLowerCase();
        if (/\.(mp4|webm|ogg|mov|m4v)$/i.test(clean)) {
            return 'video';
        }
        return 'image';
    };

    const getYouTubeEmbedUrl = (value) => {
        const text = normalizeText(value);
        if (!text) {
            return '';
        }

        try {
            const parsed = new URL(text);
            const host = parsed.hostname.toLowerCase();
            let videoId = '';

            if (host === 'youtu.be' || host.endsWith('.youtu.be')) {
                videoId = parsed.pathname.split('/').filter(Boolean)[0] || '';
            } else if (host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'm.youtube.com') {
                if (parsed.pathname === '/watch') {
                    videoId = parsed.searchParams.get('v') || '';
                } else if (parsed.pathname.startsWith('/shorts/')) {
                    videoId = parsed.pathname.split('/')[2] || '';
                } else if (parsed.pathname.startsWith('/embed/')) {
                    videoId = parsed.pathname.split('/')[2] || '';
                }
            }

            if (!/^[a-zA-Z0-9_-]{6,}$/.test(videoId)) {
                return '';
            }

            return `https://www.youtube-nocookie.com/embed/${videoId}`;
        } catch (error) {
            return '';
        }
    };

    const hasRenderableList = (value) => {
        if (!Array.isArray(value)) {
            return false;
        }
        return value.some((item) => getListItemText(item).length > 0);
    };

    const hasRenderableContent = (entry) => {
        if (!entry || typeof entry !== 'object') {
            return false;
        }
        const dailyFocus = entry.daily_focus && typeof entry.daily_focus === 'object' ? entry.daily_focus : {};
        const mediaUrl = getFirstSafeMediaUrl([dailyFocus.media_url, dailyFocus.media_file, dailyFocus.image]);
        return (
            hasRenderableText(mediaUrl) ||
            hasRenderableText(dailyFocus.description) ||
            hasRenderableText(entry.thought_of_the_day) ||
            hasRenderableList(entry.order_of_the_day) ||
            hasRenderableText(entry.principal_message) ||
            hasRenderableText(entry.bible_verse) ||
            hasRenderableText(entry.bible_reference) ||
            hasRenderableText(entry.additional_notes)
        );
    };

    const setDailyFocusOrHide = (dailyFocus) => {
        const focus = dailyFocus && typeof dailyFocus === 'object' ? dailyFocus : {};
        const mediaUrl = getFirstSafeMediaUrl([focus.media_url, focus.media_file, focus.image]);
        const mediaType = normalizeMediaType(focus.media_type || focus.type) || inferMediaTypeFromUrl(mediaUrl);
        const alt = normalizeText(focus.alt);
        const description = normalizeText(focus.description);

        const hasMedia = Boolean(mediaUrl);
        const hasDescription = Boolean(description);

        if (!hasMedia && !hasDescription) {
            hideElement(dailyFocusCard);
            return false;
        }

        if (dailyFocusMediaStatus) {
            dailyFocusMediaStatus.textContent = '';
            dailyFocusMediaStatus.classList.add('hidden');
        }

        const showMediaFallback = () => {
            const isGooglePhotosPage = /(^|\.)photos\.google\.com$/i.test((() => {
                try {
                    return new URL(mediaUrl).hostname;
                } catch (error) {
                    return '';
                }
            })());

            if (dailyFocusMediaStatus) {
                dailyFocusMediaStatus.textContent = isGooglePhotosPage
                    ? 'Google Photos page links cannot be embedded directly. Use a direct image/video file URL (for example googleusercontent.com) or upload the file to /thought/media.'
                    : 'Reflection media could not be loaded. Please check the file path/link and permissions.';
                dailyFocusMediaStatus.classList.remove('hidden');
            }
        };

        if (dailyFocusImage && dailyFocusVideo && dailyFocusEmbed) {
            const youtubeEmbedUrl = hasMedia ? getYouTubeEmbedUrl(mediaUrl) : '';

            if (youtubeEmbedUrl) {
                dailyFocusEmbed.src = youtubeEmbedUrl;
                dailyFocusEmbed.style.display = '';

                dailyFocusVideo.removeAttribute('src');
                dailyFocusVideo.style.display = 'none';
                dailyFocusImage.removeAttribute('src');
                dailyFocusImage.style.display = 'none';
            } else if (hasMedia && mediaType === 'video') {
                dailyFocusVideo.onerror = showMediaFallback;
                dailyFocusVideo.src = mediaUrl;
                dailyFocusVideo.style.display = '';
                dailyFocusImage.removeAttribute('src');
                dailyFocusImage.style.display = 'none';
                dailyFocusEmbed.removeAttribute('src');
                dailyFocusEmbed.style.display = 'none';
            } else if (hasMedia) {
                dailyFocusImage.onerror = showMediaFallback;
                dailyFocusImage.src = mediaUrl;
                dailyFocusImage.alt = alt || 'Daily focus image';
                dailyFocusImage.style.display = '';
                dailyFocusVideo.removeAttribute('src');
                dailyFocusVideo.style.display = 'none';
                dailyFocusEmbed.removeAttribute('src');
                dailyFocusEmbed.style.display = 'none';
            } else {
                dailyFocusImage.removeAttribute('src');
                dailyFocusImage.style.display = 'none';
                dailyFocusVideo.removeAttribute('src');
                dailyFocusVideo.style.display = 'none';
                dailyFocusEmbed.removeAttribute('src');
                dailyFocusEmbed.style.display = 'none';
            }
        } else if (dailyFocusImage) {
            if (hasMedia) {
                dailyFocusImage.src = mediaUrl;
                dailyFocusImage.alt = alt || 'Daily focus image';
                dailyFocusImage.style.display = '';
            } else {
                dailyFocusImage.removeAttribute('src');
                dailyFocusImage.style.display = 'none';
            }
        }

        if (dailyFocusDescription) {
            if (hasDescription) {
                dailyFocusDescription.textContent = description;
                dailyFocusDescription.style.display = '';
            } else {
                dailyFocusDescription.textContent = '';
                dailyFocusDescription.style.display = 'none';
            }
        }

        return true;
    };

    const resolveDailyFocusFromHistory = (entries, baseIndex) => {
        const baseEntry = entries[baseIndex] && typeof entries[baseIndex] === 'object' ? entries[baseIndex] : {};
        const baseFocus = baseEntry.daily_focus && typeof baseEntry.daily_focus === 'object'
            ? baseEntry.daily_focus
            : {};

        let resolvedMediaUrl = getFirstSafeMediaUrl([baseFocus.media_url, baseFocus.media_file, baseFocus.image]);
        let resolvedMediaType = normalizeMediaType(baseFocus.media_type || baseFocus.type);
        let resolvedAlt = normalizeText(baseFocus.alt);
        let resolvedDescription = normalizeText(baseFocus.description);

        if (resolvedMediaUrl && resolvedMediaType && resolvedAlt && resolvedDescription) {
            return {
                media_url: resolvedMediaUrl,
                media_type: resolvedMediaType,
                image: resolvedMediaUrl,
                alt: resolvedAlt,
                description: resolvedDescription
            };
        }

        for (let index = baseIndex + 1; index < entries.length; index += 1) {
            const previousEntry = entries[index] && typeof entries[index] === 'object' ? entries[index] : {};
            const previousFocus = previousEntry.daily_focus && typeof previousEntry.daily_focus === 'object'
                ? previousEntry.daily_focus
                : {};

            if (!resolvedMediaUrl) {
                resolvedMediaUrl = getFirstSafeMediaUrl([previousFocus.media_url, previousFocus.media_file, previousFocus.image]);
            }
            if (!resolvedMediaType) {
                resolvedMediaType = normalizeMediaType(previousFocus.media_type || previousFocus.type);
            }
            if (!resolvedAlt) {
                resolvedAlt = normalizeText(previousFocus.alt);
            }
            if (!resolvedDescription) {
                resolvedDescription = normalizeText(previousFocus.description);
            }

            if (resolvedMediaUrl && resolvedMediaType && resolvedAlt && resolvedDescription) {
                break;
            }
        }

        if (resolvedMediaUrl && !resolvedMediaType) {
            resolvedMediaType = inferMediaTypeFromUrl(resolvedMediaUrl);
        }

        return {
            media_url: resolvedMediaUrl,
            media_type: resolvedMediaType,
            image: resolvedMediaUrl,
            alt: resolvedAlt,
            description: resolvedDescription
        };
    };

    const findLatestNonEmptyText = (entries, key) => {
        for (let index = 0; index < entries.length; index += 1) {
            const value = normalizeText(entries[index] && entries[index][key]);
            if (value) {
                return value;
            }
        }
        return '';
    };

    const findBibleContentFromHistory = (entries) => {
        for (let index = 0; index < entries.length; index += 1) {
            const verse = normalizeText(entries[index] && entries[index].bible_verse);
            if (verse) {
                return {
                    verse,
                    reference: normalizeText(entries[index] && entries[index].bible_reference)
                };
            }
        }
        return {
            verse: '',
            reference: ''
        };
    };

    const findLatestNonEmptyTextWithDate = (entries, key) => {
        for (let index = 0; index < entries.length; index += 1) {
            const entry = entries[index] && typeof entries[index] === 'object' ? entries[index] : {};
            const value = normalizeText(entry[key]);
            if (value) {
                return {
                    value,
                    date: normalizeText(entry.date)
                };
            }
        }
        return {
            value: '',
            date: ''
        };
    };

    const setListOrHide = (listElement, items, container) => {
        const values = Array.isArray(items) ? items : (items ? [items] : []);
        if (!listElement || values.length === 0) {
            hideElement(container || listElement);
            return false;
        }
        listElement.replaceChildren();
        values.forEach((item, index) => {
            const text = getListItemText(item);
            if (!text) {
                return;
            }
            const li = document.createElement('li');
            li.className = index === 0
                ? 'flex items-start gap-2 bg-amber-100 border border-amber-300 rounded-lg px-3 py-2 font-bold text-blue-900'
                : 'flex items-start gap-2';

            const bullet = document.createElement('span');
            bullet.className = 'text-emerald-700';
            bullet.textContent = '•';

            const content = document.createElement('span');
            content.textContent = text;

            li.appendChild(bullet);
            li.appendChild(content);
            listElement.appendChild(li);
        });
        if (listElement.children.length === 0) {
            hideElement(container || listElement);
            return false;
        }
        return true;
    };

    fetch('thought/content.json')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to load thought content');
            }
            return response.json();
        })
        .then((data) => {
            const entries = Array.isArray(data)
                ? data
                : (Array.isArray(data.entries) ? data.entries : []);

            if (!Array.isArray(entries) || entries.length === 0) {
                hideElement(section);
                return;
            }

            const sorted = entries.slice().sort((a, b) => getEntryTime(b) - getEntryTime(a));
            const eligible = sorted.filter((item) => isTodayOrPast(item && item.date));
            const entry = eligible[0] || {};
            const resolvedDailyFocus = resolveDailyFocusFromHistory(eligible, 0);
            const bibleContent = findBibleContentFromHistory(eligible);
            const principalContent = findLatestNonEmptyTextWithDate(eligible, 'principal_message');
            const resolvedEntry = {
                ...entry,
                daily_focus: resolvedDailyFocus,
                thought_of_the_day: findLatestNonEmptyText(eligible, 'thought_of_the_day'),
                principal_message: principalContent.value,
                principal_message_source_date: principalContent.date,
                bible_verse: bibleContent.verse,
                bible_reference: bibleContent.reference
            };

            if (!hasRenderableContent(resolvedEntry)) {
                hideElement(section);
                return;
            }

            let hasContent = false;

            if (thoughtDate) {
                thoughtDate.textContent = formatDisplayDate(new Date());
            } else {
                hideElement(thoughtDate);
            }

            hasContent = setDailyFocusOrHide(resolvedEntry.daily_focus) || hasContent;

            hasContent = setTextOrHide(thoughtText, resolvedEntry.thought_of_the_day, thoughtCard) || hasContent;

            if (isTodayOrFuture(resolvedEntry.date)) {
                hasContent = setListOrHide(orderList, resolvedEntry.order_of_the_day, orderCard) || hasContent;
            } else {
                hideElement(orderCard);
            }

            const principalText = normalizeText(resolvedEntry.principal_message);
            const principalSourceDate = normalizeText(resolvedEntry.principal_message_source_date);
            const currentEntryDate = normalizeText(resolvedEntry.date);
            const principalWithDate = principalText && principalSourceDate && currentEntryDate && principalSourceDate !== currentEntryDate
                ? `${principalText} (Last updated: ${formatDisplayDate(principalSourceDate)})`
                : principalText;

            hasContent = setTextOrHide(principalMessage, principalWithDate, principalCard) || hasContent;
            hasContent = setTextOrHide(bibleVerse, resolvedEntry.bible_verse, bibleCard) || hasContent;

            if (resolvedEntry.bible_reference && bibleReference) {
                bibleReference.textContent = resolvedEntry.bible_reference;
            } else if (bibleReference) {
                bibleReference.textContent = '';
            }

            hasContent = setTextOrHide(additionalNotes, resolvedEntry.additional_notes, notesCard) || hasContent;

            if (!hasContent) {
                hideElement(section);
            }
        })
        .catch(() => {
            hideElement(section);
        });
});
