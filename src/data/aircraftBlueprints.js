// Technical Blueprint Vector Schematics for Aircraft Fleet
// CAD-accurate top-down airframe silhouettes with backward-sweeping wings, realistic engine mounts, and clean blueprint grids

function getBlueprintBase(specLabel, spanLen, scale, contentPath, accentColor = '#38bdf8') {
  return `
    <svg viewBox="0 0 280 180" class="aircraft-blueprint-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="bpGrid" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M 14 0 L 0 0 0 14" fill="none" stroke="rgba(56, 189, 248, 0.08)" stroke-width="0.8"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="#081120"/>
      <rect width="100%" height="100%" fill="url(#bpGrid)"/>
      <path d="M 8 20 L 8 8 L 20 8 M 260 8 L 272 8 L 272 20 M 8 160 L 8 172 L 20 172 M 260 172 L 272 172 L 272 160" fill="none" stroke="rgba(56, 189, 248, 0.35)" stroke-width="1.2"/>
      <line x1="16" y1="90" x2="264" y2="90" stroke="rgba(56, 189, 248, 0.18)" stroke-dasharray="4,4" stroke-width="0.8"/>
      ${contentPath}
      <text x="12" y="20" fill="rgba(226, 232, 240, 0.88)" font-family="monospace" font-size="7" font-weight="bold">${specLabel}</text>
      <text x="12" y="30" fill="${accentColor}" font-family="monospace" font-size="6.5">${spanLen}</text>
      <text x="268" y="168" text-anchor="end" fill="rgba(148, 163, 184, 0.65)" font-family="monospace" font-size="6.2">${scale}</text>
    </svg>
  `.trim();
}

