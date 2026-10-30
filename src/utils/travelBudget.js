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
  GBP: { code: 'GBP', symbol: '£', name: 'İngiliz Sterlini' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japon Yeni' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'İsviçre Frangı' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'BAE Dirhemi' }
};

export const CURRENCY_TO_EUR_RATE = {
  EUR: 1,
  USD: 0.92,
  GBP: 1.17,
  CHF: 1.04,
  AED: 0.25,
  JPY: 0.0061,
  TRY: 0.027
};

export function convertToEur(amount, currencyCode = 'TRY') {
  const curr = String(currencyCode || 'TRY').toUpperCase();
  const rate = CURRENCY_TO_EUR_RATE[curr] || 1;
  const num = typeof amount === 'number' && !Number.isNaN(amount)
    ? amount
    : (Number.parseFloat(amount) || 0);
  return num * rate;
}

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

      const rate = CURRENCY_TO_EUR_RATE[currCode] || 1;
      const normalizedAmount = rawAmount * rate;

      placeHasValidExpense = true;
      totalItems += 1;

      // Para birimi bazında toplam
      totalByCurrency[currCode] = (totalByCurrency[currCode] || 0) + rawAmount;

      // Kategori bazında toplam
      byCategory[catKey].total += rawAmount;
      byCategory[catKey].normalizedTotal = (byCategory[catKey].normalizedTotal || 0) + normalizedAmount;
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
          normalizedTotal: 0,
          currency: currCode,
          totalsByCurrency: {},
          itemCount: 0
        };
      }
      placeTotals[placeKey].total += rawAmount;
      placeTotals[placeKey].normalizedTotal += normalizedAmount;
      placeTotals[placeKey].itemCount += 1;
      placeTotals[placeKey].totalsByCurrency[currCode] =
        (placeTotals[placeKey].totalsByCurrency[currCode] || 0) + rawAmount;
    });

    if (placeHasValidExpense) {
      totalRecords += 1;
    }
  });

  // Kategori yüzdelerini normalize edilmiş (EUR bazlı) değerler üzerinden hesapla
  const grandNormalizedTotal = Object.values(byCategory).reduce((sum, c) => sum + (c.normalizedTotal || 0), 0);
  Object.keys(byCategory).forEach((catId) => {
    byCategory[catId].percentage = grandNormalizedTotal > 0
      ? Math.round(((byCategory[catId].normalizedTotal || 0) / grandNormalizedTotal) * 100)
      : 0;
  });

  // En yüksek harcama yapılan ilk 3 yer (normalize edilmiş değere göre)
  const topPlaces = Object.values(placeTotals)
    .sort((a, b) => (b.normalizedTotal || b.total) - (a.normalizedTotal || a.total))
    .slice(0, 3);

  // Kategori listesi (normalize edilmiş harcamaya göre azalan)
  const categories = Object.values(byCategory)
    .sort((a, b) => (b.normalizedTotal || b.total) - (a.normalizedTotal || a.total));

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

/**
 * Harcamaların kategori bazındaki dağılımını normalize edilmiş ağırlıklarla döner.
 */
export function getCategoryBreakdown(allVisits = {}) {
  const stats = calculateBudgetStats(allVisits);
  return stats.categories;
}

/**
 * Harcamaların ülke bazındaki dağılımını normalize edilmiş ağırlıklarla döner.
 */
export function getCountryBreakdown(allVisits = {}) {
  const safeData = allVisits || {};
  let worldVisits = safeData.worldVisits;
  if (!worldVisits && !safeData.turkeyVisits && !safeData.worldCities && typeof safeData === 'object') {
    worldVisits = safeData;
  }
  worldVisits = worldVisits || {};

  const countryTotals = {};

  Object.entries(worldVisits).forEach(([code, data]) => {
    if (!data || typeof data !== 'object' || !data.expenses) return;
    const rawItems = Array.isArray(data.expenses)
      ? data.expenses
      : (data.expenses.items || (data.expenses.amount !== undefined ? [data.expenses] : []));

    const defaultCurrency = (typeof data.expenses === 'object' && data.expenses.currency) || 'TRY';

    rawItems.forEach(item => {
      if (!item) return;
      const rawAmount = typeof item.amount === 'number' ? item.amount : Number.parseFloat(item.amount);
      if (Number.isNaN(rawAmount) || rawAmount <= 0) return;

      const curr = (item.currency || defaultCurrency || 'TRY').toUpperCase();
      const rate = CURRENCY_TO_EUR_RATE[curr] || 1;
      const normalizedAmount = rawAmount * rate;

      if (!countryTotals[code]) {
        countryTotals[code] = {
          code,
          name: data.name || data.countryName || code,
          total: 0,
          normalizedTotal: 0,
          totalsByCurrency: {},
          percentage: 0
        };
      }

      countryTotals[code].total += rawAmount;
      countryTotals[code].normalizedTotal += normalizedAmount;
      countryTotals[code].totalsByCurrency[curr] = (countryTotals[code].totalsByCurrency[curr] || 0) + rawAmount;
    });
  });

  const grandNorm = Object.values(countryTotals).reduce((sum, c) => sum + c.normalizedTotal, 0);
  Object.values(countryTotals).forEach(c => {
    c.percentage = grandNorm > 0 ? Math.round((c.normalizedTotal / grandNorm) * 100) : 0;
  });

  return Object.values(countryTotals).sort((a, b) => b.normalizedTotal - a.normalizedTotal);
}
