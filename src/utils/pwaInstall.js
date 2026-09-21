// pwaInstall.js - PWA & Mobile App Installation Engine
// Smart platform detection (iOS Safari vs Android Chrome vs Native Capacitor / Standalone PWA)

/**
 * Checks if the app is already installed or running natively
 * Returns true if in Standalone mode or running inside Capacitor APK
 */
export function isAppInstalledOrNative() {
  if (typeof window === 'undefined') return false;

  // 1. Capacitor Native Platform (Android APK / iOS App)
  if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) {
    return true;
  }

  // 2. Standalone display mode (PWA installed on mobile/desktop)
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // 3. iOS Safari standalone property
  if (window.navigator && window.navigator.standalone === true) {
    return true;
  }

  // 4. Android TWA / WebAPK referrer
  if (typeof document !== 'undefined' && document.referrer && document.referrer.includes('android-app://')) {
    return true;
  }

  return false;
}

/**
 * Checks if current device is iOS (iPhone, iPad, iPod)
 */
export function isIosDevice() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Shows visual step-by-step installation guide for iPhone/iPad (iOS Safari)
 */
export function showIosInstallGuideModal(currentLang = 'tr') {
  const existing = document.getElementById('ios-install-guide-modal');
  if (existing) existing.remove();

  const isTr = currentLang === 'tr';

  const modal = document.createElement('div');
  modal.id = 'ios-install-guide-modal';
  modal.className = 'ios-install-overlay';
  modal.innerHTML = `
    <div class="ios-install-dialog">
      <div class="ios-install-header">
        <div class="ios-install-icon-wrap">
          <span class="ios-install-app-icon">🧭</span>
        </div>
        <div class="ios-install-titles">
          <h3>${isTr ? 'Gezgin\'i iPhone\'a Yükleyin' : 'Install Gezgin on iPhone'}</h3>
          <p>${isTr ? 'Safari çubukları olmadan, tam ekran bir uygulama olarak kullanın' : 'Use full-screen without Safari bars, just like a native app'}</p>
        </div>
        <button type="button" class="ios-install-close-btn" id="btn-close-ios-guide">&times;</button>
      </div>

      <div class="ios-install-steps">
        <div class="ios-install-step">
          <div class="ios-step-num">1</div>
          <div class="ios-step-text">
            ${isTr 
              ? 'Safari\'nin alt çubuğundaki <b>Paylaş</b> (<span class="ios-inline-icon">📤</span>) simgesine dokunun.' 
              : 'Tap the <b>Share</b> (<span class="ios-inline-icon">📤</span>) button in Safari\'s bottom toolbar.'}
          </div>
        </div>

        <div class="ios-install-step">
          <div class="ios-step-num">2</div>
          <div class="ios-step-text">
            ${isTr 
              ? 'Açılan menüyü aşağı kaydırıp <b>"Ana Ekrana Ekle"</b> (<span class="ios-inline-icon">➕</span>) seçeneğine dokunun.' 
              : 'Scroll down the share sheet and tap <b>"Add to Home Screen"</b> (<span class="ios-inline-icon">➕</span>).'}
          </div>
        </div>

        <div class="ios-install-step">
          <div class="ios-step-num">3</div>
          <div class="ios-step-text">
            ${isTr 
              ? 'Sağ üst köşedeki <b>"Ekle"</b> butonuna basın.' 
              : 'Tap <b>"Add"</b> in the top right corner.'}
          </div>
        </div>
      </div>

      <div class="ios-install-banner-tip">
        <span style="font-size:1.3rem;">✨</span>
        <div>
          ${isTr 
            ? '<b>Tebrikler!</b> Gezgin ana ekranınıza ikon olarak eklenecek ve App Store uygulaması gibi tam ekran, akıcı ve çevrimdışı çalışacaktır.' 
            : '<b>All set!</b> Gezgin will appear on your home screen and run in full-screen standalone mode.'}
        </div>
      </div>

      <button type="button" class="ios-install-got-it-btn" id="btn-got-it-ios-guide">
        ${isTr ? 'Anladım, Harika! 🚀' : 'Got it, Awesome! 🚀'}
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#btn-close-ios-guide')?.addEventListener('click', close);
  modal.querySelector('#btn-got-it-ios-guide')?.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}

/**
 * Triggers installation flow based on platform
 */
export async function triggerAppInstallation(currentLang = 'tr') {
  // 1. If on iOS (Safari) -> Show visual step-by-step guide
  if (isIosDevice()) {
    showIosInstallGuideModal(currentLang);
    return;
  }

  // 2. If Android / Chromium / Desktop with native prompt available
  if (window.__deferredInstallPrompt) {
    try {
      window.__deferredInstallPrompt.prompt();
      const choiceResult = await window.__deferredInstallPrompt.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        window.__deferredInstallPrompt = null;
        const card = document.getElementById('settings-install-app-card');
        if (card) card.style.display = 'none';
      }
    } catch (e) {
      console.warn('PWA install prompt error:', e);
    }
    return;
  }

  // 3. Fallback for other browsers (e.g. desktop Firefox or already installed / unsupported)
  showIosInstallGuideModal(currentLang);
}
