// achievements.js - Seyahat Başarımları ve Madalyalar
import { STORAGE_KEYS } from '../utils/storage.js';

export const ACHIEVEMENT_CATEGORIES = {
  world: { label: 'Dünya Gezgini', labelEn: 'World Explorer', color: '#3b82f6' },
  continent: { label: 'Kıta Kâşifi', labelEn: 'Continent Pioneer', color: '#8b5cf6' },
  turkey: { label: 'Anadolu', labelEn: 'Anatolia & Turkey', color: '#ef4444' },
  city: { label: 'Şehir Avcısı', labelEn: 'City Hunter', color: '#f59e0b' },
  aviation: { label: 'Havacılık & Filo', labelEn: 'Aviation & Fleet', color: '#0ea5e9' },
  special: { label: 'Özel & Rotalar', labelEn: 'Special & Thematic', color: '#10b981' },
  community: { label: 'Topluluk & Katkı', labelEn: 'Community & Feedback', color: '#ec4899' },
};

function getContinentCount(s, continentKey) {
  const counts = s?.continentCounts || {};
  const key = (continentKey || '').toLowerCase();
  const matchedKey = Object.keys(counts).find(k => k.toLowerCase() === key);
  return matchedKey ? (counts[matchedKey] || 0) : 0;
}

function getRegionCount(s, regionKey) {
  const counts = s?.regionCounts || {};
  const key = (regionKey || '').toLowerCase();
  const matchedKey = Object.keys(counts).find(k => k.toLowerCase() === key);
  return matchedKey ? (counts[matchedKey] || 0) : 0;
}

function getVisitedCodes(s) {
  return s.visitedCodes || [];
}

