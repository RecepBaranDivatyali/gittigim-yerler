import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#162544"/>
      <stop offset="60%" stop-color="#0d1629"/>
      <stop offset="100%" stop-color="#060913"/>
    </radialGradient>

    <!-- Flight Arc Gradient -->
    <linearGradient id="flightArc" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ef4444" stop-opacity="0.2"/>
      <stop offset="40%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#fbbf24"/>
    </linearGradient>

    <!-- Compass Gold Gradients -->
    <linearGradient id="goldLight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#eab308"/>
    </linearGradient>
    <linearGradient id="goldDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>

    <!-- Earth Arc Glow -->
    <linearGradient id="earthAtmosphere" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
      <stop offset="15%" stop-color="#0284c7" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#0369a1" stop-opacity="0"/>
    </linearGradient>

    <!-- Subtle Inner Border -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.03"/>
    </linearGradient>
  </defs>

  <!-- Squircle Base -->
  <rect x="32" y="32" width="960" height="960" rx="224" fill="url(#bgGrad)"/>
  <rect x="32" y="32" width="960" height="960" rx="224" fill="none" stroke="url(#borderGrad)" stroke-width="4"/>

  <!-- Earth Horizon Curve -->
  <path d="M 60 740 Q 512 560 964 740 L 964 960 L 60 960 Z" fill="#080f1e" opacity="0.95"/>
  <path d="M 60 740 Q 512 560 964 740" fill="none" stroke="url(#earthAtmosphere)" stroke-width="8"/>
  <path d="M 60 740 Q 512 560 964 740" fill="none" stroke="#67e8f9" stroke-width="2" opacity="0.8"/>

  <!-- Subtle Latitude Grid on Earth -->
  <path d="M 160 790 Q 512 650 864 790" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="8 8" opacity="0.35"/>
  <path d="M 240 850 Q 512 730 784 850" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="8 8" opacity="0.25"/>

  <!-- Subtle Meridian Longitude Lines in Sky -->
  <ellipse cx="512" cy="460" rx="340" ry="340" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.18"/>
  <ellipse cx="512" cy="460" rx="190" ry="340" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.15"/>
  <line x1="512" y1="120" x2="512" y2="600" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.2"/>

  <!-- Dramatic Sweeping Flight Arc (Trajectory) -->
  <path d="M 220 720 C 320 620, 480 340, 740 260" fill="none" stroke="url(#flightArc)" stroke-width="7" stroke-linecap="round"/>
  <path d="M 220 720 C 320 620, 480 340, 740 260" fill="none" stroke="#fef08a" stroke-width="2" stroke-linecap="round" opacity="0.9"/>

  <!-- Start Departure Point Halo -->
  <circle cx="220" cy="720" r="14" fill="#f97316" opacity="0.3"/>
  <circle cx="220" cy="720" r="7" fill="#f97316"/>
  <circle cx="220" cy="720" r="3" fill="#ffffff"/>

  <!-- Climbing Aircraft Silhouette at Top of Flight Arc -->
  <g transform="translate(740, 260) rotate(-22)">
    <!-- Sleek Supersonic Jet Silhouette -->
    <path d="M 0 -38 L 8 -10 L 42 12 L 40 18 L 8 10 L 6 32 L 18 42 L 16 46 L 0 40 L -16 46 L -18 42 L -6 32 L -8 10 L -40 18 L -42 12 L -8 -10 Z" fill="#ffffff"/>
    <path d="M 0 -38 L 8 -10 L 8 10 L 6 32 L 0 40 Z" fill="#f1f5f9" opacity="0.85"/>
  </g>

  <!-- Central Faceted Navigator Compass Star -->
  <g transform="translate(480, 430)">
    <!-- Outer Glow Ring -->
    <circle cx="0" cy="0" r="105" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.4"/>
    <circle cx="0" cy="0" r="120" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.2"/>

    <!-- North Point -->
    <polygon points="0,0 0,-130 18,-24" fill="url(#goldLight)"/>
    <polygon points="0,0 0,-130 -18,-24" fill="url(#goldDark)"/>

    <!-- South Point -->
    <polygon points="0,0 0,110 -16,22" fill="url(#goldLight)"/>
    <polygon points="0,0 0,110 16,22" fill="url(#goldDark)"/>

    <!-- East Point -->
    <polygon points="0,0 110,0 22,16" fill="url(#goldLight)"/>
    <polygon points="0,0 110,0 22,-16" fill="url(#goldDark)"/>

    <!-- West Point -->
    <polygon points="0,0 -110,0 -22,-16" fill="url(#goldLight)"/>
    <polygon points="0,0 -110,0 -22,16" fill="url(#goldDark)"/>

    <!-- Secondary Diagonal Points -->
    <!-- NE -->
    <polygon points="0,0 60,-60 12,-22" fill="url(#goldLight)"/>
    <polygon points="0,0 60,-60 22,-12" fill="url(#goldDark)"/>
    <!-- NW -->
    <polygon points="0,0 -60,-60 -22,-12" fill="url(#goldLight)"/>
    <polygon points="0,0 -60,-60 -12,-22" fill="url(#goldDark)"/>
    <!-- SE -->
    <polygon points="0,0 60,60 22,12" fill="url(#goldLight)"/>
    <polygon points="0,0 60,60 12,22" fill="url(#goldDark)"/>
    <!-- SW -->
    <polygon points="0,0 -60,60 -12,22" fill="url(#goldLight)"/>
    <polygon points="0,0 -60,60 -22,12" fill="url(#goldDark)"/>

    <!-- Center Pivot Gem -->
    <circle cx="0" cy="0" r="12" fill="#0f172a"/>
    <circle cx="0" cy="0" r="9" fill="#fef08a"/>
    <circle cx="0" cy="0" r="4" fill="#ffffff"/>
  </g>
</svg>
`;

async function render() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 1024, deviceScaleFactor: 1 });
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden;background:transparent;">${svg}</body></html>`);
  
  const destPublic = path.resolve('public/logos/gezgin_vector_master.jpg');
  const destBrain = 'C:/Users/90536/.gemini/antigravity/brain/57d15b28-0d00-42e3-82a6-e04c3781f712/gezgin_vector_master.jpg';

  await page.screenshot({ path: destPublic, type: 'jpeg', quality: 95 });
  await page.screenshot({ path: destBrain, type: 'jpeg', quality: 95 });

  await browser.close();
  console.log('Successfully rendered vector master logo!');
}

render().catch(console.error);
