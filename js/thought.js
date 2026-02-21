document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('thought-panel');
    if (!section) {
        return;
    }

    const thoughtText = document.getElementById('thought-text');
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

    const getEntryTime = (entry) => {
        const time = new Date(entry && entry.date ? entry.date : '').getTime();
        return Number.isNaN(time) ? 0 : time;
    };

    const hasRenderableText = (value) => normalizeText(value).length > 0;

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
        return (
            hasRenderableText(entry.thought_of_the_day) ||
            hasRenderableList(entry.order_of_the_day) ||
            hasRenderableText(entry.principal_message) ||
            hasRenderableText(entry.bible_verse) ||
            hasRenderableText(entry.bible_reference) ||
            hasRenderableText(entry.additional_notes)
        );
    };

    const setListOrHide = (listElement, items, container) => {
        const values = Array.isArray(items) ? items : (items ? [items] : []);
        if (!listElement || values.length === 0) {
            hideElement(container || listElement);
            return false;
        }
        listElement.innerHTML = '';
        values.forEach((item, index) => {
            const text = getListItemText(item);
            if (!text) {
                return;
            }
            const li = document.createElement('li');
            li.className = index === 0
                ? 'flex items-start gap-2 bg-amber-100 border border-amber-300 rounded-lg px-3 py-2 font-bold text-blue-900'
                : 'flex items-start gap-2';
            li.innerHTML = '<span class="text-emerald-700">•</span><span>' + text + '</span>';
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
            const entry = sorted[0] || {};

            if (!hasRenderableContent(entry)) {
                hideElement(section);
                return;
            }

            let hasContent = false;

            if (entry.date && thoughtDate) {
                const formatted = new Date(entry.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                thoughtDate.textContent = formatted;
            } else {
                hideElement(thoughtDate);
            }

            hasContent = setTextOrHide(thoughtText, entry.thought_of_the_day, thoughtText) || hasContent;

            if (isTodayOrFuture(entry.date)) {
                hasContent = setListOrHide(orderList, entry.order_of_the_day, orderCard) || hasContent;
            } else {
                hideElement(orderCard);
            }

            hasContent = setTextOrHide(principalMessage, entry.principal_message, principalCard) || hasContent;
            hasContent = setTextOrHide(bibleVerse, entry.bible_verse, bibleCard) || hasContent;

            if (entry.bible_reference && bibleReference) {
                bibleReference.textContent = entry.bible_reference;
            } else if (bibleReference) {
                bibleReference.textContent = '';
            }

            hasContent = setTextOrHide(additionalNotes, entry.additional_notes, notesCard) || hasContent;

            if (!hasContent) {
                hideElement(section);
            }
        })
        .catch(() => {
            hideElement(section);
        });
});
