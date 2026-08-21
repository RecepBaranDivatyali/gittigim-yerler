// theme.js - Theme System & Dynamic Styles

const STORAGE_KEY = 'gv_theme';

export const THEMES = {
  dark: {
    id: 'dark',
    name: 'Gece',
    nameEn: 'Midnight',
    icon: '🌙',
    oceanBg: '#090d16',
    landFill: '#1e293b',
    provinceFill: '#131b2e',
    landBorder: '#94a3b8',
    landBorderZoomed: '#cbd5e1',
    labelColor: 'rgba(241, 245, 249, 0.58)',
    labelShadow: '0 0 4px rgba(0, 0, 0, 1), 0 1px 3px rgba(0, 0, 0, 0.95)',
    uiBg: 'rgba(30, 41, 59, 0.92)',
    uiBorder: 'rgba(255, 255, 255, 0.12)',
    textMain: '#f8fafc',
    textMuted: '#94a3b8'
  },
  ocean: {
    id: 'ocean',
    name: 'Okyanus',
    nameEn: 'Ocean',
    icon: '🌊',
    oceanBg: '#061325',
    landFill: '#0e2d4d',
    provinceFill: '#0a2037',
    landBorder: '#38bdf8',
    landBorderZoomed: '#7dd3fc',
    labelColor: 'rgba(224, 242, 254, 0.65)',
    labelShadow: '0 0 4px rgba(6, 19, 37, 1), 0 1px 3px rgba(0, 0, 0, 0.9)',
    uiBg: 'rgba(14, 45, 77, 0.92)',
    uiBorder: 'rgba(56, 189, 248, 0.25)',
    textMain: '#f0f9ff',
    textMuted: '#93c5fd'
  },
  emerald: {
    id: 'emerald',
    name: 'Zümrüt',
    nameEn: 'Emerald',
    icon: '🌲',
    oceanBg: '#061914',
    landFill: '#113a2d',
    provinceFill: '#0c2a21',
    landBorder: '#34d399',
    landBorderZoomed: '#6ee7b7',
    labelColor: 'rgba(236, 253, 245, 0.65)',
    labelShadow: '0 0 4px rgba(6, 25, 20, 1), 0 1px 3px rgba(0, 0, 0, 0.9)',
    uiBg: 'rgba(17, 58, 45, 0.92)',
    uiBorder: 'rgba(52, 211, 153, 0.25)',
    textMain: '#f0fdf4',
    textMuted: '#a7f3d0'
  },
  vintage: {
    id: 'vintage',
    name: 'Klasik',
    nameEn: 'Vintage',
    icon: '📜',
    oceanBg: '#cbd5e1',
    landFill: '#f8fafc',
    provinceFill: '#e2e8f0',
    landBorder: '#64748b',
    landBorderZoomed: '#475569',
    labelColor: 'rgba(30, 41, 59, 0.70)',
    labelShadow: '0 0 3px rgba(255, 255, 255, 0.9), 0 1px 2px rgba(255, 255, 255, 0.8)',
    uiBg: 'rgba(241, 245, 249, 0.95)',
    uiBorder: 'rgba(100, 116, 139, 0.25)',
    textMain: '#0f172a',
    textMuted: '#475569'
  }
};

let currentTheme = 'dark';
const themeListeners = [];

export function getTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES[saved]) {
      currentTheme = saved;
    }
  } catch {}
  return currentTheme;
}

export function getThemeConfig(themeId) {
  const id = themeId || getTheme();
  return THEMES[id] || THEMES.dark;
}

export function setTheme(themeId) {
  if (!THEMES[themeId]) return;
  currentTheme = themeId;
  try {
    localStorage.setItem(STORAGE_KEY, themeId);
  } catch {}
  applyTheme(themeId);
  themeListeners.forEach(fn => {
    try { fn(currentTheme); } catch {}
  });
}

export function onThemeChange(fn) {
  themeListeners.push(fn);
  return () => {
    const idx = themeListeners.indexOf(fn);
    if (idx !== -1) themeListeners.splice(idx, 1);
  };
}

export function applyTheme(themeId) {
  const cfg = getThemeConfig(themeId);
  const root = document.documentElement;
  if (!root) return;

  root.style.setProperty('--ocean-bg', cfg.oceanBg);
  root.style.setProperty('--land-fill', cfg.landFill);
  root.style.setProperty('--province-fill', cfg.provinceFill);
  root.style.setProperty('--land-border', cfg.landBorder);
  root.style.setProperty('--land-border-zoomed', cfg.landBorderZoomed);
  root.style.setProperty('--label-color', cfg.labelColor);
  root.style.setProperty('--label-shadow', cfg.labelShadow);
  root.style.setProperty('--theme-ui-bg', cfg.uiBg);
  root.style.setProperty('--theme-ui-border', cfg.uiBorder);
  root.style.setProperty('--theme-text-main', cfg.textMain);
  root.style.setProperty('--theme-text-muted', cfg.textMuted);

  document.body.setAttribute('data-theme', cfg.id);
}
