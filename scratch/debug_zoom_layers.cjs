const puppeteer = require('c:/Users/90536/Desktop/PROJELERİM/Gezgin/node_modules/puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERR:', err.message));
  page.on('requestfailed', req => console.log('REQ FAIL:', req.url(), req.failure().errorText));

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
  await page.waitForFunction(() => window.__leaflet_map !== undefined, { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1000));

  // Test 1: Zoom to Japan
  console.log('--- Zooming to Japan ---');
  const jpStatus = await page.evaluate(async () => {
    const map = window.__leaflet_map;
    map.setView([36.2, 138.2], 5.5, { animate: false });
    await new Promise(r => setTimeout(r, 3000));
    const hud = document.getElementById('layer-hud')?.innerText;
    // Check if region layer exists in DOM
    const regionPaths = document.querySelectorAll('.leaflet-pane.leaflet-statesPane-pane path');
    return { hud, regionPathsCount: regionPaths.length };
  });
  console.log('Japan zoom 5.5 status:', jpStatus);
  await page.screenshot({ path: 'C:/Users/90536/.gemini/antigravity/brain/57d15b28-0d00-42e3-82a6-e04c3781f712/debug_japan_55.png' });

  // Test 2: Deep zoom in Japan
  console.log('--- Deep Zooming in Japan (Tokyo) ---');
  const jpDeep = await page.evaluate(async () => {
    const map = window.__leaflet_map;
    map.setView([35.68, 139.76], 8, { animate: false });
    await new Promise(r => setTimeout(r, 3000));
    const hud = document.getElementById('layer-hud')?.innerText;
    const regionPaths = document.querySelectorAll('.leaflet-pane.leaflet-statesPane-pane path');
    const cityPaths = document.querySelectorAll('.leaflet-pane.leaflet-citiesPane-pane path');
    return { hud, regionPathsCount: regionPaths.length, cityPathsCount: cityPaths.length };
  });
  console.log('Japan zoom 8 status:', jpDeep);
  await page.screenshot({ path: 'C:/Users/90536/.gemini/antigravity/brain/57d15b28-0d00-42e3-82a6-e04c3781f712/debug_japan_8.png' });

  await browser.close();
  console.log('Done debug_zoom_layers');
})();
