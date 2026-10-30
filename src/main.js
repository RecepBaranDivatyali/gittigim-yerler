import './styles/main.css';
import { renderWorldMapView, preloadMapGeoData } from './components/WorldMapView.js';
import { renderLoginPage } from './components/LoginPage.js';
import { onStateChange, syncPendingFeedbacks, initFeedbackSync, silenceAndHydrateUnlockedAchievements } from './utils/storage.js';
import { applyTheme, getTheme } from './utils/theme.js';
import { checkOnboarding } from './components/OnboardingModal.js';
import { checkPrivacyConsent } from './components/PrivacyConsentModal.js';
import { initPhoneSimulator } from './components/PhoneSimulator.js';

// Preload GeoJSON map data immediately on app launch for instant 0ms map rendering
try {
  preloadMapGeoData();
} catch {}

// Listen for PWA installation prompt globally
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.__deferredInstallPrompt = e;
  });
  window.addEventListener('appinstalled', () => {
    window.__deferredInstallPrompt = null;
    const installCard = document.getElementById('settings-install-app-card');
    if (installCard) installCard.style.display = 'none';
  });
}

function syncAppHeight() {
  const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${h}px`);
  const app = document.getElementById('app');
  if (app) {
    app.style.height = `${h}px`;
    app.style.maxHeight = `${h}px`;
  }
  if (window.__leafletMapInstance) {
    window.__leafletMapInstance.invalidateSize();
  }
}

function initApp() {
  // If user selected mobile phone simulator mode on desktop, run simulator
  if (initPhoneSimulator()) {
    return;
  }

  // Apply saved theme and UI font scale immediately on startup
  applyTheme(getTheme());

  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  syncAppHeight();
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncAppHeight);
    window.visualViewport.addEventListener('scroll', syncAppHeight);
  }
  window.addEventListener('resize', syncAppHeight);
  window.addEventListener('orientationchange', () => {
    setTimeout(syncAppHeight, 150);
  });

  // Prompt first-time users to review and accept privacy policy (Huawei Rule 7.5 & store compliance)
  // Only initialize background network sync after privacy consent is granted
  checkPrivacyConsent(() => {
    initFeedbackSync();
  });

  // Ensure any existing local visits have their achievements silenced and hydrated so startup never fires toasts
  try {
    silenceAndHydrateUnlockedAchievements();
  } catch {}

  appContainer.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:var(--app-height,100dvh);max-height:var(--app-height,100dvh);overflow:hidden;background:radial-gradient(circle at 50% 45%, #162032 0%, #0d1527 60%, #080d1a 100%);';

  // Dedicated permanent Map container - Never wiped or reloaded between profile views
  const mapContainer = document.createElement('div');
  mapContainer.id = 'map-app-root';
  mapContainer.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:hidden;background:radial-gradient(circle at 50% 45%, #162032 0%, #0d1527 60%, #080d1a 100%);';
  appContainer.appendChild(mapContainer);

  // Dedicated Profile overlay container - Opens and closes instantly (0ms)
  const profileContainer = document.createElement('div');
  profileContainer.id = 'profile-app-root';
  profileContainer.style.cssText = 'position:fixed;inset:0;width:100vw;height:100%;z-index:9999;display:none;';
  appContainer.appendChild(profileContainer);

  // Login container
  const loginContainer = document.createElement('div');
  loginContainer.id = 'login-app-root';
  loginContainer.style.cssText = 'position:fixed;inset:0;width:100vw;height:100%;z-index:10000;';
  appContainer.appendChild(loginContainer);

  let mapInitialized = false;
  let currentView = 'login';

  function showMap() {
    currentView = 'map';
    profileContainer.style.display = 'none';
    profileContainer.innerHTML = '';
    if (!mapInitialized) {
      mapInitialized = true;
      renderWorldMapView(mapContainer, { onOpenProfile: showProfile });
      setTimeout(() => {
        checkPrivacyConsent(() => {
          checkOnboarding();
        });
      }, 600);
    } else {
      if (window.__refreshMapStats) window.__refreshMapStats();
      if (window.__leafletMapInstance) {
        window.__leafletMapInstance.invalidateSize();
      }
    }
  }

  async function showProfile() {
    currentView = 'profile';
    profileContainer.style.display = 'block';
    const { renderProfileView } = await import('./components/ProfileView.js');
    renderProfileView(profileContainer, () => {
      showMap();
    });
  }

  window.addEventListener('GezginFlyToCountry', (e) => {
    if (currentView === 'profile' || (profileContainer && profileContainer.style.display !== 'none')) {
      showMap();
    }
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('GezginMapFlyTo', { detail: e.detail }));
    }, 150);
  });

  // Android Donanım / Fiziksel Geri Tuşu Köprüsü
  window.__handleGezginBackButton = function() {
    try {
      // 1) Açık modal, lightbox veya sihirbazlar
      const modalSelectors = [
        '.quick-wizard-overlay',
        '.onboarding-overlay',
        '.poster-modal-overlay',
        '.country-detail-modal',
        '.city-modal-overlay',
        '.photo-lightbox-modal',
        '.passport-modal-overlay',
        '.friends-modal-overlay',
        '.privacy-consent-overlay'
      ];
      for (const sel of modalSelectors) {
        const modalEl = document.querySelector(sel);
        if (modalEl) {
          const closeBtn = modalEl.querySelector('.wizard-close-btn, #poster-close-btn, .modal-close, .close-btn, #btn-close-lightbox, button[id*="close"]');
          if (closeBtn) {
            closeBtn.click();
          } else {
            modalEl.remove();
          }
          return 'consumed';
        }
      }

      // Çekmece kontrolü (ülke detay çekmecesi)
      const drawer = document.getElementById('country-drawer');
      if (drawer && (drawer.classList.contains('open') || drawer.classList.contains('active'))) {
        const closeBtn = drawer.querySelector('.drawer-close, #drawer-close-btn, .drawer-close-btn');
        if (closeBtn) closeBtn.click();
        else drawer.classList.remove('open', 'active');
        document.body.classList.remove('drawer-open');
        return 'consumed';
      }
      if (document.body.classList.contains('drawer-open')) {
        document.body.classList.remove('drawer-open');
        return 'consumed';
      }

      // Leaflet harita popup kontrolü
      const popupClose = document.querySelector('.leaflet-popup-close-button');
      if (popupClose) {
        popupClose.click();
        return 'consumed';
      }

      // 2) Profil görünümündeyse -> Haritaya dön
      if (currentView === 'profile' || (profileContainer && profileContainer.style.display !== 'none')) {
        showMap();
        return 'consumed';
      }

      // 3) Harita ana görünümündeyse ve açık pencere yoksa -> Çıkış
      return 'exit';
    } catch (e) {
      console.warn('Back button handler error:', e);
      return 'exit';
    }
  };

  if (typeof onStateChange === 'function') {
    onStateChange(() => {
      if (window.__refreshMapStats) window.__refreshMapStats();
    });
  }

  renderLoginPage(loginContainer, (profile) => {
    loginContainer.remove();
    showMap();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

