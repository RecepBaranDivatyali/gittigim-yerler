/**
 * security.js - Güvenlik Yardımcıları & XSS Koruması
 * Gezgin Seyahat Uygulaması
 */

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function sanitizeText(str, maxLength = 250) {
  if (!str) return '';
  return escapeHtml(String(str).trim().slice(0, maxLength));
}

export function parseSecureShareCode(rawCode) {
  if (!rawCode || typeof rawCode !== 'string') return null;
  try {
    const trimmed = rawCode.trim();
    const jsonStr = decodeURIComponent(atob(trimmed));
    const parsed = JSON.parse(jsonStr);
    
    if (!parsed || typeof parsed !== 'object') return null;

    if (parsed.profile && typeof parsed.profile === 'object') {
      parsed.profile.username = sanitizeText(parsed.profile.username, 30) || 'Gezgin';
      parsed.profile.bio = sanitizeText(parsed.profile.bio, 100);
      parsed.profile.avatar = sanitizeText(parsed.profile.avatar, 10) || '🧭';
    }

    if (parsed.worldVisits && typeof parsed.worldVisits === 'object') {
      Object.keys(parsed.worldVisits).forEach(k => {
        const v = parsed.worldVisits[k];
        if (v && v.notes) v.notes = sanitizeText(v.notes, 300);
      });
    }

    if (parsed.turkeyVisits && typeof parsed.turkeyVisits === 'object') {
      Object.keys(parsed.turkeyVisits).forEach(k => {
        const v = parsed.turkeyVisits[k];
        if (v && v.notes) v.notes = sanitizeText(v.notes, 300);
      });
    }

    return parsed;
  } catch (e) {
    console.warn('Invalid share code format:', e);
    return null;
  }
}
