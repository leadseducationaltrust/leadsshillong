// Shared reflection media state used by in-panel and lightbox navigation.
let allReflectionMedia = [];
let currentMediaIndex = 0;
let reflectionLightboxIndex = -1;

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
    const dailyFocusDate = document.getElementById('daily-focus-date');
    const focusPrevButton = document.getElementById('focus-prev');
    const focusNextButton = document.getElementById('focus-next');
    const thoughtText = document.getElementById('thought-text');
    const thoughtCard = document.getElementById('thought-card');
    const thoughtDate = document.getElementById('thought-date');
    const orderList = document.getElementById('order-list');
    const orderCard = document.getElementById('order-card');
    const orderDateLabel = document.getElementById('order-date');
    const orderPrevButton = document.getElementById('order-prev');
    const orderNextButton = document.getElementById('order-next');
    const principalCard = document.getElementById('principal-message-card');
    const principalMessage = document.getElementById('principal-message');
    const principalPhoto = document.getElementById('principal-photo');
    const principalIcon = document.getElementById('principal-icon');
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
        const hasMediaItems = Array.isArray(dailyFocus.media_items) && dailyFocus.media_items.length > 0;
        return (
            hasRenderableText(mediaUrl) ||
            hasMediaItems ||
            hasRenderableText(dailyFocus.description) ||
            hasRenderableText(entry.thought_of_the_day) ||
            hasRenderableList(entry.order_of_the_day) ||
            hasRenderableText(entry.principal_message) ||
            hasRenderableText(entry.bible_verse) ||
            hasRenderableText(entry.bible_reference) ||
            hasRenderableText(entry.additional_notes)
        );
    };

    // Extract media from a single daily focus entry
    const extractMediaItemsFromEntry = (dailyFocus, entryDate) => {
        if (!dailyFocus || typeof dailyFocus !== 'object') {
            return [];
        }

        const items = [];
        
        // Check if there's a media_items array with multiple items
        if (Array.isArray(dailyFocus.media_items) && dailyFocus.media_items.length > 0) {
            dailyFocus.media_items.forEach((item) => {
                const mediaUrl = getFirstSafeMediaUrl([item.media_url, item.media_file]);
                if (mediaUrl) {
                    const mediaType = normalizeMediaType(item.media_type) || inferMediaTypeFromUrl(mediaUrl);
                    if (mediaType === 'image' || mediaType === 'video') {
                        items.push({
                            media_url: mediaUrl,
                            media_type: mediaType,
                            alt: normalizeText(item.alt),
                            description: normalizeText(item.description),
                            timestamp: normalizeText(item.timestamp) || entryDate
                        });
                    }
                }
            });
        }

        // Fallback to single media if no media_items array
        if (items.length === 0) {
            const mediaUrl = getFirstSafeMediaUrl([dailyFocus.media_url, dailyFocus.media_file, dailyFocus.image]);
            if (mediaUrl) {
                const mediaType = normalizeMediaType(dailyFocus.media_type) || inferMediaTypeFromUrl(mediaUrl);
                if (mediaType === 'image' || mediaType === 'video') {
                    items.push({
                        media_url: mediaUrl,
                        media_type: mediaType,
                        alt: normalizeText(dailyFocus.alt),
                        description: normalizeText(dailyFocus.description),
                        timestamp: entryDate
                    });
                }
            }
        }

        return items;
    };

    // Collect all media from all eligible entries
    const collectAllReflectionMedia = (allEligibleEntries) => {
        const allMedia = [];
        
        if (!Array.isArray(allEligibleEntries)) {
            return allMedia;
        }

        allEligibleEntries.forEach((entry) => {
            if (!entry || typeof entry !== 'object') {
                return;
            }
            
            const dailyFocus = entry.daily_focus && typeof entry.daily_focus === 'object' ? entry.daily_focus : {};
            const mediaItems = extractMediaItemsFromEntry(dailyFocus, entry.date);
            
            mediaItems.forEach((item) => {
                allMedia.push({
                    ...item,
                    entryDate: entry.date
                });
            });
        });

        // Sort by timestamp in descending order (newest first)
        allMedia.sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return timeB - timeA;
        });

        return allMedia;
    };

    const displayMediaItem = (itemIndex) => {
        if (!Array.isArray(allReflectionMedia) || allReflectionMedia.length === 0) {
            return false;
        }

        if (itemIndex < 0 || itemIndex >= allReflectionMedia.length) {
            return false;
        }

        const item = allReflectionMedia[itemIndex];
        const mediaUrl = item.media_url;
        const mediaType = item.media_type;
        const alt = item.alt || 'Reflection media';
        const description = item.description;
        const timestamp = item.timestamp;

        currentMediaIndex = itemIndex;

        const showMediaFallback = () => {
            if (mediaType === 'image' && Array.isArray(allReflectionMedia) && allReflectionMedia.length > 0) {
                // Remove the broken image from navigation so missed/unavailable posts are skipped.
                allReflectionMedia.splice(currentMediaIndex, 1);

                if (allReflectionMedia.length > 0) {
                    const nextIndex = Math.min(currentMediaIndex, allReflectionMedia.length - 1);
                    displayMediaItem(nextIndex);
                    updateMediaNavigationState();
                    if (dailyFocusMediaStatus) {
                        dailyFocusMediaStatus.textContent = 'Skipped one unavailable reflection image.';
                        dailyFocusMediaStatus.classList.remove('hidden');
                    }
                } else {
                    hideElement(dailyFocusCard);
                }
                return;
            }

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
            const youtubeEmbedUrl = getYouTubeEmbedUrl(mediaUrl);

            if (youtubeEmbedUrl) {
                dailyFocusEmbed.src = youtubeEmbedUrl;
                dailyFocusEmbed.style.display = '';

                dailyFocusVideo.removeAttribute('src');
                dailyFocusVideo.style.display = 'none';
                dailyFocusImage.removeAttribute('src');
                dailyFocusImage.style.display = 'none';
            } else if (mediaType === 'video') {
                dailyFocusVideo.onerror = showMediaFallback;
                dailyFocusVideo.src = mediaUrl;
                dailyFocusVideo.style.display = '';
                dailyFocusImage.removeAttribute('src');
                dailyFocusImage.style.display = 'none';
                dailyFocusEmbed.removeAttribute('src');
                dailyFocusEmbed.style.display = 'none';
            } else {
                dailyFocusImage.onerror = showMediaFallback;
                dailyFocusImage.src = mediaUrl;
                dailyFocusImage.alt = alt;
                dailyFocusImage.style.display = '';
                dailyFocusImage.classList.add('has-lightbox');
                dailyFocusVideo.removeAttribute('src');
                dailyFocusVideo.style.display = 'none';
                dailyFocusEmbed.removeAttribute('src');
                dailyFocusEmbed.style.display = 'none';
            }
        } else if (dailyFocusImage) {
            dailyFocusImage.onerror = showMediaFallback;
            dailyFocusImage.src = mediaUrl;
            dailyFocusImage.alt = alt;
            dailyFocusImage.style.display = '';
            dailyFocusImage.classList.add('has-lightbox');
        }

        if (dailyFocusDescription) {
            if (description) {
                dailyFocusDescription.textContent = description;
                dailyFocusDescription.style.display = '';
            } else {
                dailyFocusDescription.textContent = '';
                dailyFocusDescription.style.display = 'none';
            }
        }

        if (dailyFocusDate) {
            if (timestamp) {
                dailyFocusDate.textContent = formatDisplayDate(timestamp);
            } else {
                dailyFocusDate.textContent = '';
            }
        }

        if (dailyFocusMediaStatus) {
            dailyFocusMediaStatus.textContent = '';
            dailyFocusMediaStatus.classList.add('hidden');
        }

        return true;
    };

    const updateMediaNavigationState = () => {
        const hasMultipleItems = allReflectionMedia.length > 1;
        const isAtFirst = currentMediaIndex === 0;
        const isAtLast = currentMediaIndex >= allReflectionMedia.length - 1;

        if (focusPrevButton) {
            focusPrevButton.disabled = !hasMultipleItems || isAtLast;
            focusPrevButton.classList.toggle('opacity-40', focusPrevButton.disabled);
            focusPrevButton.classList.toggle('cursor-not-allowed', focusPrevButton.disabled);
        }

        if (focusNextButton) {
            focusNextButton.disabled = !hasMultipleItems || isAtFirst;
            focusNextButton.classList.toggle('opacity-40', focusNextButton.disabled);
            focusNextButton.classList.toggle('cursor-not-allowed', focusNextButton.disabled);
        }
    };

    // Set up media navigation click handlers outside function to prevent re-setup
    if (focusPrevButton) {
        focusPrevButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentMediaIndex < allReflectionMedia.length - 1) {
                displayMediaItem(currentMediaIndex + 1);
                updateMediaNavigationState();
            }
        });
    }

    if (focusNextButton) {
        focusNextButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentMediaIndex > 0) {
                displayMediaItem(currentMediaIndex - 1);
                updateMediaNavigationState();
            }
        });
    }

    // Set up image click listener once at top level to open lightbox
    if (dailyFocusImage) {
        dailyFocusImage.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Use current media index to get the correct media
            if (Array.isArray(allReflectionMedia) && currentMediaIndex >= 0 && currentMediaIndex < allReflectionMedia.length) {
                const currentMedia = allReflectionMedia[currentMediaIndex];
                const caption = currentMedia.alt || currentMedia.description || 'Reflection image';
                openReflectionLightbox(currentMedia.media_url, caption);
            }
        });
    }

    const setDailyFocusOrHide = () => {
        // Use the globally collected reflection media
        if (!Array.isArray(allReflectionMedia) || allReflectionMedia.length === 0) {
            hideElement(dailyFocusCard);
            return false;
        }

        // Display the first (newest) media item
        currentMediaIndex = 0;
        const hasContent = displayMediaItem(0);
        
        // Update navigation button states
        updateMediaNavigationState();

        return hasContent;
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
            
            // Collect all reflection media from eligible entries for navigation
            allReflectionMedia = collectAllReflectionMedia(eligible);
            currentMediaIndex = 0;
            
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
                principal_photo: findLatestNonEmptyText(eligible, 'principal_photo'),
                bible_verse: bibleContent.verse,
                bible_reference: bibleContent.reference
            };

            if (!hasRenderableContent(resolvedEntry)) {
                hideElement(section);
                return;
            }

            let hasContent = false;
            const orderEntries = eligible.filter((item) => hasRenderableList(item && item.order_of_the_day));
            let activeOrderIndex = 0;

            if (thoughtDate) {
                thoughtDate.textContent = formatDisplayDate(new Date());
            }

            const setOrderDateLabel = (value) => {
                if (!orderDateLabel) {
                    return;
                }
                const formatted = formatDisplayDate(value);
                orderDateLabel.textContent = formatted || '';
            };

            const renderActiveOrder = () => {
                if (!orderEntries.length) {
                    hideElement(orderCard);
                    setOrderDateLabel(resolvedEntry.date || new Date());
                    return false;
                }

                const activeEntry = orderEntries[activeOrderIndex] || {};
                setOrderDateLabel(activeEntry.date || new Date());
                return setListOrHide(orderList, activeEntry.order_of_the_day, orderCard);
            };

            const setOrderNavigationState = () => {
                const hasMultipleEntries = orderEntries.length > 1;
                const isAtLatest = activeOrderIndex === 0;
                const isAtOldest = activeOrderIndex >= orderEntries.length - 1;
                if (orderPrevButton) {
                    orderPrevButton.disabled = !hasMultipleEntries || isAtOldest;
                    orderPrevButton.classList.toggle('opacity-40', orderPrevButton.disabled);
                    orderPrevButton.classList.toggle('cursor-not-allowed', orderPrevButton.disabled);
                }
                if (orderNextButton) {
                    orderNextButton.disabled = !hasMultipleEntries || isAtLatest;
                    orderNextButton.classList.toggle('opacity-40', orderNextButton.disabled);
                    orderNextButton.classList.toggle('cursor-not-allowed', orderNextButton.disabled);
                }
            };

            if (orderPrevButton) {
                orderPrevButton.addEventListener('click', () => {
                    if (orderEntries.length <= 1 || activeOrderIndex >= orderEntries.length - 1) {
                        return;
                    }
                    activeOrderIndex += 1;
                    renderActiveOrder();
                    setOrderNavigationState();
                });
            }

            if (orderNextButton) {
                orderNextButton.addEventListener('click', () => {
                    if (orderEntries.length <= 1 || activeOrderIndex <= 0) {
                        return;
                    }
                    activeOrderIndex -= 1;
                    renderActiveOrder();
                    setOrderNavigationState();
                });
            }

            setOrderNavigationState();

            hasContent = setDailyFocusOrHide() || hasContent;

            hasContent = setTextOrHide(thoughtText, resolvedEntry.thought_of_the_day, thoughtCard) || hasContent;

            hasContent = renderActiveOrder() || hasContent;

            const principalText = normalizeText(resolvedEntry.principal_message);
            const principalSourceDate = normalizeText(resolvedEntry.principal_message_source_date);
            const currentEntryDate = normalizeText(resolvedEntry.date);
            const principalWithDate = principalText && principalSourceDate && currentEntryDate && principalSourceDate !== currentEntryDate
                ? `${principalText} (Last updated: ${formatDisplayDate(principalSourceDate)})`
                : principalText;

            hasContent = setTextOrHide(principalMessage, principalWithDate, principalCard) || hasContent;

            const principalPhotoUrl = getSafeImageUrl(resolvedEntry.principal_photo);
            if (principalPhoto && principalIcon) {
                if (principalPhotoUrl) {
                    principalPhoto.src = principalPhotoUrl;
                    principalPhoto.style.display = '';
                    principalIcon.style.display = 'none';
                } else {
                    principalPhoto.style.display = 'none';
                    principalIcon.style.display = '';
                }
            }
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

            // Set up lightbox navigation buttons
            const prevBtn = document.getElementById('reflection-lightbox-prev');
            const nextBtn = document.getElementById('reflection-lightbox-next');

            if (prevBtn) {
                prevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (reflectionLightboxIndex < allReflectionMedia.length - 1) {
                        displayLightboxMedia(reflectionLightboxIndex + 1);
                    }
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (reflectionLightboxIndex > 0) {
                        displayLightboxMedia(reflectionLightboxIndex - 1);
                    }
                });
            }
        })
        .catch(() => {
            hideElement(section);
        });
});

