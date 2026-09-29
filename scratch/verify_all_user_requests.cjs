const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🚀 Starting end-to-end verification with Puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE LOG ERROR:', msg.text());
  });

  // Navigate to dev server
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded' });
  console.log('✅ Page loaded');

  // Set mock logged in state in localStorage
  await page.evaluate(() => {
    const profile = {
      username: 'baran_test',
      name: 'Baran Test',
      avatar: '🧭',
      passportType: 'bordo',
      homeCountry: 'TR'
    };
    localStorage.setItem('gv_logged_in', '1');
    localStorage.setItem('gv_profile', JSON.stringify(profile));
    localStorage.setItem('gv_account', JSON.stringify(profile));
    localStorage.setItem('onboarding_seen', 'true');
    localStorage.setItem('onboarding_completed', 'true');
  });

  // Reload with user logged in
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Dismiss any remaining onboarding overlays
  await page.evaluate(() => {
    const ob = document.querySelector('.onboarding-overlay, .onboarding-modal-overlay');
    if (ob) ob.remove();
  });

  // 1. Switch to Profile View via #btn-open-profile
  console.log('--- TEST 1: Open Profile & Passport Booklet ---');
  const openedProfile = await page.evaluate(() => {
    const btn = document.querySelector('#btn-open-profile');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked #btn-open-profile:', openedProfile);
  await new Promise(r => setTimeout(r, 800));

  const hasPassportBtn = await page.evaluate(() => {
    const btn = document.querySelector('#btn-trigger-passport');
    return !!btn;
  });
  console.log('Passport Trigger Button exists:', hasPassportBtn);

  if (!hasPassportBtn) {
    throw new Error('Passport trigger button not found in profile view!');
  }

  // Open passport modal
  await page.evaluate(() => {
    document.querySelector('#btn-trigger-passport').click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Verify elements in passport modal
  const passportChecks = await page.evaluate(() => {
    const modal = document.querySelector('.passport-modal-overlay');
    const crest = document.querySelector('.passport-cover-crest-svg');
    const chip = document.querySelector('.passport-cover-chip-svg');
    const secCrest = document.querySelector('.passport-id-security-crest');
    const pill = document.querySelector('.booklet-page-pill');
    const actions = document.querySelector('.passport-actions-row, #btn-download-passport, #btn-share-passport');
    const dotsRow = document.querySelector('#passport-dots-row');
    const swipeHint = document.querySelector('.passport-swipe-hint');

    return {
      modalVisible: !!modal,
      hasCrest: !!crest,
      hasChip: !!chip,
      hasSecurityCrest: !!secCrest,
      noPagePill: !pill,
      noActionsRow: !actions,
      hasDotsRow: !!dotsRow,
      hasSwipeHint: !!swipeHint
    };
  });

  console.log('Passport Modal Checks:', passportChecks);
  if (!passportChecks.modalVisible || !passportChecks.hasCrest || !passportChecks.hasChip || !passportChecks.noPagePill || !passportChecks.noActionsRow) {
    throw new Error('Passport check failed!');
  }

  await page.screenshot({ path: path.join(__dirname, 'test_passport_page0.png') });
  console.log('📸 Passport Page 0 screenshot saved');

  // 2. Test Visa Modal "Diğer" country select
  console.log('--- TEST 2: Visa Modal "Diğer" Country Select ---');
  // Click on Page 2 dot or find add visa button
  await page.evaluate(() => {
    // If there is a dot for visa page (index 1), click it
    const dot1 = document.querySelector('.passport-dot-btn[data-page="1"]');
    if (dot1) dot1.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const addVisaBtn = document.querySelector('#btn-passport-add-visa-empty, .passport-add-visa-btn');
    if (addVisaBtn) addVisaBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const visaModalCheck = await page.evaluate(() => {
    const typeSelect = document.querySelector('#vf-type');
    if (!typeSelect) return { found: false };

    typeSelect.value = 'other';
    typeSelect.dispatchEvent(new Event('change'));

    const singleWrap = document.querySelector('#vf-single-country-wrap');
    const singleSelect = document.querySelector('#vf-single-country');
    const optionCount = singleSelect ? singleSelect.options.length : 0;
    const isVisible = singleWrap && singleWrap.style.display !== 'none';

    let hasJapan = false;
    let hasBrazil = false;
    if (singleSelect) {
      for (let i = 0; i < singleSelect.options.length; i++) {
        if (singleSelect.options[i].value === 'JP') hasJapan = true;
        if (singleSelect.options[i].value === 'BR') hasBrazil = true;
      }
    }

    return {
      found: true,
      isVisible,
      optionCount,
      hasJapan,
      hasBrazil
    };
  });

  console.log('Visa Modal Other Select Check:', visaModalCheck);
  if (!visaModalCheck.found || !visaModalCheck.isVisible || visaModalCheck.optionCount < 100 || !visaModalCheck.hasJapan) {
    throw new Error('Visa modal check failed!');
  }

  // Close visa form & passport modal
  await page.evaluate(() => {
    const vfClose = document.querySelector('.visa-form-close-btn, .visa-form-cancel-btn');
    if (vfClose) vfClose.click();
    const pClose = document.querySelector('#passport-close-btn');
    if (pClose) pClose.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // 3. Test Compare Tab: Friend Search (min 3 chars) & Responsive Layout
  console.log('--- TEST 3: Compare Tab Friend Search (min 3 chars) & Mobile Responsive ---');
  await page.evaluate(() => {
    const compareTab = document.querySelector('.ptab[data-tab="compare"], [data-tab="compare"]');
    if (compareTab) compareTab.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.setViewport({ width: 375, height: 812 });
  await new Promise(r => setTimeout(r, 400));

  const searchInput = await page.$('#friend-search-input');
  if (!searchInput) {
    throw new Error('Friend search input not found!');
  }

  // 3a. Click without typing -> results should be empty
  await searchInput.click();
  await new Promise(r => setTimeout(r, 300));
  const emptyResultsCount = await page.evaluate(() => {
    const res = document.querySelectorAll('.friend-search-item');
    return res.length;
  });
  console.log('Results on empty click (should be 0):', emptyResultsCount);

  // 3b. Type 2 characters "at" -> results should still be empty
  await searchInput.type('at');
  await new Promise(r => setTimeout(r, 300));
  const twoCharResultsCount = await page.evaluate(() => {
    const res = document.querySelectorAll('.friend-search-item');
    return res.length;
  });
  console.log('Results on 2 chars (should be 0):', twoCharResultsCount);

  // 3c. Type 3rd character "l" -> "atl" should find "atlas_mert"
  await searchInput.type('l');
  await new Promise(r => setTimeout(r, 500));
  const threeCharResults = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.friend-search-item'));
    return items.map(it => ({
      text: it.textContent.trim(),
      width: it.offsetWidth,
      containerWidth: it.parentElement.offsetWidth
    }));
  });
  console.log('Results on 3 chars ("atl"):', threeCharResults.length, threeCharResults);

  const overflowCheck = await page.evaluate(() => {
    const inputWrap = document.querySelector('.friend-search-input-wrap');
    const resultsWrap = document.querySelector('#friend-search-results');
    const actions = document.querySelector('.friend-search-actions');
    const bodyWidth = document.body.clientWidth;

    return {
      bodyWidth,
      inputWrapWidth: inputWrap ? inputWrap.offsetWidth : 0,
      resultsWrapWidth: resultsWrap ? resultsWrap.offsetWidth : 0,
      actionsWidth: actions ? actions.offsetWidth : 0,
      bodyScrollWidth: document.body.scrollWidth,
      hasHorizontalScroll: document.body.scrollWidth > bodyWidth + 2
    };
  });
  console.log('Mobile Layout Overflow Check:', overflowCheck);

  await page.screenshot({ path: path.join(__dirname, 'test_compare_mobile_search.png') });
  console.log('📸 Mobile search screenshot saved');

  if (emptyResultsCount !== 0 || twoCharResultsCount !== 0 || threeCharResults.length === 0) {
    throw new Error('Search 3-character threshold check failed!');
  }

  // 4. Test Compare Reviews Pane: Default 5 stars purged / not shown
  console.log('--- TEST 4: Compare Reviews Pane Unrated Filtering ---');
  await page.evaluate(() => {
    const compareBtn = document.querySelector('.btn-compare-traveler');
    if (compareBtn) compareBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const revSubtab = document.querySelector('.compare-subtab[data-sub="reviews"]');
    if (revSubtab) revSubtab.click();
  });
  await new Promise(r => setTimeout(r, 600));

  const reviewsCheck = await page.evaluate(() => {
    const cards = document.querySelectorAll('.compare-review-card');
    let hasDefaultUnrated5 = false;
    cards.forEach(c => {
      const text = c.textContent;
      if (text.includes('Senin Puanın: ⭐ 5/10') && text.includes('Yorum eklenmedi')) {
        hasDefaultUnrated5 = true;
      }
    });
    return {
      totalCards: cards.length,
      hasDefaultUnrated5
    };
  });
  console.log('Reviews Pane Check:', reviewsCheck);
  if (reviewsCheck.hasDefaultUnrated5) {
    throw new Error('Unrated place showed default 5 stars in reviews!');
  }

  // 5. Test Compare Duo Map
  console.log('--- TEST 5: Compare Duo Map (Subtab & Leaflet) ---');
  await page.setViewport({ width: 1024, height: 768 });
  await new Promise(r => setTimeout(r, 400));

  await page.evaluate(() => {
    const duoSubtab = document.querySelector('.compare-subtab[data-sub="duomap"]');
    if (duoSubtab) duoSubtab.click();
  });
  await new Promise(r => setTimeout(r, 2500));

  const duoMapCheck = await page.evaluate(() => {
    const mapEl = document.getElementById('duo-map-container');
    if (!mapEl) return { found: false };
    const rect = mapEl.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(mapEl);
    const leafletTilesOrPaths = mapEl.querySelectorAll('.leaflet-tile-pane, .leaflet-overlay-pane path');

    return {
      found: true,
      height: rect.height,
      width: rect.width,
      computedHeight: computedStyle.height,
      renderedLayersCount: leafletTilesOrPaths.length
    };
  });
  console.log('Duo Map Check:', duoMapCheck);

  await page.screenshot({ path: path.join(__dirname, 'test_duo_map.png') });
  console.log('📸 Duo Map screenshot saved');

  if (!duoMapCheck.found || duoMapCheck.height < 400) {
    throw new Error('Duo Map container failed to expand or render properly!');
  }

  console.log('🎉 ALL 5 TESTS PASSED SUCCESSFULLY!');
  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
