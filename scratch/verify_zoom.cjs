const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('🚀 Starting Zoom verification test with Puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded' });

  // Ensure logged in and bypass onboarding
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

  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Dismiss any remaining overlays
  await page.evaluate(() => {
    const ob = document.querySelector('.onboarding-overlay, .onboarding-modal-overlay');
    if (ob) ob.remove();
  });

  // Verify Leaflet Map instance options
  const mapOptions = await page.evaluate(() => {
    const map = window.__leaflet_map;
    if (!map) return { found: false };
    return {
      found: true,
      zoomSnap: map.options.zoomSnap,
      zoomDelta: map.options.zoomDelta,
      wheelPxPerZoomLevel: map.options.wheelPxPerZoomLevel,
      wheelDebounceTime: map.options.wheelDebounceTime,
      minZoom: map.options.minZoom,
      maxZoom: map.options.maxZoom,
      currentZoom: map.getZoom()
    };
  });

  console.log('Map Zoom Options:', mapOptions);
  if (!mapOptions.found || mapOptions.zoomSnap !== 0 || mapOptions.zoomDelta !== 0.5 || mapOptions.minZoom !== 1.2) {
    throw new Error('Map options do not match expected continuous zoom configuration!');
  }

  // TEST 1: Test Micro-Zoom (arbitrary fractional zoom level like 3.35)
  console.log('--- TEST 1: Setting fractional zoom 3.35 ---');
  const fractionalZoomResult = await page.evaluate(() => {
    const map = window.__leaflet_map;
    map.setZoom(3.35, { animate: false });
    return map.getZoom();
  });
  console.log('Current zoom after setting 3.35:', fractionalZoomResult);
  if (Math.abs(fractionalZoomResult - 3.35) > 0.001) {
    throw new Error(`Fractional zoom failed! Expected 3.35, got ${fractionalZoomResult}`);
  }

  // TEST 2: Test Floating Zoom Buttons
  console.log('--- TEST 2: Testing Zoom In & Zoom Out Buttons ---');
  const zoomInExists = await page.$('#btn-map-zoom-in');
  const zoomOutExists = await page.$('#btn-map-zoom-out');
  if (!zoomInExists || !zoomOutExists) {
    throw new Error('Floating zoom buttons not found in DOM!');
  }

  // Click Zoom In button (+0.5)
  await page.click('#btn-map-zoom-in');
  await new Promise(r => setTimeout(r, 600));
  const zoomAfterIn = await page.evaluate(() => window.__leaflet_map.getZoom());
  console.log('Zoom after + button (expected ~3.85):', zoomAfterIn);
  if (Math.abs(zoomAfterIn - 3.85) > 0.05) {
    throw new Error(`Zoom in failed! Expected ~3.85, got ${zoomAfterIn}`);
  }

  // Click Zoom Out button (-0.5)
  await page.click('#btn-map-zoom-out');
  await new Promise(r => setTimeout(r, 600));
  const zoomAfterOut = await page.evaluate(() => window.__leaflet_map.getZoom());
  console.log('Zoom after - button (expected ~3.35):', zoomAfterOut);
  if (Math.abs(zoomAfterOut - 3.35) > 0.05) {
    throw new Error(`Zoom out failed! Expected ~3.35, got ${zoomAfterOut}`);
  }

  // TEST 3: Mouse Wheel Smooth Granular Zoom
  console.log('--- TEST 3: Testing Mouse Wheel Smooth Scroll ---');
  await page.mouse.move(640, 400);
  await page.mouse.wheel({ deltaY: -60 }); // Small upward scroll (zoom in)
  await new Promise(r => setTimeout(r, 400));
  const zoomAfterWheel = await page.evaluate(() => window.__leaflet_map.getZoom());
  console.log('Zoom after small wheel scroll:', zoomAfterWheel);
  const wheelDelta = zoomAfterWheel - 3.35;
  console.log('Wheel zoom delta (should be fractional < 0.5):', wheelDelta);
  if (wheelDelta <= 0 || wheelDelta >= 0.9) {
    throw new Error(`Wheel zoom was not fractional! Delta was ${wheelDelta}`);
  }

  // Desktop screenshot
  await page.screenshot({ path: path.join(__dirname, 'test_zoom_desktop.png') });
  console.log('📸 Desktop zoom screenshot saved');

  // TEST 4: Mobile Responsive Layout & Stacking
  console.log('--- TEST 4: Testing Mobile Viewport (375x812) ---');
  await page.setViewport({ width: 375, height: 812 });
  await new Promise(r => setTimeout(r, 500));

  const mobilePositions = await page.evaluate(() => {
    const zoomControls = document.getElementById('map-zoom-controls');
    const feedbackWrap = document.getElementById('feedback-btn-wrap');
    if (!zoomControls || !feedbackWrap) return { ok: false };

    const zRect = zoomControls.getBoundingClientRect();
    const fRect = feedbackWrap.getBoundingClientRect();

    // Check that zoom controls sit above feedback wrap and don't collide
    const isAboveFeedback = zRect.bottom <= fRect.top + 2;
    const isVisibleOnScreen = zRect.right <= window.innerWidth && zRect.bottom <= window.innerHeight;

    return {
      ok: true,
      zoomRect: { top: zRect.top, bottom: zRect.bottom, right: zRect.right },
      feedbackRect: { top: fRect.top, bottom: fRect.bottom, right: fRect.right },
      isAboveFeedback,
      isVisibleOnScreen
    };
  });

  console.log('Mobile Zoom Positions:', mobilePositions);
  if (!mobilePositions.ok || !mobilePositions.isVisibleOnScreen) {
    throw new Error('Mobile zoom layout check failed!');
  }

  await page.screenshot({ path: path.join(__dirname, 'test_zoom_mobile.png') });
  console.log('📸 Mobile zoom screenshot saved');

  console.log('🎉 ALL ZOOM VERIFICATIONS PASSED SUCCESSFULLY!');
  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('❌ Zoom verification failed:', err);
  process.exit(1);
});
