if ('serviceWorker' in navigator) {
  let hasControllerChanged = false;
  let pendingServiceWorkerRegistration = null;
  let shouldAutoReloadOnVisible = false;

  const hideUpdateToast = () => {
    const existingToast = document.getElementById('pwa-update-toast');
    if (existingToast) {
      existingToast.remove();
    }
  };

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

    const message = document.createElement('span');
    message.textContent = 'Update available';

    const refreshButton = document.createElement('button');
    refreshButton.type = 'button';
    refreshButton.className = 'ml-3 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wide';
    refreshButton.textContent = 'Refresh';
    refreshButton.addEventListener('click', () => {
      shouldAutoReloadOnVisible = false;
      if (pendingServiceWorkerRegistration && pendingServiceWorkerRegistration.waiting) {
        pendingServiceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        setTimeout(() => {
          window.location.reload();
        }, 350);
        return;
      }

      window.location.reload();
    });

    toast.appendChild(message);
    toast.appendChild(refreshButton);
    document.body.appendChild(toast);
  };

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        updateViaCache: 'none'
      });

      pendingServiceWorkerRegistration = registration;
      if (registration.waiting) {
        if (document.visibilityState === 'hidden') {
          shouldAutoReloadOnVisible = true;
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        } else {
          showUpdateToast();
        }
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        if (!newWorker) {
          return;
        }

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            pendingServiceWorkerRegistration = registration;
            if (document.visibilityState === 'hidden' && registration.waiting) {
              shouldAutoReloadOnVisible = true;
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
              return;
            }

            showUpdateToast();
          }
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (hasControllerChanged) {
          return;
        }

        hasControllerChanged = true;
        hideUpdateToast();

        if (document.visibilityState === 'hidden') {
          shouldAutoReloadOnVisible = true;
          return;
        }

        window.location.reload();
      });

      const triggerUpdateCheck = () => {
        if (!navigator.onLine) {
          return;
        }

        registration.update().catch((error) => {
          console.warn('Service worker update check failed:', error);
        });
      };

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          if (shouldAutoReloadOnVisible || hasControllerChanged) {
            window.location.reload();
            return;
          }

          triggerUpdateCheck();
          return;
        }

        triggerUpdateCheck();
      });

      window.addEventListener('online', triggerUpdateCheck);
    } catch (error) {
      console.warn('Service worker registration failed:', error);
    }
  });
}

let pwaActionButton = null;
let pwaActionIcon = null;
let pwaActionLabel = null;
const ensurePwaActionButton = () => {
  if (pwaActionButton && pwaActionIcon) {
    return;
  }

  const existingButton = document.getElementById('pwa-action-button');
  const existingIcon = document.getElementById('pwa-action-icon');
  if (existingButton && existingIcon) {
    pwaActionButton = existingButton;
    pwaActionIcon = existingIcon;
    pwaActionLabel = document.getElementById('pwa-action-label');

    if (!pwaActionLabel) {
      pwaActionLabel = document.createElement('span');
      pwaActionLabel.id = 'pwa-action-label';
      pwaActionLabel.className = 'hidden md:inline text-[11px] font-semibold leading-none';
      pwaActionButton.appendChild(pwaActionLabel);
    }
    return;
  }

  const mapLink = document.getElementById('global-link-maps');
  let actionContainer = null;

  if (mapLink && mapLink.parentElement) {
    actionContainer = mapLink.parentElement;
    const shouldCreateContainer = mapLink.tagName === 'A' && actionContainer.classList.contains('container');

    if (shouldCreateContainer) {
      const wrapper = document.createElement('div');
      wrapper.className = 'flex items-center gap-2 md:gap-3';
      actionContainer.replaceChild(wrapper, mapLink);
      wrapper.appendChild(mapLink);
      actionContainer = wrapper;
    }
  }

  if (!actionContainer) {
    const topBarContainer = document.querySelector('body > div.bg-emerald-700 .container');
    if (!topBarContainer) {
      return;
    }

    const rightSlot = topBarContainer.lastElementChild;
    if (!rightSlot) {
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center justify-end gap-2 md:gap-3';
    topBarContainer.replaceChild(wrapper, rightSlot);
    wrapper.appendChild(rightSlot);
    actionContainer = wrapper;
  }

  const button = document.createElement('button');
  button.id = 'pwa-action-button';
  button.type = 'button';
  button.className = 'hidden items-center justify-center md:justify-start gap-1.5 w-7 h-7 md:w-auto md:h-8 md:px-3 rounded-full border border-white/30 text-white/90 hover:text-white hover:bg-white/10 transition-colors';
  button.setAttribute('aria-label', 'Install app');
  button.title = 'Install app';

  const icon = document.createElement('i');
  icon.id = 'pwa-action-icon';
  icon.className = 'fas fa-download text-[11px]';
  button.appendChild(icon);

  const label = document.createElement('span');
  label.id = 'pwa-action-label';
  label.className = 'hidden md:inline text-[11px] font-semibold leading-none';
  button.appendChild(label);

  actionContainer.appendChild(button);
  pwaActionButton = button;
  pwaActionIcon = icon;
  pwaActionLabel = label;
};


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
  ensurePwaActionButton();
  if (!pwaActionButton || !pwaActionIcon) {
    return;
  }

  pwaActionButton.dataset.mode = mode;
  pwaActionButton.classList.remove('hidden');
  pwaActionButton.classList.add('inline-flex');

  if (mode === 'install') {
    pwaActionButton.setAttribute('aria-label', 'Install app');
    pwaActionButton.title = 'Install app';
    if (pwaActionLabel) {
      pwaActionLabel.textContent = 'Install';
    }
    pwaActionIcon.classList.remove('fa-share-alt');
    pwaActionIcon.classList.add('fa-download');
    return;
  }

  pwaActionButton.setAttribute('aria-label', 'Share app');
  pwaActionButton.title = 'Share app';
  if (pwaActionLabel) {
    pwaActionLabel.textContent = 'Share';
  }
  pwaActionIcon.classList.remove('fa-download');
  pwaActionIcon.classList.add('fa-share-alt');
};

const hidePwaAction = () => {
  ensurePwaActionButton();
  if (!pwaActionButton) {
    return;
  }

  pwaActionButton.classList.add('hidden');
  pwaActionButton.classList.remove('inline-flex');
};

const syncPwaActionButton = () => {
  ensurePwaActionButton();
  if (!pwaActionButton) {
    return;
  }

  if (deferredInstallPrompt) {
    setButtonMode('install');
    return;
  }

  setButtonMode('share');
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

const initPwaActionButton = () => {
  ensurePwaActionButton();
  if (!pwaActionButton || pwaActionButton.dataset.bound === 'true') {
    return;
  }

  pwaActionButton.dataset.bound = 'true';
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
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPwaActionButton, { once: true });
} else {
  initPwaActionButton();
}
