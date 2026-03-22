document.addEventListener('DOMContentLoaded', () => {
    const monthLabel = document.getElementById('calendar-month-label');
    const calendarGrid = document.getElementById('calendar-grid');
    const holidayList = document.getElementById('calendar-holiday-list');
    const datePopup = document.getElementById('calendar-date-popup');
    const prevBtn = document.getElementById('calendar-prev');
    const nextBtn = document.getElementById('calendar-next');

    if (!monthLabel || !calendarGrid || !holidayList || !datePopup || !prevBtn || !nextBtn) {
        return;
    }

    const today = new Date();
    let currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
    let dateEntryMap = new Map();
    let selectedDateKey = null;

    const holidayCategories = new Set(['state_holiday', 'national_holiday', 'school_holiday']);
    const eventCategories = new Set(['school_event', 'examination', 'other_event']);

    const formatKey = (year, monthIndex, day) => {
        const month = String(monthIndex + 1).padStart(2, '0');
        const date = String(day).padStart(2, '0');
        return `${year}-${month}-${date}`;
    };

    const getDateRangeKeys = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate || startDate);
        const keys = [];

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return keys;
        }

        const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const until = new Date(end.getFullYear(), end.getMonth(), end.getDate());

        while (current <= until) {
            keys.push(formatKey(current.getFullYear(), current.getMonth(), current.getDate()));
            current.setDate(current.getDate() + 1);
        }

        return keys;
    };

    const loadHolidayData = async () => {
        try {
            const response = await fetch('calendar/content.json');
            if (!response.ok) {
                return;
            }

            const payload = await response.json();
            const entries = Array.isArray(payload.entries) ? payload.entries : [];

            dateEntryMap = new Map();

            entries.forEach((entry) => {
                if (!entry || !(entry.date || (entry.startDate && entry.endDate))) {
                    return;
                }

                const keys = entry.date
                    ? [entry.date]
                    : getDateRangeKeys(entry.startDate, entry.endDate);

                keys.forEach((key) => {
                    if (!dateEntryMap.has(key)) {
                        dateEntryMap.set(key, []);
                    }
                    dateEntryMap.get(key).push({
                        title: entry.title || 'School Activity',
                        category: entry.category || 'other_event',
                        dayType: entry.dayType || 'working_day'
                    });
                });
            });
        } catch (_) {
            dateEntryMap = new Map();
        }
    };

    const getDateMeta = (dateKey) => {
        const entries = dateEntryMap.get(dateKey) || [];
        const hasHoliday = entries.some((entry) => holidayCategories.has(entry.category) || entry.dayType === 'non_working_day');
        const hasEvent = entries.some((entry) => eventCategories.has(entry.category) || entry.dayType === 'working_day');
        return { entries, hasHoliday, hasEvent };
    };

    const getDateTone = (date, hasHoliday, hasEvent) => {
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        if (hasHoliday) {
            return 'text-red-700';
        }

        if (hasEvent) {
            return 'text-blue-700';
        }

        if (isWeekend) {
            return 'text-amber-800';
        }

        return 'text-slate-700';
    };

    const showDatePopup = (date, entries, toneClass) => {
        const readableDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        datePopup.replaceChildren();

        const title = document.createElement('p');
        title.className = `font-semibold ${toneClass}`;
        title.textContent = readableDate;
        datePopup.appendChild(title);

        if (!entries || entries.length === 0) {
            return;
        }

        const list = document.createElement('ul');
        list.className = 'mt-1 space-y-1 text-sm';

        entries.forEach((entry) => {
            const item = document.createElement('li');
            item.className = 'list-disc ml-5 text-slate-700';
            item.textContent = String(entry.title || 'School Activity');
            list.appendChild(item);
        });

        datePopup.appendChild(list);
    };

    const getEntryTheme = (entry) => {
        const isHoliday = holidayCategories.has(entry.category) || entry.dayType === 'non_working_day';
        if (isHoliday) {
            return {
                card: 'bg-red-50 border-red-200',
                badge: 'bg-red-100 text-red-700',
                label: 'Holiday'
            };
        }

        if (entry.category === 'examination') {
            return {
                card: 'bg-indigo-50 border-indigo-200',
                badge: 'bg-indigo-100 text-indigo-700',
                label: 'Exam'
            };
        }

        return {
            card: 'bg-blue-50 border-blue-200',
            badge: 'bg-blue-100 text-blue-700',
            label: 'Event'
        };
    };

    const renderHolidayList = (year, monthIndex) => {
        const items = Array.from(dateEntryMap.entries())
            .filter(([dateKey, entries]) => {
                const date = new Date(dateKey);
                return date.getFullYear() === year && date.getMonth() === monthIndex && entries.length > 0;
            })
            .sort((a, b) => new Date(a[0]) - new Date(b[0]));

        holidayList.replaceChildren();

        if (items.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'text-slate-400 text-center py-3 border border-dashed border-slate-200 rounded-lg';
            empty.textContent = 'No listed events this month.';
            holidayList.appendChild(empty);
            return;
        }

        items.forEach(([dateKey, entries]) => {
            const date = new Date(dateKey);
            const dayShort = date.toLocaleDateString('en-US', { weekday: 'short' });

            entries.forEach((entry) => {
                const theme = getEntryTheme(entry);
                const row = document.createElement('li');
                row.className = `rounded-xl border p-2.5 ${theme.card}`;

                const wrapper = document.createElement('div');
                wrapper.className = 'flex items-start gap-2.5';

                const dayBox = document.createElement('div');
                dayBox.className = 'w-10 shrink-0 rounded-lg border border-slate-200 bg-white text-center py-1';

                const dayLabel = document.createElement('p');
                dayLabel.className = 'text-[10px] font-black text-slate-400 uppercase leading-none';
                dayLabel.textContent = dayShort;

                const dayDate = document.createElement('p');
                dayDate.className = 'text-sm font-black text-slate-800 leading-tight mt-0.5';
                dayDate.textContent = String(date.getDate());

                dayBox.appendChild(dayLabel);
                dayBox.appendChild(dayDate);

                const body = document.createElement('div');
                body.className = 'min-w-0 flex-1';

                const bodyRow = document.createElement('div');
                bodyRow.className = 'flex items-start justify-between gap-2';

                const title = document.createElement('p');
                title.className = 'text-[12px] font-bold text-slate-800 leading-tight';
                title.textContent = String(entry.title || 'School Activity');

                const badge = document.createElement('span');
                badge.className = `text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${theme.badge}`;
                badge.textContent = theme.label;

                bodyRow.appendChild(title);
                bodyRow.appendChild(badge);
                body.appendChild(bodyRow);

                wrapper.appendChild(dayBox);
                wrapper.appendChild(body);
                row.appendChild(wrapper);
                holidayList.appendChild(row);
            });
        });
    };

    const renderCalendar = () => {
        const year = currentMonthDate.getFullYear();
        const monthIndex = currentMonthDate.getMonth();

        const firstDay = new Date(year, monthIndex, 1).getDay();
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

        monthLabel.textContent = currentMonthDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        calendarGrid.replaceChildren();

        for (let i = 0; i < firstDay; i += 1) {
            const spacer = document.createElement('div');
            spacer.className = 'h-9';
            calendarGrid.appendChild(spacer);
        }

        for (let day = 1; day <= daysInMonth; day += 1) {
            const date = new Date(year, monthIndex, day);
            const dayOfWeek = date.getDay();
            const key = formatKey(year, monthIndex, day);
            const { entries, hasHoliday, hasEvent } = getDateMeta(key);

            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isToday = year === today.getFullYear() && monthIndex === today.getMonth() && day === today.getDate();
            const isSelected = key === selectedDateKey;

            const cell = document.createElement('div');
            cell.className = 'h-9 rounded-md border text-xs font-bold flex items-center justify-center';
            cell.setAttribute('role', 'button');
            cell.setAttribute('tabindex', '0');
            cell.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

            if (hasHoliday) {
                cell.className += ' bg-red-100 border-red-300 text-red-700';
                cell.title = entries.map((entry) => entry.title).join(' | ');
            } else if (hasEvent) {
                cell.className += ' bg-blue-100 border-blue-300 text-blue-700';
                cell.title = entries.map((entry) => entry.title).join(' | ');
            } else if (isWeekend) {
                cell.className += ' bg-amber-100 border-amber-300 text-amber-800';
            } else {
                cell.className += ' bg-white border-slate-200 text-slate-700';
            }

            if (isToday) {
                cell.className += ' ring-2 ring-emerald-500';
            }

            if (isSelected) {
                cell.className += ' bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-200';
            }

            cell.textContent = String(day);

            cell.addEventListener('click', () => {
                selectedDateKey = key;
                renderCalendar();
                const toneClass = getDateTone(date, hasHoliday, hasEvent);
                showDatePopup(date, entries, toneClass);
            });

            cell.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectedDateKey = key;
                    renderCalendar();
                    const toneClass = getDateTone(date, hasHoliday, hasEvent);
                    showDatePopup(date, entries, toneClass);
                }
            });

            calendarGrid.appendChild(cell);
        }

        renderHolidayList(year, monthIndex);

        if (year === today.getFullYear() && monthIndex === today.getMonth()) {
            const todayKey = formatKey(today.getFullYear(), today.getMonth(), today.getDate());
            const todayMeta = getDateMeta(todayKey);
            const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            if (!selectedDateKey) {
                selectedDateKey = todayKey;
            }
            const toneClass = getDateTone(todayDate, todayMeta.hasHoliday, todayMeta.hasEvent);
            showDatePopup(todayDate, todayMeta.entries, toneClass);
        } else {
            const firstDate = new Date(year, monthIndex, 1);
            const firstMeta = getDateMeta(formatKey(year, monthIndex, 1));
            if (!selectedDateKey) {
                selectedDateKey = formatKey(year, monthIndex, 1);
            }
            const toneClass = getDateTone(firstDate, firstMeta.hasHoliday, firstMeta.hasEvent);
            showDatePopup(firstDate, firstMeta.entries, toneClass);
        }
    };

    prevBtn.addEventListener('click', () => {
        currentMonthDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1);
        renderCalendar();
    });

    nextBtn.addEventListener('click', () => {
        currentMonthDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1);
        renderCalendar();
    });

    loadHolidayData().then(renderCalendar);
});
