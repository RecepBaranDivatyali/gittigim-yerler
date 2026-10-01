// achievementIcons.js — Premium SVG vector icons for achievement badges
// Each icon is a clean, recognizable inline SVG with gradient fills

const getGrad = (id, cat) => {
  const colors = {
    world: { p: '#3b82f6', l: '#60a5fa', d: '#1e40af' },
    continent: { p: '#8b5cf6', l: '#a78bfa', d: '#5b21b6' },
    turkey: { p: '#ef4444', l: '#f87171', d: '#b91c1c' },
    city: { p: '#f59e0b', l: '#fbbf24', d: '#b45309' },
    aviation: { p: '#0ea5e9', l: '#38bdf8', d: '#0369a1' },
    special: { p: '#10b981', l: '#34d399', d: '#047857' },
    community: { p: '#ec4899', l: '#f472b6', d: '#be185d' }
  };
  const c = colors[cat];
  return `<defs>
    <linearGradient id="grad-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.l}" />
      <stop offset="50%" stop-color="${c.p}" />
      <stop offset="100%" stop-color="${c.d}" />
    </linearGradient>
  </defs>`;
};

const svg = (id, cat, paths) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="url(#grad-${id})" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
  ${getGrad(id, cat)}
  ${paths}
</svg>
`.trim();

export const ACHIEVEMENT_SVGS = {
  // ═══ WORLD — blue gradient ═══════════════════════════════════════
  // Globe with pin marker
  first_country: svg('first_country', 'world', `<circle cx="32" cy="32" r="20"/><ellipse cx="32" cy="32" rx="8" ry="20"/><path d="M12 32h40M14 22h36M14 42h36"/>`),
  // Suitcase
  world_3: svg('world_3', 'world', `<rect x="16" y="24" width="32" height="24" rx="4"/><path d="M24 24v-6a4 4 0 014-4h8a4 4 0 014 4v6"/><path d="M16 34h32"/>`),
  // Airplane
  world_5: svg('world_5', 'world', `<path d="M32 10v44M22 28l10-8 10 8" stroke-width="4"/><path d="M18 30l14-4 14 4" fill="url(#grad-world_5)"/><path d="M26 48l6-4 6 4"/>`),
  // Folded map
  world_10: svg('world_10', 'world', `<path d="M12 18l14-6 12 6 14-6v34l-14 6-12-6-14 6V18z"/><path d="M26 12v34M38 18v34"/>`),
  // Passport book
  world_15: svg('world_15', 'world', `<rect x="18" y="10" width="28" height="44" rx="4"/><circle cx="32" cy="30" r="8"/><path d="M24 44h16M26 48h12"/>`),
  // Compass rose
  world_25: svg('world_25', 'world', `<circle cx="32" cy="32" r="22"/><path d="M32 10v8M32 46v8M10 32h8M46 32h8"/><path d="M32 22l4 10 10-4-10 4 4 10-4-10-10 4 10-4z" fill="url(#grad-world_25)"/>`),
  // Satellite orbiting
  world_40: svg('world_40', 'world', `<circle cx="32" cy="32" r="14"/><ellipse cx="32" cy="32" rx="28" ry="10" transform="rotate(-30 32 32)"/><circle cx="50" cy="18" r="4" fill="url(#grad-world_40)"/>`),
  // Trophy cup
  world_50: svg('world_50', 'world', `<path d="M20 16h24v10c0 8-5 14-12 14s-12-6-12-14V16z"/><path d="M20 20h-6v6c0 4 3 7 6 7M44 20h6v6c0 4-3 7-6 7"/><path d="M28 40v6h8v-6M24 52h16"/>`),
  // Globe with meridians
  world_75: svg('world_75', 'world', `<circle cx="32" cy="32" r="22"/><ellipse cx="32" cy="32" rx="10" ry="22"/><path d="M10 32h44M12 22h40M12 42h40"/>`),
  // 100 with laurel
  world_100: svg('world_100', 'world', `<path d="M10 42c4-20 8-28 14-30M54 42c-4-20-8-28-14-30"/><path d="M10 42c2 4 6 8 10 10M54 42c-2 4-6 8-10 10"/><text x="32" y="38" font-size="18" font-weight="800" text-anchor="middle" fill="url(#grad-world_100)" stroke="none">100</text>`),

  // ═══ CONTINENT — purple gradient ═════════════════════════════════
  // EU flag
  europe_1: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#1e3a8a"/><g fill="#facc15">${[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>`<circle cx="${32+18*Math.cos(a*Math.PI/180)}" cy="${32-18*Math.sin(a*Math.PI/180)}" r="2.5"/>`).join('')}</g></svg>`,
  // Castle tower
  europe_3: svg('europe_3', 'continent', `<path d="M18 52V28h4v-6h4v6h12v-6h4v6h4v24H18z"/><rect x="28" y="38" width="8" height="14" rx="4"/><path d="M18 22h4M26 22h4M34 22h4M42 22h4"/>`),
  // Eiffel tower
  europe_5: svg('europe_5', 'continent', `<path d="M32 8l-12 44h24L32 8z"/><path d="M22 34h20M26 24h12M24 44h16"/><path d="M20 52l2-8M44 52l-2-8"/>`),
  // Greek column
  europe_10: svg('europe_10', 'continent', `<rect x="14" y="10" width="36" height="6" rx="2"/><rect x="14" y="48" width="36" height="6" rx="2"/><path d="M20 16v32M28 16v32M36 16v32M44 16v32"/>`),
  // Royal crown
  europe_20: svg('europe_20', 'continent', `<path d="M12 42l6-20 14 10 14-10 6 20H12z" fill="url(#grad-europe_20)"/><path d="M12 42h40M14 48h36"/><circle cx="18" cy="22" r="3"/><circle cx="32" cy="18" r="3"/><circle cx="46" cy="22" r="3"/>`),
  // Pagoda temple
  asia_1: svg('asia_1', 'continent', `<path d="M32 10l-18 10h36zM32 20l-14 8h28zM32 28l-10 6h20z"/><path d="M26 34v18h12V34"/><rect x="30" y="38" width="4" height="14"/>`),
  // Camel
  asia_3: svg('asia_3', 'continent', `<path d="M12 48h4v-10c0-4 2-6 4-8l2-6c0-2 2-4 4-2v-4c2-6 6-4 6 0l4-2c2-2 4 0 4 4v12c0 4 2 6 4 6h4" stroke-width="3.5"/><path d="M12 52h44"/>`),
  // Dragon serpent
  asia_5: svg('asia_5', 'continent', `<path d="M14 20c6-4 14-4 18 2 4 6 10 6 14 0" stroke-width="4"/><path d="M14 20c-4 8 0 16 8 18s16 0 20-6c4-6 10-4 12 2" stroke-width="4"/><circle cx="14" cy="20" r="3" fill="url(#grad-asia_5)"/><path d="M10 16l4 4M10 24l4-4"/>`),
  // Torii gate
  asia_10: svg('asia_10', 'continent', `<path d="M8 18c8-4 16-6 24-6s16 2 24 6"/><path d="M14 18v4h36v-4"/><path d="M20 22v30M44 22v30"/><path d="M14 32h36"/>`),
  // Lion face
  africa_1: svg('africa_1', 'continent', `<circle cx="32" cy="34" r="12"/><circle cx="32" cy="34" r="20" stroke-dasharray="5 5"/><circle cx="27" cy="31" r="2" fill="url(#grad-africa_1)"/><circle cx="37" cy="31" r="2" fill="url(#grad-africa_1)"/><path d="M28 38c2 2 6 2 8 0"/><path d="M32 34v3"/>`),
  // Desert dunes with sun
  africa_3: svg('africa_3', 'continent', `<circle cx="48" cy="16" r="6" fill="url(#grad-africa_3)"/><path d="M4 48c10-14 18-14 28 0M28 48c8-10 16-10 32 0"/>`),
  // Elephant
  africa_5: svg('africa_5', 'continent', `<circle cx="32" cy="28" r="14"/><path d="M18 28l-6 14"/><path d="M22 42v8M30 42v8M38 42v8M44 42v8"/><path d="M18 42h30"/><circle cx="38" cy="24" r="2" fill="url(#grad-africa_5)"/><path d="M46 28c2 0 4 2 4 4v6"/>`),
  // Statue of Liberty torch
  americas_1: svg('americas_1', 'continent', `<path d="M32 52V22"/><path d="M24 52h16"/><path d="M24 36h16"/><rect x="28" y="10" width="8" height="12" rx="4" fill="url(#grad-americas_1)"/><path d="M32 10v-4"/><path d="M28 8l-2-4M36 8l2-4M32 6v-4"/>`),
  // Palm tree
  americas_3: svg('americas_3', 'continent', `<path d="M32 28v24"/><path d="M28 52h8"/><path d="M32 28c-4-10-16-12-20-8M32 28c4-10 16-12 20-8M32 28c-8-8-8-18-4-22M32 28c8-8 8-18 4-22M32 28c-12-4-18-2-20 2M32 28c12-4 18-2 20 2"/>`),
  // Llama
  americas_5: svg('americas_5', 'continent', `<path d="M20 48v-16h24v16"/><path d="M20 32c0-4-2-14 0-18l6 6h12l6-6c2 4 0 14 0 18"/><path d="M24 48v-8M28 48v-8M36 48v-8M40 48v-8"/><circle cx="28" cy="16" r="2" fill="url(#grad-americas_5)"/>`),
  // Kangaroo
  oceania_1: svg('oceania_1', 'continent', `<path d="M22 44v6M30 44v6"/><path d="M18 44h16c0-8-2-12 0-18 2-4 6-8 6-14 0-4-4-6-6-4l-4 8-6-2c-4 0-6 4-6 10v20z" stroke-width="3"/><path d="M40 44c4 0 8 2 12 4"/><circle cx="32" cy="16" r="2" fill="url(#grad-oceania_1)"/>`),
  // Surfboard with wave
  oceania_2: svg('oceania_2', 'continent', `<path d="M8 40c8-8 16-8 24 0s16 8 24 0"/><path d="M36 8l-8 36 6 2 8-36z" fill="url(#grad-oceania_2)" stroke-width="2.5"/><path d="M8 48c8-6 16-6 24 0s16 6 24 0" stroke-width="2"/>`),
  // Half-half globe
  two_continents: svg('two_continents', 'continent', `<circle cx="32" cy="32" r="22"/><path d="M32 10v44" stroke-dasharray="4 3"/><path d="M32 10a22 22 0 010 44" fill="url(#grad-two_continents)"/>`),
  // Globe with 3 sections
  three_continents: svg('three_continents', 'continent', `<circle cx="32" cy="32" r="22"/><path d="M32 10l-12 38M32 10l12 38M10 36h44"/>`),
  // Globe 4 sections
  four_continents: svg('four_continents', 'continent', `<circle cx="32" cy="32" r="22"/><path d="M32 10v44M10 32h44"/><circle cx="22" cy="22" r="4" fill="url(#grad-four_continents)"/><circle cx="42" cy="42" r="4" fill="url(#grad-four_continents)"/>`),
  // Medal with star
  five_continents: svg('five_continents', 'continent', `<circle cx="32" cy="36" r="18"/><path d="M24 10l8 10 8-10"/><path d="M32 28l3 8 8 1-6 5 2 8-7-5-7 5 2-8-6-5 8-1z" fill="url(#grad-five_continents)"/>`),
  // Galaxy spiral — all continents
  six_continents: svg('six_continents', 'continent', `<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="14"/><circle cx="32" cy="32" r="6" fill="url(#grad-six_continents)"/><path d="M32 10v6M32 48v6M10 32h6M48 32h6"/>`),

  // ═══ TURKEY — red gradient ═══════════════════════════════════════
  // Turkish crescent & star flag
  turkey_first: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#e30a17"/><path d="M36 18a14 14 0 100 28 10 10 0 110-28z" fill="#fff"/><path d="M42 28l2 6 6 0-5 4 2 6-5-4-5 4 2-6-5-4 6 0z" fill="#fff"/></svg>`,
  // Car on road
  turkey_5: svg('turkey_5', 'turkey', `<rect x="14" y="28" width="36" height="16" rx="8"/><path d="M22 28l4-10h12l4 10"/><circle cx="22" cy="44" r="5"/><circle cx="42" cy="44" r="5"/><path d="M8 50h48"/>`),
  // Mosque
  turkey_10: svg('turkey_10', 'turkey', `<path d="M16 44c0-12 16-20 16-20s16 8 16 20"/><path d="M12 44h40M12 50h40"/><path d="M48 44V24l4-8"/><circle cx="32" cy="24" r="4" fill="url(#grad-turkey_10)"/>`),
  // Backpack
  turkey_20: svg('turkey_20', 'turkey', `<rect x="20" y="22" width="24" height="28" rx="6"/><path d="M26 22v-6c0-3 4-6 6-6s6 3 6 6v6"/><path d="M20 34h24"/><rect x="28" y="34" width="8" height="8" rx="2"/>`),
  // Eagle wings
  turkey_40: svg('turkey_40', 'turkey', `<path d="M32 22c-4-6-14-10-22-8 4 6 10 12 18 14zM32 22c4-6 14-10 22-8-4 6-10 12-18 14z" fill="url(#grad-turkey_40)"/><path d="M32 22v16"/><path d="M24 44l8-6 8 6"/><path d="M28 44v8M36 44v8"/>`),
  // Mountain peak
  turkey_60: svg('turkey_60', 'turkey', `<path d="M8 52l16-32 8 10 8-10 16 32H8z"/><path d="M24 20l-4 6M40 20l4 6"/><path d="M28 36h8" fill="url(#grad-turkey_60)"/>`),
  // Gold medal #1
  turkey_all: svg('turkey_all', 'turkey', `<circle cx="32" cy="36" r="16"/><path d="M24 10l8 10 8-10"/><path d="M24 10h16" stroke-width="2"/><text x="32" y="42" font-size="18" font-weight="800" text-anchor="middle" fill="url(#grad-turkey_all)" stroke="none">1</text>`),
  // Rainbow arc
  all_7_regions: svg('all_7_regions', 'turkey', `<path d="M8 48a24 24 0 0148 0" stroke-width="3" stroke="#ef4444"/><path d="M12 48a20 20 0 0140 0" stroke-width="3" stroke="#f59e0b"/><path d="M16 48a16 16 0 0132 0" stroke-width="3" stroke="#22c55e"/><path d="M20 48a12 12 0 0124 0" stroke-width="3" stroke="#3b82f6"/><path d="M24 48a8 8 0 0116 0" stroke-width="3" stroke="#8b5cf6" />`),
  // Wave
  region_marmara: svg('region_marmara', 'turkey', `<path d="M6 28c6-6 12-6 18 0s12 6 18 0 12-6 18 0"/><path d="M6 40c6-6 12-6 18 0s12 6 18 0 12-6 18 0"/>`),
  // Beach umbrella
  region_ege: svg('region_ege', 'turkey', `<path d="M32 18v34"/><path d="M12 28c0-12 20-20 20-20s20 8 20 20" fill="url(#grad-region_ege)"/><path d="M22 28c0-6 10-12 10-12s10 6 10 12"/><path d="M40 52c4-4 8-2 10 0"/>`),
  // Sun with rays
  region_akdeniz: svg('region_akdeniz', 'turkey', `<circle cx="32" cy="32" r="10" fill="url(#grad-region_akdeniz)"/><path d="M32 12v8M32 44v8M12 32h8M44 32h8M18 18l6 6M40 40l6 6M18 46l6-6M40 24l6-6"/>`),
  // Pine tree
  region_karadeniz: svg('region_karadeniz', 'turkey', `<path d="M32 8l-14 18h8l-10 14h10l-8 12h28l-8-12h10l-10-14h8z" fill="url(#grad-region_karadeniz)"/><rect x="30" y="52" width="4" height="6"/>`),
  // Wheat stalks
  region_ic_anadolu: svg('region_ic_anadolu', 'turkey', `<path d="M22 52V30l-6-4 6-2V18l-6-4 6-2V8M32 52V34l-6-4 6-2V22l-6-4 6-2V12M42 52V30l6-4-6-2V18l6-4-6-2V8"/>`),
  // Mountain range
  region_dogu_anadolu: svg('region_dogu_anadolu', 'turkey', `<path d="M4 52l14-28 8 10 10-18 8 12 6-8 10 16v16H4z"/><path d="M30 18l6 10"/>`),
  // Ancient pillar
  region_guneydogu: svg('region_guneydogu', 'turkey', `<rect x="14" y="8" width="36" height="8" rx="3"/><rect x="14" y="48" width="36" height="8" rx="3"/><path d="M22 16v32M32 16v32M42 16v32"/>`),

  // ═══ CITY — amber/gold gradient ══════════════════════════════════
  // City skyline
  city_first: svg('city_first', 'city', `<path d="M8 52V36h8V28h8v-8h6v-6h4v6h6v8h8v8h8v16H8z"/><rect x="18" y="36" width="4" height="4" fill="url(#grad-city_first)"/><rect x="30" y="24" width="4" height="4" fill="url(#grad-city_first)"/><rect x="42" y="36" width="4" height="4" fill="url(#grad-city_first)"/>`),
  // Taxi
  city_3: svg('city_3', 'city', `<path d="M14 38h36v8H14z" rx="2"/><path d="M20 38l4-10h16l4 10"/><circle cx="20" cy="46" r="4"/><circle cx="44" cy="46" r="4"/><rect x="26" y="24" width="12" height="4" rx="2" fill="url(#grad-city_3)"/>`),
  // Houses
  city_5: svg('city_5', 'city', `<path d="M8 34l12-12 12 12v18H8V34z"/><path d="M32 30l12-12 12 12v22H32V30z"/><rect x="16" y="40" width="6" height="12" rx="1"/><rect x="40" y="38" width="6" height="14" rx="1"/>`),
  // Sunset over buildings
  city_10: svg('city_10', 'city', `<circle cx="32" cy="30" r="10" fill="url(#grad-city_10)"/><path d="M8 52V36h10v-8h10v-4h8v4h10v8h10v16H8z"/>`),
  // Target bullseye
  city_20: svg('city_20', 'city', `<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="14"/><circle cx="32" cy="32" r="6"/><circle cx="32" cy="32" r="2" fill="url(#grad-city_20)"/>`),
  // Night city
  city_35: svg('city_35', 'city', `<path d="M8 52V32h10v-8h8v-10h12v10h8v8h10v20H8z"/><rect x="14" y="36" width="4" height="4" fill="url(#grad-city_35)"/><rect x="22" y="28" width="4" height="4" fill="url(#grad-city_35)"/><rect x="34" y="20" width="4" height="4" fill="url(#grad-city_35)"/><rect x="44" y="28" width="4" height="4" fill="url(#grad-city_35)"/>`),
  // City + stars
  city_50: svg('city_50', 'city', `<path d="M12 52V34h10v-10h8v-8h4v8h8v10h10v18H12z"/><path d="M16 10l1 3h3l-2 2 1 3-3-2-3 2 1-3-2-2h3z" fill="url(#grad-city_50)"/><path d="M50 14l1 2h2l-2 1 1 2-2-1-2 1 1-2-2-1h2z" fill="url(#grad-city_50)"/>`),
  // Diamond gem
  city_100: svg('city_100', 'city', `<path d="M16 22h32l-16 32z"/><path d="M16 22l8-10h16l8 10"/><path d="M24 12l8 10 8-10M16 22l16 8 16-8"/>`),
  // Location pin
  city_3_in_one: svg('city_3_in_one', 'city', `<path d="M32 10c-10 0-18 8-18 18 0 14 18 28 18 28s18-14 18-28c0-10-8-18-18-18z"/><circle cx="32" cy="28" r="6" fill="url(#grad-city_3_in_one)"/>`),
  // Magnifying glass
  city_5_in_one: svg('city_5_in_one', 'city', `<circle cx="28" cy="28" r="14"/><path d="M38 38l14 14" stroke-width="5"/><circle cx="28" cy="28" r="6" fill="url(#grad-city_5_in_one)"/>`),
  // House with heart
  city_10_in_one: svg('city_10_in_one', 'city', `<path d="M8 30l24-20 24 20v22H8V30z"/><path d="M32 32c-2-4-8-4-8 0 0 6 8 12 8 12s8-6 8-12c0-4-6-4-8 0z" fill="url(#grad-city_10_in_one)"/>`),

  // ═══ AVIATION — sky blue gradient ════════════════════════════════
  // Airplane taking off
  first_flight: svg('first_flight', 'aviation', `<path d="M28 14l-16 22h12l-4 16h4l12-18 16 6 4-4-24-14z" fill="url(#grad-first_flight)" stroke-width="2.5"/><path d="M8 56h48"/>`),
  // Turkish crescent on wing
  turkish_fleet_master: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="grad-tfm" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="50%" stop-color="#0ea5e9"/><stop offset="100%" stop-color="#0369a1"/></linearGradient></defs><path d="M12 40l32-14 8 6-40 16z" fill="url(#grad-tfm)" stroke="url(#grad-tfm)" stroke-width="2"/><circle cx="38" cy="22" r="10" fill="#e30a17"/><path d="M40 16a5 5 0 100 12 4 4 0 110-12z" fill="#fff"/><path d="M44 20l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="#fff"/></svg>`,
  // Star
  star_collector: svg('star_collector', 'aviation', `<path d="M32 10l7 18h18l-14 11 5 17-16-11-16 11 5-17L7 28h18z" fill="url(#grad-star_collector)" stroke-width="2.5"/>`),
  // SkyTeam swirl
  skyteam_rider: svg('skyteam_rider', 'aviation', `<circle cx="32" cy="32" r="20"/><path d="M32 16c8 0 14 6 14 14" stroke-width="4"/><path d="M32 16c-4 4-4 12 0 16" stroke-width="4"/><circle cx="32" cy="32" r="4" fill="url(#grad-skyteam_rider)"/>`),
  // Diamond gem in circle
  oneworld_flyer: svg('oneworld_flyer', 'aviation', `<circle cx="32" cy="32" r="20"/><path d="M32 14l14 18-14 18-14-18z" fill="url(#grad-oneworld_flyer)"/>`),
  // Whale (big plane)
  sky_giant: svg('sky_giant', 'aviation', `<path d="M8 32c0-10 10-16 24-16s24 6 24 16-10 16-24 16S8 42 8 32z"/><circle cx="46" cy="28" r="3" fill="url(#grad-sky_giant)"/><path d="M8 32l-4-6M8 36l-4 6"/>`),
  // Rocket
  modern_fleet: svg('modern_fleet', 'aviation', `<path d="M32 8c-6 10-8 20-8 28h16c0-8-2-18-8-28z"/><path d="M24 36l-8 10h8M40 36l8 10h-8"/><circle cx="32" cy="28" r="4" fill="url(#grad-modern_fleet)"/><path d="M28 48h8v6h-8z"/>`),
  // Plane landing
  fleet_collector: svg('fleet_collector', 'aviation', `<path d="M8 24l32 14 12-4-40-16z" fill="url(#grad-fleet_collector)" stroke-width="2.5"/><path d="M8 52h48"/><path d="M42 34l-2 18"/>`),
  // Boarding pass
  frequent_flyer: svg('frequent_flyer', 'aviation', `<rect x="10" y="18" width="44" height="28" rx="4"/><path d="M38 18v28" stroke-dasharray="4 4"/><circle cx="24" cy="32" r="6" fill="url(#grad-frequent_flyer)"/><path d="M44 28h6M44 32h6M44 36h6"/>`),
  // Lightning bolt
  lowcost_adventurer: svg('lowcost_adventurer', 'aviation', `<path d="M36 8L18 34h12l-6 22 22-28H34z" fill="url(#grad-lowcost_adventurer)" stroke-width="2.5"/>`),
  // Fleur-de-lis
  quad_jet_legend: svg('quad_jet_legend', 'aviation', `<path d="M32 8c0 12-6 16-6 24 0 4 2 6 6 6s6-2 6-6c0-8-6-12-6-24z" fill="url(#grad-quad_jet_legend)"/><path d="M26 38c-6 0-10-4-10-10 4 2 8 6 10 10M38 38c6 0 10-4 10-10-4 2-8 6-10 10"/><path d="M26 50h12"/><path d="M32 38v12"/>`),

  // ═══ SPECIAL — emerald gradient ══════════════════════════════════
  // Calendar
  planner: svg('planner', 'special', `<rect x="12" y="16" width="40" height="36" rx="4"/><path d="M12 28h40"/><path d="M22 10v12M42 10v12"/><path d="M22 36h6M22 42h6M36 36h6M36 42h6"/>`),
  // Calendar with check
  big_planner: svg('big_planner', 'special', `<rect x="12" y="16" width="40" height="36" rx="4"/><path d="M12 28h40M22 10v12M42 10v12"/><path d="M24 38l6 6 12-12" stroke-width="4"/>`),
  // Dream cloud
  dreamer: svg('dreamer', 'special', `<circle cx="32" cy="28" r="12"/><circle cx="20" cy="32" r="8"/><circle cx="44" cy="32" r="8"/><circle cx="26" cy="22" r="6"/><circle cx="38" cy="22" r="6"/><circle cx="18" cy="48" r="3"/><circle cx="12" cy="54" r="2"/>`),
  // Shooting star
  big_dreamer: svg('big_dreamer', 'special', `<path d="M48 12L16 44" stroke-width="3"/><path d="M48 12l4 2-2 4M48 12l-6-2M48 12l2-6"/><path d="M16 44l-3 6h6l-3 6h6" fill="url(#grad-big_dreamer)"/><path d="M36 16l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="url(#grad-big_dreamer)"/><path d="M24 28l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="url(#grad-big_dreamer)"/>`),
  // Handshake
  neighbor: svg('neighbor', 'special', `<path d="M8 28h12l4-4h4l8 8 8-4h12"/><path d="M8 28v12l12 4 6-4"/><path d="M56 28v12l-12 4-6-4"/><path d="M28 24l8 8"/>`),
  // Violin
  balkan_tour: svg('balkan_tour', 'special', `<path d="M24 14c0-4 16-4 16 0v8c-4 4-4 8 0 12v8c0 4-16 4-16 0v-8c4-4 4-8 0-12V14z"/><path d="M32 14v28"/><path d="M26 30h12"/>`),
  // Sailboat
  mediterranean: svg('mediterranean', 'special', `<path d="M32 12v32"/><path d="M32 14l18 20H32z" fill="url(#grad-mediterranean)"/><path d="M32 18l-12 16h12"/><path d="M8 48c8-4 16-4 24 0s16 4 24 0"/>`),
  // Briefcase
  g20: svg('g20', 'special', `<rect x="12" y="24" width="40" height="24" rx="4"/><path d="M24 24v-8c0-2 2-4 4-4h8c2 0 4 2 4 4v8"/><path d="M12 36h40"/><rect x="28" y="32" width="8" height="8" rx="2"/>`),
  // Snowflake
  nordic: svg('nordic', 'special', `<path d="M32 8v48M8 32h48M14 14l36 36M14 50l36-36"/><path d="M32 16l-4 4M32 16l4 4M32 48l-4-4M32 48l4-4M16 32l4-4M16 32l4 4M48 32l-4-4M48 32l-4 4"/>`),
  // Lantern
  far_east: svg('far_east', 'special', `<path d="M28 10h8"/><path d="M32 10v6"/><ellipse cx="32" cy="30" rx="12" ry="14" fill="url(#grad-far_east)"/><path d="M20 30h24"/><path d="M22 38h20"/><path d="M28 44h8v4h-8z"/><path d="M30 48v4M34 48v4"/>`),
  // Wolf head
  turkic_world: svg('turkic_world', 'special', `<path d="M16 14l8 18v14l8 8 8-8V32l8-18" stroke-width="3.5"/><path d="M24 32l-6 4M40 32l6 4"/><circle cx="28" cy="34" r="2.5" fill="url(#grad-turkic_world)"/><circle cx="36" cy="34" r="2.5" fill="url(#grad-turkic_world)"/><path d="M30 40l2 2 2-2"/>`),

  // ═══ COMMUNITY — pink gradient ═══════════════════════════════════
  // Envelope with letter
  first_feedback: svg('first_feedback', 'community', `<rect x="10" y="20" width="44" height="28" rx="4"/><path d="M10 24l22 14 22-14"/><path d="M10 44l14-10M54 44l-14-10"/>`),
  // Bug/beetle
  bug_hunter: svg('bug_hunter', 'community', `<ellipse cx="32" cy="34" rx="10" ry="14"/><circle cx="32" cy="18" r="6"/><path d="M32 24v24"/><path d="M22 34h20"/><path d="M18 24l-6-6M46 24l6-6M16 34h-6M48 34h6M18 44l-6 6M46 44l6 6"/>`),
  // Lightbulb
  feature_contributor: svg('feature_contributor', 'community', `<path d="M24 38c-6-4-10-10-10-18 0-10 8-14 18-14s18 4 18 14c0 8-4 14-10 18"/><path d="M24 38v6c0 4 4 6 8 6s8-2 8-6v-6"/><path d="M26 44h12M26 48h12"/><path d="M32 20v8M26 22l4 6M38 22l-4 6"/>`),
  // Wrench
  issue_resolved: svg('issue_resolved', 'community', `<path d="M18 46l20-20c-2-6 0-12 6-16l-6 6 4 4 6-6c-4 6-10 8-16 6L12 40c-2 2-2 6 0 8s6 2 8-2z" fill="url(#grad-issue_resolved)" stroke-width="2.5"/><circle cx="14" cy="44" r="2" fill="url(#grad-issue_resolved)"/>`)
};
