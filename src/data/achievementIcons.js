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

const createSvg = (id, cat, paths) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="url(#grad-${id})" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
  ${getGrad(id, cat)}
  ${paths}
</svg>
`.trim();

export const ACHIEVEMENT_SVGS = {
  // WORLD
  first_country: createSvg('first_country', 'world', `<circle cx="32" cy="32" r="22" stroke-width="4"/><path d="M32 12c-5.5 0-10 4.5-10 10 0 7 10 18 10 18s10-11 10-18c0-5.5-4.5-10-10-10zm0 14a4 4 0 110-8 4 4 0 010 8z" fill="url(#grad-first_country)"/>`),
  world_3: createSvg('world_3', 'world', `<rect x="14" y="24" width="36" height="26" rx="4" stroke-width="4"/><path d="M24 24v-6a4 4 0 014-4h8a4 4 0 014 4v6M20 24v26M44 24v26"/>`),
  world_5: createSvg('world_5', 'world', `<path d="M22 42l26-22-6-6-22 26z" fill="url(#grad-world_5)"/><path d="M22 42L12 40l6-12M48 20l4 8-12 6M10 52h44" stroke-width="4"/>`),
  world_10: createSvg('world_10', 'world', `<path d="M14 18l12-6 12 6 12-6v34l-12 6-12-6-12 6V18zM26 12v34M38 18v34" stroke-width="4"/>`),
  world_15: createSvg('world_15', 'world', `<rect x="18" y="12" width="28" height="40" rx="3" stroke-width="4"/><circle cx="32" cy="30" r="6"/><path d="M24 42h16M28 48h8"/>`),
  world_25: createSvg('world_25', 'world', `<circle cx="32" cy="32" r="24" stroke-width="4"/><path d="M32 16l4 12 12 4-12 4-4 12-4-12-12-4 12-4 4-12z" fill="url(#grad-world_25)"/>`),
  world_40: createSvg('world_40', 'world', `<circle cx="32" cy="32" r="14" stroke-width="4"/><path d="M12 52c16-16 24-24 40-40" stroke-width="4" stroke-dasharray="6 6"/><rect x="42" y="14" width="8" height="8" transform="rotate(45 46 18)" fill="url(#grad-world_40)"/>`),
  world_50: createSvg('world_50', 'world', `<path d="M16 16h32v12c0 10-8 16-16 16s-16-6-16-16V16z" stroke-width="4"/><path d="M26 56h12M32 44v12M16 20H8v6c0 4 3 6 8 6M48 20h8v6c0 4-3 6-8 6"/>`),
  world_75: createSvg('world_75', 'world', `<circle cx="32" cy="32" r="22" stroke-width="4"/><path d="M32 10c6 0 10 10 10 22s-4 22-10 22-10-10-10-22 4-22 10-22z"/><path d="M10 32h44"/>`),
  world_100: createSvg('world_100', 'world', `<path d="M16 48c-4-8-4-18 0-26M48 48c4-8 4-18 0-26" stroke-width="4"/><text x="32" y="38" font-size="20" font-weight="bold" text-anchor="middle" fill="url(#grad-world_100)" stroke="none">100</text>`),

  // CONTINENT
  europe_1: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#1e3a8a" /><g fill="#facc15"><circle cx="32" cy="10" r="2.5"/><circle cx="32" cy="54" r="2.5"/><circle cx="10" cy="32" r="2.5"/><circle cx="54" cy="32" r="2.5"/><circle cx="21" cy="13" r="2.5"/><circle cx="43" cy="13" r="2.5"/><circle cx="21" cy="51" r="2.5"/><circle cx="43" cy="51" r="2.5"/><circle cx="13" cy="21" r="2.5"/><circle cx="13" cy="43" r="2.5"/><circle cx="51" cy="21" r="2.5"/><circle cx="51" cy="43" r="2.5"/></g></svg>`,
  europe_3: createSvg('europe_3', 'continent', `<path d="M20 24v28h24V24l-4-4v-8h-4v8h-8v-8h-4v8l-4 4z" stroke-width="4"/><rect x="28" y="36" width="8" height="16"/>`),
  europe_5: createSvg('europe_5', 'continent', `<path d="M24 52h16M32 12l-8 40h16zM26 32h12M28 22h8" stroke-width="4"/>`),
  europe_10: createSvg('europe_10', 'continent', `<path d="M16 16h32M18 16v32M27 16v32M37 16v32M46 16v32M14 48h36M12 54h40" stroke-width="4"/>`),
  europe_20: createSvg('europe_20', 'continent', `<path d="M14 44l-4-24 12 8 10-16 10 16 12-8-4 24z" stroke-width="4"/><path d="M14 48h36M16 54h32"/>`),
  asia_1: createSvg('asia_1', 'continent', `<path d="M32 12l-16 8h32zM24 20v8M40 20v8M32 28l-20 8h40zM20 36v12M44 36v12M32 48l-24 8h48z" stroke-width="3"/>`),
  asia_3: createSvg('asia_3', 'continent', `<path d="M16 44v4M22 44v4M40 44v4M46 44v4M16 44c0-8-4-12-4-12 0-8 6-10 10-4 4-8 12-10 16-4 4 0 8 4 8 12h4s2 4-2 8M16 44h30" stroke-width="4"/>`),
  asia_5: createSvg('asia_5', 'continent', `<path d="M12 32c10-10 20-10 30 0s10 20 0 30" stroke-width="4"/><circle cx="42" cy="22" r="4"/><path d="M46 22l6-6M38 18l-4-8M24 24l-6-6"/>`),
  asia_10: createSvg('asia_10', 'continent', `<path d="M16 20v32M48 20v32M10 24h44M12 34h40M16 20c0-6 16-8 16-8s16 2 16 8" stroke-width="4"/>`),
  africa_1: createSvg('africa_1', 'continent', `<circle cx="32" cy="32" r="16" stroke-width="4"/><path d="M16 32c0 8 16 20 16 20s16-12 16-20M24 24h16M32 16v8" stroke-width="4"/>`),
  africa_3: createSvg('africa_3', 'continent', `<path d="M8 48c8-12 16-12 24 0M24 48c10-16 22-16 32 0" stroke-width="4"/><circle cx="32" cy="24" r="8"/>`),
  africa_5: createSvg('africa_5', 'continent', `<path d="M48 44v8M36 44v8M24 44v8M16 44v8M48 32c0-8-10-12-16-12s-16 4-16 12c-8 0-10 8-10 16M48 32c8 0 10 8 10 16M32 32v12" stroke-width="4"/>`),
  americas_1: createSvg('americas_1', 'continent', `<path d="M32 16v16M24 24l8 8M40 24l-8 8M32 32v16M24 48h16" stroke-width="4"/><path d="M32 16l-4-8h8z" fill="url(#grad-americas_1)"/>`),
  americas_3: createSvg('americas_3', 'continent', `<path d="M32 52c-4-12-4-24 0-36M32 16c-8 0-16 8-16 8s8-4 16 0M32 16c8 0 16 8 16 8s-8-4-16 0M32 24c-12 0-20 12-20 12s12-4 20 0M32 24c12 0 20 12 20 12s-12-4-20 0" stroke-width="4"/>`),
  americas_5: createSvg('americas_5', 'continent', `<path d="M40 24c0-6-6-8-12-8s-8 4-8 4v16l-8 8v8h8v-8l8-4h4v12h8V36h4v-8h-4z" stroke-width="4"/>`),
  oceania_1: createSvg('oceania_1', 'continent', `<path d="M16 48l8-8c4-4 8-4 12 0l4 4M24 40c0-8 8-12 16-12l8-8M40 28l8 8" stroke-width="4"/>`),
  oceania_2: createSvg('oceania_2', 'continent', `<path d="M16 48c16-16 32-16 40 0M16 48c0-8 8-16 16-16" stroke-width="4"/><path d="M24 24l16-16 8 8-16 16z" fill="url(#grad-oceania_2)"/>`),
  two_continents: createSvg('two_continents', 'continent', `<circle cx="32" cy="32" r="22" stroke-width="4"/><path d="M32 10v44c12 0 22-10 22-22S44 10 32 10z" fill="url(#grad-two_continents)"/>`),
  three_continents: createSvg('three_continents', 'continent', `<circle cx="32" cy="32" r="22" stroke-width="4"/><path d="M40 20c-8 8-8 16 0 24M24 20c8 8 8 16 0 24" stroke-width="4"/>`),
  four_continents: createSvg('four_continents', 'continent', `<circle cx="32" cy="32" r="22" stroke-width="4"/><path d="M20 24c8 0 16 8 16 16M44 24c-8 0-16 8-16 16" stroke-width="4"/>`),
  five_continents: createSvg('five_continents', 'continent', `<circle cx="32" cy="36" r="16" stroke-width="4"/><path d="M24 12l8 8 8-8" stroke-width="4"/><path d="M32 28l3 8 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" fill="url(#grad-five_continents)"/>`),
  six_continents: createSvg('six_continents', 'continent', `<path d="M32 16c12 0 16 8 16 16s-8 16-16 16-16-8-16-16 4-16 16-16zM32 24c4 0 8 4 8 8s-4 8-8 8-8-4-8-8 4-8 8-8z" stroke-width="4"/>`),

  // TURKEY
  turkey_first: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#ef4444" /><path d="M38 18a14 14 0 100 28 12 12 0 110-28zm6 13l-4 3 1.5 4-4-3-4 3 1.5-4-4-3h5l1.5-4 1.5 4h5z" fill="#fff" /></svg>`,
  turkey_5: createSvg('turkey_5', 'turkey', `<path d="M12 40l6-16h28l6 16v8H12v-8z" stroke-width="4"/><circle cx="20" cy="40" r="4"/><circle cx="44" cy="40" r="4"/><path d="M22 28h20" stroke-width="4"/>`),
  turkey_10: createSvg('turkey_10', 'turkey', `<path d="M16 48v-16c0-8 16-16 16-16s16 8 16 16v16" stroke-width="4"/><path d="M12 48h40M48 20v28M46 16h4M32 16V8M30 8h4" stroke-width="4"/>`),
  turkey_20: createSvg('turkey_20', 'turkey', `<rect x="20" y="20" width="24" height="32" rx="6" stroke-width="4"/><path d="M24 20v-4c0-4 16-4 16 0v4M20 32h24M24 32v20M40 32v20" stroke-width="4"/>`),
  turkey_40: createSvg('turkey_40', 'turkey', `<path d="M32 24c0-8 8-12 8-12s4 4 4 12c0 8-12 12-12 12s-12-4-12-12c0-8 4-12 4-12s8 4 8 12z" fill="url(#grad-turkey_40)"/><path d="M32 36l-16 12M32 36l16 12M16 24l-8 8M48 24l8 8" stroke-width="4"/>`),
  turkey_60: createSvg('turkey_60', 'turkey', `<path d="M12 48l12-24 8 8 12-16 8 32H12z" stroke-width="4"/><path d="M24 24l4 8 4-4M44 32l-4 8-4-4" stroke-width="4"/>`),
  turkey_all: createSvg('turkey_all', 'turkey', `<circle cx="32" cy="36" r="16" stroke-width="4"/><path d="M24 12l8 8 8-8M24 12v8l8 8 8-8v-8" stroke-width="4"/><text x="32" y="42" font-size="16" font-weight="bold" text-anchor="middle" fill="url(#grad-turkey_all)" stroke="none">1</text>`),
  all_7_regions: createSvg('all_7_regions', 'turkey', `<path d="M12 48c0-12 10-24 20-24s20 12 20 24" stroke-width="8" stroke="url(#grad-all_7_regions)" stroke-linecap="round"/><path d="M20 48c0-8 6-16 12-16s12 8 12 16" stroke-width="8" stroke="#f87171" stroke-linecap="round"/>`),
  region_marmara: createSvg('region_marmara', 'turkey', `<path d="M12 36c4-4 8-4 12 0s8 4 12 0 8-4 12 0M12 48c4-4 8-4 12 0s8 4 12 0 8-4 12 0" stroke-width="4"/>`),
  region_ege: createSvg('region_ege', 'turkey', `<path d="M16 32h32c0-8-8-16-16-16s-16 8-16 16z" fill="url(#grad-region_ege)"/><path d="M32 32v20M24 32v4M40 32v4" stroke-width="4"/>`),
  region_akdeniz: createSvg('region_akdeniz', 'turkey', `<circle cx="32" cy="32" r="12" stroke-width="4"/><path d="M32 12v4M32 48v4M12 32h4M48 32h4M18 18l4 4M42 42l4 4M18 46l4-4M42 22l4-4" stroke-width="4"/>`),
  region_karadeniz: createSvg('region_karadeniz', 'turkey', `<path d="M32 12L16 28h8l-8 12h12v12h8V40h12l-8-12h8L32 12z" stroke-width="4" stroke-linejoin="round"/>`),
  region_ic_anadolu: createSvg('region_ic_anadolu', 'turkey', `<path d="M24 48V24c0-8 8-12 12-4M32 48V28c0-6 6-8 8-2M40 48v-12c0-4 4-6 6-2" stroke-width="4"/><path d="M24 24l-4 4M32 28l-4 4M40 36l-4 4" stroke-width="4"/>`),
  region_dogu_anadolu: createSvg('region_dogu_anadolu', 'turkey', `<path d="M10 48l14-24 10 12 12-16 8 28H10z" stroke-width="4"/><path d="M24 24l6 10M46 20l-6 12" stroke-width="4"/>`),
  region_guneydogu: createSvg('region_guneydogu', 'turkey', `<path d="M24 16h16v32H24z" stroke-width="4"/><path d="M20 28h24M28 16v32M36 16v32" stroke-width="4"/>`),

  // CITY
  city_first: createSvg('city_first', 'city', `<path d="M12 48V32h8v-8h10v-8h10v16h8v16H12z" stroke-width="4"/>`),
  city_3: createSvg('city_3', 'city', `<path d="M16 36l4-12h24l4 12v12H16V36z" stroke-width="4"/><path d="M26 24v-4h12v4M22 36h20" stroke-width="4"/><circle cx="24" cy="48" r="4"/><circle cx="40" cy="48" r="4"/>`),
  city_5: createSvg('city_5', 'city', `<path d="M12 32l8-8 8 8v16H12V32zM36 32l8-8 8 8v16H36V32z" stroke-width="4"/><path d="M28 40h8" stroke-width="4"/>`),
  city_10: createSvg('city_10', 'city', `<path d="M16 48V24h12v-8h16v32" stroke-width="4"/><circle cx="32" cy="32" r="8" fill="url(#grad-city_10)"/>`),
  city_20: createSvg('city_20', 'city', `<circle cx="32" cy="32" r="20" stroke-width="4"/><circle cx="32" cy="32" r="10" stroke-width="4"/><circle cx="32" cy="32" r="2" fill="url(#grad-city_20)"/><path d="M32 12v-4M32 56v-4M12 32H8M56 32h-4" stroke-width="4"/>`),
  city_35: createSvg('city_35', 'city', `<path d="M16 48V20h12v-8h16v36H16z" stroke-width="4"/><rect x="20" y="28" width="4" height="4" fill="url(#grad-city_35)"/><rect x="20" y="36" width="4" height="4" fill="url(#grad-city_35)"/><rect x="36" y="20" width="4" height="4" fill="url(#grad-city_35)"/><rect x="36" y="28" width="4" height="4" fill="url(#grad-city_35)"/>`),
  city_50: createSvg('city_50', 'city', `<path d="M16 48V20h12v-8h16v36" stroke-width="4"/><path d="M20 12l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="url(#grad-city_50)"/><path d="M48 16l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="url(#grad-city_50)"/>`),
  city_100: createSvg('city_100', 'city', `<path d="M32 52L12 28l8-12h24l8 12-20 24z" stroke-width="4"/><path d="M12 28h40M20 16l4 12-12-12M44 16l-4 12 12-12M32 52l-8-24M32 52l8-24" stroke-width="4"/>`),
  city_3_in_one: createSvg('city_3_in_one', 'city', `<path d="M32 12c-8 0-14 6-14 14 0 10 14 26 14 26s14-16 14-26c0-8-6-14-14-14z" stroke-width="4"/><circle cx="32" cy="26" r="4" fill="url(#grad-city_3_in_one)"/>`),
  city_5_in_one: createSvg('city_5_in_one', 'city', `<circle cx="28" cy="28" r="12" stroke-width="4"/><path d="M36 36l12 12" stroke-width="6"/><path d="M24 28c0-4 4-8 8-8" stroke-width="4"/>`),
  city_10_in_one: createSvg('city_10_in_one', 'city', `<path d="M16 32l16-16 16 16v16H16V32z" stroke-width="4"/><path d="M32 30c-2-2-6-2-6 2 0 4 6 8 6 8s6-4 6-8c0-4-4-4-6-2z" fill="url(#grad-city_10_in_one)"/>`),

  // AVIATION
  first_flight: createSvg('first_flight', 'aviation', `<path d="M16 40l28-16 8 4-36 20z" fill="url(#grad-first_flight)"/><path d="M12 52h40" stroke-width="4"/>`),
  turkish_fleet_master: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="url(#grad-turkish_fleet_master)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${getGrad('turkish_fleet_master', 'aviation')}<path d="M16 36l28-8 8 8-36 12z" stroke-width="4"/><circle cx="36" cy="24" r="10" fill="#ef4444" stroke="none"/><path d="M38 19a4.5 4.5 0 100 10 4 4 0 110-10zm2 4.5l-1 1 .5 1.5-1.5-1-1.5 1 .5-1.5-1-1 1.5-.5.5-1.5.5 1.5 1.5.5z" fill="#fff" stroke="none"/></svg>`,
  star_collector: createSvg('star_collector', 'aviation', `<path d="M32 12l6 16h16l-12 10 4 16-14-10-14 10 4-16-12-10h16z" stroke-width="4" stroke-linejoin="round"/>`),
  skyteam_rider: createSvg('skyteam_rider', 'aviation', `<path d="M32 12c-12 0-20 8-20 20s8 20 20 20 20-8 20-20c0-8-4-12-8-12s-8 4-8 8" stroke-width="4"/>`),
  oneworld_flyer: createSvg('oneworld_flyer', 'aviation', `<circle cx="32" cy="32" r="20" stroke-width="4"/><path d="M32 16l12 16-12 16-12-16z" fill="url(#grad-oneworld_flyer)"/>`),
  sky_giant: createSvg('sky_giant', 'aviation', `<path d="M12 36c0-12 12-16 24-16s20 8 20 16-12 16-24 16c-8 0-20-8-20-16z" stroke-width="4"/><path d="M20 36h12" stroke-width="4"/>`),
  modern_fleet: createSvg('modern_fleet', 'aviation', `<path d="M32 12c4 8 8 16 8 24v12h-16V36c0-8 4-16 8-24z" stroke-width="4"/><path d="M24 48l-8 8M40 48l8 8M32 48v8" stroke-width="4"/>`),
  fleet_collector: createSvg('fleet_collector', 'aviation', `<path d="M16 24l28 16 8-4-36-20z" fill="url(#grad-fleet_collector)"/><path d="M12 48h40" stroke-width="4"/>`),
  frequent_flyer: createSvg('frequent_flyer', 'aviation', `<rect x="12" y="20" width="40" height="24" rx="4" stroke-width="4"/><path d="M40 20v24" stroke-width="4" stroke-dasharray="4 4"/><circle cx="24" cy="32" r="4" fill="url(#grad-frequent_flyer)"/>`),
  lowcost_adventurer: createSvg('lowcost_adventurer', 'aviation', `<path d="M36 12L20 36h12l-4 16 16-24H32l4-16z" stroke-width="4" stroke-linejoin="round"/>`),
  quad_jet_legend: createSvg('quad_jet_legend', 'aviation', `<path d="M32 12c-4 12-12 16-12 24s8 8 12 0c4 8 12 8 12 0s-8-12-12-24z" stroke-width="4"/>`),

  // SPECIAL
  planner: createSvg('planner', 'special', `<rect x="16" y="16" width="32" height="36" rx="4" stroke-width="4"/><path d="M16 28h32M24 12v8M40 12v8" stroke-width="4"/>`),
  big_planner: createSvg('big_planner', 'special', `<rect x="16" y="16" width="32" height="36" rx="4" stroke-width="4"/><path d="M16 28h32M24 12v8M40 12v8" stroke-width="4"/><path d="M24 40l4 4 8-8" stroke-width="4"/>`),
  dreamer: createSvg('dreamer', 'special', `<path d="M44 40c4 0 8-4 8-8s-4-8-8-8c0-8-12-12-20-8-6-4-12 0-12 8 0 4 4 8 8 8" stroke-width="4" fill="none"/><circle cx="16" cy="48" r="3"/><circle cx="24" cy="52" r="2"/>`),
  big_dreamer: createSvg('big_dreamer', 'special', `<path d="M48 16L24 40l-8-2-2-8 24-24z" stroke-width="4"/><path d="M16 48l-4 4M24 52l-2 6M12 40l-6 2" stroke-width="4"/>`),
  neighbor: createSvg('neighbor', 'special', `<path d="M16 32l12-12 20 20-12 12z" stroke-width="4"/><path d="M28 20l12 12M32 24l8 8M36 28l4 4" stroke-width="4"/>`),
  balkan_tour: createSvg('balkan_tour', 'special', `<path d="M24 16c0-6 16-6 16 0v24c0 10-16 10-16 0V16z" stroke-width="4"/><path d="M28 16v24M36 16v24M24 32h16" stroke-width="2"/>`),
  mediterranean: createSvg('mediterranean', 'special', `<path d="M32 12v32M32 16l16 12-16 12" stroke-width="4"/><path d="M16 48h32c0 4-8 4-16 4s-16 0-16-4z" fill="url(#grad-mediterranean)"/>`),
  g20: createSvg('g20', 'special', `<rect x="16" y="24" width="32" height="24" rx="4" stroke-width="4"/><path d="M24 24v-6c0-3 2-6 8-6s8 3 8 6v6" stroke-width="4"/>`),
  nordic: createSvg('nordic', 'special', `<path d="M32 12v40M12 32h40M20 20l24 24M20 44l24-24" stroke-width="4"/><path d="M32 16l4 4M32 48l-4-4M16 32l4-4M48 32l-4 4" stroke-width="4"/>`),
  far_east: createSvg('far_east', 'special', `<rect x="20" y="20" width="24" height="28" rx="8" stroke-width="4"/><path d="M20 28h24M20 40h24M32 12v8M32 48v8" stroke-width="4"/>`),
  turkic_world: createSvg('turkic_world', 'special', `<path d="M40 24c-8 0-16 8-16 16h16c0-8 8-16 16-16-4-8-12-8-16 0z" fill="url(#grad-turkic_world)"/><path d="M24 40c0-12 12-16 16-24-8 0-20 4-24 16l8 8z" stroke-width="4"/>`),

  // COMMUNITY
  first_feedback: createSvg('first_feedback', 'community', `<rect x="16" y="24" width="32" height="24" rx="4" stroke-width="4"/><path d="M16 28l16 12 16-12" stroke-width="4"/>`),
  bug_hunter: createSvg('bug_hunter', 'community', `<rect x="24" y="20" width="16" height="24" rx="8" stroke-width="4"/><path d="M24 28h16M24 36h16M32 20v24" stroke-width="4"/><path d="M20 24l-4-4M20 32h-4M20 40l-4 4M44 24l4-4M44 32h4M44 40l4 4" stroke-width="4"/>`),
  feature_contributor: createSvg('feature_contributor', 'community', `<circle cx="32" cy="28" r="12" stroke-width="4"/><path d="M26 36l2 12h8l2-12" stroke-width="4"/><path d="M28 52h8" stroke-width="4"/>`),
  issue_resolved: createSvg('issue_resolved', 'community', `<path d="M20 44l16-16c4 4 12 4 16 0-4-4-4-12 0-16-4 4-12 4-16 0L20 28c-4-4-12 4-8 8s4 8 8 8z" stroke-width="4"/>`)
};
