import './styles/main.css';
import { renderWorldMapView } from './components/WorldMapView.js';
import { renderLoginPage } from './components/LoginPage.js';
import { renderProfileView } from './components/ProfileView.js';
import { onStateChange, syncPendingFeedbacks } from './utils/storage.js';
import { applyTheme, getTheme } from './utils/theme.js';

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

  // Auto-sync any offline feedbacks whenever app boots or device regains internet connection
  syncPendingFeedbacks();
  window.addEventListener('online', () => {
    syncPendingFeedbacks();
  });

  appContainer.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:var(--app-height,100dvh);max-height:var(--app-height,100dvh);overflow:hidden;background:#0f172a;';

  // Dedicated permanent Map container - Never wiped or reloaded between profile views
  const mapContainer = document.createElement('div');
  mapContainer.id = 'map-app-root';
  mapContainer.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:hidden;';
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

  function showMap() {
    profileContainer.style.display = 'none';
    profileContainer.innerHTML = '';
    if (!mapInitialized) {
      mapInitialized = true;
      renderWorldMapView(mapContainer, { onOpenProfile: showProfile });
    } else {
      if (window.__refreshMapStats) window.__refreshMapStats();
      if (window.__leafletMapInstance) {
        window.__leafletMapInstance.invalidateSize();
      }
    }
  }

  function showProfile() {
    profileContainer.style.display = 'block';
    renderProfileView(profileContainer, () => {
      showMap();
    });
  }

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

