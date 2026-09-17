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
  },
  ocean: {
    id: 'ocean',
    name: 'Okyanus',
    nameEn: 'Ocean',
    icon: '🌊',
    oceanBg: '#0c1929',
    landFill: '#1a3a5c',
    provinceFill: '#1e4470',
    landBorder: '#2a5a8c',
    landBorderZoomed: '#3a7ab0',
    labelColor: '#e0f0ff',
    labelShadow: '0 1px 3px rgba(0,20,60,0.7)',
    uiBg: 'rgba(12, 25, 41, 0.92)',
    uiBorder: 'rgba(42, 90, 140, 0.35)',
    textMain: '#e0f0ff',
    textMuted: '#7ab0d4'
  },
  emerald: {
    id: 'emerald',
    name: 'Zümrüt',
    nameEn: 'Emerald',
    icon: '🌲',
    oceanBg: '#0a1f0a',
    landFill: '#1a3d1a',
    provinceFill: '#1e4a1e',
    landBorder: '#2d6b2d',
    landBorderZoomed: '#3d8b3d',
    labelColor: '#d4f5d4',
    labelShadow: '0 1px 3px rgba(0,30,0,0.7)',
    uiBg: 'rgba(10, 31, 10, 0.92)',
    uiBorder: 'rgba(45, 107, 45, 0.35)',
    textMain: '#d4f5d4',
    textMuted: '#7abf7a'
  },
  vintage: {
    id: 'vintage',
    name: 'Nostalji',
    nameEn: 'Vintage',
    icon: '📜',
    oceanBg: '#2c1810',
    landFill: '#4a3828',
    provinceFill: '#3d2e20',
    landBorder: '#6b5240',
    landBorderZoomed: '#8b7260',
    labelColor: '#f5e6d0',
    labelShadow: '0 1px 3px rgba(40,20,0,0.7)',
    uiBg: 'rgba(44, 24, 16, 0.92)',
    uiBorder: 'rgba(107, 82, 64, 0.35)',
    textMain: '#f5e6d0',
    textMuted: '#b8a088'
  },
  midnight_gold: {
    id: 'midnight_gold',
    name: 'Gece & Altın',
    nameEn: 'Midnight Gold',
    icon: '🌟',
    oceanBg: '#090a10',
    landFill: '#141724',
    provinceFill: '#10121c',
    landBorder: '#d4af37',
    landBorderZoomed: '#f59e0b',
    labelColor: '#fef3c7',
    labelShadow: '0 0 6px rgba(0,0,0,1)',
    uiBg: 'rgba(15, 17, 28, 0.94)',
    uiBorder: 'rgba(212, 175, 55, 0.35)',
    textMain: '#fef3c7',
    textMuted: '#d4af37'
  },
  natgeo_atlas: {
    id: 'natgeo_atlas',
    name: 'NatGeo Atlas',
    nameEn: 'NatGeo Atlas',
    icon: '🗺️',
    oceanBg: '#cbe4ee',
    landFill: '#f7eee1',
    provinceFill: '#fcf6ed',
    landBorder: '#8c7052',
    landBorderZoomed: '#664d33',
    labelColor: '#2b2118',
    labelShadow: '0 0 3px rgba(255,255,255,0.9)',
    uiBg: 'rgba(247, 238, 225, 0.95)',
    uiBorder: 'rgba(140, 112, 82, 0.3)',
    textMain: '#2b2118',
    textMuted: '#664d33'
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    nameEn: 'Cyberpunk',
    icon: '⚡',
    oceanBg: '#070514',
    landFill: '#150c2e',
    provinceFill: '#100824',
    landBorder: '#00f0ff',
    landBorderZoomed: '#ff007f',
    labelColor: '#00f0ff',
    labelShadow: '0 0 8px rgba(0,240,255,0.8)',
    uiBg: 'rgba(18, 10, 38, 0.94)',
    uiBorder: 'rgba(0, 240, 255, 0.4)',
    textMain: '#00f0ff',
    textMuted: '#ff007f'
  },
  pure_oled: {
    id: 'pure_oled',
    name: 'Saf OLED',
    nameEn: 'Pure OLED',
    icon: '🖤',
    oceanBg: '#000000',
    landFill: '#0a0a0a',
    provinceFill: '#050505',
    landBorder: '#333333',
    landBorderZoomed: '#555555',
    labelColor: '#ffffff',
    labelShadow: '0 0 4px rgba(0,0,0,1)',
    uiBg: 'rgba(10, 10, 10, 0.96)',
    uiBorder: 'rgba(255, 255, 255, 0.15)',
    textMain: '#ffffff',
    textMuted: '#888888'
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
  root.style.setProperty('--text-main', cfg.textMain);
  root.style.setProperty('--text-muted', cfg.textMuted);
  root.style.setProperty('--bg-dark', cfg.id === 'light' ? '#f1f5f9' : '#0f172a');
  root.style.setProperty('--bg-card', cfg.id === 'light' ? 'rgba(255, 255, 255, 0.96)' : 'rgba(30, 41, 59, 0.7)');
  root.style.setProperty('--border-glass', cfg.id === 'light' ? 'rgba(203, 213, 225, 0.85)' : 'rgba(255, 255, 255, 0.1)');
  root.style.setProperty('--theme-card-bg', cfg.id === 'light' ? 'rgba(255, 255, 255, 0.96)' : 'rgba(15, 23, 42, 0.65)');
  root.style.setProperty('--theme-card-border', cfg.id === 'light' ? 'rgba(203, 213, 225, 0.85)' : 'rgba(148, 163, 184, 0.12)');

  const uiSize = getUiSize();
  const uiScale = UI_SCALES[uiSize] || '1.0';
  root.style.setProperty('--ui-font-scale', uiScale);
  document.documentElement.setAttribute('data-ui-size', uiSize);
  document.body.setAttribute('data-ui-size', uiSize);
  document.body.setAttribute('data-theme', cfg.id);
}


const UI_SIZE_STORAGE_KEY = 'gv_ui_size';
export const UI_SCALES = {
  small: '0.88',
  medium: '1.0',
  large: '1.20'
};

export function getUiSize() {
  try {
    const saved = localStorage.getItem(UI_SIZE_STORAGE_KEY);
    if (saved && UI_SCALES[saved]) return saved;
  } catch {}
  return 'medium';
}

export function setUiSize(sizeKey) {
  if (!UI_SCALES[sizeKey]) return;
  try {
    localStorage.setItem(UI_SIZE_STORAGE_KEY, sizeKey);
  } catch {}
  applyTheme(getTheme());
  themeListeners.forEach(fn => {
    try { fn(currentTheme); } catch {}
  });
}

export function blendColors(hexBase, hexTint, ratio = 0.25) {
  if (!hexBase || !hexTint) return hexBase || '#1e293b';
  let b = hexBase.startsWith('#') ? hexBase.slice(1) : hexBase;
  if (b.length === 3) b = b.split('').map(c => c + c).join('');
  let t = hexTint.startsWith('#') ? hexTint.slice(1) : hexTint;
  if (t.length === 3) t = t.split('').map(c => c + c).join('');

  const r1 = parseInt(b.slice(0, 2), 16) || 0;
  const g1 = parseInt(b.slice(2, 4), 16) || 0;
  const b1 = parseInt(b.slice(4, 6), 16) || 0;

  const r2 = parseInt(t.slice(0, 2), 16) || 0;
  const g2 = parseInt(t.slice(2, 4), 16) || 0;
  const b2 = parseInt(t.slice(4, 6), 16) || 0;

  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const bl = Math.round(b1 * (1 - ratio) + b2 * ratio);

  return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
}
