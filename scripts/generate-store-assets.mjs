/**
 * Gezgin — Otomatik Mağaza Vitrin Görselleri ve Banner Üretici
 * (Apple App Store 1290x2796, Google Play 1080x2400, Google Play Feature Graphic 1024x500)
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const PORT = 4173;
const DIST_DIR = path.resolve('dist');

// Hedef klasörler
const APP_STORE_DIR = path.resolve('magaza-gorselleri/app-store-1290x2796');
const APP_STORE_MEDIUM_DIR = path.resolve('magaza-gorselleri/app-store-1206x2622');
const GOOGLE_PLAY_DIR = path.resolve('magaza-gorselleri/google-play-1080x2400');
const FEATURE_GRAPHIC_DIR = path.resolve('magaza-gorselleri/google-play-feature-graphic');
const RAW_DIR = path.resolve('magaza-gorselleri/.temp-raw');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function startStaticServer() {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';

    const filePath = path.join(DIST_DIR, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      const indexFile = path.join(DIST_DIR, 'index.html');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync(indexFile));
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(filePath));
  });

  return new Promise((resolve) => {
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`[HTTP] Statik sunucu hazır: http://127.0.0.1:${PORT}`);
      resolve(server);
    });
  });
}

// 5 Vitrin Sahnesi Tanımları
const SCENES = [
  {
    id: '01-dunya-haritasi',
    badge: '🌍 DÜNYA HARİTASI',
    title: 'Gezdiğin Dünyayı Renklendir',
    subtitle: 'Ziyaret ettiğin ülkeleri haritana işle, seyahat oranını ve kıta istatistiklerini keşfet'
  },
  {
    id: '02-turkiye-ve-bolgeler',
    badge: '📍 İL VE BÖLGE DETAYLARI',
    title: 'Tüm Şehirleri ve Bölgeleri Keşfet',
    subtitle: '81 ilin detaylı haritası, ilçe ve eyaletler, hızlı seçim sihirbazı'
  },
  {
    id: '03-rozetler-ve-istatistikler',
    badge: '🏆 GEZGİN ROZETLERİ',
    title: 'İstatistiklerin & Pasaport Rozetlerin',
    subtitle: 'Kazanılan madalyalar, seyahat seviyesi ve kıta başarıları'
  },
  {
    id: '04-seyahat-butcesi',
    badge: '💰 SEYAHAT BÜTÇESİ',
    title: 'Anılarını ve Harcamalarını Kaydet',
    subtitle: 'Çoklu para birimli seyahat bütçesi, harcama grafikleri ve şehir notları'
  },
  {
    id: '05-harita-temalari',
    badge: '🎨 10 FARKLI TEMA',
    title: 'Kendi Harita Tarzını Yarat',
    subtitle: 'Gece, Retro, Atlas, Pastel... Haritan senin zevkini yansıtsın'
  }
];

// Mockup HTML Üretici Şablon
function renderMockupHtml({ scene, imageBase64, width, height, isGooglePlay = false }) {
  const isMediumIos = !isGooglePlay && width === 1206;
  const badgeFontSize = isGooglePlay ? '20px' : (isMediumIos ? '22px' : '24px');
  const badgePadding = isGooglePlay ? '8px 20px' : '10px 24px';
  const titleFontSize = isGooglePlay ? '50px' : (isMediumIos ? '58px' : '62px');
  const subFontSize = isGooglePlay ? '23px' : (isMediumIos ? '26px' : '28px');
  const headerPaddingTop = isGooglePlay ? '90px' : (isMediumIos ? '110px' : '120px');
  const headerPaddingBottom = isGooglePlay ? '22px' : '26px';

  // Telefon Kasa ve Ekran Ölçüleri
  const phoneWidth = isGooglePlay ? '790px' : (isMediumIos ? '870px' : '930px');
  const phoneRadius = isGooglePlay ? '48px' : (isMediumIos ? '52px' : '56px');
  const phoneBorder = isGooglePlay ? '10px' : '12px';
  const statusBarHeight = isGooglePlay ? '48px' : (isMediumIos ? '52px' : '56px');
  const statusBarPaddingX = isGooglePlay ? '30px' : (isMediumIos ? '34px' : '36px');
  const timeFontSize = isGooglePlay ? '18px' : (isMediumIos ? '20px' : '21px');
  const islandWidth = isGooglePlay ? '140px' : (isMediumIos ? '150px' : '160px');
  const islandHeight = isGooglePlay ? '30px' : (isMediumIos ? '32px' : '34px');
  const lensSize = isGooglePlay ? '10px' : '12px';
  const screenHeight = isGooglePlay ? '1680px' : (isMediumIos ? '1855px' : '1980px');
  const homeBarHeight = isGooglePlay ? '38px' : (isMediumIos ? '40px' : '44px');
  const indicatorWidth = isGooglePlay ? '140px' : (isMediumIos ? '150px' : '160px');
  const indicatorHeight = isGooglePlay ? '4.5px' : '5px';

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    body {
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #070b14;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      color: #ffffff;
    }

    /* Lüks Gezgin Arka Plan Atmosferi */
    .bg-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at 50% 15%, #1e293b 0%, #0f172a 50%, #060911 100%);
      z-index: 1;
    }
    .bg-glow-top {
      position: absolute;
      top: -150px;
      left: 50%;
      transform: translateX(-50%);
      width: 900px;
      height: 600px;
      background: radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, rgba(99, 102, 241, 0.12) 40%, transparent 70%);
      filter: blur(60px);
      z-index: 2;
      pointer-events: none;
    }
    .bg-grid-lines {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 80px 80px;
      z-index: 2;
      opacity: 0.7;
      mask-image: radial-gradient(circle at 50% 30%, black 40%, transparent 80%);
      -webkit-mask-image: radial-gradient(circle at 50% 30%, black 40%, transparent 80%);
    }

    /* Üst Metin Alanı */
    .header-zone {
      position: relative;
      z-index: 10;
      width: 90%;
      text-align: center;
      padding-top: ${headerPaddingTop};
      padding-bottom: ${headerPaddingBottom};
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: ${badgeFontSize};
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: ${badgePadding};
      border-radius: 999px;
      background: rgba(56, 189, 248, 0.12);
      border: 1.5px solid rgba(56, 189, 248, 0.35);
      color: #38bdf8;
      box-shadow: 0 4px 20px rgba(56, 189, 248, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      margin-bottom: 18px;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .scene-title {
      font-size: ${titleFontSize};
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: -1px;
      margin-bottom: 14px;
      background: linear-gradient(135deg, #ffffff 40%, #bae6fd 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    }

    .scene-sub {
      font-size: ${subFontSize};
      font-weight: 600;
      line-height: 1.35;
      color: #94a3b8;
      max-width: 88%;
      letter-spacing: -0.2px;
    }

    /* Akıllı Telefon Mockup */
    .mockup-wrapper {
      position: relative;
      z-index: 10;
      flex: 1;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      margin-top: 20px;
    }

    .phone-frame {
      width: ${phoneWidth};
      background: #000000;
      border: ${phoneBorder} solid #1e293b;
      border-radius: ${phoneRadius};
      position: relative;
      box-shadow: 
        0 40px 120px -10px rgba(0, 0, 0, 0.95),
        0 0 60px rgba(56, 189, 248, 0.18),
        inset 0 0 0 1.5px rgba(255, 255, 255, 0.12);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Üst Bağımsız Durum Çubuğu */
    .phone-status-bar {
      width: 100%;
      height: ${statusBarHeight};
      background: #000000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 ${statusBarPaddingX};
      box-sizing: border-box;
      flex-shrink: 0;
      z-index: 20;
    }

    .status-time {
      font-size: ${timeFontSize};
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.3px;
      min-width: 80px;
      text-align: left;
    }

    /* Dynamic Island / Kamera Hapı */
    .dynamic-island {
      width: ${islandWidth};
      height: ${islandHeight};
      background: #0c0f17;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 12px;
      box-shadow: inset 0 0 4px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6);
    }
    .island-lens {
      width: ${lensSize};
      height: ${lensSize};
      background: radial-gradient(circle at 35% 35%, #253347 0%, #030712 85%);
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 2px rgba(56, 189, 248, 0.3);
    }

    .status-icons {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 80px;
      justify-content: flex-end;
    }
    .status-svg {
      display: block;
    }

    /* Ekran Görüntüsü Görüntüleme Penceresi */
    .screen-viewport {
      width: 100%;
      height: ${screenHeight};
      overflow: hidden;
      background: #090d16;
      flex-shrink: 0;
      position: relative;
    }

    .phone-screen-img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      object-position: top;
      background: #090d16;
    }

    /* Alt Home Bar */
    .phone-home-bar {
      width: 100%;
      height: ${homeBarHeight};
      background: #000000;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .home-indicator {
      width: ${indicatorWidth};
      height: ${indicatorHeight};
      background: rgba(255, 255, 255, 0.45);
      border-radius: 999px;
    }
  </style>
</head>
<body>
  <div class="bg-canvas"></div>
  <div class="bg-glow-top"></div>
  <div class="bg-grid-lines"></div>

  <div class="header-zone">
    <div class="badge-pill">${scene.badge}</div>
    <h1 class="scene-title">${scene.title}</h1>
    <p class="scene-sub">${scene.subtitle}</p>
  </div>

  <div class="mockup-wrapper">
    <div class="phone-frame">
      <div class="phone-status-bar">
        <div class="status-time">09:41</div>
        <div class="dynamic-island">
          <div class="island-lens"></div>
        </div>
        <div class="status-icons">
          <svg class="status-svg" width="${isGooglePlay ? '17' : '20'}" height="${isGooglePlay ? '11' : '13'}" viewBox="0 0 19 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="9" width="3" height="4" rx="0.8" fill="#FFFFFF"/>
            <rect x="5" y="6" width="3" height="7" rx="0.8" fill="#FFFFFF"/>
            <rect x="10" y="3" width="3" height="10" rx="0.8" fill="#FFFFFF"/>
            <rect x="15" y="0" width="3" height="13" rx="0.8" fill="#FFFFFF"/>
          </svg>
          <svg class="status-svg" width="${isGooglePlay ? '16' : '19'}" height="${isGooglePlay ? '11' : '13'}" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 10.5C9.6 10.5 10.1 11 10.1 11.6C10.1 12.2 9.6 12.7 9 12.7C8.4 12.7 7.9 12.2 7.9 11.6C7.9 11 8.4 10.5 9 10.5Z" fill="#FFFFFF"/>
            <path d="M5.2 8C7.3 6.1 10.7 6.1 12.8 8" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
            <path d="M2 5C6 1.4 12 1.4 16 5" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg class="status-svg" width="${isGooglePlay ? '22' : '26'}" height="${isGooglePlay ? '10' : '12'}" viewBox="0 0 25 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.75" y="0.75" width="20.5" height="10.5" rx="3.25" stroke="#FFFFFF" stroke-width="1.5"/>
            <rect x="2.5" y="2.5" width="16" height="7" rx="1.8" fill="#FFFFFF"/>
            <path d="M23 4C23.6 4.4 24 5.1 24 6C24 6.9 23.6 7.6 23 8" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
      <div class="screen-viewport">
        <img src="${imageBase64}" class="phone-screen-img" alt="${scene.title}" />
      </div>
      <div class="phone-home-bar">
        <div class="home-indicator"></div>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

// Google Play Feature Graphic (1024x500) HTML Şablonu
function renderFeatureGraphicHtml({ iconBase64, phoneBase64 }) {
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    body {
      width: 1024px;
      height: 500px;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #070c18;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #ffffff;
      padding: 40px 60px;
    }
    .bg-layer {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 25% 40%, #1e293b 0%, #0f172a 50%, #070c18 100%);
      z-index: 1;
    }
    .bg-glow {
      position: absolute;
      top: -100px;
      left: 100px;
      width: 600px;
      height: 500px;
      background: radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 70%);
      filter: blur(50px);
      z-index: 2;
    }
    .bg-grid {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
      background-size: 50px 50px;
      z-index: 2;
      opacity: 0.6;
    }

    /* Sol Taraf: Marka & Başlık & Rozetler */
    .left-side {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 580px;
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .brand-icon-box {
      width: 88px;
      height: 88px;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 12px 30px rgba(0,0,0,0.6), 0 0 25px rgba(56,189,248,0.3);
      border: 2px solid rgba(255,255,255,0.18);
      flex-shrink: 0;
    }
    .brand-icon-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .brand-titles {
      display: flex;
      flex-direction: column;
    }
    .main-title {
      font-size: 56px;
      font-weight: 900;
      line-height: 1.05;
      letter-spacing: -1.5px;
      background: linear-gradient(135deg, #ffffff 40%, #38bdf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      font-size: 21px;
      font-weight: 700;
      color: #94a3b8;
      margin-top: 4px;
      letter-spacing: -0.3px;
    }

    .chips-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.14);
      padding: 8px 14px;
      border-radius: 999px;
      font-size: 13.5px;
      font-weight: 700;
      color: #f1f5f9;
      backdrop-filter: blur(8px);
    }
    .chip.highlight {
      background: rgba(56, 189, 248, 0.16);
      border-color: rgba(56, 189, 248, 0.4);
      color: #38bdf8;
    }

    /* Sağ Taraf: Eğimli Telefon Mockup */
    .right-side {
      position: relative;
      z-index: 10;
      width: 320px;
      height: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
    }
    .angled-phone {
      width: 280px;
      background: #090d16;
      border: 6px solid #1e293b;
      border-radius: 36px;
      overflow: hidden;
      box-shadow: 
        -20px 25px 60px rgba(0,0,0,0.8),
        0 0 40px rgba(56,189,248,0.2),
        inset 0 0 0 1px rgba(255,255,255,0.15);
      transform: rotate(-6deg) translateY(20px);
    }
    .angled-phone img {
      width: 100%;
      height: auto;
      display: block;
    }
  </style>
</head>
<body>
  <div class="bg-layer"></div>
  <div class="bg-glow"></div>
  <div class="bg-grid"></div>

  <div class="left-side">
    <div class="brand-row">
      <div class="brand-icon-box">
        <img src="${iconBase64}" alt="Gezgin Logo" />
      </div>
      <div class="brand-titles">
        <h1 class="main-title">Gezgin</h1>
        <div class="subtitle">İnteraktif Seyahat Haritası & Günlüğü</div>
      </div>
    </div>

    <div class="chips-row">
      <div class="chip highlight">🌍 200+ Ülke & 81 İl</div>
      <div class="chip">🛂 Sanal Pasaport & Mühürler</div>
      <div class="chip">🏆 3D Başarı Rozetleri</div>
      <div class="chip highlight">💰 Seyahat Bütçesi</div>
      <div class="chip">🔒 %100 Çevrimdışı & Güvenli</div>
    </div>
  </div>

  <div class="right-side">
    <div class="angled-phone">
      <img src="${phoneBase64}" alt="Gezgin Ekran" />
    </div>
  </div>
</body>
</html>
`;
}

async function main() {
  console.log('=== GEZGİN MAĞAZA GÖRSELLERİ ÜRETİMİ BAŞLADI ===\n');

  // Dizinleri oluştur
  [APP_STORE_DIR, APP_STORE_MEDIUM_DIR, GOOGLE_PLAY_DIR, FEATURE_GRAPHIC_DIR, RAW_DIR].forEach((dir) => {
    fs.mkdirSync(dir, { recursive: true });
  });

  const server = await startStaticServer();
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  // iPhone 15 Pro Max çözünürlük oranı: 430 x 932 @ 2.5x -> 1075 x 2330
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2.5 });

  // 1. Zengin Seyahat Verilerini LocalStorage'a yükle
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('gv_logged_in', '1');
    localStorage.setItem('gv_data_owner_key', '__guest__');
    localStorage.setItem('gv_privacy_agreed', '1');
    localStorage.setItem('gv_onboarded', '1');
    localStorage.setItem('gv_lang', 'tr');
    localStorage.setItem('gv_profile', JSON.stringify({
      username: 'Baran Gezgin',
      displayName: 'Baran Gezgin',
      avatar: '🧭',
      bio: 'Dünyayı geziyor, anılar biriktiriyorum ✈️',
      isGuest: true
    }));
    localStorage.setItem('gittigim_yerler_profile_v2', JSON.stringify({
      name: 'Baran Gezgin',
      bio: 'Dünyayı geziyor, anılar biriktiriyorum ✈️'
    }));

    // Türkiye Ziyaretleri (8 İl, harcama kayıtlarıyla)
    localStorage.setItem('gittigim_yerler_turkey_v2', JSON.stringify({
      '34': { status: 'visited', rating: 5, date: '2024-05-10', notes: 'Boğaz manzarası ve Tarihi Yarımada.', expenses: [{ amount: 1450, currency: 'TRY', category: 'food', note: 'Karaköy Akşam Yemeği' }, { amount: 850, currency: 'TRY', category: 'activity', note: 'Müze Kartı' }] },
      '06': { status: 'visited', rating: 5, date: '2023-10-29', notes: 'Anıtkabir ziyareti ve Kızılay turu.', expenses: [{ amount: 650, currency: 'TRY', category: 'food', note: 'Aspava Kebap' }] },
      '35': { status: 'visited', rating: 5, date: '2024-07-15', notes: 'Kordon boyu, Alsancak ve Saat Kulesi.', expenses: [{ amount: 2400, currency: 'TRY', category: 'stay', note: 'Alsancak Butik Otel' }] },
      '07': { status: 'visited', rating: 5, date: '2024-08-20', notes: 'Kaleiçi, Konyaaltı ve Kaş plajları.', expenses: [{ amount: 4800, currency: 'TRY', category: 'stay', note: 'Kaş Pansiyon' }, { amount: 1500, currency: 'TRY', category: 'activity', note: 'Kekova Tekne Turu' }] },
      '48': { status: 'visited', rating: 5, date: '2024-09-05', notes: 'Ölüdeniz Belcekız ve Fethiye koyları.', expenses: [{ amount: 3500, currency: 'TRY', category: 'activity', note: 'Babadağ Yamaç Paraşütü' }] },
      '16': { status: 'visited', rating: 4, date: '2023-12-12', notes: 'Uludağ kayak merkezi ve İskender.', expenses: [{ amount: 750, currency: 'TRY', category: 'food', note: 'Tarihi İskender' }] },
      '50': { status: 'visited', rating: 5, date: '2024-04-18', notes: 'Kapadokya peri bacaları ve gün doğumu balonu.', expenses: [{ amount: 5500, currency: 'TRY', category: 'activity', note: 'Sıcak Hava Balon Turu' }, { amount: 3200, currency: 'TRY', category: 'stay', note: 'Göreme Mağara Otel' }] },
      '61': { status: 'visited', rating: 4, date: '2024-06-22', notes: 'Sümela Manastırı ve Uzungöl doğası.', expenses: [{ amount: 950, currency: 'TRY', category: 'transport', note: 'Araç Kiralama' }] }
    }));

    // Dünya Ziyaretleri (12 Ülke, farklı para birimleri ve harcamalarla)
    localStorage.setItem('gittigim_yerler_world_v2', JSON.stringify({
      TR: { status: 'visited', date: '2024-05-10', notes: 'Memleket' },
      IT: { status: 'visited', rating: 5, date: '2024-06-15', notes: 'Roma Kolezyum ve Floransa kanalları.', expenses: [{ amount: 420, currency: 'EUR', category: 'stay', note: 'Roma Otel' }, { amount: 180, currency: 'EUR', category: 'food', note: 'Trastevere Akşam Yemeği' }] },
      FR: { status: 'visited', rating: 5, date: '2023-11-04', notes: 'Paris Eyfel Kulesi ve Louvre.', expenses: [{ amount: 390, currency: 'EUR', category: 'stay', note: 'Montmartre Otel' }, { amount: 140, currency: 'EUR', category: 'food', note: 'Fransız Mutfağı' }] },
      ES: { status: 'visited', rating: 5, date: '2024-02-14', notes: 'Barselona Sagrada Familia.', expenses: [{ amount: 310, currency: 'EUR', category: 'stay', note: 'Barselona Konaklama' }, { amount: 110, currency: 'EUR', category: 'food', note: 'Tapas & Paella' }] },
      DE: { status: 'visited', rating: 4, date: '2023-09-18', notes: 'Berlin Brandenburg Kapısı.', expenses: [{ amount: 260, currency: 'EUR', category: 'transport', note: 'ICE Hızlı Tren' }] },
      GR: { status: 'visited', rating: 5, date: '2024-08-10', notes: 'Atina Akropolis ve Santorini.', expenses: [{ amount: 360, currency: 'EUR', category: 'stay', note: 'Santorini Otel' }] },
      JP: { status: 'visited', rating: 5, date: '2024-03-25', notes: 'Tokyo Şibuya ve Kyoto tapınakları.', expenses: [{ amount: 55000, currency: 'JPY', category: 'transport', note: 'Shinkansen Mermi Tren' }, { amount: 68000, currency: 'JPY', category: 'stay', note: 'Tokyo Otel' }] },
      US: { status: 'visited', rating: 5, date: '2023-07-20', notes: 'New York Manhattan.', expenses: [{ amount: 680, currency: 'USD', category: 'stay', note: 'Manhattan Otel' }, { amount: 210, currency: 'USD', category: 'activity', note: 'Broadway Gösterisi' }] },
      EG: { status: 'visited', rating: 5, date: '2024-01-12', notes: 'Gize Piramitleri ve Nil Nehri.', expenses: [{ amount: 240, currency: 'USD', category: 'activity', note: 'Özel Piramit Turu' }] },
      NO: { status: 'visited', rating: 5, date: '2024-01-28', notes: 'Tromsø Kuzey Işıkları (Aurora).', expenses: [{ amount: 520, currency: 'EUR', category: 'activity', note: 'Kuzey Işıkları Safarisi' }] },
      BR: { status: 'visited', rating: 4, date: '2023-05-02', notes: 'Rio de Janeiro Kurtarıcı İsa.', expenses: [{ amount: 340, currency: 'USD', category: 'stay', note: 'Copacabana Otel' }] },
      NL: { status: 'visited', rating: 5, date: '2023-10-15', notes: 'Amsterdam kanalları.', expenses: [{ amount: 190, currency: 'EUR', category: 'activity', note: 'Kanal Turu' }] }
    }));
  });

  console.log('[1/4] Uygulama yükleniyor...');
  await page.goto(`http://127.0.0.1:${PORT}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#leaflet-map', { timeout: 12000 });
  await new Promise((r) => setTimeout(r, 2000));

  const rawScreens = [];

  // --- SAHNE 1: DÜNYA HARİTASI ---
  console.log('[2/4] Ekran 1 yakalanıyor: Renkli Dünya Haritası...');
  await page.evaluate(() => {
    if (window.__leafletMapInstance) {
      window.__leafletMapInstance.setView([25, 12], 2.4, { animate: false });
    }
  });
  await new Promise((r) => setTimeout(r, 1200));
  const rawPath1 = path.join(RAW_DIR, 'raw-01.png');
  await page.screenshot({ path: rawPath1 });
  rawScreens.push(rawPath1);

  // --- SAHNE 2: TÜRKİYE İL HARİTASI ---
  console.log('[2/4] Ekran 2 yakalanıyor: Türkiye İl Haritası...');
  await page.evaluate(() => {
    if (window.__leafletMapInstance) {
      window.__leafletMapInstance.fitBounds([[35.6, 25.4], [42.4, 44.9]], { animate: false });
    }
  });
  await new Promise((r) => setTimeout(r, 1500));
  const rawPath2 = path.join(RAW_DIR, 'raw-02.png');
  await page.screenshot({ path: rawPath2 });
  rawScreens.push(rawPath2);

  // --- SAHNE 3: GEZGİN PROFİLİ VE ROZETLER / MADALYALAR ---
  console.log('[2/4] Ekran 3 yakalanıyor: Rozetler ve Madalyalar...');
  await page.evaluate(() => {
    const btn = document.querySelector('.floating-profile-btn') || document.getElementById('btn-open-profile');
    if (btn) btn.click();
  });
  await page.waitForSelector('#profile-content-area', { timeout: 6000 });
  await new Promise((r) => setTimeout(r, 600));

  // Madalyalar sekmesine geç
  await page.evaluate(() => {
    const medalsTab = document.querySelector('.ptab[data-tab="medals"]');
    if (medalsTab) medalsTab.click();
  });
  await new Promise((r) => setTimeout(r, 1000));
  const rawPath3 = path.join(RAW_DIR, 'raw-03.png');
  await page.screenshot({ path: rawPath3 });
  rawScreens.push(rawPath3);

  // --- SAHNE 4: SEYAHAT BÜTÇESİ & HARCAMALAR ---
  console.log('[2/4] Ekran 4 yakalanıyor: Seyahat Bütçesi ve Harcamalar...');
  await page.evaluate(() => {
    const profileTab = document.querySelector('.ptab[data-tab="profile"]');
    if (profileTab) profileTab.click();
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.evaluate(() => {
    const card = document.getElementById('profile-budget-showcase');
    const scrollContainer = document.getElementById('profile-content-area');
    if (card && scrollContainer) {
      scrollContainer.scrollTop = card.offsetTop - 30;
    }
  });
  await new Promise((r) => setTimeout(r, 800));
  const rawPath4 = path.join(RAW_DIR, 'raw-04.png');
  await page.screenshot({ path: rawPath4 });
  rawScreens.push(rawPath4);

  // --- SAHNE 5: HARİTA TEMALARI (TEMA STÜDYOSU) ---
  console.log('[2/4] Ekran 5 yakalanıyor: 10 Farklı Harita Teması...');
  await page.evaluate(() => {
    const settingsTab = document.querySelector('.ptab[data-tab="settings"]');
    if (settingsTab) settingsTab.click();
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.evaluate(() => {
    const themesGrid = document.querySelector('.settings-themes-grid');
    const scrollContainer = document.getElementById('profile-content-area');
    if (themesGrid && scrollContainer) {
      scrollContainer.scrollTop = themesGrid.offsetTop - 80;
    }
  });
  await new Promise((r) => setTimeout(r, 800));
  const rawPath5 = path.join(RAW_DIR, 'raw-05.png');
  await page.screenshot({ path: rawPath5 });
  rawScreens.push(rawPath5);

  console.log('Tüm 5 ham ekran görüntüsü başarıyla alındı!');

  // Mockup Sayfası
  const mockupPage = await browser.newPage();

  // 3. App Store Formatı (1290x2796)
  console.log('\n[3/4] Apple App Store (1290x2796) vitrin görselleri üretiliyor...');
  await mockupPage.setViewport({ width: 1290, height: 2796, deviceScaleFactor: 1 });

  for (let i = 0; i < SCENES.length; i++) {
    const scene = SCENES[i];
    const rawBuffer = fs.readFileSync(rawScreens[i]);
    const base64Img = `data:image/png;base64,${rawBuffer.toString('base64')}`;

    const html = renderMockupHtml({
      scene,
      imageBase64: base64Img,
      width: 1290,
      height: 2796,
      isGooglePlay: false
    });

    await mockupPage.setContent(html, { waitUntil: 'load' });
    await new Promise((r) => setTimeout(r, 400));

    const outPath = path.join(APP_STORE_DIR, `${scene.id}.png`);
    await mockupPage.screenshot({ path: outPath, type: 'png' });
    console.log(`  ✓ [App Store] ${scene.id}.png hazır`);
  }

  // 3b. App Store Medium Display Formatı (1206x2622 - iPhone with Dynamic Island)
  console.log('\n[3/4] Apple App Store (1206x2622) vitrin görselleri üretiliyor...');
  await mockupPage.setViewport({ width: 1206, height: 2622, deviceScaleFactor: 1 });

  for (let i = 0; i < SCENES.length; i++) {
    const scene = SCENES[i];
    const rawBuffer = fs.readFileSync(rawScreens[i]);
    const base64Img = `data:image/png;base64,${rawBuffer.toString('base64')}`;

    const html = renderMockupHtml({
      scene,
      imageBase64: base64Img,
      width: 1206,
      height: 2622,
      isGooglePlay: false
    });

    await mockupPage.setContent(html, { waitUntil: 'load' });
    await new Promise((r) => setTimeout(r, 400));

    const outPath = path.join(APP_STORE_MEDIUM_DIR, `${scene.id}.png`);
    await mockupPage.screenshot({ path: outPath, type: 'png' });
    console.log(`  ✓ [App Store Medium] ${scene.id}.png hazır`);
  }

  // 4. Google Play Formatı (1080x2400)
  console.log('\n[3/4] Google Play (1080x2400) vitrin görselleri üretiliyor...');
  await mockupPage.setViewport({ width: 1080, height: 2400, deviceScaleFactor: 1 });

  for (let i = 0; i < SCENES.length; i++) {
    const scene = SCENES[i];
    const rawBuffer = fs.readFileSync(rawScreens[i]);
    const base64Img = `data:image/png;base64,${rawBuffer.toString('base64')}`;

    const html = renderMockupHtml({
      scene,
      imageBase64: base64Img,
      width: 1080,
      height: 2400,
      isGooglePlay: true
    });

    await mockupPage.setContent(html, { waitUntil: 'load' });
    await new Promise((r) => setTimeout(r, 400));

    const outPath = path.join(GOOGLE_PLAY_DIR, `${scene.id}.png`);
    await mockupPage.screenshot({ path: outPath, type: 'png' });
    console.log(`  ✓ [Google Play] ${scene.id}.png hazır`);
  }

  // 5. Google Play Feature Graphic (1024x500)
  console.log('\n[4/4] Google Play Feature Graphic (1024x500) banner üretiliyor...');
  await mockupPage.setViewport({ width: 1024, height: 500, deviceScaleFactor: 1 });

  const logoBuffer = fs.readFileSync(path.resolve('public/icon-512.png'));
  const iconBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  const phone1Buffer = fs.readFileSync(rawScreens[0]);
  const phoneBase64 = `data:image/png;base64,${phone1Buffer.toString('base64')}`;

  const featureHtml = renderFeatureGraphicHtml({ iconBase64, phoneBase64 });
  await mockupPage.setContent(featureHtml, { waitUntil: 'load' });
  await new Promise((r) => setTimeout(r, 500));

  const featureOutPath = path.join(FEATURE_GRAPHIC_DIR, 'feature-graphic-1024x500.png');
  await mockupPage.screenshot({ path: featureOutPath, type: 'png' });
  console.log(`  ✓ [Feature Graphic] feature-graphic-1024x500.png hazır`);

  // Temizlik
  await browser.close();
  server.close();

  console.log('\n=== TÜM MAĞAZA GÖRSELLERİ BAŞARIYLA ÜRETİLDİ VE ARŞİVLENDİ! ===\n');
}

main().catch((err) => {
  console.error('Kritik Hata:', err);
  process.exit(1);
});