function findMediaIndexByUrl(mediaUrl) {
    if (!Array.isArray(allReflectionMedia)) {
        return -1;
    }
    for (let i = 0; i < allReflectionMedia.length; i += 1) {
        if (allReflectionMedia[i].media_url === mediaUrl) {
            return i;
        }
    }
    return -1;
}

function getLightboxMediaItems() {
    if (!Array.isArray(allReflectionMedia)) {
        return [];
    }
    return allReflectionMedia.filter((item) => item && item.media_type === 'image');
}

function displayLightboxMedia(index) {
    const lightboxMedia = getLightboxMediaItems();
    if (!Array.isArray(lightboxMedia) || index < 0 || index >= lightboxMedia.length) {
        return;
    }

    const item = lightboxMedia[index];
    const lightbox = document.getElementById('reflection-lightbox');
    const img = document.getElementById('reflection-lightbox-img');
    const cap = document.getElementById('reflection-lightbox-caption');

    if (!lightbox || !img) {
        return;
    }

    img.src = item.media_url;
    img.alt = item.alt || 'Enlarged reflection image';
    if (cap) {
        cap.textContent = item.description || '';
    }

    reflectionLightboxIndex = index;
    updateLightboxNavigationState();
}

function updateLightboxNavigationState() {
    const prevBtn = document.getElementById('reflection-lightbox-prev');
    const nextBtn = document.getElementById('reflection-lightbox-next');

    if (!prevBtn || !nextBtn) {
        return;
    }

    const lightboxMedia = getLightboxMediaItems();
    const hasMultiple = lightboxMedia.length > 1;
    const isAtFirst = reflectionLightboxIndex === 0;
    const isAtLast = reflectionLightboxIndex >= lightboxMedia.length - 1;

    prevBtn.disabled = !hasMultiple || isAtLast;
    prevBtn.classList.toggle('opacity-40', prevBtn.disabled);
    prevBtn.classList.toggle('cursor-not-allowed', prevBtn.disabled);

    nextBtn.disabled = !hasMultiple || isAtFirst;
    nextBtn.classList.toggle('opacity-40', nextBtn.disabled);
    nextBtn.classList.toggle('cursor-not-allowed', nextBtn.disabled);
}

