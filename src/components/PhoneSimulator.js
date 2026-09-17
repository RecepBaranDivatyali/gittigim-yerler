// PhoneSimulator.js - Clean Interactive Mobile Simulator for Gezgin Web
import { getTheme } from '../utils/theme.js';

export function isDesktopWeb() {
  // If running inside the simulator iframe, it is not desktop host
  if (window.self !== window.top || window.location.search.includes('simulated=1')) {
    return false;
  }
  // Native Capacitor / mobile app detection
  if (window.Capacitor?.isNativePlatform?.() || window.Capacitor?.getPlatform?.() === 'android' || window.Capacitor?.getPlatform?.() === 'ios') {
    return false;
  }
  if (window.location.protocol === 'capacitor:' || window.location.protocol === 'ionic:') {
    return false;
  }
  // Screen width boundary: <= 520px is actual mobile screen
  if (window.innerWidth <= 520) {
    return false;
  }
  // User agent check for mobile phones (phones/phablets on small screens)
  const isMobileUA = /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobileUA && window.innerWidth <= 768) {
    return false;
  }
  return true;
}

export function getSimulatorMode() {
  return localStorage.getItem('gv_simulator_mode') || 'phone';
}

export function setSimulatorMode(mode) {
  localStorage.setItem('gv_simulator_mode', mode);
}

export function getSimulatorScaleMode() {
  return localStorage.getItem('gv_simulator_scale') || 'fit';
}

export function setSimulatorScaleMode(scaleMode) {
  localStorage.setItem('gv_simulator_scale', scaleMode);
}

// Floating button displayed on desktop when in fullscreen mode (disabled per user request)
export function renderSimulatorSwitcherButton() {
  const existingBtn = document.getElementById('floating-sim-switch-pill');
  if (existingBtn) existingBtn.remove();
}

/**
 * Initializes the Phone Simulator if conditions are met.
 * Disabled: Website runs directly in responsive desktop mode.
 */
export function initPhoneSimulator() {
  const existingStudio = document.getElementById('phone-simulator-studio');
  if (existingStudio) existingStudio.remove();
  document.body.classList.remove('sim-studio-active', 'is-simulated-screen');
  const appRoot = document.getElementById('app');
  if (appRoot) {
    appRoot.style.display = '';
  }
  return false;
}