export const ACHIEVEMENTS = [
  // ─── DÜNYA GEZGİNİ ───────────────────────────────────────────────
  { id: 'first_country', title: 'İlk Adım', titleEn: 'First Step', desc: 'Dünya haritasında ilk ülkeni işaretle', descEn: 'Mark your very first country on the world map', icon: '🌍', category: 'world', check: s => s.worldCountryCount >= 1 },
  { id: 'world_3', title: 'Mini Turist', titleEn: 'Mini Tourist', desc: '3 farklı ülkeyi ziyaret et', descEn: 'Visit 3 different countries', icon: '🧳', category: 'world', check: s => s.worldCountryCount >= 3 },
  { id: 'world_5', title: 'Gezgin Başlıyor', titleEn: 'Journey Begins', desc: '5 farklı ülkeyi ziyaret et', descEn: 'Visit 5 different countries', icon: '✈️', category: 'world', check: s => s.worldCountryCount >= 5 },
  { id: 'world_10', title: 'Dünya Yolcusu', titleEn: 'Globetrotter', desc: '10 farklı ülkeyi ziyaret et', descEn: 'Visit 10 different countries', icon: '🗺️', category: 'world', check: s => s.worldCountryCount >= 10 },
  { id: 'world_15', title: 'Pasaport Avcısı', titleEn: 'Passport Collector', desc: '15 farklı ülkeyi ziyaret et', descEn: 'Visit 15 different countries', icon: '🛂', category: 'world', check: s => s.worldCountryCount >= 15 },
  { id: 'world_25', title: 'Deneyimli Gezgin', titleEn: 'Seasoned Traveler', desc: '25 farklı ülkeyi ziyaret et', descEn: 'Visit 25 different countries', icon: '🧭', category: 'world', check: s => s.worldCountryCount >= 25 },
  { id: 'world_40', title: 'Küresel Kâşif', titleEn: 'Global Explorer', desc: '40 farklı ülkeyi ziyaret et', descEn: 'Visit 40 different countries', icon: '🛰️', category: 'world', check: s => s.worldCountryCount >= 40 },
  { id: 'world_50', title: 'Yarısına Ulaştın!', titleEn: 'Halfway There!', desc: '50 farklı ülkeyi ziyaret et', descEn: 'Visit 50 different countries', icon: '🏆', category: 'world', check: s => s.worldCountryCount >= 50 },
  { id: 'world_75', title: 'Dünya Çapında', titleEn: 'Worldwide Nomad', desc: '75 farklı ülkeyi ziyaret et', descEn: 'Visit 75 different countries', icon: '🌐', category: 'world', check: s => s.worldCountryCount >= 75 },
  { id: 'world_100', title: 'Yüzler Kulübü', titleEn: 'Centurion Club', desc: '100 farklı ülkeyi ziyaret et', descEn: 'Visit 100 different countries', icon: '💯', category: 'world', check: s => s.worldCountryCount >= 100 },

  // ─── KITA KÂŞİFİ ────────────────────────────────────────────────
  // Avrupa
  { id: 'europe_1', title: 'Avrupa Kapısı', titleEn: 'Gateway to Europe', desc: "Avrupa'da 1 ülkeyi ziyaret et", descEn: 'Visit 1 country in Europe', icon: '🇪🇺', category: 'continent', check: s => getContinentCount(s, 'europe') >= 1 },
  { id: 'europe_3', title: 'Avrupa Turisti', titleEn: 'Euro Tourist', desc: "Avrupa'da 3 ülkeyi ziyaret et", descEn: 'Visit 3 countries in Europe', icon: '🏰', category: 'continent', check: s => getContinentCount(s, 'europe') >= 3 },
  { id: 'europe_5', title: 'Avrupa Kâşifi', titleEn: 'Euro Explorer', desc: "Avrupa'da 5 ülkeyi ziyaret et", descEn: 'Visit 5 countries in Europe', icon: '🗼', category: 'continent', check: s => getContinentCount(s, 'europe') >= 5 },
  { id: 'europe_10', title: 'Avrupa Ustası', titleEn: 'Euro Master', desc: "Avrupa'da 10 ülkeyi ziyaret et", descEn: 'Visit 10 countries in Europe', icon: '🏛️', category: 'continent', check: s => getContinentCount(s, 'europe') >= 10 },
  { id: 'europe_20', title: 'Avrupa Fatihi', titleEn: 'Conqueror of Europe', desc: "Avrupa'da 20 ülkeyi ziyaret et", descEn: 'Visit 20 countries in Europe', icon: '👑', category: 'continent', check: s => getContinentCount(s, 'europe') >= 20 },
  
  // Asya
  { id: 'asia_1', title: 'Asya Kapısı', titleEn: 'Gateway to Asia', desc: "Asya'da 1 ülkeyi ziyaret et", descEn: 'Visit 1 country in Asia', icon: '🏯', category: 'continent', check: s => getContinentCount(s, 'asia') >= 1 },
  { id: 'asia_3', title: 'İpek Yolu Yolcusu', titleEn: 'Silk Road Voyager', desc: "Asya'da 3 ülkeyi ziyaret et", descEn: 'Visit 3 countries in Asia', icon: '🐫', category: 'continent', check: s => getContinentCount(s, 'asia') >= 3 },
  { id: 'asia_5', title: 'Asya Kâşifi', titleEn: 'Asian Explorer', desc: "Asya'da 5 ülkeyi ziyaret et", descEn: 'Visit 5 countries in Asia', icon: '🐉', category: 'continent', check: s => getContinentCount(s, 'asia') >= 5 },
  { id: 'asia_10', title: 'Doğu Rüzgârı', titleEn: 'Eastern Breeze', desc: "Asya'da 10 ülkeyi ziyaret et", descEn: 'Visit 10 countries in Asia', icon: '⛩️', category: 'continent', check: s => getContinentCount(s, 'asia') >= 10 },

  // Afrika
  { id: 'africa_1', title: "Afrika'ya Adım", titleEn: 'Step into Africa', desc: "Afrika'da 1 ülkeyi ziyaret et", descEn: 'Visit 1 country in Africa', icon: '🦁', category: 'continent', check: s => getContinentCount(s, 'africa') >= 1 },
  { id: 'africa_3', title: 'Safari Macerası', titleEn: 'Safari Adventure', desc: "Afrika'da 3 ülkeyi ziyaret et", descEn: 'Visit 3 countries in Africa', icon: '🏜️', category: 'continent', check: s => getContinentCount(s, 'africa') >= 3 },
  { id: 'africa_5', title: 'Vahşi Doğa', titleEn: 'Wild Safari', desc: "Afrika'da 5 ülkeyi ziyaret et", descEn: 'Visit 5 countries in Africa', icon: '🐘', category: 'continent', check: s => getContinentCount(s, 'africa') >= 5 },

  // Amerika
  { id: 'americas_1', title: 'Amerika Kıtası', titleEn: 'The Americas', desc: "Kuzey veya Güney Amerika'da 1 ülke gez", descEn: 'Visit 1 country in North or South America', icon: '🗽', category: 'continent', check: s => (getContinentCount(s, 'north_america') + getContinentCount(s, 'south_america')) >= 1 },
  { id: 'americas_3', title: 'Yeni Dünya', titleEn: 'New World', desc: "Amerika kıtalarında 3 ülke gez", descEn: 'Visit 3 countries across the Americas', icon: '🌴', category: 'continent', check: s => (getContinentCount(s, 'north_america') + getContinentCount(s, 'south_america')) >= 3 },
  { id: 'americas_5', title: 'Pan-Amerika', titleEn: 'Pan-American', desc: "Amerika kıtalarında 5 ülke gez", descEn: 'Visit 5 countries across the Americas', icon: '🦙', category: 'continent', check: s => (getContinentCount(s, 'north_america') + getContinentCount(s, 'south_america')) >= 5 },

  // Okyanusya
  { id: 'oceania_1', title: 'Okyanusya Yolcusu', titleEn: 'Oceania Traveler', desc: "Okyanusya'da 1 ülkeyi ziyaret et", descEn: 'Visit 1 country in Oceania', icon: '🦘', category: 'continent', check: s => getContinentCount(s, 'oceania') >= 1 },
  { id: 'oceania_2', title: 'Pasifik Kâşifi', titleEn: 'Pacific Explorer', desc: "Okyanusya'da 2 ülkeyi ziyaret et", descEn: 'Visit 2 countries in Oceania', icon: '🏄', category: 'continent', check: s => getContinentCount(s, 'oceania') >= 2 },

  // Kıta Kombinasyonları
  { id: 'two_continents', title: 'İki Kıta', titleEn: 'Two Continents', desc: "2 farklı kıtada en az 1'er ülke gez", descEn: 'Visit at least 1 country in 2 different continents', icon: '🌓', category: 'continent', check: s => Object.values(s.continentCounts || {}).filter(v => v > 0).length >= 2 },
  { id: 'three_continents', title: 'Üç Kıta', titleEn: 'Three Continents', desc: "3 farklı kıtada en az 1'er ülke gez", descEn: 'Visit at least 1 country in 3 different continents', icon: '🌏', category: 'continent', check: s => Object.values(s.continentCounts || {}).filter(v => v > 0).length >= 3 },
  { id: 'four_continents', title: 'Dört Kıta', titleEn: 'Four Continents', desc: "4 farklı kıtada en az 1'er ülke gez", descEn: 'Visit at least 1 country in 4 different continents', icon: '🌎', category: 'continent', check: s => Object.values(s.continentCounts || {}).filter(v => v > 0).length >= 4 },
  { id: 'five_continents', title: 'Beş Kıta Efsanesi', titleEn: 'Five Continents Legend', desc: "5 farklı kıtada en az 1'er ülke gez", descEn: 'Visit at least 1 country in 5 different continents', icon: '🏅', category: 'continent', check: s => Object.values(s.continentCounts || {}).filter(v => v > 0).length >= 5 },
  { id: 'six_continents', title: 'Küresel Bütünlük', titleEn: 'Global Wholeness', desc: "Tüm 6 kıtada en az 1'er ülke gez", descEn: 'Visit at least 1 country in all 6 continents', icon: '🌌', category: 'continent', check: s => Object.values(s.continentCounts || {}).filter(v => v > 0).length >= 6 },

  // ─── ANADOLU & TÜRKİYE ──────────────────────────────────────────
  { id: 'turkey_first', title: "Anadolu'ya İlk Adım", titleEn: 'First Footprint in Anatolia', desc: "Türkiye'de ilk ilini ziyaret et", descEn: 'Visit your first province in Turkey', icon: '🇹🇷', category: 'turkey', check: s => s.turkeyCount >= 1 },
  { id: 'turkey_5', title: 'Memleket Turu', titleEn: 'Homeland Journey', desc: "Türkiye'de 5 il ziyaret et", descEn: 'Visit 5 provinces in Turkey', icon: '🚗', category: 'turkey', check: s => s.turkeyCount >= 5 },
  { id: 'turkey_10', title: 'Anadolu Kâşifi', titleEn: 'Anatolian Explorer', desc: "Türkiye'de 10 il ziyaret et", descEn: 'Visit 10 provinces in Turkey', icon: '🕌', category: 'turkey', check: s => s.turkeyCount >= 10 },
  { id: 'turkey_20', title: 'Türkiye Yolcusu', titleEn: 'Turkey Wayfarer', desc: "Türkiye'de 20 il ziyaret et", descEn: 'Visit 20 provinces in Turkey', icon: '🎒', category: 'turkey', check: s => s.turkeyCount >= 20 },
  { id: 'turkey_40', title: 'Yarım Türkiye', titleEn: 'Half of Turkey', desc: "Türkiye'de 40 il ziyaret et", descEn: 'Visit 40 provinces in Turkey', icon: '🦅', category: 'turkey', check: s => s.turkeyCount >= 40 },
  { id: 'turkey_60', title: 'Anadolu Fatihi', titleEn: 'Anatolian Master', desc: "Türkiye'de 60 il ziyaret et", descEn: 'Visit 60 provinces in Turkey', icon: '🏔️', category: 'turkey', check: s => s.turkeyCount >= 60 },
  { id: 'turkey_all', title: "81'de 81 Türkiye Ustası", titleEn: '81 in 81 Grandmaster', desc: "Türkiye'nin tüm 81 ilini tamamla", descEn: 'Visit all 81 provinces of Turkey', icon: '🥇', category: 'turkey', check: s => s.turkeyCount >= 81 },
  
  // Türkiye Bölgeleri
  { id: 'all_7_regions', title: '7 Bölge Gezgini', titleEn: '7 Regions Explorer', desc: "Türkiye'nin 7 coğrafi bölgesinden de en az 1'er il gez", descEn: 'Visit at least 1 province in all 7 geographical regions of Turkey', icon: '🌈', category: 'turkey', check: s => Object.values(s.regionCounts || {}).filter(v => v > 0).length >= 7 },
  { id: 'region_marmara', title: 'Marmara Efendisi', titleEn: 'Master of Marmara', desc: "Marmara Bölgesi'nin tüm 11 ilini tamamla", descEn: 'Complete all 11 provinces of the Marmara Region', icon: '🌊', category: 'turkey', check: s => getRegionCount(s, 'marmara') >= 11 },
  { id: 'region_ege', title: 'Ege Âşıkları', titleEn: 'Aegean Lover', desc: "Ege Bölgesi'nin tüm 8 ilini tamamla", descEn: 'Complete all 8 provinces of the Aegean Region', icon: '🏖️', category: 'turkey', check: s => getRegionCount(s, 'ege') >= 8 },
  { id: 'region_akdeniz', title: 'Akdeniz Güneşi', titleEn: 'Mediterranean Sunshine', desc: "Akdeniz Bölgesi'nin tüm 8 ilini tamamla", descEn: 'Complete all 8 provinces of the Mediterranean Region', icon: '☀️', category: 'turkey', check: s => getRegionCount(s, 'akdeniz') >= 8 },
  { id: 'region_karadeniz', title: 'Karadeniz Ruhu', titleEn: 'Black Sea Soul', desc: "Karadeniz Bölgesi'nin tüm 18 ilini tamamla", descEn: 'Complete all 18 provinces of the Black Sea Region', icon: '🌲', category: 'turkey', check: s => getRegionCount(s, 'karadeniz') >= 18 },
  { id: 'region_ic_anadolu', title: 'Bozkırın Kalbi', titleEn: 'Heart of the Steppe', desc: "İç Anadolu Bölgesi'nin tüm 13 ilini tamamla", descEn: 'Complete all 13 provinces of Central Anatolia', icon: '🌾', category: 'turkey', check: s => getRegionCount(s, 'ic_anadolu') >= 13 },
  { id: 'region_dogu_anadolu', title: 'Doğu Zirveleri', titleEn: 'Eastern Peaks', desc: "Doğu Anadolu Bölgesi'nin tüm 14 ilini tamamla", descEn: 'Complete all 14 provinces of Eastern Anatolia', icon: '⛰️', category: 'turkey', check: s => getRegionCount(s, 'dogu_anadolu') >= 14 },
  { id: 'region_guneydogu', title: 'Güneydoğu Masalı', titleEn: 'Southeastern Tale', desc: "Güneydoğu Anadolu'nun tüm 9 ilini tamamla", descEn: 'Complete all 9 provinces of Southeastern Anatolia', icon: '🗿', category: 'turkey', check: s => getRegionCount(s, 'guneydogu_anadolu') >= 9 },

  // ─── ŞEHİR & EYALET AVCISI ─────────────────────────────────────
  { id: 'city_first', title: 'İlk Şehir', titleEn: 'First City', desc: 'Herhangi bir ülkede 1 şehir/bölge işaretle', descEn: 'Mark 1 city or region in any country', icon: '🏙️', category: 'city', check: s => s.worldCityCount >= 1 },
  { id: 'city_3', title: 'Şehir Meraklısı', titleEn: 'City Enthusiast', desc: 'Toplam 3 farklı şehir/bölge gez', descEn: 'Visit 3 different cities or regions in total', icon: '🚖', category: 'city', check: s => s.worldCityCount >= 3 },
  { id: 'city_5', title: 'Şehir Gezgini', titleEn: 'Urban Wanderer', desc: 'Toplam 5 farklı şehir/bölge gez', descEn: 'Visit 5 different cities or regions in total', icon: '🏘️', category: 'city', check: s => s.worldCityCount >= 5 },
  { id: 'city_10', title: 'Metropol Avcısı', titleEn: 'Metropolis Seeker', desc: 'Toplam 10 farklı şehir/bölge gez', descEn: 'Visit 10 different cities or regions in total', icon: '🌇', category: 'city', check: s => s.worldCityCount >= 10 },
  { id: 'city_20', title: 'Şehir Avcısı', titleEn: 'City Hunter', desc: 'Toplam 20 farklı şehir/bölge gez', descEn: 'Visit 20 different cities or regions in total', icon: '🎯', category: 'city', check: s => s.worldCityCount >= 20 },
  { id: 'city_35', title: 'Büyük Şehir Kâşifi', titleEn: 'Big City Explorer', desc: 'Toplam 35 farklı şehir/bölge gez', descEn: 'Visit 35 different cities or regions in total', icon: '🌆', category: 'city', check: s => s.worldCityCount >= 35 },
  { id: 'city_50', title: 'Şehir Efsanesi', titleEn: 'Urban Legend', desc: 'Toplam 50 farklı şehir/bölge gez', descEn: 'Visit 50 different cities or regions in total', icon: '🌃', category: 'city', check: s => s.worldCityCount >= 50 },
  { id: 'city_100', title: 'Yüzyılın Şehirlisi', titleEn: 'Centurion Citizen', desc: 'Toplam 100 farklı şehir/bölge gez', descEn: 'Visit 100 different cities or regions in total', icon: '💎', category: 'city', check: s => s.worldCityCount >= 100 },
  { id: 'city_3_in_one', title: 'Ülke Uzmanı', titleEn: 'Country Specialist', desc: 'Aynı ülkede 3+ farklı şehir/bölge gez', descEn: 'Visit 3+ cities or regions within the same country', icon: '📍', category: 'city', check: s => s.maxCitiesInOneCountry >= 3 },
  { id: 'city_5_in_one', title: 'Bölge Âlimi', titleEn: 'Regional Scholar', desc: 'Aynı ülkede 5+ farklı şehir/bölge gez', descEn: 'Visit 5+ cities or regions within the same country', icon: '🔎', category: 'city', check: s => s.maxCitiesInOneCountry >= 5 },
  { id: 'city_10_in_one', title: 'Yerel Gibi Yaşa', titleEn: 'Live Like a Local', desc: 'Aynı ülkede 10+ şehir/bölge gez', descEn: 'Visit 10+ cities or regions within the same country', icon: '🏡', category: 'city', check: s => s.maxCitiesInOneCountry >= 10 },

  // ─── HAVACILIK & FİLO ─────────────────────────────────────────
  { id: 'first_flight', title: 'Kanatlanış', titleEn: 'Taking Wing', desc: 'Binilen ilk havayolunu işaretle', descEn: 'Log your first flown airline', icon: '🛫', category: 'aviation', check: s => (s.flownAirlines || []).length >= 1 },
  { id: 'turkish_fleet_master', title: 'Göklerin Hakimi', titleEn: 'Ruler of the Skies', desc: "Türkiye'nin yerli havayollarının en az 3'üyle uç", descEn: 'Fly with at least 3 Turkish domestic airlines', icon: '🛩️', category: 'aviation', check: s => (s.flownAirlines || []).filter(id => ['thy', 'pegasus', 'sunexpress', 'ajet', 'corendon', 'freebird', 'tailwind', 'southwind'].includes(id)).length >= 3 },
  { id: 'star_collector', title: 'Star Alliance Koleksiyoneri', titleEn: 'Star Alliance Collector', desc: 'Star Alliance üyesi en az 3 farklı havayoluyla uç', descEn: 'Fly with at least 3 different Star Alliance member airlines', icon: '⭐', category: 'aviation', check: s => (s.flownAirlines || []).filter(id => ['thy', 'lufthansa', 'united', 'singapore', 'swiss', 'austrian', 'ana', 'aircanada', 'sas', 'tap', 'aegean', 'lot', 'brussels', 'airindia', 'egyptair', 'eva', 'airchina', 'thai', 'airnewzealand', 'asiana', 'copa', 'avianca'].includes(id)).length >= 3 },
  { id: 'skyteam_rider', title: 'SkyTeam Yolcusu', titleEn: 'SkyTeam Passenger', desc: 'SkyTeam üyesi bir havayoluyla uç', descEn: 'Fly with any SkyTeam member airline', icon: '🌀', category: 'aviation', check: s => (s.flownAirlines || []).some(id => ['airfrance', 'klm', 'delta', 'koreanair', 'saudia', 'virgin', 'aeromexico', 'ita', 'chinaeastern', 'vietnam', 'garuda', 'aireuropa', 'tarom', 'mea'].includes(id)) },
  { id: 'oneworld_flyer', title: 'oneworld Gezgini', titleEn: 'oneworld Traveler', desc: 'oneworld üyesi bir havayoluyla uç', descEn: 'Fly with any oneworld member airline', icon: '💠', category: 'aviation', check: s => (s.flownAirlines || []).some(id => ['british', 'qatar', 'american', 'cathay', 'finnair', 'iberia', 'jal', 'qantas', 'malaysia', 'royaljordanian', 'royalairmaroc', 'alaska', 'srilankan'].includes(id)) },
  { id: 'sky_giant', title: 'Gökyüzü Devi', titleEn: 'Giant of the Skies', desc: 'A380 veya B747 ile uçuş yap', descEn: 'Fly aboard an Airbus A380 or Boeing 747', icon: '🐋', category: 'aviation', check: s => (s.flownAircraft || []).some(id => id === 'a380' || id === 'b747') },
  { id: 'modern_fleet', title: 'Yeni Nesil Filo', titleEn: 'Next-Gen Fleet', desc: 'B787 Dreamliner veya A350 ile uçuş yap', descEn: 'Fly aboard a Boeing 787 Dreamliner or Airbus A350', icon: '🚀', category: 'aviation', check: s => (s.flownAircraft || []).some(id => id === 'b787' || id === 'a350') },
  { id: 'fleet_collector', title: 'Hangar Koleksiyoneri', titleEn: 'Hangar Collector', desc: 'En az 4 farklı uçak modelini koleksiyonuna ekle', descEn: 'Add at least 4 different aircraft models to your fleet', icon: '🛬', category: 'aviation', check: s => (s.flownAircraft || []).length >= 4 },
  { id: 'frequent_flyer', title: 'Sadık Yolcu', titleEn: 'Frequent Flyer', desc: '5 veya daha fazla farklı havayolu ile uç', descEn: 'Fly with 5 or more different airlines', icon: '🎫', category: 'aviation', check: s => (s.flownAirlines || []).length >= 5 },
  { id: 'lowcost_adventurer', title: 'Sırt Çantalı Gezgin', titleEn: 'Backpacker Aviator', desc: 'Ryanair, Wizz Air veya easyJet gibi bir indirimli havayoluyla uç', descEn: 'Fly with a budget airline like Ryanair, Wizz Air or easyJet', icon: '⚡', category: 'aviation', check: s => (s.flownAirlines || []).some(id => ['ryanair', 'easyjet', 'wizzair', 'vueling', 'eurowings', 'norwegian', 'transavia', 'volotea'].includes(id)) },
  { id: 'quad_jet_legend', title: 'Dört Motorlu Efsane', titleEn: 'Quad-Jet Legend', desc: 'A340 veya B747 gibi dört motorlu bir gökyüzü deviyle uç', descEn: 'Fly aboard a four-engine jetliner such as the A340 or B747', icon: '⚜️', category: 'aviation', check: s => (s.flownAircraft || []).some(id => id === 'a340' || id === 'b747') },

  // ─── ÖZEL & TEMATİK ROTALAR ───────────────────────────────────
  { id: 'planner', title: 'Planlı Gezgin', titleEn: 'Organized Traveler', desc: '5+ yeri "Planlanıyor" olarak işaretle', descEn: 'Mark 5+ places as "Planned"', icon: '📅', category: 'special', check: s => (s.worldPlannedCount || s.worldTargetCount || 0) >= 5 },
  { id: 'big_planner', title: 'Geleceğin Gezgini', titleEn: 'Future Globetrotter', desc: '15+ yeri "Planlanıyor" olarak işaretle', descEn: 'Mark 15+ places as "Planned"', icon: '🗓️', category: 'special', check: s => (s.worldPlannedCount || s.worldTargetCount || 0) >= 15 },
  { id: 'dreamer', title: 'Dünya Hayalcisi', titleEn: 'World Dreamer', desc: '10+ yeri "İstiyorum" olarak işaretle', descEn: 'Mark 10+ places as "Wishlist"', icon: '💭', category: 'special', check: s => (s.worldWishlistCount || 0) >= 10 },
  { id: 'big_dreamer', title: 'Sınırsız Hayal', titleEn: 'Limitless Dreams', desc: '25+ yeri "İstiyorum" olarak işaretle', descEn: 'Mark 25+ places as "Wishlist"', icon: '🌠', category: 'special', check: s => (s.worldWishlistCount || 0) >= 25 },
  { id: 'neighbor', title: 'Komşu Gezgin', titleEn: 'Neighboring Nomad', desc: "Türkiye'nin tüm 8 komşusunu (Yunanistan, Bulgaristan, Gürcistan, Ermenistan, Azerbaycan, İran, Irak, Suriye) ziyaret et", descEn: 'Visit all 8 neighbors of Turkey', icon: '🤝', category: 'special', check: s => ['GR','BG','GE','AM','AZ','IR','IQ','SY'].every(c => getVisitedCodes(s).includes(c)) },
  { id: 'balkan_tour', title: 'Balkan Ruhu', titleEn: 'Balkan Soul', desc: 'En az 4 Balkan ülkesini ziyaret et (Yunanistan, Bulgaristan, Makedonya, Arnavutluk, Sırbistan, Karadağ, Bosna, Hırvatistan, Romanya, Slovenya, Kosova)', descEn: 'Visit at least 4 Balkan countries', icon: '🎻', category: 'special', check: s => ['GR','BG','MK','AL','RS','ME','BA','HR','RO','SI','XK'].filter(c => getVisitedCodes(s).includes(c)).length >= 4 },
  { id: 'mediterranean', title: 'Akdeniz Çanağı', titleEn: 'Mediterranean Basin', desc: 'En az 4 Akdeniz ülkesini ziyaret et (Türkiye, Yunanistan, İtalya, İspanya, Fransa, Mısır, Fas)', descEn: 'Visit at least 4 Mediterranean countries', icon: '⛵', category: 'special', check: s => ['TR','GR','IT','ES','FR','EG','MA'].filter(c => getVisitedCodes(s).includes(c)).length >= 4 },
  { id: 'g20', title: 'G20 Gezgini', titleEn: 'G20 Traveler', desc: 'G20 ülkelerinin en az yarısını (10 ülke) ziyaret et', descEn: 'Visit at least half (10) of the G20 countries', icon: '💼', category: 'special', check: s => ['AR','AU','BR','CA','CN','FR','DE','IN','ID','IT','JP','MX','RU','SA','ZA','KR','TR','GB','US'].filter(c => getVisitedCodes(s).includes(c)).length >= 10 },
  { id: 'nordic', title: 'Kuzey Işıkları', titleEn: 'Northern Lights', desc: 'En az 2 İskandinav/Nordik ülkesini ziyaret et (İsveç, Norveç, Finlandiya, Danimarka, İzlanda)', descEn: 'Visit at least 2 Nordic/Scandinavian countries', icon: '❄️', category: 'special', check: s => ['SE','NO','FI','DK','IS'].filter(c => getVisitedCodes(s).includes(c)).length >= 2 },
  { id: 'far_east', title: 'Uzak Doğu Kâşifi', titleEn: 'Far East Explorer', desc: 'En az 2 Uzak Doğu ülkesini ziyaret et (Japonya, Güney Kore, Çin)', descEn: 'Visit at least 2 Far East Asian countries', icon: '🏮', category: 'special', check: s => ['JP','KR','CN'].filter(c => getVisitedCodes(s).includes(c)).length >= 2 },
  { id: 'turkic_world', title: 'Türk Dünyası', titleEn: 'Turkic World', desc: 'En az 2 Türk devletini ziyaret et (Azerbaycan, Kazakistan, Özbekistan, Türkmenistan, Kırgızistan)', descEn: 'Visit at least 2 Turkic states', icon: '🐺', category: 'special', check: s => ['AZ','KZ','UZ','TM','KG'].filter(c => getVisitedCodes(s).includes(c)).length >= 2 },

  // ─── TOPLULUK & KATKI ─────────────────────────────────────────
  { id: 'first_feedback', title: 'İlk Ses', titleEn: 'First Voice', desc: 'Uygulamayı geliştirmek için ilk geri bildirimini paylaş', descEn: 'Share your first feedback to help improve the app', icon: '📮', category: 'community', check: s => (s.feedbackCount || 0) >= 1 },
  { id: 'bug_hunter', title: 'Hata Avcısı', titleEn: 'Bug Hunter', desc: 'Uygulamanın gelişmesi için en az 1 hata (bug) bildirimi yap', descEn: 'Submit at least 1 bug report to help the app improve', icon: '🐞', category: 'community', check: s => (s.bugReportCount || 0) >= 1 },
  { id: 'feature_contributor', title: 'Fikir Mimarı', titleEn: 'Visionary', desc: 'Geliştiriciye 3 veya daha fazla öneri/fikir gönder', descEn: 'Submit 3 or more ideas or suggestions to the developer', icon: '💡', category: 'community', check: s => (s.suggestionCount || 0) >= 3 },
  { id: 'issue_resolved', title: 'Sorun Çözücü', titleEn: 'Problem Solver', desc: 'Bildirdiğin bir öneri veya hatanın çözülmesini sağla', descEn: 'Have an idea or bug report that you submitted marked as resolved', icon: '🛠️', category: 'community', check: s => (s.resolvedFeedbackCount || 0) >= 1 },
];

