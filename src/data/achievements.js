// achievements.js - Travel Achievement Definitions
export const ACHIEVEMENT_CATEGORIES = {
  world: { label: 'Dunya Gezgini', color: '#3b82f6' },
  continent: { label: 'Kita Kasifi', color: '#8b5cf6' },
  turkey: { label: 'Anadolu', color: '#ef4444' },
  city: { label: 'Sehir Avcisi', color: '#f59e0b' },
  special: { label: 'Ozel', color: '#10b981' },
};

export const ACHIEVEMENTS = [
  { id: 'first_country', title: 'Ilk Adim', desc: 'Ilk ulkeni isaretl', icon: '🌍', category: 'world', check: s => s.worldCountryCount >= 1 },
  { id: 'world_5', title: 'Gezgin Basliyor', desc: '5 farkli ulkeyi ziyaret et', icon: '✈️', category: 'world', check: s => s.worldCountryCount >= 5 },
  { id: 'world_10', title: 'Dunya Yolcusu', desc: '10 farkli ulkeyi ziyaret et', icon: '🗺️', category: 'world', check: s => s.worldCountryCount >= 10 },
  { id: 'world_25', title: 'Deneyimli Gezgin', desc: '25 farkli ulkeyi ziyaret et', icon: '🧳', category: 'world', check: s => s.worldCountryCount >= 25 },
  { id: 'world_50', title: 'Yarisina Ulastin!', desc: '50 farkli ulkeyi ziyaret et', icon: '🏆', category: 'world', check: s => s.worldCountryCount >= 50 },
  { id: 'world_100', title: 'Yuzler Kulubu', desc: '100 farkli ulkeyi ziyaret et', icon: '💯', category: 'world', check: s => s.worldCountryCount >= 100 },
  // Continents
  { id: 'europe_1', title: 'Avrupa Kapısı', desc: "Avrupa'da 1 ülkeyi ziyaret et", icon: '🇪🇺', category: 'continent', check: s => (s.continentCounts?.europe || s.continentCounts?.Europe || 0) >= 1 },
  { id: 'europe_5', title: 'Avrupa Kâşifi', desc: "Avrupa'da 5 ülkeyi ziyaret et", icon: '🗼', category: 'continent', check: s => (s.continentCounts?.europe || s.continentCounts?.Europe || 0) >= 5 },
  { id: 'europe_15', title: 'Avrupa Ustası', desc: "Avrupa'da 15 ülkeyi ziyaret et", icon: '👑', category: 'continent', check: s => (s.continentCounts?.europe || s.continentCounts?.Europe || 0) >= 15 },
  { id: 'asia_1', title: 'Asya Kapısı', desc: "Asya'da 1 ülkeyi ziyaret et", icon: '🏯', category: 'continent', check: s => (s.continentCounts?.asia || s.continentCounts?.Asia || 0) >= 1 },
  { id: 'asia_5', title: 'Asya Kâşifi', desc: "Asya'da 5 ülkeyi ziyaret et", icon: '🐉', category: 'continent', check: s => (s.continentCounts?.asia || s.continentCounts?.Asia || 0) >= 5 },
  { id: 'africa_1', title: "Afrika'ya Adım", desc: "Afrika'da 1 ülkeyi ziyaret et", icon: '🦁', category: 'continent', check: s => (s.continentCounts?.africa || s.continentCounts?.Africa || 0) >= 1 },
  { id: 'americas_1', title: 'Amerika Kıtası', desc: "Kuzey veya Güney Amerika'da 1 ülkeyi ziyaret et", icon: '🗽', category: 'continent', check: s => ((s.continentCounts?.north_america || s.continentCounts?.['North America'] || 0) + (s.continentCounts?.south_america || s.continentCounts?.['South America'] || 0)) >= 1 },
  { id: 'oceania_1', title: 'Okyanusya Yolcusu', desc: "Okyanusya'da 1 ülkeyi ziyaret et", icon: '🦘', category: 'continent', check: s => (s.continentCounts?.oceania || s.continentCounts?.Oceania || 0) >= 1 },
  { id: 'two_continents', title: 'İki Kıta', desc: "2 farklı kıtada en az 1'er ülke gez", icon: '🌐', category: 'continent', check: s => Object.values(s.continentCounts || {}).filter(v => v > 0).length >= 2 },
  { id: 'three_continents', title: 'Üç Kıta', desc: "3 farklı kıtada en az 1'er ülke gez", icon: '🌏', category: 'continent', check: s => Object.values(s.continentCounts || {}).filter(v => v > 0).length >= 3 },
  { id: 'five_continents', title: 'Beş Kıta Efsanesi', desc: "5 farklı kıtada en az 1'er ülke gez", icon: '🏅', category: 'continent', check: s => Object.values(s.continentCounts || {}).filter(v => v > 0).length >= 5 },
  { id: 'turkey_first', title: 'Anadoluya Ilk Adim', desc: 'Turkiyede 1 il isaretl', icon: '🇹🇷', category: 'turkey', check: s => s.turkeyCount >= 1 },
  { id: 'turkey_10', title: 'Anadolu Kasifi', desc: 'Turkiyede 10 il', icon: '🕌', category: 'turkey', check: s => s.turkeyCount >= 10 },
  { id: 'turkey_40', title: 'Yarim Turkiye', desc: 'Turkiyede 40 il', icon: '🦅', category: 'turkey', check: s => s.turkeyCount >= 40 },
  { id: 'turkey_all', title: 'Turkiye Ustasi', desc: 'Turkiyenin tum 81 ilini ziyaret et', icon: '🏆', category: 'turkey', check: s => s.turkeyCount >= 81 },
  { id: 'city_first', title: 'Ilk Sehir', desc: 'Herhangi bir ulkede 1 sehir', icon: '🏙️', category: 'city', check: s => s.worldCityCount >= 1 },
  { id: 'city_5', title: 'Sehir Gezgini', desc: '5 farkli sehir', icon: '🏘️', category: 'city', check: s => s.worldCityCount >= 5 },
  { id: 'city_3_in_one', title: 'Ulke Uzmani', desc: 'Ayni ulkede 3+ sehir', icon: '📍', category: 'city', check: s => s.maxCitiesInOneCountry >= 3 },
  { id: 'city_10_in_one', title: 'Yerel Gibi', desc: 'Ayni ulkede 10+ sehir', icon: '🏡', category: 'city', check: s => s.maxCitiesInOneCountry >= 10 },
  { id: 'city_20', title: 'Sehir Avcisi', desc: '20 farkli sehir', icon: '🦅', category: 'city', check: s => s.worldCityCount >= 20 },
  { id: 'city_50', title: 'Sehir Efsanesi', desc: '50 farkli sehir', icon: '🌃', category: 'city', check: s => s.worldCityCount >= 50 },
  { id: 'planner', title: 'Planli Gezgin', desc: '5+ ulkeyi Planlaniyor olarak isaretl', icon: '📅', category: 'special', check: s => s.worldTargetCount >= 5 },
  { id: 'dreamer', title: 'Dunya Hayalcisi', desc: '10+ ulkeyi Istiyorum olarak isaretl', icon: '💭', category: 'special', check: s => (s.worldWishlistCount || 0) >= 10 },
  { id: 'neighbor', title: 'Komsu Gezgin', desc: 'Turkiyenin komsularini ziyaret et', icon: '🤝', category: 'special', check: s => ['GR','BG','GE','AM','AZ','IR','IQ','SY'].every(c => s.visitedCodes.includes(c)) },
  { id: 'g20', title: 'G20 Gezgini', desc: 'G20 ulkelerinin yarisini ziyaret et', icon: '💼', category: 'special', check: s => ['AR','AU','BR','CA','CN','FR','DE','IN','ID','IT','JP','MX','RU','SA','ZA','KR','TR','GB','US'].filter(c => s.visitedCodes.includes(c)).length >= 10 },
];

