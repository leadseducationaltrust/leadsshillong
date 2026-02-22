/**
 * Downloads System - Handles fetching, pagination, and PDF preview
 * LEADS Higher Secondary School
 */

// Global state
let allDownloads = [];
let displayedCount = 0;
const ITEMS_PER_PAGE = 10;

// DOM Elements
const downloadsList = document.getElementById('downloads-list');
const moreDownloadsBtn = document.getElementById('more-downloads-btn');
const moreDownloadsContainer = document.getElementById('more-downloads-container');
const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');
const pdfModal = document.getElementById('pdf-modal');
const pdfIframe = document.getElementById('pdf-iframe');
const closeModalBtn = document.getElementById('close-modal-btn');
const printPdfBtn = document.getElementById('print-pdf-btn');
const downloadPdfBtn = document.getElementById('download-pdf-btn');

let currentPdfUrl = '';

function hasExplicitScheme(value) {
    return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value);
}

function getSafePdfUrl(value) {
    if (value === undefined || value === null) {
        return null;
    }

    const text = String(value).trim();
    if (!text) {
        return null;
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

    return null;
}

/**
 * Initialize the downloads system
 */
async function initDownloads() {
    try {
        loadingState.style.display = 'block';
        
        // Fetch downloads data
        const response = await fetch('downloads/content.json');
        if (!response.ok) {
            throw new Error('Failed to fetch downloads');
        }
        
        const data = await response.json();
        const entries = Array.isArray(data)
            ? data
            : (Array.isArray(data.items) ? data.items : []);
        
        // Sort by timestamp (descending - most recent first)
        allDownloads = entries.sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        loadingState.style.display = 'none';
        
        // Check if we have any downloads
        if (allDownloads.length === 0) {
            emptyState.style.display = 'block';
            return;
        }
        
        // Display initial batch (10 most recent items)
        displayDownloads(ITEMS_PER_PAGE);
        
        // Show "More Downloads" button if there are more than 10 items
        if (allDownloads.length > ITEMS_PER_PAGE) {
            moreDownloadsContainer.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error loading downloads:', error);
        loadingState.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.querySelector('p').textContent = 'Error loading downloads. Please try again later.';
    }
}

/**
 * Display downloads with pagination
 * @param {number} count - Number of items to display
 */
function displayDownloads(count) {
    const itemsToShow = allDownloads.slice(displayedCount, displayedCount + count);
    
    itemsToShow.forEach(download => {
        const card = createDownloadCard(download);
        downloadsList.appendChild(card);
    });
    
    displayedCount += itemsToShow.length;
    
    // Hide "More Downloads" button if no more items
    if (displayedCount >= allDownloads.length) {
        moreDownloadsContainer.style.display = 'none';
    }
}

/**
 * Create a download card element
 * @param {Object} download - Download object with heading, description, etc.
 * @returns {HTMLElement} - Card element
 */
function createDownloadCard(download) {
    const card = document.createElement('div');
    card.className = 'download-card bg-white border border-gray-200 rounded-lg shadow-md p-6 hover:border-emerald-500 transition-all';
    const safePdfUrl = getSafePdfUrl(download.pdf_url);
    
    // Format the timestamp
    const date = new Date(download.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const header = document.createElement('div');
    header.className = 'flex items-start justify-between mb-4';

    const headerLeft = document.createElement('div');
    headerLeft.className = 'flex-1';

    const heading = document.createElement('h3');
    heading.className = 'text-xl font-bold text-blue-900 mb-2';
    heading.textContent = String(download.heading || 'Untitled download');

    const audience = document.createElement('span');
    audience.className = 'inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full';
    audience.textContent = String(download.audience || 'General');

    headerLeft.appendChild(heading);
    headerLeft.appendChild(audience);

    const headerRight = document.createElement('div');
    headerRight.className = 'ml-4 flex-shrink-0';
    const icon = document.createElement('i');
    icon.className = 'fas fa-file-pdf text-4xl text-red-500';
    headerRight.appendChild(icon);

    header.appendChild(headerLeft);
    header.appendChild(headerRight);

    const description = document.createElement('p');
    description.className = 'text-gray-600 mb-4 leading-relaxed';
    description.textContent = String(download.description || '');

    const footer = document.createElement('div');
    footer.className = 'flex items-center justify-between pt-4 border-t border-gray-100';

    const dateWrap = document.createElement('div');
    dateWrap.className = 'flex items-center text-sm text-gray-500';
    const dateIcon = document.createElement('i');
    dateIcon.className = 'fas fa-calendar-alt mr-2';
    const dateText = document.createElement('span');
    dateText.textContent = formattedDate;
    dateWrap.appendChild(dateIcon);
    dateWrap.appendChild(dateText);

    const actions = document.createElement('div');
    actions.className = 'flex gap-2';

    const previewButton = document.createElement('button');
    previewButton.type = 'button';
    previewButton.className = 'bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-all inline-flex items-center gap-2';
    previewButton.title = 'Preview PDF';
    const previewIcon = document.createElement('i');
    previewIcon.className = 'fas fa-eye';
    const previewLabel = document.createElement('span');
    previewLabel.textContent = 'Preview';
    previewButton.appendChild(previewIcon);
    previewButton.appendChild(previewLabel);
    if (safePdfUrl) {
        previewButton.addEventListener('click', () => openPreview(safePdfUrl));
    } else {
        previewButton.disabled = true;
        previewButton.classList.add('opacity-50', 'cursor-not-allowed');
    }

    const downloadLink = document.createElement('a');
    downloadLink.className = 'bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all inline-flex items-center gap-2';
    downloadLink.title = 'Download PDF';
    const downloadIcon = document.createElement('i');
    downloadIcon.className = 'fas fa-download';
    const downloadLabel = document.createElement('span');
    downloadLabel.textContent = 'Download';
    downloadLink.appendChild(downloadIcon);
    downloadLink.appendChild(downloadLabel);
    if (safePdfUrl) {
        downloadLink.href = safePdfUrl;
        downloadLink.download = '';
    } else {
        downloadLink.href = '#';
        downloadLink.addEventListener('click', (event) => event.preventDefault());
        downloadLink.classList.add('opacity-50', 'cursor-not-allowed');
    }

    actions.appendChild(previewButton);
    actions.appendChild(downloadLink);

    footer.appendChild(dateWrap);
    footer.appendChild(actions);

    card.appendChild(header);
    card.appendChild(description);
    card.appendChild(footer);
    
    return card;
}

/**
 * Open PDF preview modal
 * @param {string} url - URL of the PDF file
 */
function openPreview(url) {
    const safeUrl = getSafePdfUrl(url);
    if (!safeUrl) {
        return;
    }

    currentPdfUrl = safeUrl;
    pdfIframe.src = safeUrl;
    pdfModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

/**
 * Close PDF preview modal
 */
function closePreview() {
    pdfModal.classList.remove('active');
    pdfIframe.src = '';
    currentPdfUrl = '';
    document.body.style.overflow = ''; // Restore scrolling
}

/**
 * Print PDF from iframe
 */
function printPdf() {
    if (!currentPdfUrl) {
        return;
    }

    try {
        const iframe = document.getElementById('pdf-iframe');
        if (iframe.contentWindow) {
            iframe.contentWindow.print();
        } else {
            // Fallback: open in new window and print
            window.open(currentPdfUrl, '_blank');
        }
    } catch (error) {
        console.error('Print error:', error);
        // Fallback: open in new window
        window.open(currentPdfUrl, '_blank');
    }
}

/**
 * Download PDF
 */
function downloadPdf() {
    if (!currentPdfUrl) {
        return;
    }

    const link = document.createElement('a');
    link.href = currentPdfUrl;
    link.download = currentPdfUrl.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Event Listeners
moreDownloadsBtn.addEventListener('click', () => {
    displayDownloads(ITEMS_PER_PAGE);
});

closeModalBtn.addEventListener('click', closePreview);

printPdfBtn.addEventListener('click', printPdf);

downloadPdfBtn.addEventListener('click', downloadPdf);

// Close modal when clicking outside
pdfModal.addEventListener('click', (e) => {
    if (e.target === pdfModal) {
        closePreview();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pdfModal.classList.contains('active')) {
        closePreview();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDownloads);
