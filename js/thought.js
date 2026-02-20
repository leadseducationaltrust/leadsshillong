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

    const setTextOrHide = (element, value, container) => {
        if (value && String(value).trim().length > 0) {
            if (element) {
                element.textContent = value;
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

    const setListOrHide = (listElement, items, container) => {
        const values = Array.isArray(items) ? items : (items ? [items] : []);
        if (!listElement || values.length === 0) {
            hideElement(container || listElement);
            return false;
        }
        listElement.innerHTML = '';
        values.forEach((item, index) => {
            if (!item || !String(item).trim()) {
                return;
            }
            const li = document.createElement('li');
            li.className = index === 0
                ? 'flex items-start gap-2 bg-amber-100 border border-amber-300 rounded-lg px-3 py-2 font-bold text-blue-900'
                : 'flex items-start gap-2';
            li.innerHTML = '<span class="text-emerald-700">•</span><span>' + item + '</span>';
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
            if (!Array.isArray(data) || data.length === 0) {
                hideElement(section);
                return;
            }

            const sorted = data.slice().sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });
            const entry = sorted[0] || {};

            let hasContent = false;

            if (entry.date && thoughtDate) {
                const formatted = new Date(entry.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                thoughtDate.textContent = formatted;
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
