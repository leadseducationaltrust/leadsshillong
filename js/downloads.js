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
    
    // Format the timestamp
    const date = new Date(download.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    card.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
                <h3 class="text-xl font-bold text-blue-900 mb-2">${download.heading}</h3>
                <span class="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
                    ${download.audience}
                </span>
            </div>
            <div class="ml-4 flex-shrink-0">
                <i class="fas fa-file-pdf text-4xl text-red-500"></i>
            </div>
        </div>
        
        <p class="text-gray-600 mb-4 leading-relaxed">${download.description}</p>
        
        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <div class="flex items-center text-sm text-gray-500">
                <i class="fas fa-calendar-alt mr-2"></i>
                <span>${formattedDate}</span>
            </div>
            <div class="flex gap-2">
                <button 
                    onclick="openPreview('${download.pdf_url}')" 
                    class="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-all inline-flex items-center gap-2"
                    title="Preview PDF"
                >
                    <i class="fas fa-eye"></i>
                    <span>Preview</span>
                </button>
                <a 
                    href="${download.pdf_url}" 
                    download 
                    class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-all inline-flex items-center gap-2"
                    title="Download PDF"
                >
                    <i class="fas fa-download"></i>
                    <span>Download</span>
                </a>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Open PDF preview modal
 * @param {string} url - URL of the PDF file
 */
function openPreview(url) {
    currentPdfUrl = url;
    pdfIframe.src = url;
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