function renderPhoneSimulatorStudio() {
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.classList.add('sim-studio-active');

  const appRoot = document.getElementById('app');
  if (appRoot) {
    appRoot.style.display = 'none';
  }

  // Studio Container
  const studio = document.createElement('div');
  studio.id = 'phone-simulator-studio';
  studio.className = 'phone-simulator-studio';

  // Build iframe URL with ?simulated=1
  const simUrl = new URL(window.location.href);
  simUrl.searchParams.set('simulated', '1');
  const iframeSrc = simUrl.toString();

  // Current scale mode
  let currentScaleMode = getSimulatorScaleMode();

  // HTML Structure
  studio.innerHTML = `
    <!-- Top Floating Studio Control Bar -->
    <header class="sim-control-bar">
      <div class="sim-bar-left">
        <span class="sim-brand-icon">🌍</span>
        <div class="sim-brand-text">
          <span class="sim-brand-title">Gezgin</span>
          <span class="sim-badge-screen">Mobil Önizleme • 390 × 844 px</span>
        </div>
      </div>

      <div class="sim-bar-center">
        <div class="sim-segmented-control">
          <button id="sim-mode-phone-btn" class="sim-segment-btn active" title="Mobil telefon çerçevesi">
            <span class="sim-btn-icon">📱</span> Mobil Çerçeve
          </button>
          <button id="sim-mode-fullscreen-btn" class="sim-segment-btn" title="Masaüstü tam ekran harita görünümü">
            <span class="sim-btn-icon">🖥️</span> Masaüstü Tam Ekran
          </button>
        </div>
      </div>

      <div class="sim-bar-right">
        <div class="sim-segmented-control sim-scale-control">
          <button id="sim-scale-fit-btn" class="sim-segment-btn ${currentScaleMode === 'fit' ? 'active' : ''}" title="Ekrana göre otomatik sığdır">
            <span class="sim-btn-icon">📐</span> Sığdır <span id="sim-scale-percent-badge" class="sim-scale-badge">--%</span>
          </button>
          <button id="sim-scale-100-btn" class="sim-segment-btn ${currentScaleMode === '100' ? 'active' : ''}" title="Gerçek 1:1 piksel boyutu">
            <span class="sim-btn-icon">🔍</span> %100
          </button>
        </div>

        <button id="sim-reload-btn" class="sim-icon-btn" title="Uygulamayı Yeniden Yükle">
          <span class="sim-btn-icon">🔄</span>
        </button>
      </div>
    </header>

    <!-- Center Stage / Phone Viewport -->
    <main class="sim-viewport-stage">
      <div id="sim-phone-wrapper" class="sim-phone-wrapper">
        <!-- Clean Smartphone Frame -->
        <div class="sim-clean-phone-frame">
          <!-- Subtle top speaker slit in bezel -->
          <div class="sim-top-speaker-notch"></div>
          
          <!-- Screen container: exact 390x844 mobile resolution -->
          <div class="sim-screen-container">
            <iframe id="sim-app-iframe" class="sim-app-iframe" src="${iframeSrc}" title="Gezgin Mobil Uygulama"></iframe>
          </div>

          <!-- Subtle bottom home bar -->
          <div class="sim-bottom-home-pill"></div>
        </div>
      </div>
    </main>
  `;

  document.body.appendChild(studio);

  // Setup DOM references & Event Listeners
  const phoneWrapper = document.getElementById('sim-phone-wrapper');
  const scalePercentBadge = document.getElementById('sim-scale-percent-badge');
  const fitBtn = document.getElementById('sim-scale-fit-btn');
  const scale100Btn = document.getElementById('sim-scale-100-btn');
  const reloadBtn = document.getElementById('sim-reload-btn');
  const fullscreenBtn = document.getElementById('sim-mode-fullscreen-btn');
  const iframe = document.getElementById('sim-app-iframe');

  // Dynamic Scaling calculation: calculates fitScale so the entire 398x852 frame is visible
  function applyScaling() {
    if (!phoneWrapper) return;

    const FRAME_WIDTH = 406;
    const FRAME_HEIGHT = 860;
    const TOP_BAR_HEIGHT = 56;
    const PADDING_V = 32;
    const PADDING_H = 32;

    const availH = window.innerHeight - TOP_BAR_HEIGHT - PADDING_V;
    const availW = window.innerWidth - PADDING_H;

    const scaleH = availH / FRAME_HEIGHT;
    const scaleW = availW / FRAME_WIDTH;
    const fitScale = Math.min(1, Math.min(scaleH, scaleW));

    if (currentScaleMode === 'fit') {
      const activeScale = Math.max(0.35, fitScale);
      phoneWrapper.style.transform = `scale(${activeScale})`;
      phoneWrapper.style.transformOrigin = 'center center';
      if (scalePercentBadge) {
        scalePercentBadge.textContent = `${Math.round(activeScale * 100)}%`;
      }
    } else {
      phoneWrapper.style.transform = 'scale(1)';
      phoneWrapper.style.transformOrigin = 'center top';
      if (scalePercentBadge) {
        scalePercentBadge.textContent = '100%';
      }
    }
  }

  applyScaling();
  window.addEventListener('resize', applyScaling);

  // Controls Handlers
  fitBtn?.addEventListener('click', () => {
    currentScaleMode = 'fit';
    setSimulatorScaleMode('fit');
    fitBtn.classList.add('active');
    scale100Btn?.classList.remove('active');
    applyScaling();
  });

  scale100Btn?.addEventListener('click', () => {
    currentScaleMode = '100';
    setSimulatorScaleMode('100');
    scale100Btn.classList.add('active');
    fitBtn?.classList.remove('active');
    applyScaling();
  });

  reloadBtn?.addEventListener('click', () => {
    if (iframe) {
      reloadBtn.style.transform = 'rotate(360deg)';
      reloadBtn.style.transition = 'transform 0.4s ease';
      setTimeout(() => {
        reloadBtn.style.transform = '';
        reloadBtn.style.transition = '';
      }, 400);
      iframe.src = iframeSrc;
    }
  });

  fullscreenBtn?.addEventListener('click', () => {
    setSimulatorMode('fullscreen');
    window.location.reload();
  });

  // Sync theme
  const theme = getTheme();
  studio.setAttribute('data-sim-theme', theme || 'dark');
}
