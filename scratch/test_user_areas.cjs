const puppeteer = require('c:/Users/90536/Desktop/PROJELERİM/Gezgin/node_modules/puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('gv_logged_in', '1');
    localStorage.setItem('gv_onboarded', '1');
    localStorage.setItem('gv_profile', JSON.stringify({
      username: 'Tester',
      email: 'tester@example.com',
      avatar: '✈️'
    }));
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

  // Clear indexedDB cache so it loads fresh geo data
  await page.evaluate(() => {
    try { indexedDB.deleteDatabase('GezginGeoCache'); } catch(e) {}
  });

  await page.waitForFunction(() => window.__leaflet_map !== undefined, { timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  const artifactDir = 'C:\\Users\\90536\\.gemini\\antigravity\\brain\\57d15b28-0d00-42e3-82a6-e04c3781f712';

  const targets = [
    { name: 'test_area1_mugla', lat: 37.1, lng: 28.0, zoom: 7.5 },
    { name: 'test_area2_burgaz', lat: 42.1, lng: 27.5, zoom: 7.5 },
    { name: 'test_area3_canakkale_islands', lat: 39.2, lng: 26.5, zoom: 7.5 },
    { name: 'test_area4_israel', lat: 31.8, lng: 35.2, zoom: 7.5 },
    { name: 'test_area5_tulcea', lat: 45.0, lng: 29.0, zoom: 7.5 }
  ];

  for (const t of targets) {
    await page.evaluate((target) => {
      if (window.__leaflet_map) {
        window.__leaflet_map.setView([target.lat, target.lng], target.zoom, { animate: false });
      }
    }, t);

    // Wait for geojson layers to settle and render
    await new Promise(r => setTimeout(r, 3000));

    const shotPath = path.join(artifactDir, `${t.name}.png`);
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot: ${t.name}.png`);
  }

  await browser.close();
  console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY');
})();