export const AIRCRAFT_BLUEPRINTS = {
  // ── 1. BOEING 737 / 737 MAX ───────────────────────────────────────────
  b737: getBlueprintBase(
    'BOEING 737-800 / MAX 8',
    'KANAT: 35.9m • UZUNLUK: 39.5m',
    'KROKİ // 1:500',
    `
      <g fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round">
        <!-- Main Wings (Swept back from x=95 to x=165) -->
        <path d="M 95 83 L 165 22 L 172 24 L 138 83 Z M 95 97 L 165 158 L 172 156 L 138 97 Z" fill="rgba(56, 189, 248, 0.12)"/>
        <!-- Split Scimitar Winglets at wingtips -->
        <line x1="164" y1="18" x2="167" y2="25" stroke="#38bdf8" stroke-width="1.8"/>
        <line x1="167" y1="24" x2="170" y2="28" stroke="#38bdf8" stroke-width="1.5"/>
        <line x1="164" y1="162" x2="167" y2="155" stroke="#38bdf8" stroke-width="1.8"/>
        <line x1="167" y1="156" x2="170" y2="152" stroke="#38bdf8" stroke-width="1.5"/>
        <!-- 2x CFM56 / LEAP Turbofan Engines mounted under wings -->
        <rect x="108" y="52" width="20" height="8" rx="3" fill="#0b172a" stroke="#38bdf8" stroke-width="1.2"/>
        <rect x="108" y="120" width="20" height="8" rx="3" fill="#0b172a" stroke="#38bdf8" stroke-width="1.2"/>
        <!-- Engine Pylons attaching to wing leading edge -->
        <line x1="116" y1="52" x2="116" y2="44" stroke="#38bdf8" stroke-width="1"/>
        <line x1="116" y1="128" x2="116" y2="136" stroke="#38bdf8" stroke-width="1"/>
        <!-- Horizontal Tailplanes -->
        <path d="M 225 86 L 255 58 L 262 60 L 246 86 Z M 225 94 L 255 122 L 262 120 L 246 94 Z" fill="rgba(56, 189, 248, 0.1)"/>
        <!-- Narrowbody Fuselage -->
        <path d="M 28 90 C 28 83 40 83 58 83 L 238 83 C 252 83 260 87 262 90 C 260 93 252 97 238 97 L 58 97 C 40 97 28 97 28 90 Z" fill="#081120" stroke="#f1f5f9" stroke-width="1.5"/>
        <!-- Cockpit Visor Band -->
        <path d="M 38 87 Q 44 85 48 87 M 38 93 Q 44 95 48 93" stroke="#38bdf8" stroke-width="1.5"/>
      </g>
    `,
    '#3b82f6'
  ),

  // ── 2. BOEING 777 (TRIPLE SEVEN) ──────────────────────────────────────
  b777: getBlueprintBase(
    'BOEING 777-300ER',
    'KANAT: 64.8m • UZUNLUK: 73.9m',
    'KROKİ // 1:500',
    `
      <g fill="none" stroke="#6366f1" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round">
        <!-- Widebody Swept Wings with Raked Wingtips -->
        <path d="M 90 79 L 172 16 L 184 18 L 146 79 Z M 90 101 L 172 164 L 184 162 L 146 101 Z" fill="rgba(99, 102, 241, 0.12)"/>
        <!-- Raked Wingtips extending back -->
        <line x1="172" y1="16" x2="188" y2="22" stroke="#818cf8" stroke-width="2"/>
        <line x1="172" y1="164" x2="188" y2="158" stroke="#818cf8" stroke-width="2"/>
        <!-- Giant GE90-115B Engines -->
        <rect x="104" y="44" width="26" height="11" rx="4" fill="#0b172a" stroke="#818cf8" stroke-width="1.3"/>
        <rect x="104" y="125" width="26" height="11" rx="4" fill="#0b172a" stroke="#818cf8" stroke-width="1.3"/>
        <!-- Pylons -->
        <line x1="114" y1="44" x2="114" y2="38" stroke="#818cf8" stroke-width="1.2"/>
        <line x1="114" y1="136" x2="114" y2="142" stroke="#818cf8" stroke-width="1.2"/>
        <!-- Horizontal Tailplanes -->
        <path d="M 226 83 L 260 50 L 268 53 L 250 83 Z M 226 97 L 260 130 L 268 127 L 250 97 Z" fill="rgba(99, 102, 241, 0.1)"/>
        <!-- Widebody Fuselage & Blade Tailcone -->
        <path d="M 22 90 C 22 79 38 79 62 79 L 244 79 C 262 79 270 86 272 90 C 270 94 262 101 244 101 L 62 101 C 38 101 22 101 22 90 Z" fill="#081120" stroke="#f1f5f9" stroke-width="1.6"/>
        <!-- Cockpit Glass -->
        <path d="M 32 86 Q 40 83 46 86 M 32 94 Q 40 97 46 94" stroke="#818cf8" stroke-width="1.5"/>
      </g>
    `,
    '#6366f1'
  ),

  // ── 3. BOEING 787 DREAMLINER ──────────────────────────────────────────
  b787: getBlueprintBase(
    'BOEING 787-9 DREAMLINER',
    'KANAT: 60.1m • UZUNLUK: 62.8m',
    'KROKİ // 1:500',
    `
      <g fill="none" stroke="#0ea5e9" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round">
        <!-- Smooth Aerodynamic Organic Swept Wings -->
        <path d="M 94 80 Q 120 52 174 15 Q 184 18 182 24 L 144 80 Z M 94 100 Q 120 128 174 165 Q 184 162 182 156 L 144 100 Z" fill="rgba(14, 165, 233, 0.12)"/>
        <!-- Curved Raked Wingtips -->
        <path d="M 174 15 Q 186 18 188 26 M 174 165 Q 186 162 188 154" stroke="#38bdf8" stroke-width="2"/>
        <!-- GEnx Engines with Chevron Scallops -->
        <rect x="106" y="46" width="22" height="10" rx="3.5" fill="#0b172a" stroke="#0ea5e9" stroke-width="1.2"/>
        <path d="M 128 46 L 131 48 L 128 51 L 131 53 L 128 56" stroke="#38bdf8" stroke-width="1.2"/>
        <rect x="106" y="124" width="22" height="10" rx="3.5" fill="#0b172a" stroke="#0ea5e9" stroke-width="1.2"/>
        <path d="M 128 124 L 131 126 L 128 129 L 131 131 L 128 134" stroke="#38bdf8" stroke-width="1.2"/>
        <!-- Horizontal Tailplanes -->
        <path d="M 224 84 L 258 54 L 266 56 L 248 84 Z M 224 96 L 258 126 L 266 124 L 248 96 Z" fill="rgba(14, 165, 233, 0.1)"/>
        <!-- Composite Fuselage -->
        <path d="M 24 90 C 24 80 40 80 64 80 L 235 80 C 252 80 262 86 264 90 C 262 94 252 100 235 100 L 64 100 C 40 100 24 100 24 90 Z" fill="#081120" stroke="#f1f5f9" stroke-width="1.5"/>
        <path d="M 34 86 Q 42 83 48 86 M 34 94 Q 42 97 48 94" stroke="#38bdf8" stroke-width="1.5"/>
      </g>
    `,
    '#0ea5e9'
  ),

  // ── 4. BOEING 747 (QUEEN OF THE SKIES) ────────────────────────────────
  b747: getBlueprintBase(
    'BOEING 747-8 INTERCONTINENTAL',
    'KANAT: 68.4m • UZUNLUK: 76.3m',
    'KROKİ // 1:500',
    `
      <g fill="none" stroke="#f59e0b" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round">
        <!-- 37.5° High Swept Wings -->
        <path d="M 88 77 L 172 12 L 184 15 L 144 77 Z M 88 103 L 172 168 L 184 165 L 144 103 Z" fill="rgba(245, 158, 11, 0.12)"/>
        <!-- 4x GEnx Turbofans under wings -->
        <rect x="106" y="44" width="18" height="8" rx="2.5" fill="#0b172a" stroke="#fbbf24" stroke-width="1.1"/>
        <rect x="132" y="27" width="18" height="8" rx="2.5" fill="#0b172a" stroke="#fbbf24" stroke-width="1.1"/>
        <rect x="106" y="128" width="18" height="8" rx="2.5" fill="#0b172a" stroke="#fbbf24" stroke-width="1.1"/>
        <rect x="132" y="145" width="18" height="8" rx="2.5" fill="#0b172a" stroke="#fbbf24" stroke-width="1.1"/>
        <!-- Horizontal Tailplanes -->
        <path d="M 226 83 L 264 46 L 272 49 L 250 83 Z M 226 97 L 264 134 L 272 131 L 250 97 Z" fill="rgba(245, 158, 11, 0.1)"/>
        <!-- Fuselage with Upper Deck Hump -->
        <path d="M 20 90 C 20 77 36 77 60 77 L 240 77 C 260 77 270 85 272 90 C 270 95 260 103 240 103 L 60 103 C 36 103 20 103 20 90 Z" fill="#081120" stroke="#f1f5f9" stroke-width="1.6"/>
        <!-- Upper Deck Hump contour line -->
        <path d="M 32 83 Q 65 79 105 79 L 118 82" stroke="#fbbf24" stroke-width="1.5"/>
        <path d="M 32 97 Q 65 101 105 101 L 118 98" stroke="#fbbf24" stroke-width="1.5"/>
      </g>
    `,
    '#f59e0b'
  ),

  // ── 5. AIRBUS A320NEO ─────────────────────────────────────────────────
  a320: getBlueprintBase(
    'AIRBUS A320NEO',
    'KANAT: 35.8m • UZUNLUK: 37.6m',
    'KROKİ // 1:500',
    `
      <g fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round">
        <!-- Main Wings Swept Backwards -->
        <path d="M 98 82.5 L 164 24 L 170 26 L 138 82.5 Z M 98 97.5 L 164 156 L 170 154 L 138 97.5 Z" fill="rgba(56, 189, 248, 0.12)"/>
        <!-- Vertical Sharklets -->
        <line x1="162" y1="18" x2="166" y2="28" stroke="#38bdf8" stroke-width="2.2"/>
        <line x1="162" y1="162" x2="166" y2="152" stroke="#38bdf8" stroke-width="2.2"/>
        <!-- 2x CFM LEAP Turbofans -->
        <rect x="110" y="50" width="20" height="8.5" rx="3" fill="#0b172a" stroke="#38bdf8" stroke-width="1.2"/>
        <rect x="110" y="121.5" width="20" height="8.5" rx="3" fill="#0b172a" stroke="#38bdf8" stroke-width="1.2"/>
        <!-- Tailplanes -->
        <path d="M 224 85 L 252 58 L 258 60 L 244 85 Z M 224 95 L 252 122 L 258 120 L 244 95 Z" fill="rgba(56, 189, 248, 0.1)"/>
        <!-- Fuselage (Curved Airbus Nose) -->
        <path d="M 28 90 C 28 82.5 42 82.5 60 82.5 L 235 82.5 C 248 82.5 256 86 258 90 C 256 94 248 97.5 235 97.5 L 60 97.5 C 42 97.5 28 97.5 28 90 Z" fill="#081120" stroke="#f1f5f9" stroke-width="1.5"/>
        <path d="M 38 87 Q 44 85 48 87 M 38 93 Q 44 95 48 93" stroke="#38bdf8" stroke-width="1.5"/>
      </g>
    `,
    '#38bdf8'
  ),

  // ── 6. AIRBUS A330NEO ─────────────────────────────────────────────────
  a330: getBlueprintBase(
    'AIRBUS A330-900NEO',
    'KANAT: 64.0m • UZUNLUK: 63.7m',
    'KROKİ // 1:500',
    `
      <g fill="none" stroke="#2563eb" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round">
        <path d="M 94 80 L 174 16 L 182 18 L 145 80 Z M 94 100 L 174 164 L 182 162 L 145 100 Z" fill="rgba(37, 99, 235, 0.12)"/>
        <path d="M 174 16 Q 186 18 184 26 M 174 164 Q 186 162 184 154" stroke="#60a5fa" stroke-width="2"/>
        <rect x="108" y="46" width="24" height="10" rx="3.5" fill="#0b172a" stroke="#60a5fa" stroke-width="1.2"/>
        <rect x="108" y="124" width="24" height="10" rx="3.5" fill="#0b172a" stroke="#60a5fa" stroke-width="1.2"/>
        <path d="M 226 84 L 260 52 L 268 55 L 250 84 Z M 226 96 L 260 128 L 268 125 L 250 96 Z" fill="rgba(37, 99, 235, 0.1)"/>
        <path d="M 24 90 C 24 80 40 80 64 80 L 240 80 C 256 80 266 86 268 90 C 266 94 256 100 240 100 L 64 100 C 40 100 24 100 24 90 Z" fill="#081120" stroke="#f1f5f9" stroke-width="1.5"/>
        <path d="M 34 86 Q 42 83 48 86 M 34 94 Q 42 97 48 94" stroke="#60a5fa" stroke-width="1.5"/>
      </g>
    `,
    '#2563eb'
  ),

  // ── 7. AIRBUS A350 XWB ────────────────────────────────────────────────
  a350: getBlueprintBase(
    'AIRBUS A350-900 XWB',
    'KANAT: 64.8m • UZUNLUK: 66.8m',
    'KROKİ // 1:500',
    `
      <g fill="none" stroke="#0284c7" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round">
        <path d="M 90 79.5 Q 118 50 174 14 Q 184 16 183 24 L 144 79.5 Z M 90 100.5 Q 118 130 174 166 Q 184 164 183 156 L 144 100.5 Z" fill="rgba(2, 132, 199, 0.12)"/>
        <path d="M 174 14 Q 186 16 185 26 M 174 166 Q 186 164 185 154" stroke="#38bdf8" stroke-width="2"/>
        <rect x="106" y="45" width="24" height="10" rx="3.5" fill="#0b172a" stroke="#38bdf8" stroke-width="1.2"/>
        <rect x="106" y="125" width="24" height="10" rx="3.5" fill="#0b172a" stroke="#38bdf8" stroke-width="1.2"/>
        <path d="M 228 84 L 262 52 L 270 55 L 250 84 Z M 228 96 L 262 128 L 270 125 L 250 96 Z" fill="rgba(2, 132, 199, 0.1)"/>
        <path d="M 22 90 C 22 79.5 38 79.5 62 79.5 L 244 79.5 C 262 79.5 272 86 274 90 C 272 94 262 100.5 244 100.5 L 62 100.5 C 38 100.5 22 100.5 22 90 Z" fill="#081120" stroke="#f1f5f9" stroke-width="1.5"/>
        <!-- Raccoon Mask -->
        <path d="M 32 86 Q 42 82 48 86 Q 42 89 32 86 Z M 32 94 Q 42 98 48 94 Q 42 91 32 94 Z" fill="#0b172a" stroke="#38bdf8" stroke-width="1.2"/>
      </g>
    `,
    '#0284c7'
  ),

  // ── 8. AIRBUS A380-800 (SUPERJUMBO) ───────────────────────────────────
  a380: getBlueprintBase(
    'AIRBUS A380-800',
    'KANAT: 79.8m • UZUNLUK: 72.7m',
    'KROKİ // 1:500',
    `
      <g fill="none" stroke="#8b5cf6" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round">
        <path d="M 80 76.5 L 172 10 L 182 14 L 146 76.5 Z M 80 103.5 L 172 170 L 182 166 L 146 103.5 Z" fill="rgba(139, 92, 246, 0.12)"/>
        <line x1="170" y1="6" x2="174" y2="16" stroke="#a78bfa" stroke-width="2.2"/>
        <line x1="170" y1="174" x2="174" y2="164" stroke="#a78bfa" stroke-width="2.2"/>
        <!-- 4x Turbofans -->
        <rect x="104" y="42" width="20" height="8" rx="2.5" fill="#0b172a" stroke="#a78bfa" stroke-width="1.1"/>
        <rect x="128" y="24" width="20" height="8" rx="2.5" fill="#0b172a" stroke="#a78bfa" stroke-width="1.1"/>
        <rect x="104" y="130" width="20" height="8" rx="2.5" fill="#0b172a" stroke="#a78bfa" stroke-width="1.1"/>
        <rect x="128" y="148" width="20" height="8" rx="2.5" fill="#0b172a" stroke="#a78bfa" stroke-width="1.1"/>
        <path d="M 224 82 L 264 42 L 272 45 L 250 82 Z M 224 98 L 264 138 L 272 135 L 250 98 Z" fill="rgba(139, 92, 246, 0.1)"/>
        <!-- Double Decker Fuselage -->
        <path d="M 18 90 C 18 76.5 36 76.5 60 76.5 L 240 76.5 C 260 76.5 270 84 272 90 C 270 96 260 103.5 240 103.5 L 60 103.5 C 36 103.5 18 103.5 18 90 Z" fill="#081120" stroke="#f1f5f9" stroke-width="1.7"/>
        <line x1="60" y1="84" x2="236" y2="84" stroke="#a78bfa" stroke-dasharray="2,2" stroke-width="0.9"/>
        <line x1="60" y1="96" x2="236" y2="96" stroke="#a78bfa" stroke-dasharray="2,2" stroke-width="0.9"/>
      </g>
    `,
    '#8b5cf6'
  ),

  // ── 9. AIRBUS A220 ────────────────────────────────────────────────────
  a220: getBlueprintBase(
    'AIRBUS A220-300',
    'KANAT: 35.1m • UZUNLUK: 38.7m',
    'KROKİ // 1:500',
    `
      <g fill="none" stroke="#06b6d4" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round">
        <path d="M 100 83 L 162 25 L 168 27 L 138 83 Z M 100 97 L 162 155 L 168 153 L 138 97 Z" fill="rgba(6, 182, 212, 0.12)"/>
        <line x1="160" y1="20" x2="164" y2="28" stroke="#22d3ee" stroke-width="1.8"/>
        <line x1="160" y1="160" x2="164" y2="152" stroke="#22d3ee" stroke-width="1.8"/>
        <rect x="112" y="52" width="20" height="8.5" rx="3" fill="#0b172a" stroke="#22d3ee" stroke-width="1.2"/>
        <rect x="112" y="119.5" width="20" height="8.5" rx="3" fill="#0b172a" stroke="#22d3ee" stroke-width="1.2"/>
        <path d="M 226 85 L 254 60 L 260 62 L 246 85 Z M 226 95 L 254 120 L 260 118 L 246 95 Z" fill="rgba(6, 182, 212, 0.1)"/>
        <path d="M 30 90 C 30 83 44 83 62 83 L 235 83 C 248 83 256 86 258 90 C 256 94 248 97 235 97 L 62 97 C 44 97 30 97 30 90 Z" fill="#081120" stroke="#f1f5f9" stroke-width="1.5"/>
        <path d="M 40 87 Q 46 85 50 87 M 40 93 Q 46 95 50 93" stroke="#22d3ee" stroke-width="1.4"/>
      </g>
    `,
    '#06b6d4'
  ),

  // ── 10. EMBRAER E-JETS E2 ─────────────────────────────────────────────
  e_jets: getBlueprintBase(
    'EMBRAER E195-E2',
    'KANAT: 33.7m • UZUNLUK: 41.5m',
    'KROKİ // 1:500',
    `
      <g fill="none" stroke="#10b981" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round">
        <path d="M 102 83.5 L 166 24 L 174 27 L 140 83.5 Z M 102 96.5 L 166 156 L 174 153 L 140 96.5 Z" fill="rgba(16, 185, 129, 0.12)"/>
        <line x1="166" y1="24" x2="178" y2="28" stroke="#34d399" stroke-width="1.8"/>
        <line x1="166" y1="156" x2="178" y2="152" stroke="#34d399" stroke-width="1.8"/>
        <rect x="114" y="52" width="20" height="8.5" rx="3" fill="#0b172a" stroke="#34d399" stroke-width="1.2"/>
        <rect x="114" y="119.5" width="20" height="8.5" rx="3" fill="#0b172a" stroke="#34d399" stroke-width="1.2"/>
        <path d="M 228 85 L 256 58 L 262 60 L 248 85 Z M 228 95 L 256 122 L 262 120 L 248 95 Z" fill="rgba(16, 185, 129, 0.1)"/>
        <path d="M 30 90 C 30 83.5 44 83.5 62 83.5 L 238 83.5 C 250 83.5 258 86 260 90 C 258 94 250 96.5 238 96.5 L 62 96.5 C 44 96.5 30 96.5 30 90 Z" fill="#081120" stroke="#f1f5f9" stroke-width="1.5"/>
        <path d="M 40 87 Q 46 85 50 87 M 40 93 Q 46 95 50 93" stroke="#34d399" stroke-width="1.4"/>
      </g>
    `,
    '#10b981'
  ),

  // ── 11. ATR 72-600 (TURBOPROP) ────────────────────────────────────────
  atr72: getBlueprintBase(
    'ATR 72-600 TURBOPROP',
    'KANAT: 27.1m • UZUNLUK: 27.2m',
    'KROKİ // 1:500',
    `
      <g fill="none" stroke="#f97316" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round">
        <!-- High-Wing Architecture across top of fuselage -->
        <path d="M 110 84 L 166 30 L 174 31 L 136 84 Z M 110 96 L 166 150 L 174 149 L 136 96 Z" fill="rgba(249, 115, 22, 0.14)"/>
        <rect x="110" y="84" width="26" height="12" fill="rgba(249, 115, 22, 0.2)" stroke="#f97316" stroke-width="1.1"/>
        <!-- 2x Turboprop Engines with 6-Blade Propeller Discs -->
        <rect x="116" y="52" width="18" height="7.5" rx="2" fill="#0b172a" stroke="#fb923c" stroke-width="1.2"/>
        <circle cx="116" cy="56" r="9" stroke="#fb923c" stroke-width="1" stroke-dasharray="2,2"/>
        <line x1="116" y1="47" x2="116" y2="65" stroke="#fb923c" stroke-width="1.2"/>
        <rect x="116" y="120.5" width="18" height="7.5" rx="2" fill="#0b172a" stroke="#fb923c" stroke-width="1.2"/>
        <circle cx="116" cy="124" r="9" stroke="#fb923c" stroke-width="1" stroke-dasharray="2,2"/>
        <line x1="116" y1="115" x2="116" y2="133" stroke="#fb923c" stroke-width="1.2"/>
        <!-- T-Tail -->
        <line x1="235" y1="90" x2="258" y2="90" stroke="#fb923c" stroke-width="1.8"/>
        <path d="M 248 64 L 260 64 L 264 66 L 254 90 L 264 114 L 260 116 L 248 116 Z" fill="rgba(249, 115, 22, 0.12)" stroke="#fb923c"/>
        <path d="M 32 90 C 32 84 44 84 62 84 L 235 84 C 246 84 254 87 256 90 C 254 93 246 96 235 96 L 62 96 C 44 96 32 96 32 90 Z" fill="#081120" stroke="#f1f5f9" stroke-width="1.5"/>
        <path d="M 40 87 Q 46 85 50 87 M 40 93 Q 46 95 50 93" stroke="#fb923c" stroke-width="1.4"/>
      </g>
    `,
    '#f97316'
  ),

  // ── 12. CONCORDE (SUPERSONIC AIRLINER) ─────────────────────────────────
  concorde: getBlueprintBase(
    'AÉROSPATIALE / BAC CONCORDE',
    'KANAT: 25.6m • UZUNLUK: 61.7m',
    'KROKİ // 1:500',
    `
      <g fill="none" stroke="#e11d48" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round">
        <!-- Ogival Delta Wing -->
        <path d="M 85 86 Q 130 76 168 50 Q 198 32 208 28 L 212 30 L 230 86 Z M 85 94 Q 130 104 168 130 Q 198 148 208 152 L 212 150 L 230 94 Z" fill="rgba(225, 29, 72, 0.14)"/>
        <!-- 4x Olympus Turbojets in Paired Boxes -->
        <rect x="165" y="58" width="26" height="12" rx="2" fill="#0b172a" stroke="#fb7185" stroke-width="1.2"/>
        <rect x="165" y="110" width="26" height="12" rx="2" fill="#0b172a" stroke="#fb7185" stroke-width="1.2"/>
        <!-- Slender Needle Fuselage with Droop Nose -->
        <path d="M 12 90 L 26 86 L 250 86 C 258 86 264 88 268 90 C 264 92 258 94 250 94 L 26 94 Z" fill="#081120" stroke="#f1f5f9" stroke-width="1.5"/>
        <line x1="26" y1="86" x2="12" y2="90" stroke="#fb7185" stroke-width="1.6"/>
        <line x1="26" y1="94" x2="12" y2="90" stroke="#fb7185" stroke-width="1.6"/>
      </g>
    `,
    '#e11d48'
  )
};

export function getAircraftBlueprint(id) {
  return AIRCRAFT_BLUEPRINTS[id] || AIRCRAFT_BLUEPRINTS.b737;
}
