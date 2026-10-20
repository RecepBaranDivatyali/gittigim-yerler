import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const targets = [
  // Web / PWA (Full-bleed so OS/CSS masks cleanly without double borders)
  { path: 'public/icon-512.png', width: 512, height: 512 },
  { path: 'public/icon-192.png', width: 192, height: 192 },
  { path: 'public/apple-touch-icon.png', width: 180, height: 180 },

  // Browser Favicon (Pre-clipped squircle with 100% transparent corners for browser tabs)
  { path: 'public/favicon.png', width: 64, height: 64, squircle: true },

  // iOS App Icon (1024x1024 single master - Apple requires full-bleed square without alpha)
  { path: 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png', width: 1024, height: 1024 },

  // Android standard & round launcher icons
  { path: 'android/app/src/main/res/mipmap-mdpi/ic_launcher.png', width: 48, height: 48, squircle: true },
  { path: 'android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png', width: 48, height: 48, rounded: true },
  { path: 'android/app/src/main/res/mipmap-hdpi/ic_launcher.png', width: 72, height: 72, squircle: true },
  { path: 'android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png', width: 72, height: 72, rounded: true },
  { path: 'android/app/src/main/res/mipmap-xhdpi/ic_launcher.png', width: 96, height: 96, squircle: true },
  { path: 'android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png', width: 96, height: 96, rounded: true },
  { path: 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png', width: 144, height: 144, squircle: true },
  { path: 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png', width: 144, height: 144, rounded: true },
  { path: 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png', width: 192, height: 192, squircle: true },
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

  // Read source logo and build clean full-bleed & squircle masters without outer mockup borders
  const rawBuffer = fs.readFileSync(path.resolve('public/logos/gezgin_hot_balloon_1791495767568.jpg'));
  const rawBase64 = `data:image/jpeg;base64,${rawBuffer.toString('base64')}`;

  await page.setViewport({ width: 1024, height: 1024, deviceScaleFactor: 1 });
  await page.setContent(`
    <html>
      <body style="margin:0;padding:0;background:transparent;overflow:hidden;">
        <canvas id="c" width="1024" height="1024"></canvas>
      </body>
    </html>
  `);

  const { fullBleedDataUrl, squircleDataUrl, bgColorHex } = await page.evaluate((src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const c = document.getElementById('c');
        const ctx = c.getContext('2d');

        // 1. Build Squircle Master (zero mockup border, transparent corners)
        ctx.clearRect(0, 0, 1024, 1024);
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(0, 0, 1024, 1024, 228);
        ctx.clip();
        ctx.drawImage(img, 186, 183, 652, 652, 0, 0, 1024, 1024);
        ctx.restore();
        const squircleDataUrl = c.toDataURL('image/png');

        // 2. Build Full-Bleed Master (100% edge-to-edge, zero borders)
        ctx.clearRect(0, 0, 1024, 1024);
        ctx.drawImage(img, 204, 198, 616, 616, 0, 0, 1024, 1024);
        const imgData = ctx.getImageData(0, 0, 1024, 1024);
        const data = imgData.data;

        const cornerR = 145;
        for (let y = 0; y < cornerR; y++) {
          const dy = cornerR - y;
          const safeX = Math.ceil(cornerR - Math.sqrt(Math.max(0, cornerR * cornerR - dy * dy))) + 15;
          const lIdx = (y * 1024 + safeX) * 4;
          for (let x = 0; x < safeX; x++) {
            const idx = (y * 1024 + x) * 4;
            data[idx] = data[lIdx];
            data[idx + 1] = data[lIdx + 1];
            data[idx + 2] = data[lIdx + 2];
            data[idx + 3] = 255;
          }
          const rSafeX = 1023 - safeX;
          const rIdx = (y * 1024 + rSafeX) * 4;
          for (let x = rSafeX + 1; x < 1024; x++) {
            const idx = (y * 1024 + x) * 4;
            data[idx] = data[rIdx];
            data[idx + 1] = data[rIdx + 1];
            data[idx + 2] = data[rIdx + 2];
            data[idx + 3] = 255;
          }
        }

        for (let y = 1024 - cornerR; y < 1024; y++) {
          const dy = y - (1023 - cornerR);
          const safeX = Math.ceil(cornerR - Math.sqrt(Math.max(0, cornerR * cornerR - dy * dy))) + 15;
          for (let x = 0; x < safeX; x++) {
            const step = safeX - x;
            const srcX = safeX + 4;
            const srcY = Math.max(0, y - Math.round(step * 0.55));
            const sIdx = (srcY * 1024 + srcX) * 4;
            const idx = (y * 1024 + x) * 4;
            data[idx] = data[sIdx];
            data[idx + 1] = data[sIdx + 1];
            data[idx + 2] = data[sIdx + 2];
            data[idx + 3] = 255;
          }
          const rSafeX = 1023 - safeX;
          for (let x = rSafeX + 1; x < 1024; x++) {
            const step = x - rSafeX;
            const srcX = rSafeX - 4;
            const srcY = Math.max(0, y - Math.round(step * 0.55));
            const sIdx = (srcY * 1024 + srcX) * 4;
            const idx = (y * 1024 + x) * 4;
            data[idx] = data[sIdx];
            data[idx + 1] = data[sIdx + 1];
            data[idx + 2] = data[sIdx + 2];
            data[idx + 3] = 255;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const fullBleedDataUrl = c.toDataURL('image/png');

        // Sample top sky color for Android adaptive icon background
        const p = ctx.getImageData(512, 32, 1, 1).data;
        const toHex = (n) => n.toString(16).padStart(2, '0');
        const bgColorHex = `#${toHex(p[0])}${toHex(p[1])}${toHex(p[2])}`.toUpperCase();

        resolve({ fullBleedDataUrl, squircleDataUrl, bgColorHex });
      };
      img.src = src;
    });
  }, rawBase64);

  console.log('Sampled dominant sky background color:', bgColorHex);

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
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;overflow:hidden;background:transparent;">
            <div style="width:${t.width}px;height:${t.height}px;border-radius:50%;overflow:hidden;">
              <img src="${fullBleedDataUrl}" style="width:100%;height:100%;object-fit:cover;display:block;" />
            </div>
          </body>
        </html>
      `);
    } else if (t.squircle) {
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;overflow:hidden;background:transparent;">
            <img src="${squircleDataUrl}" style="width:${t.width}px;height:${t.height}px;object-fit:contain;display:block;" />
          </body>
        </html>
      `);
    } else if (t.adaptive) {
      const innerSize = Math.round(t.width * 0.72);
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;overflow:hidden;background:transparent;display:flex;align-items:center;justify-content:center;width:${t.width}px;height:${t.height}px;">
            <div style="width:${innerSize}px;height:${innerSize}px;border-radius:${Math.round(innerSize * 0.22)}px;overflow:hidden;">
              <img src="${fullBleedDataUrl}" style="width:100%;height:100%;object-fit:cover;display:block;" />
            </div>
          </body>
        </html>
      `);
    } else {
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;overflow:hidden;background:transparent;">
            <img src="${fullBleedDataUrl}" style="width:${t.width}px;height:${t.height}px;object-fit:cover;display:block;" />
          </body>
        </html>
      `);
    }

    await page.screenshot({ path: fullPath, type: 'png', omitBackground: true });
    console.log(`Generated: ${t.path} (${t.width}x${t.height})`);
  }

  // Generate self-contained favicon.svg, icon.svg, and favicon.ico from the clean 64x64 favicon.png
  const faviconPng = fs.readFileSync(path.resolve('public/favicon.png'));
  const base64Favicon = faviconPng.toString('base64');

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <image href="data:image/png;base64,${base64Favicon}" width="64" height="64" />
</svg>
`;
  fs.writeFileSync(path.resolve('public/icon.svg'), svgContent, 'utf8');
  fs.writeFileSync(path.resolve('public/favicon.svg'), svgContent, 'utf8');

  const pngLen = faviconPng.length;
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(1, 4);

  const icoEntry = Buffer.alloc(16);
  icoEntry.writeUInt8(64, 0);
  icoEntry.writeUInt8(64, 1);
  icoEntry.writeUInt8(0, 2);
  icoEntry.writeUInt8(0, 3);
  icoEntry.writeUInt16LE(1, 4);
  icoEntry.writeUInt16LE(32, 6);
  icoEntry.writeUInt32LE(pngLen, 8);
  icoEntry.writeUInt32LE(22, 12);

  const icoBuffer = Buffer.concat([icoHeader, icoEntry, faviconPng]);
  fs.writeFileSync(path.resolve('public/favicon.ico'), icoBuffer);
  console.log('Updated public/favicon.ico, public/icon.svg, and public/favicon.svg (zero borders)');

  await browser.close();
  console.log('All icons successfully regenerated without borders!');
}

generateAll().catch(console.error);
