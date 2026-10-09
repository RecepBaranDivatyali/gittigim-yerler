import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const logoSrcPath = path.resolve('public/logos/gezgin_hot_balloon_1791495767568.jpg');
const logoBuffer = fs.readFileSync(logoSrcPath);
const base64Logo = `data:image/jpeg;base64,${logoBuffer.toString('base64')}`;

async function generate() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // 1. Google Play Store 512x512 Icon
  console.log('Generating Google Play Store 512x512 icons...');
  await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;overflow:hidden;background:#090d16;">
        <img src="${base64Logo}" style="width:512px;height:512px;object-fit:cover;display:block;" />
      </body>
    </html>
  `);
  const playStoreIconPath = path.resolve('google-play-store-icon-512x512.png');
  await page.screenshot({ path: playStoreIconPath, type: 'png' });
  console.log('Created:', playStoreIconPath);

  // 2. Google Play Feature Graphic (1024x500)
  console.log('Generating Google Play 1024x500 Feature Graphic...');
  await page.setViewport({ width: 1024, height: 500, deviceScaleFactor: 1 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&display=swap" rel="stylesheet">
      </head>
      <body style="margin:0;padding:0;overflow:hidden;background:linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e293b 100%);font-family:'Plus Jakarta Sans',sans-serif;color:#ffffff;display:flex;align-items:center;justify-content:center;height:500px;width:1024px;">
        <div style="display:flex;align-items:center;gap:48px;padding:40px;">
          <div style="width:280px;height:280px;border-radius:64px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.6);border:2px solid rgba(255,255,255,0.15);">
            <img src="${base64Logo}" style="width:100%;height:100%;object-fit:cover;display:block;" />
          </div>
          <div>
            <div style="font-size:3.5rem;font-weight:900;letter-spacing:-1px;background:linear-gradient(90deg, #f8fafc, #38bdf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1.1;">
              Gezgin
            </div>
            <div style="font-size:1.4rem;font-weight:700;color:#94a3b8;margin-top:12px;letter-spacing:0.5px;">
              İnteraktif Seyahat Haritası & Günlüğü
            </div>
            <div style="margin-top:20px;display:flex;gap:12px;">
              <span style="background:rgba(56,189,248,0.15);color:#38bdf8;padding:8px 16px;border-radius:20px;font-size:0.95rem;font-weight:700;border:1px solid rgba(56,189,248,0.3);">🌍 81 İl & Dünya</span>
              <span style="background:rgba(16,185,129,0.15);color:#34d399;padding:8px 16px;border-radius:20px;font-size:0.95rem;font-weight:700;border:1px solid rgba(16,185,129,0.3);">🎖️ 84 Başarı Madalyası</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
  const featureGraphicPath = path.resolve('google-play-feature-graphic-1024x500.png');
  await page.screenshot({ path: featureGraphicPath, type: 'png' });
  console.log('Created:', featureGraphicPath);

  // 3. Android Splash Screens
  console.log('Updating Android splash screens...');
  const androidSplashes = [
    { p: 'android/app/src/main/res/drawable/splash.png', w: 480, h: 800 },
    { p: 'android/app/src/main/res/drawable-port-mdpi/splash.png', w: 320, h: 480 },
    { p: 'android/app/src/main/res/drawable-port-hdpi/splash.png', w: 480, h: 800 },
    { p: 'android/app/src/main/res/drawable-port-xhdpi/splash.png', w: 720, h: 1280 },
    { p: 'android/app/src/main/res/drawable-port-xxhdpi/splash.png', w: 960, h: 1600 },
    { p: 'android/app/src/main/res/drawable-port-xxxhdpi/splash.png', w: 1280, h: 1920 },
    { p: 'android/app/src/main/res/drawable-land-mdpi/splash.png', w: 480, h: 320 },
    { p: 'android/app/src/main/res/drawable-land-hdpi/splash.png', w: 800, h: 480 },
    { p: 'android/app/src/main/res/drawable-land-xhdpi/splash.png', w: 1280, h: 720 },
    { p: 'android/app/src/main/res/drawable-land-xxhdpi/splash.png', w: 1600, h: 960 },
    { p: 'android/app/src/main/res/drawable-land-xxxhdpi/splash.png', w: 1920, h: 1280 },
  ];

  for (const s of androidSplashes) {
    const fullPath = path.resolve(s.p);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    await page.setViewport({ width: s.w, height: s.h, deviceScaleFactor: 1 });
    const logoSize = Math.round(Math.min(s.w, s.h) * 0.38);
    const radius = Math.round(logoSize * 0.22);

    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;overflow:hidden;background:#090d16;display:flex;align-items:center;justify-content:center;width:${s.w}px;height:${s.h}px;">
          <div style="display:flex;flex-direction:column;align-items:center;gap:18px;">
            <div style="width:${logoSize}px;height:${logoSize}px;border-radius:${radius}px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,0.6);border:1.5px solid rgba(255,255,255,0.12);">
              <img src="${base64Logo}" style="width:100%;height:100%;object-fit:cover;display:block;" />
            </div>
            <div style="font-family:sans-serif;font-size:${Math.round(logoSize * 0.18)}px;font-weight:800;color:#f8fafc;letter-spacing:1px;">
              Gezgin
            </div>
          </div>
        </body>
      </html>
    `);

    await page.screenshot({ path: fullPath, type: 'png' });
    console.log(`Generated: ${s.p}`);
  }

  // 4. iOS Splash Screens (2732x2732)
  console.log('Updating iOS splash screens...');
  const iosSplashes = [
    'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png',
    'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-1.png',
    'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-2.png'
  ];

  await page.setViewport({ width: 2732, height: 2732, deviceScaleFactor: 1 });
  const iosLogoSize = 650;
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;overflow:hidden;background:#090d16;display:flex;align-items:center;justify-content:center;width:2732px;height:2732px;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:40px;">
          <div style="width:${iosLogoSize}px;height:${iosLogoSize}px;border-radius:150px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,0.6);border:3px solid rgba(255,255,255,0.15);">
            <img src="${base64Logo}" style="width:100%;height:100%;object-fit:cover;display:block;" />
          </div>
          <div style="font-family:sans-serif;font-size:80px;font-weight:800;color:#f8fafc;letter-spacing:3px;">
            Gezgin
          </div>
        </div>
      </body>
    </html>
  `);

  for (const p of iosSplashes) {
    const fullPath = path.resolve(p);
    await page.screenshot({ path: fullPath, type: 'png' });
    console.log(`Generated: ${p}`);
  }

  await browser.close();
  console.log('All store graphics and splash screens successfully generated!');
}

generate().catch(console.error);