export function computeAchievementStats(storageData, baseStats) {
  const { worldVisits = {}, turkeyVisits = {}, worldCities = [] } = storageData || {};

  // ── Read aviation data from localStorage ──
  let userAirlines = {};
  let userAircraft = {};
  try {
    const alRaw = localStorage.getItem(STORAGE_KEYS.USER_AIRLINES);
    if (alRaw) userAirlines = JSON.parse(alRaw);
    const acRaw = localStorage.getItem(STORAGE_KEYS.USER_AIRCRAFT);
    if (acRaw) userAircraft = JSON.parse(acRaw);
  } catch {}

  const flownAirlines = Object.keys(userAirlines).filter(k => userAirlines[k]?.flown);
  const totalFlightCount = flownAirlines.length;
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

  // ── Read feedback stats from localStorage ──
  let userFeedbacks = [];
  try {
    const fbRaw = localStorage.getItem(STORAGE_KEYS.USER_FEEDBACKS);
    if (fbRaw) userFeedbacks = JSON.parse(fbRaw);
  } catch {}
  if (!Array.isArray(userFeedbacks)) userFeedbacks = [];

  let fbOverrides = {};
  try {
    const ovRaw = localStorage.getItem(STORAGE_KEYS.FEEDBACK_STATUS_OVERRIDES);
    if (ovRaw) fbOverrides = JSON.parse(ovRaw);
  } catch {}

  const mergedFeedbacks = userFeedbacks.map(f => fbOverrides[f.id] ? { ...f, ...fbOverrides[f.id] } : f);
  const feedbackCount = mergedFeedbacks.length;
  const bugReportCount = mergedFeedbacks.filter(f => f.type === 'bug').length;
  const suggestionCount = mergedFeedbacks.filter(f => f.type === 'suggestion' || f.type === 'feature').length;
  const resolvedFeedbackCount = mergedFeedbacks.filter(f => f.status === 'resolved' || f.status === 'completed' || f.status === 'Yapıldı').length;

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
    flownAircraft,
    feedbackCount,
    bugReportCount,
    suggestionCount,
    resolvedFeedbackCount
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

