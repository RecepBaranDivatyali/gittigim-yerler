// Seyahat Başarı Rozetleri
export const BADGES = [
  {
    id: 'first_step',
    title: 'İlk Adım 👣',
    description: 'İlk şehir veya ülkeni işaretledin!',
    condition: (stats) => (stats.turkeyCount + stats.worldCountryCount) >= 1,
    icon: '📍',
    color: '#6366f1'
  },
  {
    id: 'turkey_5',
    title: 'Acemi Gezgin 🚗',
    description: 'Türkiye\'de 5 il ziyaret ettin.',
    condition: (stats) => stats.turkeyCount >= 5,
    icon: '🚘',
    color: '#10b981'
  },
  {
    id: 'turkey_15',
    title: 'Yol Çocuğu 🎒',
    description: 'Türkiye\'de 15 il keşfettin.',
    condition: (stats) => stats.turkeyCount >= 15,
    icon: '🎒',
    color: '#3b82f6'
  },
  {
    id: 'turkey_35',
    title: 'Türkiye Üstadı 🏔️',
    description: 'Türkiye\'de 35 il ziyaret ettin!',
    condition: (stats) => stats.turkeyCount >= 35,
    icon: '🏔️',
    color: '#f59e0b'
  },
  {
    id: 'turkey_81',
    title: 'Evliya Çelebi 👑',
    description: 'Tebrikler! Türkiye\'nin 81 ilinin tamamını gezdin!',
    condition: (stats) => stats.turkeyCount === 81,
    icon: '👑',
    color: '#ef4444'
  },
  {
    id: 'world_3',
    title: 'Pasaport Hamlesi ✈️',
    description: '3 farklı ülke ziyaret ettin.',
    condition: (stats) => stats.worldCountryCount >= 3,
    icon: '✈️',
    color: '#ec4899'
  },
  {
    id: 'world_10',
    title: 'Dünya Vatandaşı 🌍',
    description: '10 farklı ülke keşfettin.',
    condition: (stats) => stats.worldCountryCount >= 10,
    icon: '🌐',
    color: '#8b5cf6'
  },
  {
    id: 'world_cities_5',
    title: 'Şehir Avcısı 🏙️',
    description: 'Dünya çapında 5 farklı şehir işaretledin.',
    condition: (stats) => stats.worldCityCount >= 5,
    icon: '🏙️',
    color: '#06b6d4'
  },
  {
    id: 'europe_explorer',
    title: 'Avrupa Fatihi 🏰',
    description: 'Avrupa\'da en az 5 ülke gezdin.',
    condition: (stats) => (stats.continentCounts['europe'] || 0) >= 5,
    icon: '🏰',
    color: '#3b82f6'
  },
  {
    id: 'marmara_master',
    title: 'Marmara Hakimi 🌊',
    description: 'Marmara Bölgesi\'ndeki tüm illeri (11 il) gezdin.',
    condition: (stats) => (stats.regionCounts['marmara'] || 0) === 11,
    icon: '🌊',
    color: '#10b981'
  }
];
