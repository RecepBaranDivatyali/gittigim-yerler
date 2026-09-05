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

    const sanitizeVisit = (v) => {
      if (!v || typeof v !== 'object') return { status: 'unvisited', rating: 0, notes: '' };
      const validStatuses = ['visited', 'planned', 'wishlist', 'unvisited'];
      const status = validStatuses.includes(v.status) ? v.status : 'unvisited';
      const rawRating = Number(v.rating);
      const rating = (!isNaN(rawRating) && rawRating >= 0 && rawRating <= 10) ? Math.round(rawRating) : 0;
      const notes = v.notes ? sanitizeText(v.notes, 300) : '';
      const date = typeof v.date === 'string' ? sanitizeText(v.date, 20) : '';
      return { status, rating, notes, date };
    };

    if (parsed.worldVisits && typeof parsed.worldVisits === 'object') {
      const sanitizedWorld = {};
      Object.keys(parsed.worldVisits).forEach(k => {
        const cleanKey = String(k).replace(/[^a-zA-Z0-9_:\-]/g, '').slice(0, 50);
        if (cleanKey) {
          sanitizedWorld[cleanKey] = sanitizeVisit(parsed.worldVisits[k]);
        }
      });
      parsed.worldVisits = sanitizedWorld;
    } else {
      parsed.worldVisits = {};
    }

    if (parsed.turkeyVisits && typeof parsed.turkeyVisits === 'object') {
      const sanitizedTurkey = {};
      Object.keys(parsed.turkeyVisits).forEach(k => {
        const cleanKey = String(k).replace(/[^0-9]/g, '').slice(0, 10);
        if (cleanKey) {
          sanitizedTurkey[cleanKey] = sanitizeVisit(parsed.turkeyVisits[k]);
        }
      });
      parsed.turkeyVisits = sanitizedTurkey;
    } else {
      parsed.turkeyVisits = {};
    }

    if (Array.isArray(parsed.worldCities)) {
      parsed.worldCities = parsed.worldCities.map(c => {
        if (!c || typeof c !== 'object') return null;
        return {
          countryCode: String(c.countryCode || '').replace(/[^a-zA-Z]/g, '').slice(0, 10),
          cityName: sanitizeText(c.cityName, 50),
          date: typeof c.date === 'string' ? sanitizeText(c.date, 20) : '',
          notes: sanitizeText(c.notes, 200)
        };
      }).filter(Boolean);
    } else {
      parsed.worldCities = [];
    }

    return parsed;
  } catch (e) {
    console.warn('Invalid share code format:', e);
    return null;
  }
}
