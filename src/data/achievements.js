// achievements.js - Seyahat Başarımları ve Madalyalar
export const ACHIEVEMENT_CATEGORIES = {
  world: { label: 'Dünya Gezgini', color: '#3b82f6' },
  continent: { label: 'Kıta Kâşifi', color: '#8b5cf6' },
  turkey: { label: 'Anadolu', color: '#ef4444' },
  city: { label: 'Şehir Avcısı', color: '#f59e0b' },
  aviation: { label: 'Havacılık & Filo', color: '#0ea5e9' },
  special: { label: 'Özel & Rotalar', color: '#10b981' },
};

function getContinentCount(s, continentKey) {
  const counts = s.continentCounts || {};
  const key = continentKey.toLowerCase();
  return counts[key] !== undefined ? counts[key] : (counts[continentKey] || 0);
}

function getVisitedCodes(s) {
  return s.visitedCodes || [];
}

export const ACHIEVEMENTS = [
  // ─── DÜNYA GEZGİNİ ───────────────────────────────────────────────
  { id: 'first_country', title: 'İlk Adım', desc: 'Dünya haritasında ilk ülkeni işaretle', icon: '🌍', category: 'world', check: s => s.worldCountryCount >= 1 },
  { id: 'world_3', title: 'Mini Turist', desc: '3 farklı ülkeyi ziyaret et', icon: '🧳', category: 'world', check: s => s.worldCountryCount >= 3 },
  { id: 'world_5', title: 'Gezgin Başlıyor', desc: '5 farklı ülkeyi ziyaret et', icon: '✈️', category: 'world', check: s => s.worldCountryCount >= 5 },
  { id: 'world_10', title: 'Dünya Yolcusu', desc: '10 farklı ülkeyi ziyaret et', icon: '🗺️', category: 'world', check: s => s.worldCountryCount >= 10 },
  { id: 'world_15', title: 'Pasaport Avcısı', desc: '15 farklı ülkeyi ziyaret et', icon: '🛂', category: 'world', check: s => s.worldCountryCount >= 15 },
  { id: 'world_25', title: 'Deneyimli Gezgin', desc: '25 farklı ülkeyi ziyaret et', icon: '🧭', category: 'world', check: s => s.worldCountryCount >= 25 },
  { id: 'world_40', title: 'Küresel Kâşif', desc: '40 farklı ülkeyi ziyaret et', icon: '🚀', category: 'world', check: s => s.worldCountryCount >= 40 },
  { id: 'world_50', title: 'Yarısına Ulaştın!', desc: '50 farklı ülkeyi ziyaret et', icon: '🏆', category: 'world', check: s => s.worldCountryCount >= 50 },
  { id: 'world_75', title: 'Dünya Çapında', desc: '75 farklı ülkeyi ziyaret et', icon: '🌐', category: 'world', check: s => s.worldCountryCount >= 75 },
  { id: 'world_100', title: 'Yüzler Kulübü', desc: '100 farklı ülkeyi ziyaret et', icon: '💯', category: 'world', check: s => s.worldCountryCount >= 100 },

  // ─── KITA KÂŞİFİ ────────────────────────────────────────────────
  // Avrupa
  { id: 'europe_1', title: 'Avrupa Kapısı', desc: 'Avrupa\'da 1 ülkeyi ziyaret et', icon: '🇪🇺', category: 'continent', check: s => getContinentCount(s, 'europe') >= 1 },
  { id: 'europe_3', title: 'Avrupa Turisti', desc: 'Avrupa\'da 3 ülkeyi ziyaret et', icon: '🏰', category: 'continent', check: s => getContinentCount(s, 'europe') >= 3 },
  { id: 'europe_5', title: 'Avrupa Kâşifi', desc: 'Avrupa\'da 5 ülkeyi ziyaret et', icon: '🗼', category: 'continent', check: s => getContinentCount(s, 'europe') >= 5 },
  { id: 'europe_10', title: 'Avrupa Ustası', desc: 'Avrupa\'da 10 ülkeyi ziyaret et', icon: '👑', category: 'continent', check: s => getContinentCount(s, 'europe') >= 10 },
  { id: 'europe_20', title: 'Avrupa Fatihi', desc: 'Avrupa\'da 20 ülkeyi ziyaret et', icon: '🏛️', category: 'continent', check: s => getContinentCount(s, 'europe') >= 20 },
  
  // Asya
  { id: 'asia_1', title: 'Asya Kapısı', desc: 'Asya\'da 1 ülkeyi ziyaret et', icon: '🏯', category: 'continent', check: s => getContinentCount(s, 'asia') >= 1 },
  { id: 'asia_3', title: 'İpek Yolu Yolcusu', desc: 'Asya\'da 3 ülkeyi ziyaret et', icon: '🏮', category: 'continent', check: s => getContinentCount(s, 'asia') >= 3 },
  { id: 'asia_5', title: 'Asya Kâşifi', desc: 'Asya\'da 5 ülkeyi ziyaret et', icon: '🐉', category: 'continent', check: s => getContinentCount(s, 'asia') >= 5 },
  { id: 'asia_10', title: 'Doğu Rüzgârı', desc: 'Asya\'da 10 ülkeyi ziyaret et', icon: '⛩️', category: 'continent', check: s => getContinentCount(s, 'asia') >= 10 },

  // Afrika
  { id: 'africa_1', title: 'Afrika\'ya Adım', desc: 'Afrika\'da 1 ülkeyi ziyaret et', icon: '🦁', category: 'continent', check: s => getContinentCount(s, 'africa') >= 1 },
  { id: 'africa_3', title: 'Safari Macerası', desc: 'Afrika\'da 3 ülkeyi ziyaret et', icon: '🏜️', category: 'continent', check: s => getContinentCount(s, 'africa') >= 3 },
  { id: 'africa_5', title: 'Vahşi Doğa', desc: 'Afrika\'da 5 ülkeyi ziyaret et', icon: '🐘', category: 'continent', check: s => getContinentCount(s, 'africa') >= 5 },

  // Amerika
  { id: 'americas_1', title: 'Amerika Kıtası', desc: 'Kuzey veya Güney Amerika\'da 1 ülke gez', icon: '🗽', category: 'continent', check: s => (getContinentCount(s, 'north_america') + getContinentCount(s, 'south_america')) >= 1 },
  { id: 'americas_3', title: 'Yeni Dünya', desc: 'Amerika kıtalarında 3 ülke gez', icon: '🌴', category: 'continent', check: s => (getContinentCount(s, 'north_america') + getContinentCount(s, 'south_america')) >= 3 },
  { id: 'americas_5', title: 'Pan-Amerika', desc: 'Amerika kıtalarında 5 ülke gez', icon: '🦙', category: 'continent', check: s => (getContinentCount(s, 'north_america') + getContinentCount(s, 'south_america')) >= 5 },

  // Okyanusya
  { id: 'oceania_1', title: 'Okyanusya Yolcusu', desc: 'Okyanusya\'da 1 ülkeyi ziyaret et', icon: '🦘', category: 'continent', check: s => getContinentCount(s, 'oceania') >= 1 },
  { id: 'oceania_2', title: 'Pasifik Kâşifi', desc: 'Okyanusya\'da 2 ülkeyi ziyaret et', icon: '🏄', category: 'continent', check: s => getContinentCount(s, 'oceania') >= 2 },

  // Kıta Kombinasyonları
  { id: 'two_continents', title: 'İki Kıta', desc: '2 farklı kıtada en az 1\'er ülke gez', icon: '🌐', category: 'continent', check: s => Object.values(s.continentCounts || {}).filter(v => v > 0).length >= 2 },
  { id: 'three_continents', title: 'Üç Kıta', desc: '3 farklı kıtada en az 1\'er ülke gez', icon: '🌏', category: 'continent', check: s => Object.values(s.continentCounts || {}).filter(v => v > 0).length >= 3 },
  { id: 'four_continents', title: 'Dört Kıta', desc: '4 farklı kıtada en az 1\'er ülke gez', icon: '🌍', category: 'continent', check: s => Object.values(s.continentCounts || {}).filter(v => v > 0).length >= 4 },
  { id: 'five_continents', title: 'Beş Kıta Efsanesi', desc: '5 farklı kıtada en az 1\'er ülke gez', icon: '🏅', category: 'continent', check: s => Object.values(s.continentCounts || {}).filter(v => v > 0).length >= 5 },
  { id: 'six_continents', title: 'Küresel Bütünlük', desc: 'Tüm 6 kıtada en az 1\'er ülke gez', icon: '🌟', category: 'continent', check: s => Object.values(s.continentCounts || {}).filter(v => v > 0).length >= 6 },

  // ─── ANADOLU & TÜRKİYE ──────────────────────────────────────────
  { id: 'turkey_first', title: 'Anadolu\'ya İlk Adım', desc: 'Türkiye\'de ilk ilini ziyaret et', icon: '🇹🇷', category: 'turkey', check: s => s.turkeyCount >= 1 },
  { id: 'turkey_5', title: 'Memleket Turu', desc: 'Türkiye\'de 5 il ziyaret et', icon: '🚗', category: 'turkey', check: s => s.turkeyCount >= 5 },
  { id: 'turkey_10', title: 'Anadolu Kâşifi', desc: 'Türkiye\'de 10 il ziyaret et', icon: '🕌', category: 'turkey', check: s => s.turkeyCount >= 10 },
  { id: 'turkey_20', title: 'Türkiye Yolcusu', desc: 'Türkiye\'de 20 il ziyaret et', icon: '🎒', category: 'turkey', check: s => s.turkeyCount >= 20 },
  { id: 'turkey_40', title: 'Yarım Türkiye', desc: 'Türkiye\'de 40 il ziyaret et', icon: '🦅', category: 'turkey', check: s => s.turkeyCount >= 40 },
  { id: 'turkey_60', title: 'Anadolu Fatihi', desc: 'Türkiye\'de 60 il ziyaret et', icon: '🏔️', category: 'turkey', check: s => s.turkeyCount >= 60 },
  { id: 'turkey_all', title: '81\'de 81 Türkiye Ustası', desc: 'Türkiye\'nin tüm 81 ilini tamamla', icon: '🏆', category: 'turkey', check: s => s.turkeyCount >= 81 },
  
  // Türkiye Bölgeleri
  { id: 'all_7_regions', title: '7 Bölge Gezgini', desc: 'Türkiye\'nin 7 coğrafi bölgesinden de en az 1\'er il gez', icon: '🌈', category: 'turkey', check: s => Object.values(s.regionCounts || {}).filter(v => v > 0).length >= 7 },
  { id: 'region_marmara', title: 'Marmara Efendisi', desc: 'Marmara Bölgesi\'nin tüm 11 ilini tamamla', icon: '🌊', category: 'turkey', check: s => (s.regionCounts?.marmara || 0) >= 11 },
  { id: 'region_ege', title: 'Ege Âşıkları', desc: 'Ege Bölgesi\'nin tüm 8 ilini tamamla', icon: '🏖️', category: 'turkey', check: s => (s.regionCounts?.ege || 0) >= 8 },
  { id: 'region_akdeniz', title: 'Akdeniz Güneşi', desc: 'Akdeniz Bölgesi\'nin tüm 8 ilini tamamla', icon: '☀️', category: 'turkey', check: s => (s.regionCounts?.akdeniz || 0) >= 8 },
  { id: 'region_karadeniz', title: 'Karadeniz Ruhu', desc: 'Karadeniz Bölgesi\'nin tüm 18 ilini tamamla', icon: '🌲', category: 'turkey', check: s => (s.regionCounts?.karadeniz || 0) >= 18 },
  { id: 'region_ic_anadolu', title: 'Bozkırın Kalbi', desc: 'İç Anadolu Bölgesi\'nin tüm 13 ilini tamamla', icon: '🌾', category: 'turkey', check: s => (s.regionCounts?.ic_anadolu || 0) >= 13 },
  { id: 'region_dogu_anadolu', title: 'Doğu Zirveleri', desc: 'Doğu Anadolu Bölgesi\'nin tüm 14 ilini tamamla', icon: '⛰️', category: 'turkey', check: s => (s.regionCounts?.dogu_anadolu || 0) >= 14 },
  { id: 'region_guneydogu', title: 'Güneydoğu Masalı', desc: 'Güneydoğu Anadolu\'nun tüm 9 ilini tamamla', icon: '🏰', category: 'turkey', check: s => (s.regionCounts?.guneydogu_anadolu || 0) >= 9 },

  // ─── ŞEHİR & EYALET AVCISI ─────────────────────────────────────
  { id: 'city_first', title: 'İlk Şehir', desc: 'Herhangi bir ülkede 1 şehir/bölge işaretle', icon: '🏙️', category: 'city', check: s => s.worldCityCount >= 1 },
  { id: 'city_3', title: 'Şehir Meraklısı', desc: 'Toplam 3 farklı şehir/bölge gez', icon: '🚗', category: 'city', check: s => s.worldCityCount >= 3 },
  { id: 'city_5', title: 'Şehir Gezgini', desc: 'Toplam 5 farklı şehir/bölge gez', icon: '🏘️', category: 'city', check: s => s.worldCityCount >= 5 },
  { id: 'city_10', title: 'Metropol Avcısı', desc: 'Toplam 10 farklı şehir/bölge gez', icon: '🌇', category: 'city', check: s => s.worldCityCount >= 10 },
  { id: 'city_20', title: 'Şehir Avcısı', desc: 'Toplam 20 farklı şehir/bölge gez', icon: '🦅', category: 'city', check: s => s.worldCityCount >= 20 },
  { id: 'city_35', title: 'Büyük Şehir Kâşifi', desc: 'Toplam 35 farklı şehir/bölge gez', icon: '🌆', category: 'city', check: s => s.worldCityCount >= 35 },
  { id: 'city_50', title: 'Şehir Efsanesi', desc: 'Toplam 50 farklı şehir/bölge gez', icon: '🌃', category: 'city', check: s => s.worldCityCount >= 50 },
  { id: 'city_100', title: 'Yüzyılın Şehirlisi', desc: 'Toplam 100 farklı şehir/bölge gez', icon: '👑', category: 'city', check: s => s.worldCityCount >= 100 },
  { id: 'city_3_in_one', title: 'Ülke Uzmanı', desc: 'Aynı ülkede 3+ farklı şehir/bölge gez', icon: '📍', category: 'city', check: s => s.maxCitiesInOneCountry >= 3 },
  { id: 'city_5_in_one', title: 'Bölge Âlimi', desc: 'Aynı ülkede 5+ farklı şehir/bölge gez', icon: '🗺️', category: 'city', check: s => s.maxCitiesInOneCountry >= 5 },
  { id: 'city_10_in_one', title: 'Yerel Gibi Yaşa', desc: 'Aynı ülkede 10+ şehir/bölge gez', icon: '🏡', category: 'city', check: s => s.maxCitiesInOneCountry >= 10 },

  // ─── HAVACILIK & FİLO ─────────────────────────────────────────
  { id: 'first_flight', title: 'Kanatlanış', desc: 'Binilen ilk havayolunu işaretle', icon: '✈️', category: 'aviation', check: s => (s.flownAirlines || []).length >= 1 },
  { id: 'turkish_fleet_master', title: 'Göklerin Hakimi', desc: "Türkiye'nin yerli havayollarının en az 3'üyle uç", icon: '🇹🇷', category: 'aviation', check: s => (s.flownAirlines || []).filter(id => ['thy', 'pegasus', 'sunexpress', 'ajet', 'corendon', 'freebird', 'tailwind', 'southwind'].includes(id)).length >= 3 },
  { id: 'star_collector', title: 'Star Alliance Koleksiyoneri', desc: 'Star Alliance üyesi en az 3 farklı havayoluyla uç', icon: '🌟', category: 'aviation', check: s => (s.flownAirlines || []).filter(id => ['thy', 'thy_star', 'lufthansa', 'united', 'singapore', 'swiss', 'austrian', 'ana', 'air_canada', 'tap_portugal', 'aegean', 'lot_polish', 'eva_air', 'air_china', 'thai_airways', 'copa', 'brussels'].includes(id)).length >= 3 },
  { id: 'skyteam_rider', title: 'SkyTeam Yolcusu', desc: 'SkyTeam üyesi bir havayoluyla uç', icon: '🌐', category: 'aviation', check: s => (s.flownAirlines || []).some(id => ['air_france', 'klm', 'delta', 'korean_air', 'saudia', 'virgin_atlantic', 'aeromexico', 'ita_airways', 'vietnam_airlines', 'garuda_indonesia', 'air_europa', 'tarom'].includes(id)) },
  { id: 'oneworld_flyer', title: 'oneworld Gezgini', desc: 'oneworld üyesi bir havayoluyla uç', icon: '🦅', category: 'aviation', check: s => (s.flownAirlines || []).some(id => ['british_airways', 'qatar', 'american', 'cathay_pacific', 'finnair', 'iberia', 'jal', 'qantas', 'royal_jordanian', 'malaysia', 'royal_air_maroc', 'alaska_airlines'].includes(id)) },
  { id: 'sky_giant', title: 'Gökyüzü Devi', desc: 'A380 veya B747 ile uçuş yap', icon: '🐘', category: 'aviation', check: s => (s.flownAircraft || []).some(id => id === 'a380' || id === 'b747') },
  { id: 'modern_fleet', title: 'Yeni Nesil Filo', desc: 'B787 Dreamliner veya A350 ile uçuş yap', icon: '🚀', category: 'aviation', check: s => (s.flownAircraft || []).some(id => id === 'b787' || id === 'a350') },
  { id: 'fleet_collector', title: 'Hangar Koleksiyoneri', desc: 'En az 4 farklı uçak modelini koleksiyonuna ekle', icon: '🛫', category: 'aviation', check: s => (s.flownAircraft || []).length >= 4 },
  { id: 'frequent_flyer', title: 'Sadık Yolcu', desc: 'Toplam 10 veya daha fazla uçuş kaydet', icon: '🎫', category: 'aviation', check: s => (s.totalFlightCount || 0) >= 10 },

  // ─── ÖZEL & TEMATİK ROTALAR ───────────────────────────────────
  { id: 'planner', title: 'Planlı Gezgin', desc: '5+ yeri "Planlanıyor" olarak işaretle', icon: '📅', category: 'special', check: s => (s.worldPlannedCount || s.worldTargetCount || 0) >= 5 },
  { id: 'big_planner', title: 'Geleceğin Gezgini', desc: '15+ yeri "Planlanıyor" olarak işaretle', icon: '🗓️', category: 'special', check: s => (s.worldPlannedCount || s.worldTargetCount || 0) >= 15 },
  { id: 'dreamer', title: 'Dünya Hayalcisi', desc: '10+ yeri "İstiyorum" olarak işaretle', icon: '💭', category: 'special', check: s => (s.worldWishlistCount || 0) >= 10 },
  { id: 'big_dreamer', title: 'Sınırsız Hayal', desc: '25+ yeri "İstiyorum" olarak işaretle', icon: '🌠', category: 'special', check: s => (s.worldWishlistCount || 0) >= 25 },
  { id: 'neighbor', title: 'Komşu Gezgin', desc: 'Türkiye\'nin tüm 8 komşusunu (Yunanistan, Bulgaristan, Gürcistan, Ermenistan, Azerbaycan, İran, Irak, Suriye) ziyaret et', icon: '🤝', category: 'special', check: s => ['GR','BG','GE','AM','AZ','IR','IQ','SY'].every(c => getVisitedCodes(s).includes(c)) },
  { id: 'balkan_tour', title: 'Balkan Ruhu', desc: 'En az 4 Balkan ülkesini ziyaret et (Yunanistan, Bulgaristan, Makedonya, Arnavutluk, Sırbistan, Karadağ, Bosna, Hırvatistan, Romanya, Slovenya, Kosova)', icon: '🎻', category: 'special', check: s => ['GR','BG','MK','AL','RS','ME','BA','HR','RO','SI','XK'].filter(c => getVisitedCodes(s).includes(c)).length >= 4 },
  { id: 'mediterranean', title: 'Akdeniz Çanağı', desc: 'En az 4 Akdeniz ülkesini ziyaret et (Türkiye, Yunanistan, İtalya, İspanya, Fransa, Mısır, Fas)', icon: '⛵', category: 'special', check: s => ['TR','GR','IT','ES','FR','EG','MA'].filter(c => getVisitedCodes(s).includes(c)).length >= 4 },
  { id: 'g20', title: 'G20 Gezgini', desc: 'G20 ülkelerinin en az yarısını (10 ülke) ziyaret et', icon: '💼', category: 'special', check: s => ['AR','AU','BR','CA','CN','FR','DE','IN','ID','IT','JP','MX','RU','SA','ZA','KR','TR','GB','US'].filter(c => getVisitedCodes(s).includes(c)).length >= 10 },
  { id: 'nordic', title: 'Kuzey Işıkları', desc: 'En az 2 İskandinav/Nordik ülkesini ziyaret et (İsveç, Norveç, Finlandiya, Danimarka, İzlanda)', icon: '❄️', category: 'special', check: s => ['SE','NO','FI','DK','IS'].filter(c => getVisitedCodes(s).includes(c)).length >= 2 },
  { id: 'far_east', title: 'Uzak Doğu Kâşifi', desc: 'En az 2 Uzak Doğu ülkesini ziyaret et (Japonya, Güney Kore, Çin)', icon: '🏮', category: 'special', check: s => ['JP','KR','CN'].filter(c => getVisitedCodes(s).includes(c)).length >= 2 },
  { id: 'turkic_world', title: 'Türk Dünyası', desc: 'En az 2 Türk devletini ziyaret et (Azerbaycan, Kazakistan, Özbekistan, Türkmenistan, Kırgızistan)', icon: '🐺', category: 'special', check: s => ['AZ','KZ','UZ','TM','KG'].filter(c => getVisitedCodes(s).includes(c)).length >= 2 },
];

