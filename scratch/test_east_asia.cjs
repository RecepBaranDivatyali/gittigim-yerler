const puppeteer = require('c:/Users/90536/Desktop/PROJELERİM/Gezgin/node_modules/puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.log('ERR:', err.message));
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('gv_logged_in', '1');
    localStorage.setItem('gv_onboarded', '1');
  });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => window.__leaflet_map !== undefined, { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1000));
  
  const testCountries = [
    { code: 'JP', name: 'Japan', center: [36.2, 138.2], zoom: 6 },
    { code: 'CN', name: 'China', center: [35.8, 104.1], zoom: 5 },
    { code: 'KR', name: 'South Korea', center: [35.9, 127.7], zoom: 7 }
  ];

  for (const tc of testCountries) {
    const info = await page.evaluate(async (c) => {
      const map = window.__leaflet_map;
      map.setView(c.center, c.zoom, { animate: false });
      await new Promise(r => setTimeout(r, 2500));
      const hud = document.getElementById('layer-hud')?.innerText;
      return { code: c.code, hud, layersCount: Object.keys(window.__regionLayers || {}).length };
    }, tc);
    console.log('Country test info:', info);
    await page.screenshot({ path: `C:/Users/90536/.gemini/antigravity/brain/57d15b28-0d00-42e3-82a6-e04c3781f712/test_${tc.code}.png` });
  }

  await browser.close();
  console.log('Finished testing East Asia countries');
})();
