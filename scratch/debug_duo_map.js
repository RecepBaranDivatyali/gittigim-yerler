import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 892 });

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

  await page.evaluate(() => {
    localStorage.setItem('gv_logged_in', '1');
    localStorage.setItem('gv_onboarded', '1');
    localStorage.setItem('gv_profile', JSON.stringify({
      username: 'TestUser',
      avatar: '🧭'
    }));
    localStorage.setItem('gv_travel_data', JSON.stringify({
      worldVisits: { 'FR': { status: 'visited' }, 'DE': { status: 'visited' }, 'TR': { status: 'visited' } },
      turkeyVisits: { '34': { status: 'visited' } },
      worldCities: []
    }));
  });

  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Open profile
  await page.click('#btn-open-profile');
  await new Promise(r => setTimeout(r, 800));

  // Go to Compare tab
  await page.click('.ptab[data-tab="compare"]');
  await new Promise(r => setTimeout(r, 600));

  // Search 'atlas'
  await page.type('#friend-search-input', 'atlas');
  await new Promise(r => setTimeout(r, 500));

  // Click compare
  await page.click('.btn-compare-traveler');
  await new Promise(r => setTimeout(r, 800));

  // Click Duo Map subtab
  console.log('Clicking Duo Map subtab...');
  await page.click('.compare-subtab[data-sub="duomap"]');
  await new Promise(r => setTimeout(r, 1500));

  // Inspect duo map DOM
  const mapDetails = await page.evaluate(() => {
    const el = document.getElementById('duo-map-container');
    const pane = document.getElementById('compare-pane-duomap');
    if (!el) return { found: false };
    return {
      found: true,
      offsetWidth: el.offsetWidth,
      offsetHeight: el.offsetHeight,
      innerHTML_length: el.innerHTML.length,
      hasLeafletPane: !!el.querySelector('.leaflet-pane'),
      leafletLayersCount: el.querySelectorAll('.leaflet-pane path').length,
      paneDisplay: pane ? window.getComputedStyle(pane).display : null,
      elStyle: el.getAttribute('style')
    };
  });
  console.log('Duo Map Details:', mapDetails);

  // Take screenshot of Duo map pane
  await page.evaluate(() => {
    const el = document.getElementById('duo-map-container');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'scratch/debug_duo_map.png' });

  await browser.close();
})();
