// Dünya Ülkeleri ve Popüler Şehirler Veri Seti
export const CONTINENTS = [
  { id: 'europe', name: 'Avrupa', icon: '🏰', color: '#3b82f6' },
  { id: 'asia', name: 'Asya', icon: '🕌', color: '#ec4899' },
  { id: 'north_america', name: 'Kuzey Amerika', icon: '🗽', color: '#10b981' },
  { id: 'south_america', name: 'Güney Amerika', icon: '💃', color: '#f59e0b' },
  { id: 'africa', name: 'Afrika', icon: '🦁', color: '#8b5cf6' },
  { id: 'oceania', name: 'Okyanusya', icon: '🦘', color: '#06b6d4' }
];

export const WORLD_COUNTRIES = [
  {
    code: 'DE',
    name: 'Almanya',
    nameEn: 'Germany',
    flag: '🇩🇪',
    continent: 'europe',
    capital: 'Berlin',
    popularCities: ['Münih', 'Berlin', 'Frankfurt', 'Hamburg', 'Köln', 'Stuttgart', 'Düsseldorf', 'Dresden', 'Nürnberg', 'Leipzig']
  },
  {
    code: 'FR',
    name: 'Fransa',
    nameEn: 'France',
    flag: '🇫🇷',
    continent: 'europe',
    capital: 'Paris',
    popularCities: ['Paris', 'Nice', 'Lyon', 'Marsilya', 'Bordeaux', 'Strazburg', 'Toulouse', 'Cannes', 'Lille']
  },
  {
    code: 'IT',
    name: 'İtalya',
    nameEn: 'Italy',
    flag: '🇮🇹',
    continent: 'europe',
    capital: 'Roma',
    popularCities: ['Roma', 'Milano', 'Venedik', 'Floransa', 'Napoli', 'Torino', 'Bologna', 'Palermo', 'Verona', 'Pisa']
  },
  {
    code: 'ES',
    name: 'İspanya',
    nameEn: 'Spain',
    flag: '🇪🇸',
    continent: 'europe',
    capital: 'Madrid',
    popularCities: ['Barselona', 'Madrid', 'Sevilla', 'Valensiya', 'Malaga', 'Granada', 'Bilbao', 'İbiza', 'Palma de Mallorca']
  },
  {
    code: 'GB',
    name: 'İngiltere / Birleşik Krallık',
    nameEn: 'United Kingdom',
    flag: '🇬🇧',
    continent: 'europe',
    capital: 'Londra',
    popularCities: ['Londra', 'Edinburgh', 'Manchester', 'Liverpool', 'Oxford', 'Cambridge', 'Birmingham', 'Belfast', 'Glasgow']
  },
  {
    code: 'US',
    name: 'Amerika Birleşik Devletleri',
    nameEn: 'United States',
    flag: '🇺🇸',
    continent: 'north_america',
    capital: 'Washington, D.C.',
    popularCities: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Las Vegas', 'Boston', 'Seattle', 'Orlando', 'Washington, D.C.']
  },
  {
    code: 'NL',
    name: 'Hollanda',
    nameEn: 'Netherlands',
    flag: '🇳🇱',
    continent: 'europe',
    capital: 'Amsterdam',
    popularCities: ['Amsterdam', 'Rotterdam', 'Lahey', 'Utrecht', 'Eindhoven', 'Maastricht', 'Groningen']
  },
  {
    code: 'GR',
    name: 'Yunanistan',
    nameEn: 'Greece',
    flag: '🇬🇷',
    continent: 'europe',
    capital: 'Atina',
    popularCities: ['Atina', 'Selanik', 'Santorini', 'Mikonos', 'Rodos', 'Girit', 'Kavala', 'Dedeağaç']
  },
  {
    code: 'AT',
    name: 'Avusturya',
    nameEn: 'Austria',
    flag: '🇦🇹',
    continent: 'europe',
    capital: 'Viyana',
    popularCities: ['Viyana', 'Salzburg', 'Innsbruck', 'Graz', 'Linz', 'Hallstatt']
  },
  {
    code: 'CH',
    name: 'İsviçre',
    nameEn: 'Switzerland',
    flag: '🇨🇭',
    continent: 'europe',
    capital: 'Bern',
    popularCities: ['Zürih', 'Cenevre', 'Lozan', 'Luzern', 'Basel', 'Interlaken', 'Bern']
  },
  {
    code: 'JP',
    name: 'Japonya',
    nameEn: 'Japan',
    flag: '🇯🇵',
    continent: 'asia',
    capital: 'Tokyo',
    popularCities: ['Tokyo', 'Kyoto', 'Osaka', 'Hiroşima', 'Nara', 'Sapporo', 'Fukuoka', 'Yokohama']
  },
  {
    code: 'TR',
    name: 'Türkiye',
    nameEn: 'Turkey',
    flag: '🇹🇷',
    continent: 'europe',
    capital: 'Ankara',
    popularCities: ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa', 'Kapadokya', 'Trabzon', 'Gaziantep', 'Muğla']
  },
  {
    code: 'AE',
    name: 'Birleşik Arap Emirlikleri',
    nameEn: 'United Arab Emirates',
    flag: '🇦🇪',
    continent: 'asia',
    capital: 'Abu Dabi',
    popularCities: ['Dubai', 'Abu Dabi', 'Şarjah', 'Acman']
  },
  {
    code: 'RU',
    name: 'Rusya',
    nameEn: 'Russia',
    flag: '🇷🇺',
    continent: 'europe',
    capital: 'Moskova',
    popularCities: ['Moskova', 'St. Petersburg', 'Kazan', 'Soçi', 'Vladivostok']
  },
  {
    code: 'PT',
    name: 'Portekiz',
    nameEn: 'Portugal',
    flag: '🇵🇹',
    continent: 'europe',
    capital: 'Lizbon',
    popularCities: ['Lizbon', 'Porto', 'Faro', 'Coimbra', 'Funchal (Madeira)', 'Sintra']
  },
  {
    code: 'BE',
    name: 'Belçika',
    nameEn: 'Belgium',
    flag: '🇧🇪',
    continent: 'europe',
    capital: 'Brüksel',
    popularCities: ['Brüksel', 'Brugge', 'Gent', 'Antwerpen', 'Leuven']
  },
  {
    code: 'CZ',
    name: 'Çekya',
    nameEn: 'Czech Republic',
    flag: '🇨🇿',
    continent: 'europe',
    capital: 'Prag',
    popularCities: ['Prag', 'Český Krumlov', 'Brno', 'Karlovy Vary', 'Ostrava']
  },
  {
    code: 'HU',
    name: 'Macaristan',
    nameEn: 'Hungary',
    flag: '🇭🇺',
    continent: 'europe',
    capital: 'Budapeşte',
    popularCities: ['Budapeşte', 'Debrecen', 'Eger', 'Szeged', 'Pécs']
  },
  {
    code: 'PL',
    name: 'Polonya',
    nameEn: 'Poland',
    flag: '🇵🇱',
    continent: 'europe',
    capital: 'Varşova',
    popularCities: ['Kraków', 'Varşova', 'Wrocław', 'Gdańsk', 'Poznań']
  },
  {
    code: 'GE',
    name: 'Gürcistan',
    nameEn: 'Georgia',
    flag: '🇬🇪',
    continent: 'asia',
    capital: 'Tiflis',
    popularCities: ['Tiflis', 'Batum', 'Kutaisi', 'Kazbegi', 'Sighnaghi']
  },
  {
    code: 'EG',
    name: 'Mısır',
    nameEn: 'Egypt',
    flag: '🇪🇬',
    continent: 'africa',
    capital: 'Kahire',
    popularCities: ['Kahire', 'Şarm El-Şeyh', 'İskenderiye', 'Luksor', 'Hurgada', 'Aswan']
  },
  {
    code: 'TH',
    name: 'Tayland',
    nameEn: 'Thailand',
    flag: '🇹🇭',
    continent: 'asia',
    capital: 'Bangkok',
    popularCities: ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Koh Samui', 'Krabi']
  },
  {
    code: 'CN',
    name: 'Çin',
    nameEn: 'China',
    flag: '🇨🇳',
    continent: 'asia',
    capital: 'Pekin',
    popularCities: ['Pekin', 'Şanghay', 'Guangzhou', 'Shenzhen', 'Xi\'an', 'Chengdu', 'Hong Kong']
  },
  {
    code: 'KR',
    name: 'Güney Kore',
    nameEn: 'South Korea',
    flag: '🇰🇷',
    continent: 'asia',
    capital: 'Seul',
    popularCities: ['Seul', 'Busan', 'Jeju', 'Incheon', 'Gyeongju']
  },
  {
    code: 'BR',
    name: 'Brezilya',
    nameEn: 'Brazil',
    flag: '🇧🇷',
    continent: 'south_america',
    capital: 'Brasília',
    popularCities: ['Rio de Janeiro', 'São Paulo', 'Salvador', 'Brasília', 'Florianópolis']
  },
  {
    code: 'AR',
    name: 'Arjantin',
    nameEn: 'Argentina',
    flag: '🇦🇷',
    continent: 'south_america',
    capital: 'Buenos Aires',
    popularCities: ['Buenos Aires', 'Mendoza', 'Bariloche', 'Cordoba', 'Ushuaia']
  },
  {
    code: 'CA',
    name: 'Kanada',
    nameEn: 'Canada',
    flag: '🇨🇦',
    continent: 'north_america',
    capital: 'Ottawa',
    popularCities: ['Toronto', 'Vancouver', 'Montreal', 'Quebec City', 'Calgary', 'Ottawa']
  },
  {
    code: 'AU',
    name: 'Avustralya',
    nameEn: 'Australia',
    flag: '🇦🇺',
    continent: 'oceania',
    capital: 'Canberra',
    popularCities: ['Sidney', 'Melbourne', 'Brisbane', 'Perth', 'Gold Coast', 'Cairns']
  },
  {
    code: 'SE',
    name: 'İsveç',
    nameEn: 'Sweden',
    flag: '🇸🇪',
    continent: 'europe',
    capital: 'Stokholm',
    popularCities: ['Stokholm', 'Göteborg', 'Malmö', 'Uppsala']
  },
  {
    code: 'NO',
    name: 'Norveç',
    nameEn: 'Norway',
    flag: '🇳🇴',
    continent: 'europe',
    capital: 'Oslo',
    popularCities: ['Oslo', 'Bergen', 'Tromsø', 'Trondheim', 'Stavanger']
  },
  {
    code: 'DK',
    name: 'Danimarka',
    nameEn: 'Denmark',
    flag: '🇩🇰',
    continent: 'europe',
    capital: 'Kopenhag',
    popularCities: ['Kopenhag', 'Aarhus', 'Odense', 'Aalborg']
  },
  {
    code: 'FI',
    name: 'Finlandiya',
    nameEn: 'Finland',
    flag: '🇫🇮',
    continent: 'europe',
    capital: 'Helsinki',
    popularCities: ['Helsinki', 'Rovaniemi (Laponya)', 'Tampere', 'Turku']
  },
  {
    code: 'HR',
    name: 'Hırvatistan',
    nameEn: 'Croatia',
    flag: '🇭🇷',
    continent: 'europe',
    capital: 'Zagreb',
    popularCities: ['Dubrovnik', 'Split', 'Zagreb', 'Zadar', 'Pula']
  },
  {
    code: 'BA',
    name: 'Bosna-Hersek',
    nameEn: 'Bosnia and Herzegovina',
    flag: '🇧🇦',
    continent: 'europe',
    capital: 'Saraybosna',
    popularCities: ['Saraybosna', 'Mostar', 'Banja Luka', 'Travnik', 'Neum']
  },
  {
    code: 'ME',
    name: 'Karadağ',
    nameEn: 'Montenegro',
    flag: '🇲🇪',
    continent: 'europe',
    capital: 'Podgorica',
    popularCities: ['Kotor', 'Budva', 'Podgorica', 'Tivat', 'Herceg Novi']
  },
  {
    code: 'RS',
    name: 'Sırbistan',
    nameEn: 'Serbia',
    flag: '🇷🇸',
    continent: 'europe',
    capital: 'Belgrad',
    popularCities: ['Belgrad', 'Novi Sad', 'Niş', 'Subotica']
  },
  {
    code: 'RO',
    name: 'Romanya',
    nameEn: 'Romania',
    flag: '🇷🇴',
    continent: 'europe',
    capital: 'Bükreş',
    popularCities: ['Bükreş', 'Braşov', 'Cluj-Napoca', 'Sibiu', 'Timişoara']
  },
  {
    code: 'BG',
    name: 'Bulgaristan',
    nameEn: 'Bulgaria',
    flag: '🇧🇬',
    continent: 'europe',
    capital: 'Sofya',
    popularCities: ['Sofya', 'Plovdiv (Filibe)', 'Varna', 'Burgaz', 'Bansko']
  },
  {
    code: 'MX',
    name: 'Meksika',
    nameEn: 'Mexico',
    flag: '🇲🇽',
    continent: 'north_america',
    capital: 'Meksiko',
    popularCities: ['Cancun', 'Meksiko', 'Guadalajara', 'Playa del Carmen', 'Oaxaca']
  },
  {
    code: 'MA',
    name: 'Fas',
    nameEn: 'Morocco',
    flag: '🇲🇦',
    continent: 'africa',
    capital: 'Rabat',
    popularCities: ['Marakeş', 'Kasablanka', 'Fes', 'Şafşavan', 'Tanca', 'Rabat']
  },
  {
    code: 'ZA',
    name: 'Güney Afrika',
    nameEn: 'South Africa',
    flag: '🇿🇦',
    continent: 'africa',
    capital: 'Pretoria',
    popularCities: ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria']
  },
  {
    code: 'ID',
    name: 'Endonezya',
    nameEn: 'Indonesia',
    flag: '🇮🇩',
    continent: 'asia',
    capital: 'Cakarta',
    popularCities: ['Bali', 'Cakarta', 'Yogyakarta', 'Bandung', 'Lombok']
  },
  {
    code: 'SG',
    name: 'Singapur',
    nameEn: 'Singapore',
    flag: '🇸🇬',
    continent: 'asia',
    capital: 'Singapur',
    popularCities: ['Singapur', 'Sentosa']
  },
  {
    code: 'MY',
    name: 'Malezya',
    nameEn: 'Malaysia',
    flag: '🇲🇾',
    continent: 'asia',
    capital: 'Kuala Lumpur',
    popularCities: ['Kuala Lumpur', 'Penang', 'Langkawi', 'Melaka']
  },
  {
    code: 'AZ',
    name: 'Azerbaycan',
    nameEn: 'Azerbaijan',
    flag: '🇦🇿',
    continent: 'asia',
    capital: 'Bakü',
    popularCities: ['Bakü', 'Gence', 'Şeki', 'Gebele', 'Şuşa']
  },
  {
    code: 'CY',
    name: 'Kıbrıs (KKTC & GKRY)',
    nameEn: 'Cyprus',
    flag: '🇨🇾',
    continent: 'europe',
    capital: 'Lefkoşa',
    popularCities: ['Girne', 'Lefkoşa', 'Gazimağusa', 'Larnaka', 'Baf']
  }
];

// Toplam tanınmış bağımsız ülke sayısı benchmarkı (195 UN üyesi/gözlemcisi)
export const TOTAL_WORLD_COUNTRIES_BENCHMARK = 195;
