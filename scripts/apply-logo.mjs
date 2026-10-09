import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const logoSrcPath = path.resolve('public/logos/gezgin_hot_balloon_1791495767568.jpg').replace(/\\/g, '/');

const targets = [
  // Web / PWA
  { path: 'public/icon-512.png', width: 512, height: 512 },
  { path: 'public/icon-192.png', width: 192, height: 192 },
  { path: 'public/apple-touch-icon.png', width: 180, height: 180 },
  { path: 'public/favicon.png', width: 64, height: 64 },

  // iOS App Icon (1024x1024 single master)
  { path: 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png', width: 1024, height: 1024 },

  // Android standard & round launcher icons
  { path: 'android/app/src/main/res/mipmap-mdpi/ic_launcher.png', width: 48, height: 48 },
  { path: 'android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png', width: 48, height: 48, rounded: true },
  { path: 'android/app/src/main/res/mipmap-hdpi/ic_launcher.png', width: 72, height: 72 },
  { path: 'android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png', width: 72, height: 72, rounded: true },
  { path: 'android/app/src/main/res/mipmap-xhdpi/ic_launcher.png', width: 96, height: 96 },
  { path: 'android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png', width: 96, height: 96, rounded: true },
  { path: 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png', width: 144, height: 144 },
  { path: 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png', width: 144, height: 144, rounded: true },
  { path: 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png', width: 192, height: 192 },
  { path: 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png', width: 192, height: 192, rounded: true },

  // Android adaptive foreground icons (108dp canvas with safe zone)
  { path: 'android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png', width: 108, height: 108, adaptive: true },
  { path: 'android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png', width: 162, height: 162, adaptive: true },
  { path: 'android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png', width: 216, height: 216, adaptive: true },
  { path: 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png', width: 324, height: 324, adaptive: true },
  { path: 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png', width: 432, height: 432, adaptive: true },
];

async function generateAll() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Read base64 data of source logo
  const logoBuffer = fs.readFileSync(path.resolve('public/logos/gezgin_hot_balloon_1791495767568.jpg'));
  const base64Logo = `data:image/jpeg;base64,${logoBuffer.toString('base64')}`;

  // Analyze corner/bg color
  await page.setViewport({ width: 1024, height: 1024 });
  await page.setContent(`
    <html>
      <body style="margin:0;padding:0;overflow:hidden;">
        <canvas id="c" width="1024" height="1024"></canvas>
      </body>
    </html>
  `);

  const bgColorHex = await page.evaluate((src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const c = document.getElementById('c');
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        // sample top corner
        const p = ctx.getImageData(16, 16, 1, 1).data;
        const toHex = (n) => n.toString(16).padStart(2, '0');
        resolve(`#${toHex(p[0])}${toHex(p[1])}${toHex(p[2])}`.toUpperCase());
      };
      img.src = src;
    });
  }, base64Logo);

  console.log('Sampled dominant background color:', bgColorHex);

  // Update Android ic_launcher_background.xml
  const bgXmlPath = path.resolve('android/app/src/main/res/values/ic_launcher_background.xml');
  if (fs.existsSync(bgXmlPath)) {
    fs.writeFileSync(bgXmlPath, `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${bgColorHex}</color>\n</resources>\n`);
    console.log('Updated Android ic_launcher_background.xml with', bgColorHex);
  }

  // Generate each icon target
  for (const t of targets) {
    const fullPath = path.resolve(t.path);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    await page.setViewport({ width: t.width, height: t.height, deviceScaleFactor: 1 });

    if (t.rounded) {
      // Circle clip for round launcher
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;overflow:hidden;background:transparent;">
            <div style="width:${t.width}px;height:${t.height}px;border-radius:50%;overflow:hidden;">
              <img src="${base64Logo}" style="width:100%;height:100%;object-fit:cover;display:block;" />
            </div>
          </body>
        </html>
      `);
    } else if (t.adaptive) {
      // Adaptive foreground: logo sits centered in safe zone (about 70% of 108dp canvas)
      const innerSize = Math.round(t.width * 0.72);
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;overflow:hidden;background:transparent;display:flex;align-items:center;justify-content:center;width:${t.width}px;height:${t.height}px;">
            <div style="width:${innerSize}px;height:${innerSize}px;border-radius:${Math.round(innerSize * 0.22)}px;overflow:hidden;">
              <img src="${base64Logo}" style="width:100%;height:100%;object-fit:cover;display:block;" />
            </div>
          </body>
        </html>
      `);
    } else {
      // Full bleed square icon
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;overflow:hidden;background:transparent;">
            <img src="${base64Logo}" style="width:${t.width}px;height:${t.height}px;object-fit:cover;display:block;" />
          </body>
        </html>
      `);
    }

    await page.screenshot({ path: fullPath, type: 'png', omitBackground: true });
    console.log(`Generated: ${t.path} (${t.width}x${t.height})`);
  }

  // Also create a high quality SVG wrapper for favicon.svg / icon.svg
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <clipPath id="squircle">
    <rect width="512" height="512" rx="112" ry="112" />
  </clipPath>
  <image href="/icon-512.png" width="512" height="512" clip-path="url(#squircle)" />
</svg>
`;
  fs.writeFileSync(path.resolve('public/icon.svg'), svgContent);
  fs.writeFileSync(path.resolve('public/favicon.svg'), svgContent);
  console.log('Updated public/icon.svg and public/favicon.svg');

  await browser.close();
  console.log('All icons successfully applied from Logo #7 (Hot Air Balloon)!');
}

generateAll().catch(console.error);