function openReflectionLightbox(src, caption) {
    const lightbox = document.getElementById('reflection-lightbox');
    const img = document.getElementById('reflection-lightbox-img');
    const cap = document.getElementById('reflection-lightbox-caption');
    
    if (!lightbox || !img) {
        return;
    }

    // Only image media is eligible for lightbox display.
    const lightboxMedia = getLightboxMediaItems();
    if (!lightboxMedia.length) {
        return;
    }

    // Open the matching image item when possible, else fall back to latest image.
    let targetIndex = lightboxMedia.length - 1;
    if (Array.isArray(allReflectionMedia) && currentMediaIndex >= 0 && currentMediaIndex < allReflectionMedia.length) {
        const currentMedia = allReflectionMedia[currentMediaIndex];
        const matchedIndex = lightboxMedia.findIndex((item) => item.media_url === currentMedia.media_url);
        if (matchedIndex >= 0) {
            targetIndex = matchedIndex;
        }
    }

    const item = lightboxMedia[targetIndex];
    img.src = item.media_url;
    img.alt = item.alt || 'Enlarged reflection image';
    if (cap) {
        cap.textContent = item.description || '';
    }
    reflectionLightboxIndex = targetIndex;
    updateLightboxNavigationState();

    // Show lightbox no matter what
    lightbox.style.display = 'flex';
    lightbox.style.visibility = 'visible';
    lightbox.style.opacity = '1';
    document.body.style.overflow = 'hidden';

    lightbox.onclick = (event) => {
        if (event.target === lightbox || event.target.closest('img')) {
            closeReflectionLightbox();
        }
    };
}

function closeReflectionLightbox() {
    const lightbox = document.getElementById('reflection-lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
    }
    document.body.style.overflow = '';
    reflectionLightboxIndex = -1;
}

// Keyboard navigation for arrow keys and escape
document.addEventListener('keydown', (event) => {
    const lightbox = document.getElementById('reflection-lightbox');
    if (!lightbox || lightbox.style.display === 'none') {
        return;
    }

    const lightboxMedia = getLightboxMediaItems();

    if (event.key === 'Escape') {
        closeReflectionLightbox();
    } else if (event.key === 'ArrowLeft') {
        if (reflectionLightboxIndex < lightboxMedia.length - 1) {
            displayLightboxMedia(reflectionLightboxIndex + 1);
        }
    } else if (event.key === 'ArrowRight') {
        if (reflectionLightboxIndex > 0) {
            displayLightboxMedia(reflectionLightboxIndex - 1);
        }
    }
});
