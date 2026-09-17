// PhoneSimulator.js - Interactive Desktop Phone Simulator for Gezgin Web
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
  // Screen width boundary for phone simulator
  if (window.innerWidth <= 520) {
    return false;
  }
  // User agent check for mobile devices (phones/phablets)
  const isMobileUA = /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobileUA && (window.innerWidth <= 768 || 'ontouchstart' in window)) {
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

// Floating button displayed when user is on desktop and in fullscreen mode
export function renderSimulatorSwitcherButton() {
  if (!isDesktopWeb()) return;
  if (window.location.search.includes('simulated=1')) return;
  if (document.getElementById('floating-sim-switch-pill')) return;

  const btn = document.createElement('button');
  btn.id = 'floating-sim-switch-pill';
  btn.className = 'floating-sim-switch-pill';
  btn.innerHTML = `
    <span class="sim-pill-icon">📱</span>
    <span class="sim-pill-label">Mobil Simülatör</span>
  `;
  btn.title = 'Telefon Çerçevesi (Simülatör) Görünümüne Geç';
  btn.addEventListener('click', () => {
    setSimulatorMode('phone');
    window.location.reload();
  });
  document.body.appendChild(btn);
}

/**
 * Initializes the Phone Simulator if conditions are met.
 * Returns true if simulator is activated (halting normal map boot on parent),
 * or false if normal app flow should proceed.
 */
export function initPhoneSimulator() {
  // If running inside simulated iframe or on mobile device, do NOT run simulator
  if (window.location.search.includes('simulated=1')) {
    document.body.classList.add('is-simulated-screen');
    return false;
  }

  if (!isDesktopWeb()) {
    return false;
  }

  // If user explicitly chose fullscreen mode on desktop
  const mode = getSimulatorMode();
  if (mode === 'fullscreen') {
    renderSimulatorSwitcherButton();
    return false;
  }

  // Otherwise, activate Phone Simulator Studio!
  renderPhoneSimulatorStudio();
  return true;
}

function renderPhoneSimulatorStudio() {
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.classList.add('sim-studio-active');

  const appRoot = document.getElementById('app');
  if (appRoot) {
    appRoot.innerHTML = '';
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
    <!-- Ambient Studio Lights -->
    <div class="sim-studio-ambient-glow"></div>
    <div class="sim-studio-grid-dots"></div>

    <!-- Top Floating Studio Control Bar -->
    <header class="sim-control-bar">
      <div class="sim-bar-left">
        <div class="sim-brand-wrap">
          <span class="sim-brand-logo">🌍</span>
          <div class="sim-brand-text">
            <span class="sim-brand-title">Gezgin</span>
            <span class="sim-device-tag">iPhone 15 Pro • 19.5:9</span>
          </div>
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
          <button id="sim-scale-fit-btn" class="sim-segment-btn ${currentScaleMode === 'fit' ? 'active' : ''}" title="Ekrana göre otomatik ölçekle">
            <span class="sim-btn-icon">📐</span> Sığdır <span id="sim-scale-percent-badge" class="sim-scale-badge">--%</span>
          </button>
          <button id="sim-scale-100-btn" class="sim-segment-btn ${currentScaleMode === '100' ? 'active' : ''}" title="Gerçek 1:1 piksel boyutu">
            <span class="sim-btn-icon">🔍</span> %100
          </button>
        </div>

        <button id="sim-reload-btn" class="sim-action-icon-btn" title="Simülatörü Yeniden Başlat">
          <span class="sim-btn-icon">🔄</span>
        </button>
      </div>
    </header>

    <!-- Center Stage / Phone Viewport -->
    <main class="sim-viewport-stage">
      <div id="sim-phone-wrapper" class="sim-phone-wrapper">
        
        <!-- Physical Side Buttons -->
        <div class="sim-chassis-button sim-btn-action"></div>
        <div class="sim-chassis-button sim-btn-vol-up"></div>
        <div class="sim-chassis-button sim-btn-vol-down"></div>
        <div class="sim-chassis-button sim-btn-power"></div>

        <!-- Titanium Phone Chassis -->
        <div class="sim-phone-chassis">
          
          <!-- Inner Screen (390 x 844) -->
          <div class="sim-screen-container">
            
            <!-- iOS Status Bar -->
            <div class="sim-ios-status-bar">
              <div class="sim-status-left">
                <span id="sim-status-clock" class="sim-status-clock">09:41</span>
              </div>
              <div class="sim-status-right">
                <!-- Signal Bars -->
                <svg class="sim-status-icon" viewBox="0 0 17 11" width="17" height="11" fill="currentColor">
                  <rect x="0" y="8" width="3" height="3" rx="0.7"/>
                  <rect x="4.5" y="5.5" width="3" height="5.5" rx="0.7"/>
                  <rect x="9" y="3" width="3" height="8" rx="0.7"/>
                  <rect x="13.5" y="0" width="3" height="11" rx="0.7"/>
                </svg>
                <!-- 5G Badge -->
                <span class="sim-status-network">5G</span>
                <!-- Battery Icon -->
                <svg class="sim-status-icon" viewBox="0 0 25 12" width="25" height="12" fill="currentColor">
                  <rect x="0.5" y="0.5" width="21" height="11" rx="2.6" fill="none" stroke="currentColor" stroke-width="1" opacity="0.6"/>
                  <rect x="2" y="2" width="15" height="8" rx="1.6" fill="currentColor"/>
                  <path d="M23 4C23.5 4.5 24 5 24 6C24 7 23.5 7.5 23 8" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
                </svg>
              </div>
            </div>

            <!-- Dynamic Island -->
            <div id="sim-dynamic-island" class="sim-dynamic-island" title="Gezgin Dynamic Island">
              <div class="sim-di-camera"></div>
              <div class="sim-di-sensor"></div>
              <div class="sim-di-pulse-dot"></div>
            </div>

            <!-- App Iframe -->
            <iframe id="sim-app-iframe" class="sim-app-iframe" src="${iframeSrc}" title="Gezgin Mobil Uygulama"></iframe>

            <!-- iOS Home Indicator -->
            <div class="sim-home-indicator"></div>

          </div>
        </div>
      </div>
    </main>
  `;

  if (appRoot) {
    appRoot.appendChild(studio);
  } else {
    document.body.appendChild(studio);
  }

  // Setup DOM references & Event Listeners
  const phoneWrapper = document.getElementById('sim-phone-wrapper');
  const scalePercentBadge = document.getElementById('sim-scale-percent-badge');
  const fitBtn = document.getElementById('sim-scale-fit-btn');
  const scale100Btn = document.getElementById('sim-scale-100-btn');
  const reloadBtn = document.getElementById('sim-reload-btn');
  const fullscreenBtn = document.getElementById('sim-mode-fullscreen-btn');
  const phoneBtn = document.getElementById('sim-mode-phone-btn');
  const iframe = document.getElementById('sim-app-iframe');
  const statusClock = document.getElementById('sim-status-clock');
  const dynamicIsland = document.getElementById('sim-dynamic-island');

  // Dynamic live clock update
  function updateClock() {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    if (statusClock) statusClock.textContent = `${hrs}:${mins}`;
  }
  updateClock();
  const clockInterval = setInterval(updateClock, 30000);

  // Dynamic Island interactive easter egg / status display
  if (dynamicIsland) {
    let diExpanded = false;
    dynamicIsland.addEventListener('click', () => {
      diExpanded = !diExpanded;
      dynamicIsland.classList.toggle('expanded', diExpanded);
      if (diExpanded) {
        dynamicIsland.innerHTML = `
          <div class="sim-di-content-expanded">
            <span class="sim-di-icon">🌍</span>
            <span class="sim-di-text">Gezgin v1.5 • Çevrimiçi</span>
          </div>
        `;
        setTimeout(() => {
          if (diExpanded) {
            diExpanded = false;
            dynamicIsland.classList.remove('expanded');
            dynamicIsland.innerHTML = `
              <div class="sim-di-camera"></div>
              <div class="sim-di-sensor"></div>
              <div class="sim-di-pulse-dot"></div>
            `;
          }
        }, 3200);
      } else {
        dynamicIsland.innerHTML = `
          <div class="sim-di-camera"></div>
          <div class="sim-di-sensor"></div>
          <div class="sim-di-pulse-dot"></div>
        `;
      }
    });
  }

  // Dynamic Scaling calculation
  function applyScaling() {
    if (!phoneWrapper) return;

    // Chassis physical outer bounds: ~422px width, ~874px height
    const CHASSIS_WIDTH = 422;
    const CHASSIS_HEIGHT = 874;
    const TOP_BAR_HEIGHT = 64;
    const PADDING_V = 40;
    const PADDING_H = 40;

    const availH = window.innerHeight - TOP_BAR_HEIGHT - PADDING_V;
    const availW = window.innerWidth - PADDING_H;

    const scaleH = availH / CHASSIS_HEIGHT;
    const scaleW = availW / CHASSIS_WIDTH;
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

  phoneBtn?.addEventListener('click', () => {
    // Already in phone mode
  });

  // Sync theme changes
  const theme = getTheme();
  studio.setAttribute('data-sim-theme', theme || 'dark');
}
