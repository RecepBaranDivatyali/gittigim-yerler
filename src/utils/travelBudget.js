/**
 * Seyahat Cüzdanı & Harcama Yönetim Modülü (Travel Budget Utility)
 * 
 * Gezgin kullanıcılarının il, ülke ve şehir ziyaretlerinde yaptıkları harcamaları
 * kategorize etme, para birimi formatlama ve bütçe istatistiklerini hesaplama altyapısı.
 */

export const EXPENSE_CATEGORIES = {
  transport: { id: 'transport', labelTr: 'Ulaşım', labelEn: 'Transport', icon: '✈️', color: '#0ea5e9' },
  stay: { id: 'stay', labelTr: 'Konaklama', labelEn: 'Accommodation', icon: '🏨', color: '#8b5cf6' },
  food: { id: 'food', labelTr: 'Yeme & İçme', labelEn: 'Dining & Cafes', icon: '🍕', color: '#f59e0b' },
  activity: { id: 'activity', labelTr: 'Gezi & Müze', labelEn: 'Attractions', icon: '🎟️', color: '#10b981' },
  shopping: { id: 'shopping', labelTr: 'Alışveriş', labelEn: 'Shopping', icon: '🛍️', color: '#ec4899' },
  other: { id: 'other', labelTr: 'Diğer', labelEn: 'Other', icon: '📦', color: '#64748b' }
};

export const SUPPORTED_CURRENCIES = {
  TRY: { code: 'TRY', symbol: '₺', name: 'Türk Lirası' },
  USD: { code: 'USD', symbol: '$', name: 'Amerikan Doları' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'İngiliz Sterlini' }
};

/**
 * Para miktarını seçilen para birimi sembolü ile şık biçimde formatlar.
 * Gizlilik modu açıksa (bakiye gizle) sembolü koruyup tutarı maskeler.
 * 
 * @param {number|string} amount - Harcama tutarı
 * @param {string} [currencyCode='TRY'] - Para birimi kodu (TRY, USD, EUR, GBP)
 * @param {boolean} [isHidden=false] - Bakiye gizleme bayrağı (👁️)
 * @returns {string} Formatlanmış metin (örn: '1.250 ₺' veya '•••• ₺')
 */
export function formatMoney(amount, currencyCode = 'TRY', isHidden = false) {
  const curr = SUPPORTED_CURRENCIES[currencyCode] || { symbol: currencyCode || '₺' };
  const symbol = curr.symbol || '₺';

  if (isHidden) {
    return `•••• ${symbol}`;
  }

  const num = typeof amount === 'number' && !Number.isNaN(amount)
    ? amount
    : (Number.parseFloat(amount) || 0);

  const formatted = new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(num);

  return `${formatted} ${symbol}`;
}

/**
 * Ziyaret kayıtlarındaki harcamaları (expenses) tarayarak detaylı bütçe istatistikleri üretir.
 * 
 * @param {Object} allVisits - { turkeyVisits, worldVisits, worldCities } veya tekil ziyaret haritası
 * @returns {Object} Bütçe istatistikleri nesnesi
 */
