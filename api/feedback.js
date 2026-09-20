export default async function handler(req, res) {
  // CORS for Mobile & Web clients
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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

    const cleanId = (req.body && req.body.id) ? String(req.body.id).trim().slice(0, 50) : ('fb_' + Date.now());

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

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Feedback API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
