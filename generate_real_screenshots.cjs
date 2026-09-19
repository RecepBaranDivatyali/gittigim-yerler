const puppeteer = require('./node_modules/puppeteer');
const path = require('path');

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1080,2160']
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1080,
    height: 2160,
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true
  });

  const outDir = 'C:\\Users\\90536\\Desktop\\GittigimYerler';

  const sampleWorldVisits = {
    'TR': { status: 'visited' },
    'DE': { status: 'visited' },
    'FR': { status: 'visited' },
    'IT': { status: 'visited' },
    'ES': { status: 'visited' },
    'GR': { status: 'visited' },
    'BG': { status: 'visited' },
    'NL': { status: 'visited' },
    'EG': { status: 'planned' },
    'JP': { status: 'wishlist' },
    'US': { status: 'wishlist' },
    'NO': { status: 'planned' }
  };

  const sampleTurkeyVisits = {
    '6': { status: 'visited' },
    '34': { status: 'visited' },
    '35': { status: 'visited' },
    '7': { status: 'visited' },
    '48': { status: 'visited' },
    '16': { status: 'visited' },
    '50': { status: 'visited' },
    '26': { status: 'visited' },
    '10': { status: 'visited' },
    '17': { status: 'visited' }
  };

  const sampleProfile = {
    username: 'Baran',
    avatar: '🧭',
    bio: 'Dünyayı ve Türkiye\'yi keşfediyorum ✈️'
  };

  await page.goto('https://gittigim-yerler.vercel.app/', { waitUntil: 'networkidle2' });

  // Inject login & sample data into localStorage
  await page.evaluate((wVisits, trVisits, prof) => {
    localStorage.setItem('gv_logged_in', '1');
    localStorage.setItem('gv_profile', JSON.stringify(prof));
    localStorage.setItem('gv_world_visits', JSON.stringify(wVisits));
    localStorage.setItem('gv_turkey_visits', JSON.stringify(trVisits));
    localStorage.setItem('gv_language', 'tr');
    location.reload();
  }, sampleWorldVisits, sampleTurkeyVisits, sampleProfile);

  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));

  // 1. World Map Screenshot
  await page.screenshot({ path: path.join(outDir, 'screenshot-1-world.png') });
  console.log('Saved screenshot-1-world.png (World Map)');

  // 2. Turkey Map Screenshot
  await page.evaluate(() => {
    if (window.map) {
      window.map.setView([39.0, 35.0], 6.0);
    }
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outDir, 'screenshot-2-turkey.png') });
  console.log('Saved screenshot-2-turkey.png (Turkey Provinces)');

  // 3. Profile Screen Screenshot
  await page.click('#btn-open-profile');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, 'screenshot-3-profile.png') });
  console.log('Saved screenshot-3-profile.png (Traveler Profile)');

  // 4. Medals / Achievements Screenshot
  await page.evaluate(() => {
    const btn = document.querySelector('[data-tab="medals"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, 'screenshot-4-medals.png') });
  console.log('Saved screenshot-4-medals.png (Achievements & Medals)');

  await browser.close();
  console.log('All 4 real screenshots generated successfully!');
}

run().catch(console.error);
