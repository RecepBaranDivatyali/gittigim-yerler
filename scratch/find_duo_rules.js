import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 892 });
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    localStorage.setItem('gv_logged_in', '1');
    localStorage.setItem('gv_onboarded', '1');
    localStorage.setItem('gv_profile', JSON.stringify({ username: 'Test', avatar: '🧭' }));
  });
  await page.reload();
  await new Promise(r => setTimeout(r, 600));
  await page.click('#btn-open-profile');
  await new Promise(r => setTimeout(r, 600));
  await page.click('.ptab[data-tab="compare"]');
  await new Promise(r => setTimeout(r, 600));
  await page.type('#friend-search-input', 'atlas');
  await new Promise(r => setTimeout(r, 500));
  await page.click('.btn-compare-traveler');
  await new Promise(r => setTimeout(r, 600));
  await page.click('.compare-subtab[data-sub="duomap"]');
  await new Promise(r => setTimeout(r, 1000));

  const rules = await page.evaluate(() => {
    const el = document.getElementById('duo-map-container');
    const matched = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText && el.matches(rule.selectorText)) {
            matched.push({ selector: rule.selectorText, cssText: rule.cssText });
          }
        }
      } catch (e) {}
    }
    return matched;
  });
  console.log('MATCHED RULES:', JSON.stringify(rules, null, 2));
  await browser.close();
})();
