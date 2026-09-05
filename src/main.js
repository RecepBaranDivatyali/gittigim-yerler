import './styles/main.css';
import { renderWorldMapView } from './components/WorldMapView.js';
import { renderLoginPage } from './components/LoginPage.js';
import { renderProfileView } from './components/ProfileView.js';
import { onStateChange } from './utils/storage.js';

function syncAppHeight() {
  const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${h}px`);
}

function initApp() {
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

  appContainer.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;width:100vw;height:var(--app-height,100dvh);overflow:hidden;background:#0f172a;';

  let cleanupMap = null;

  function showMap() {
    if (cleanupMap) { cleanupMap(); cleanupMap = null; }
    else if (window.__cleanupWorldMap) { window.__cleanupWorldMap(); }
    appContainer.innerHTML = '';
    cleanupMap = renderWorldMapView(appContainer, { onOpenProfile: showProfile });
  }

  function showProfile() {
    if (cleanupMap) { cleanupMap(); cleanupMap = null; }
    else if (window.__cleanupWorldMap) { window.__cleanupWorldMap(); }
    appContainer.innerHTML = '';
    renderProfileView(appContainer, showMap);
  }

  if (typeof onStateChange === 'function') {
    onStateChange(() => {
      if (window.__refreshMapStats) window.__refreshMapStats();
    });
  }

  renderLoginPage(appContainer, (profile) => {
    showMap();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

