// Seyahat Başarı Rozetleri
export const BADGES = [
  {
    id: 'first_step',
    title: 'İlk Adım 👣',
    description: 'İlk şehir veya ülkeni işaretledin!',
    condition: (stats) => ((stats?.turkeyCount || 0) + (stats?.worldCountryCount || 0)) >= 1,
    icon: '📍',
    color: '#6366f1'
  },
  {
    id: 'turkey_5',
    title: 'Acemi Gezgin 🚗',
    description: 'Türkiye\'de 5 il ziyaret ettin.',
    condition: (stats) => (stats?.turkeyCount || 0) >= 5,
    icon: '🚘',
    color: '#10b981'
  },
  {
    id: 'turkey_15',
    title: 'Yol Çocuğu 🎒',
    description: 'Türkiye\'de 15 il keşfettin.',
    condition: (stats) => (stats?.turkeyCount || 0) >= 15,
    icon: '🎒',
    color: '#3b82f6'
  },
  {
    id: 'turkey_35',
    title: 'Türkiye Üstadı 🏔️',
    description: 'Türkiye\'de 35 il ziyaret ettin!',
    condition: (stats) => (stats?.turkeyCount || 0) >= 35,
    icon: '🏔️',
    color: '#f59e0b'
  },
  {
    id: 'turkey_81',
    title: 'Evliya Çelebi 👑',
    description: 'Tebrikler! Türkiye\'nin 81 ilinin tamamını gezdin!',
    condition: (stats) => (stats?.turkeyCount || 0) === 81,
    icon: '👑',
    color: '#ef4444'
  },
  {
    id: 'world_3',
    title: 'Pasaport Hamlesi ✈️',
    description: '3 farklı ülke ziyaret ettin.',
    condition: (stats) => (stats?.worldCountryCount || 0) >= 3,
    icon: '✈️',
    color: '#ec4899'
  },
  {
    id: 'world_10',
    title: 'Dünya Vatandaşı 🌍',
    description: '10 farklı ülke keşfettin.',
    condition: (stats) => (stats?.worldCountryCount || 0) >= 10,
    icon: '🌐',
    color: '#8b5cf6'
  },
  {
    id: 'world_cities_5',
    title: 'Şehir Avcısı 🏙️',
    description: 'Dünya çapında 5 farklı şehir işaretledin.',
    condition: (stats) => (stats?.worldCityCount || 0) >= 5,
    icon: '🏙️',
    color: '#06b6d4'
  },
  {
    id: 'world_cities_15',
    title: 'Metropol Avcısı 🏙️',
    description: 'Dünya çapında en az 15 farklı şehir veya il işaretledin.',
    condition: (stats) => (stats?.worldCityCount || 0) >= 15,
    icon: '🏙️',
    color: '#6366f1'
  },
  {
    id: 'world_cities_30',
    title: 'Dünya Sakini 🌍',
    description: 'Dünya çapında en az 30 farklı şehir veya il gezdin.',
    condition: (stats) => (stats?.worldCityCount || 0) >= 30,
    icon: '🌍',
    color: '#8b5cf6'
  },
  {
    id: 'europe_explorer',
    title: 'Avrupa Fatihi 🏰',
    description: 'Avrupa\'da en az 5 ülke gezdin.',
    condition: (stats) => (stats?.continentCounts?.['europe'] || 0) >= 5,
    icon: '🏰',
    color: '#3b82f6'
  },
  {
    id: 'asia_explorer',
    title: 'Asya Yolcusu ⛩️',
    description: 'Asya kıtasında en az 3 ülke gezdin.',
    condition: (stats) => (stats?.continentCounts?.['asia'] || 0) >= 3,
    icon: '⛩️',
    color: '#f59e0b'
  },
  {
    id: 'americas_explorer',
    title: 'Amerika Kâşifi 🗽',
    description: 'Amerika kıtalarında en az 2 ülke keşfettin.',
    condition: (stats) => ((stats?.continentCounts?.['americas'] || 0) + (stats?.continentCounts?.['north_america'] || 0) + (stats?.continentCounts?.['south_america'] || 0)) >= 2 || ((stats?.continentCounts?.['americas'] || stats?.continentCounts?.['north_america'] || 0) >= 2),
    icon: '🗽',
    color: '#ef4444'
  },
  {
    id: 'africa_explorer',
    title: 'Afrika Safarisi 🦁',
    description: 'Afrika kıtasında en az 1 ülke ziyaret ettin.',
    condition: (stats) => (stats?.continentCounts?.['africa'] || 0) >= 1,
    icon: '🦁',
    color: '#10b981'
  },
  {
    id: 'marmara_master',
    title: 'Marmara Hakimi 🌊',
    description: 'Marmara Bölgesi\'ndeki tüm illeri (11 il) gezdin.',
    condition: (stats) => (stats?.regionCounts?.['marmara'] || 0) === 11,
    icon: '🌊',
    color: '#10b981'
  },
  {
    id: 'ege_master',
    title: 'Ege Aşıkları 🏖️',
    description: 'Ege Bölgesi\'nde en az 5 il ziyaret ettin.',
    condition: (stats) => (stats?.regionCounts?.['ege'] || 0) >= 5,
    icon: '🏖️',
    color: '#06b6d4'
  },
  {
    id: 'akdeniz_master',
    title: 'Akdeniz Güneşi ☀️',
    description: 'Akdeniz Bölgesi\'nde en az 5 il gezdin.',
    condition: (stats) => (stats?.regionCounts?.['akdeniz'] || 0) >= 5,
    icon: '☀️',
    color: '#f59e0b'
  },
  {
    id: 'karadeniz_master',
    title: 'Karadeniz Yaylaları 🌲',
    description: 'Karadeniz Bölgesi\'nde en az 6 il keşfettin.',
    condition: (stats) => (stats?.regionCounts?.['karadeniz'] || 0) >= 6,
    icon: '🌲',
    color: '#10b981'
  },
  {
    id: 'ic_anadolu_master',
    title: 'Bozkır Gezgini 🌾',
    description: 'İç Anadolu Bölgesi\'nde en az 6 il ziyaret ettin.',
    condition: (stats) => (stats?.regionCounts?.['ic_anadolu'] || 0) >= 6,
    icon: '🌾',
    color: '#8b5cf6'
  },
  {
    id: 'dogu_anadolu_master',
    title: 'Doğu Kâşifi 🏔️',
    description: 'Doğu Anadolu Bölgesi\'nde en az 5 il gezdin.',
    condition: (stats) => (stats?.regionCounts?.['dogu_anadolu'] || 0) >= 5,
    icon: '🏔️',
    color: '#ec4899'
  },
  {
    id: 'guneydogu_master',
    title: 'Mezopotamya Ruhu 🏛️',
    description: 'Güneydoğu Anadolu Bölgesi\'nde en az 4 il keşfettin.',
    condition: (stats) => (stats?.regionCounts?.['guneydogu_anadolu'] || 0) >= 4,
    icon: '🏛️',
    color: '#f97316'
  }
];
