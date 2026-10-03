const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 }); // iPhone 14 mobile viewport

  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });

  // Set English language and login in localStorage
  await page.evaluate(() => {
    localStorage.setItem('gv_language', 'en');
    localStorage.setItem('gv_logged_in', '1');
    localStorage.setItem('gv_profile', JSON.stringify({
      username: 'Globetrotter',
      avatar: '🧭',
      bio: 'Exploring the world!'
    }));
    // Add sample visited country
    localStorage.setItem('gittigim_yerler_world_v2', JSON.stringify({
      FR: { status: 'visited' },
      IT: { status: 'visited' }
    }));
  });

  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: 'scratch/en_map_screen.png' });
  console.log('Saved en_map_screen.png');

  // Open Profile
  await page.click('#btn-open-profile');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'scratch/en_profile_tab.png' });
  console.log('Saved en_profile_tab.png');

  // Click Medals Tab
  const medalsTab = await page.$('.ptab[data-tab="medals"]');
  if (medalsTab) {
    await medalsTab.click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'scratch/en_medals_tab.png' });
    console.log('Saved en_medals_tab.png');
  }

  // Click Flights Tab
  const flightsTab = await page.$('.ptab[data-tab="flights"]');
  if (flightsTab) {
    await flightsTab.click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'scratch/en_flights_tab.png' });
    console.log('Saved en_flights_tab.png');
  }

  // Close profile and click Visa Mode
  await page.click('#profile-close');
  await new Promise(r => setTimeout(r, 600));

  const visaBtn = await page.$('#btn-toggle-visa-mode');
  if (visaBtn) {
    await visaBtn.click();
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'scratch/en_visa_mode.png' });
    console.log('Saved en_visa_mode.png');
  }

  await browser.close();
  console.log('Verification done!');
})();
