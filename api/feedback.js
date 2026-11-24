const ALLOWED_ORIGINS = [
  /^https:\/\/gittigim-yerler(-[a-z0-9-]+)?\.vercel\.app$/,
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^capacitor:\/\/localhost$/,
  /^ionic:\/\/localhost$/
];

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const ipRateLimitMap = new Map();

function isAllowedOrigin(origin) {
  return typeof origin === 'string' && ALLOWED_ORIGINS.some((re) => re.test(origin));
}

function getClientIp(req) {
  const fwd = req.headers?.['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.trim()) {
    return fwd.split(',')[0].trim();
  }
  return req.headers?.['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(ip, now = Date.now()) {
  if (ipRateLimitMap.size > 500) {
    for (const [k, entry] of ipRateLimitMap.entries()) {
      if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
        ipRateLimitMap.delete(k);
      }
    }
  }
  const entry = ipRateLimitMap.get(ip);
  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    ipRateLimitMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  entry.count += 1;
  return false;
}

export default async function handler(req, res) {
  // CORS & Origin verification for Mobile & Web clients
  const origin = req.headers?.origin;
  if (origin) {
    if (!isAllowedOrigin(origin)) {
      return res.status(403).json({ error: 'Origin not allowed' });
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (isRateLimited(getClientIp(req))) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  try {
    const { type, message, contact, username } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const cleanMsg = String(message).trim().slice(0, 1000);
    const cleanContact = contact ? String(contact).trim().slice(0, 120) : 'Belirtilmedi';
    const cleanUsername = username ? String(username).trim().slice(0, 60) : 'Gezgin';
    const cleanType = ['bug', 'feature', 'suggestion'].includes(type) ? type : 'suggestion';

    const typeLabel = cleanType === 'bug' ? '🐞 Hata / Bug' : (cleanType === 'feature' ? '✨ Yeni Özellik İsteği' : '💡 Öneri / Tavsiye');
    const nowStr = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

    const rawId = (req.body && typeof req.body.id === 'string') ? req.body.id.trim() : '';
    const cleanId = /^[a-zA-Z0-9_-]{3,50}$/.test(rawId) ? rawId : ('fb_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8));

    // Escape HTML for safe Telegram rendering (prevents Markdown parsing failures)
    const esc = (t) => String(t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const telegramText = `📬 <b>Yeni Gezgin Bildirimi!</b>\n\n🆔 <b>ID:</b> <code>${esc(cleanId)}</code>\n🏷️ <b>Tür:</b> ${esc(typeLabel)}\n👤 <b>Kullanıcı:</b> ${esc(cleanUsername)}\n📱 <b>İletişim:</b> ${esc(cleanContact)}\n\n📝 <b>Mesaj:</b>\n${esc(cleanMsg)}\n\n🕒 <b>Zaman:</b> ${esc(nowStr)}`;

    const botToken = process.env.TELEGRAM_BOT_TOKEN || '8842381582:AAH_tgTR4uAudrcIQ1SCbgRzcear3wfP2cU';
    const chatId = process.env.TELEGRAM_CHAT_ID || '7906240525';

    const tgResp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramText,
        parse_mode: 'HTML'
      })
    });

    const tgData = await tgResp.json();
    if (!tgData.ok) {
      console.error('Telegram dispatch failed:', tgData);
      return res.status(502).json({ error: 'Telegram dispatch failed', details: tgData.description });
    }

    // Also persist to Firestore 'feedbacks' collection for cross-device developer mode
    try {
      const nowIso = new Date().toISOString();
      await fetch(`https://firestore.googleapis.com/v1/projects/gezgin-app-c269d/databases/(default)/documents/feedbacks/${encodeURIComponent(cleanId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            id: { stringValue: cleanId },
            type: { stringValue: cleanType },
            message: { stringValue: cleanMsg },
            contact: { stringValue: cleanContact },
            username: { stringValue: cleanUsername },
            status: { stringValue: 'pending' },
            devResponse: { stringValue: '' },
            synced: { booleanValue: true },
            createdAt: { stringValue: nowIso },
            updatedAt: { stringValue: nowIso }
          }
        })
      });
    } catch (fsErr) {
      console.warn('Firestore write in serverless feedback handler failed:', fsErr);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Feedback API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
