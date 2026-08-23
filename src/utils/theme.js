// theme.js - Modern Dark & Light Themes + Custom Status Colors

const STORAGE_KEY = 'gv_theme';
const COLOR_STORAGE_PREFIX = 'gv_color_';

export const THEMES = {
  dark: {
    id: 'dark',
    name: 'Karanlık',
    nameEn: 'Dark',
    icon: '🌙',
    oceanBg: '#090d16',
    landFill: '#1e293b',
    provinceFill: '#131b2e',
    landBorder: '#94a3b8',
    landBorderZoomed: '#cbd5e1',
    labelColor: 'rgba(241, 245, 249, 0.65)',
    labelShadow: '0 0 4px rgba(0, 0, 0, 1), 0 1px 3px rgba(0, 0, 0, 0.95)',
    uiBg: 'rgba(30, 41, 59, 0.92)',
    uiBorder: 'rgba(255, 255, 255, 0.12)',
    textMain: '#f8fafc',
    textMuted: '#94a3b8'
  },
  light: {
    id: 'light',
    name: 'Aydınlık',
    nameEn: 'Light',
    icon: '☀️',
    oceanBg: '#c5dff6',
    landFill: '#f8fafc',
    provinceFill: '#f1f5f9',
    landBorder: '#94a3b8',
    landBorderZoomed: '#64748b',
    labelColor: '#0f172a',
    labelShadow: '0 0 4px #ffffff, 0 0 6px #ffffff, 0 1px 2px rgba(255, 255, 255, 0.95)',
    uiBg: 'rgba(255, 255, 255, 0.96)',
    uiBorder: 'rgba(203, 213, 225, 0.9)',
    textMain: '#0f172a',
    textMuted: '#64748b'
  }
};

export const COLOR_PALETTES = [
  { id: 'orange', name: 'Turuncu', nameEn: 'Orange', color: '#ff5722' },
  { id: 'crimson', name: 'Kırmızı', nameEn: 'Crimson', color: '#ef4444' },
  { id: 'emerald', name: 'Zümrüt', nameEn: 'Emerald', color: '#10b981' },
  { id: 'blue', name: 'Mavi', nameEn: 'Sky Blue', color: '#3b82f6' },
  { id: 'purple', name: 'Mor', nameEn: 'Purple', color: '#8b5cf6' },
  { id: 'amber', name: 'Kehribar', nameEn: 'Amber', color: '#f59e0b' },
  { id: 'rose', name: 'Pembe', nameEn: 'Rose Pink', color: '#ec4899' },
  { id: 'teal', name: 'Turkuaz', nameEn: 'Teal', color: '#06b6d4' },
  { id: 'indigo', name: 'İndigo', nameEn: 'Indigo', color: '#6366f1' },
  { id: 'bronze', name: 'Bronz', nameEn: 'Bronze', color: '#d97706' }
];

const DEFAULT_STATUS_COLORS = {
  visited: '#ff5722',
  planned: '#f59e0b',
  wishlist: '#8b5cf6'
};

export function getStatusColor(statusKey) {
  try {
    const saved = localStorage.getItem(COLOR_STORAGE_PREFIX + statusKey);
    if (saved) return saved;
  } catch {}
  return DEFAULT_STATUS_COLORS[statusKey] || DEFAULT_STATUS_COLORS.visited;
}

export function setStatusColor(statusKey, hexColor) {
  try {
    localStorage.setItem(COLOR_STORAGE_PREFIX + statusKey, hexColor);
  } catch {}
  themeListeners.forEach(fn => {
    try { fn(currentTheme); } catch {}
  });
}

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
