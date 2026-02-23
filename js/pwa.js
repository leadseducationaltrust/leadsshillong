if ('serviceWorker' in navigator) {
  let hasControllerChanged = false;
  const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;

  const showUpdateToast = () => {
    const existingToast = document.getElementById('pwa-update-toast');
    if (existingToast) {
      return;
    }

    const toast = document.createElement('div');
    toast.id = 'pwa-update-toast';
    toast.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 z-[1000] rounded-full bg-blue-900 text-white text-xs md:text-sm font-semibold px-4 py-2 shadow-lg';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = 'Website updated. Syncing latest content…';
    document.body.appendChild(toast);
  };

  const promptServiceWorkerActivation = (registration) => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        updateViaCache: 'none'
      });

      promptServiceWorkerActivation(registration);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        if (!newWorker) {
          return;
        }

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            promptServiceWorkerActivation(registration);
          }
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (hasControllerChanged) {
          return;
        }

        hasControllerChanged = true;
        showUpdateToast();
        setTimeout(() => {
          window.location.reload();
        }, 900);
      });

      const triggerUpdateCheck = () => {
        if (!navigator.onLine) {
          return;
        }

        registration.update().catch((error) => {
          console.warn('Service worker update check failed:', error);
        });
      };

      setInterval(triggerUpdateCheck, UPDATE_CHECK_INTERVAL_MS);

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          triggerUpdateCheck();
        }
      });
    } catch (error) {
      console.warn('Service worker registration failed:', error);
    }
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
    text: 'Install LEADS School app',
    url: `${window.location.origin}/`
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