export function calculateBudgetStats(allVisits = {}) {
  const safeData = allVisits || {};

  let turkeyVisits = safeData.turkeyVisits;
  let worldVisits = safeData.worldVisits;
  let worldCities = safeData.worldCities;

  // Eğer doğrudan nesne olarak visits map'i verildiyse
  if (!turkeyVisits && !worldVisits && !worldCities) {
    turkeyVisits = safeData;
    worldVisits = {};
    worldCities = [];
  } else {
    turkeyVisits = turkeyVisits || {};
    worldVisits = worldVisits || {};
    worldCities = worldCities || [];
  }

  const totalByCurrency = {};
  const placeTotals = {};
  let totalRecords = 0;
  let totalItems = 0;

  // Başlangıç kategori yapıları
  const byCategory = {};
  Object.keys(EXPENSE_CATEGORIES).forEach((catId) => {
    byCategory[catId] = {
      id: catId,
      labelTr: EXPENSE_CATEGORIES[catId].labelTr,
      labelEn: EXPENSE_CATEGORIES[catId].labelEn,
      icon: EXPENSE_CATEGORIES[catId].icon,
      color: EXPENSE_CATEGORIES[catId].color,
      total: 0,
      totalsByCurrency: {},
      count: 0,
      percentage: 0
    };
  });

  // Tüm kayıtları listeye dönüştür
  const records = [];

  if (turkeyVisits && typeof turkeyVisits === 'object') {
    Object.entries(turkeyVisits).forEach(([id, data]) => {
      if (data && typeof data === 'object') {
        records.push({
          id,
          name: data.name || data.provinceName || data.title || `İl ${id}`,
          type: 'turkey',
          expenses: data.expenses
        });
      }
    });
  }

  if (worldVisits && typeof worldVisits === 'object') {
    Object.entries(worldVisits).forEach(([id, data]) => {
      if (data && typeof data === 'object') {
        records.push({
          id,
          name: data.name || data.countryName || data.title || id,
          type: 'world',
          expenses: data.expenses
        });
      }
    });
  }

  if (Array.isArray(worldCities)) {
    worldCities.forEach((city, idx) => {
      if (city && typeof city === 'object') {
        records.push({
          id: city.id || `city_${idx}`,
          name: city.name || city.cityName || `Şehir ${idx + 1}`,
          type: 'city',
          expenses: city.expenses
        });
      }
    });
  } else if (worldCities && typeof worldCities === 'object') {
    Object.entries(worldCities).forEach(([id, data]) => {
      if (data && typeof data === 'object') {
        records.push({
          id,
          name: data.name || data.cityName || id,
          type: 'city',
          expenses: data.expenses
        });
      }
    });
  }

  // Harcamaları tara ve hesapla
  records.forEach((rec) => {
    if (!rec.expenses) return;

    let defaultCurrency = 'TRY';
    let rawItems = [];

    if (Array.isArray(rec.expenses)) {
      rawItems = rec.expenses;
    } else if (typeof rec.expenses === 'object' && rec.expenses !== null) {
      defaultCurrency = rec.expenses.currency || 'TRY';
      if (Array.isArray(rec.expenses.items)) {
        rawItems = rec.expenses.items;
      } else if (rec.expenses.amount !== undefined) {
        rawItems = [rec.expenses];
      }
    }

    let placeHasValidExpense = false;
    const placeKey = `${rec.type}_${rec.id}`;

    rawItems.forEach((item) => {
      if (!item) return;

      const rawAmount = typeof item.amount === 'number' ? item.amount : Number.parseFloat(item.amount);
      if (Number.isNaN(rawAmount) || rawAmount <= 0) return;

      const currCode = (item.currency || defaultCurrency || 'TRY').toUpperCase();
      const rawCat = (item.category || 'other').toLowerCase();
      const catKey = EXPENSE_CATEGORIES[rawCat] ? rawCat : 'other';

      placeHasValidExpense = true;
      totalItems += 1;

      // Para birimi bazında toplam
      totalByCurrency[currCode] = (totalByCurrency[currCode] || 0) + rawAmount;

      // Kategori bazında toplam
      byCategory[catKey].total += rawAmount;
      byCategory[catKey].count += 1;
      byCategory[catKey].totalsByCurrency[currCode] =
        (byCategory[catKey].totalsByCurrency[currCode] || 0) + rawAmount;

      // Yer bazında toplam (en çok harcanan yerler için)
      if (!placeTotals[placeKey]) {
        placeTotals[placeKey] = {
          id: rec.id,
          name: rec.name,
          type: rec.type,
          total: 0,
          currency: currCode,
          totalsByCurrency: {},
          itemCount: 0
        };
      }
      placeTotals[placeKey].total += rawAmount;
      placeTotals[placeKey].itemCount += 1;
      placeTotals[placeKey].totalsByCurrency[currCode] =
        (placeTotals[placeKey].totalsByCurrency[currCode] || 0) + rawAmount;
    });

    if (placeHasValidExpense) {
      totalRecords += 1;
    }
  });

  // Kategori yüzdelerini hesapla
  const grandTotal = Object.values(totalByCurrency).reduce((sum, v) => sum + v, 0);
  Object.keys(byCategory).forEach((catId) => {
    byCategory[catId].percentage = grandTotal > 0
      ? Math.round((byCategory[catId].total / grandTotal) * 100)
      : 0;
  });

  // En yüksek harcama yapılan ilk 3 yer
  const topPlaces = Object.values(placeTotals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  // Kategori listesi (harcamaya göre azalan)
  const categories = Object.values(byCategory)
    .sort((a, b) => b.total - a.total);

  return {
    totalByCurrency,
    totalsByCurrency: totalByCurrency,
    byCategory,
    categories,
    topPlaces,
    totalRecords,
    totalItems,
    hasExpenses: totalItems > 0
  };
}
