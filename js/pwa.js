if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((error) => {
      console.warn('Service worker registration failed:', error);
    });
  });
}

const pwaActionButton = document.getElementById('pwa-action-button');
const pwaActionIcon = document.getElementById('pwa-action-icon');

let deferredInstallPrompt = null;

const setPwaInstalled = () => {
  try {
    localStorage.setItem('leadsPwaInstalled', 'true');
  } catch (error) {
    console.warn('Could not persist PWA install status:', error);
  }
};

const isStandaloneMode = () => {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
};

const isPwaInstalled = () => {
  if (isStandaloneMode()) {
    return true;
  }

  try {
    return localStorage.getItem('leadsPwaInstalled') === 'true';
  } catch (error) {
    return false;
  }
};

const setButtonMode = (mode) => {
  if (!pwaActionButton || !pwaActionIcon) {
    return;
  }

  pwaActionButton.dataset.mode = mode;
  pwaActionButton.classList.remove('hidden');
  pwaActionButton.classList.add('inline-flex');

  if (mode === 'install') {
    pwaActionButton.setAttribute('aria-label', 'Install app');
    pwaActionButton.title = 'Install app';
    pwaActionIcon.classList.remove('fa-share-alt');
    pwaActionIcon.classList.add('fa-download');
    return;
  }

  pwaActionButton.setAttribute('aria-label', 'Share app');
  pwaActionButton.title = 'Share app';
  pwaActionIcon.classList.remove('fa-download');
  pwaActionIcon.classList.add('fa-share-alt');
};

const hidePwaAction = () => {
  if (!pwaActionButton) {
    return;
  }

  pwaActionButton.classList.add('hidden');
  pwaActionButton.classList.remove('inline-flex');
};

const syncPwaActionButton = () => {
  if (!pwaActionButton) {
    return;
  }

  if (isPwaInstalled()) {
    setButtonMode('share');
    return;
  }

  if (deferredInstallPrompt) {
    setButtonMode('install');
    return;
  }

  hidePwaAction();
};

const shareApp = async () => {
  const shareData = {
    title: document.title,
    text: 'Install LEADS Higher Secondary School app',
    url: `${window.location.origin}/index.html`
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error && error.name === 'AbortError') {
        return;
      }
    }
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(shareData.url);
      if (pwaActionButton) {
        const previousTitle = pwaActionButton.title;
        pwaActionButton.title = 'Link copied';
        setTimeout(() => {
          pwaActionButton.title = previousTitle;
        }, 1200);
      }
    } catch (error) {
      console.warn('Failed to copy app link:', error);
    }
  }
};

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  syncPwaActionButton();
});

window.addEventListener('appinstalled', () => {
  setPwaInstalled();
  deferredInstallPrompt = null;
  syncPwaActionButton();
});

if (pwaActionButton) {
  pwaActionButton.addEventListener('click', async () => {
    const mode = pwaActionButton.dataset.mode;

    if (mode === 'share') {
      await shareApp();
      return;
    }

    if (mode === 'install' && deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        setPwaInstalled();
      }
      deferredInstallPrompt = null;
      syncPwaActionButton();
    }
  });

  syncPwaActionButton();
}