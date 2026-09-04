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

    const telegramText = `📬 *Yeni Gezgin Bildirimi!*\n\n🏷️ *Tür:* ${typeLabel}\n👤 *Kullanıcı:* ${cleanUsername}\n📱 *İletişim:* ${cleanContact}\n\n📝 *Mesaj:*\n"${cleanMsg}"\n\n🕒 *Zaman:* ${nowStr}`;

    const botToken = process.env.TELEGRAM_BOT_TOKEN || '8842381582:AAH_tgTR4uAudrcIQ1SCbgRzcear3wfP2cU';
    const chatId = process.env.TELEGRAM_CHAT_ID || '7906240525';

    const tgResp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramText,
        parse_mode: 'Markdown'
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