export function computeAchievementStats(storageData, baseStats) {
  const { worldVisits = {}, worldCities = [] } = storageData || {};
  const visitedCodes = Object.entries(worldVisits)
    .filter(([k, v]) => !k.includes('::') && v?.status === 'visited')
    .map(([k]) => k);

  const citiesPerCountry = {};
  worldCities.forEach(c => {
    if (c?.countryCode) citiesPerCountry[c.countryCode] = (citiesPerCountry[c.countryCode] || 0) + 1;
  });
  Object.entries(worldVisits).forEach(([k, v]) => {
    if (k.includes('::') && v?.status === 'visited') {
      const code = k.split('::')[0];
      citiesPerCountry[code] = (citiesPerCountry[code] || 0) + 1;
    }
  });

  const totalMarkedCities = Object.values(citiesPerCountry).reduce((a, b) => a + b, 0);
  const maxCitiesInOneCountry = Object.values(citiesPerCountry).length ? Math.max(...Object.values(citiesPerCountry)) : 0;
  const worldWishlistCount = Object.entries(worldVisits).filter(([k, v]) => !k.includes('::') && v?.status === 'wishlist').length;
  const worldPlannedCount = Object.entries(worldVisits).filter(([k, v]) => !k.includes('::') && (v?.status === 'planned' || v?.status === 'target')).length;

  return {
    ...baseStats,
    visitedCodes,
    worldCityCount: Math.max(baseStats?.worldCityCount || 0, totalMarkedCities),
    maxCitiesInOneCountry,
    worldWishlistCount,
    worldTargetCount: Math.max(baseStats?.worldTargetCount || 0, worldPlannedCount)
  };
}

export function getEarnedAchievements(storageData, baseStats) {
  const stats = computeAchievementStats(storageData, baseStats);
  return ACHIEVEMENTS.filter(a => { try { return a.check(stats); } catch { return false; } });
}