export function computeAchievementStats(storageData, baseStats) {
  const { worldVisits = {}, turkeyVisits = {}, worldCities = [] } = storageData || {};

  // ── Read aviation data from localStorage ──
  let userAirlines = {};
  let userAircraft = {};
  try {
    const alRaw = localStorage.getItem('gittigim_yerler_airlines_v1');
    if (alRaw) userAirlines = JSON.parse(alRaw);
    const acRaw = localStorage.getItem('gittigim_yerler_aircraft_v1');
    if (acRaw) userAircraft = JSON.parse(acRaw);
  } catch {}

  const flownAirlines = Object.keys(userAirlines).filter(k => userAirlines[k]?.flown);
  const totalFlightCount = Object.values(userAirlines).reduce((acc, curr) => acc + ((curr?.flown) ? (curr.count || 1) : 0), 0);
  const flownAircraft = Object.keys(userAircraft).filter(k => userAircraft[k]?.flown);
  
  // Visited country codes (including TR if at least 1 Turkish province is visited)
  const visitedCodes = Object.entries(worldVisits)
    .filter(([k, v]) => !k.includes('::') && v?.status === 'visited')
    .map(([k]) => k);

  const turkeyVisitedProvinces = Object.values(turkeyVisits).filter(v => v?.status === 'visited').length;
  if (turkeyVisitedProvinces > 0 && !visitedCodes.includes('TR')) {
    visitedCodes.push('TR');
  }

  // Marked regions / cities
  const citiesPerCountry = {};
  if (turkeyVisitedProvinces > 0) {
    citiesPerCountry['TR'] = turkeyVisitedProvinces;
  }
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
  
  const turkeyWishlistCount = Object.values(turkeyVisits).filter(v => v?.status === 'wishlist').length;
  const turkeyPlannedCount = Object.values(turkeyVisits).filter(v => v?.status === 'target' || v?.status === 'planned').length;
  
  const worldWishlistCount = Object.entries(worldVisits).filter(([k, v]) => !k.includes('::') && v?.status === 'wishlist').length + turkeyWishlistCount;
  const worldPlannedCount = Object.entries(worldVisits).filter(([k, v]) => !k.includes('::') && (v?.status === 'planned' || v?.status === 'target')).length + turkeyPlannedCount;

  return {
    ...baseStats,
    visitedCodes,
    worldCityCount: Math.max(baseStats?.worldCityCount || 0, totalMarkedCities),
    maxCitiesInOneCountry,
    worldWishlistCount,
    worldPlannedCount,
    worldTargetCount: Math.max(baseStats?.worldTargetCount || 0, worldPlannedCount),
    flownAirlines,
    totalFlightCount,
    flownAircraft
  };
}

export function getEarnedAchievements(storageData, baseStats) {
  const stats = computeAchievementStats(storageData, baseStats);
  return ACHIEVEMENTS.filter(a => {
    try {
      return a.check(stats);
    } catch {
      return false;
    }
  });
}

