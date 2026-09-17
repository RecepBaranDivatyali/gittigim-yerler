// challengesData.js - Gezgin 2.0 Rota Koleksiyonları & Seyahat Challenge'ları
export const TRAVEL_CHALLENGES = [
  {
    id: 'balkans',
    title: 'Balkan Rüyası',
    titleEn: 'Balkan Dream',
    icon: '🏛️',
    badge: '🎖️ Balkan Fatihi',
    desc: 'Balkan yarımadasının zengin tarihini, lezzetlerini ve doğasını keşfet.',
    descEn: 'Explore the rich history, cuisine, and nature of the Balkan peninsula.',
    countries: ['TR', 'GR', 'BG', 'MK', 'AL', 'ME', 'BA', 'RS', 'XK', 'HR', 'RO']
  },
  {
    id: 'nordic',
    title: 'İskandinav Masalı',
    titleEn: 'Nordic Escapade',
    icon: '❄️',
    badge: '👑 Kuzey Yıldızı',
    desc: 'Fiyortlar, kuzey ışıkları ve masalsı İskandinav coğrafyası.',
    descEn: 'Fjords, northern lights, and magical Scandinavian landscapes.',
    countries: ['NO', 'SE', 'FI', 'DK', 'IS']
  },
  {
    id: 'central_europe',
    title: 'Orta Avrupa Klasikleri',
    titleEn: 'Central Europe Classics',
    icon: '🏰',
    badge: '🏰 Şatolar Efendisi',
    desc: 'Tarihi kaleler, klasik müzik ve gotik mimarinin kalbi.',
    descEn: 'Historic castles, classical music, and gothic architecture.',
    countries: ['DE', 'AT', 'CH', 'CZ', 'PL', 'HU', 'SK']
  },
  {
    id: 'mediterranean',
    title: 'Akdeniz Güneşi',
    titleEn: 'Mediterranean Charm',
    icon: '🌊',
    badge: '☀️ Akdeniz Korsanı',
    desc: 'Turkuaz koylar, zeytin ağaçları ve güney sahilleri.',
    descEn: 'Turquoise bays, olive groves, and sunny southern coastlines.',
    countries: ['ES', 'IT', 'FR', 'PT', 'GR', 'MT', 'CY']
  },
  {
    id: 'silk_road',
    title: 'Kafkaslar & İpek Yolu',
    titleEn: 'Caucasus & Silk Road',
    icon: '🐫',
    badge: '🧭 Kervan Başı',
    desc: 'Tarihi İpek Yolu kervan rotaları ve görkemli Kafkas dağları.',
    descEn: 'Historic Silk Road caravan routes and majestic Caucasus peaks.',
    countries: ['AZ', 'GE', 'AM', 'UZ', 'KZ', 'KG', 'TM']
  },
  {
    id: 'far_east',
    title: 'Uzak Doğu Asya',
    titleEn: 'Far East Asia',
    icon: '🏮',
    badge: '🐉 Doğu Ejderhası',
    desc: 'Kadim tapınaklar, neon şehirler ve büyüleyici Doğu kültürü.',
    descEn: 'Ancient temples, neon cities, and captivating Eastern culture.',
    countries: ['JP', 'KR', 'CN', 'TW', 'VN', 'TH', 'SG', 'MY', 'ID']
  }
];

export function calculateChallengesProgress(visitedCountryCodes = []) {
  const visitedSet = new Set(visitedCountryCodes.filter(c => c && !c.includes('::')));

  return TRAVEL_CHALLENGES.map(ch => {
    const total = ch.countries.length;
    const visited = ch.countries.filter(code => visitedSet.has(code));
    const count = visited.length;
    const percentage = Math.round((count / total) * 100);
    const isCompleted = count === total;

    return {
      ...ch,
      total,
      count,
      percentage,
      isCompleted,
      visitedCodes: visited,
      missingCodes: ch.countries.filter(code => !visitedSet.has(code))
    };
  });
}
