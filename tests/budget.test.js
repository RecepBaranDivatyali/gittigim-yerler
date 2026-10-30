import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EXPENSE_CATEGORIES,
  SUPPORTED_CURRENCIES,
  CURRENCY_TO_EUR_RATE,
  convertToEur,
  formatMoney,
  calculateBudgetStats,
  getCategoryBreakdown,
  getCountryBreakdown
} from '../src/utils/travelBudget.js';

test('travelBudget sabitleri - kategoriler ve para birimleri eksiksiz tanımlı', () => {
  assert.ok(EXPENSE_CATEGORIES.transport);
  assert.ok(EXPENSE_CATEGORIES.stay);
  assert.ok(EXPENSE_CATEGORIES.food);
  assert.ok(EXPENSE_CATEGORIES.activity);
  assert.ok(EXPENSE_CATEGORIES.shopping);
  assert.ok(EXPENSE_CATEGORIES.other);

  assert.strictEqual(SUPPORTED_CURRENCIES.TRY.symbol, '₺');
  assert.strictEqual(SUPPORTED_CURRENCIES.USD.symbol, '$');
  assert.strictEqual(SUPPORTED_CURRENCIES.EUR.symbol, '€');
  assert.strictEqual(SUPPORTED_CURRENCIES.GBP.symbol, '£');
});

test('formatMoney - temel ve küsuratlı tutarları doğru biçimlendirir', () => {
  const tryRes = formatMoney(1250, 'TRY');
  assert.match(tryRes, /1\.250\s*₺/);

  const usdRes = formatMoney(100, 'USD');
  assert.match(usdRes, /100\s*\$/);

  const eurRes = formatMoney(45.5, 'EUR');
  assert.match(eurRes, /45,5\s*€/);

  const zeroRes = formatMoney(0, 'TRY');
  assert.match(zeroRes, /0\s*₺/);
});

test('formatMoney - gizlilik modu (isHidden) tutarı maskeler ancak sembolü korur', () => {
  assert.strictEqual(formatMoney(1250, 'TRY', true), '•••• ₺');
  assert.strictEqual(formatMoney(9999, 'USD', true), '•••• $');
  assert.strictEqual(formatMoney(0, 'EUR', true), '•••• €');
});

test('calculateBudgetStats - boş veya harcamasız veri setini güvenle ele alır', () => {
  const stats = calculateBudgetStats({});
  assert.strictEqual(stats.hasExpenses, false);
  assert.strictEqual(stats.totalRecords, 0);
  assert.strictEqual(stats.totalItems, 0);
  assert.deepStrictEqual(stats.topPlaces, []);
  assert.strictEqual(stats.byCategory.food.total, 0);
  assert.strictEqual(stats.byCategory.food.percentage, 0);
});

test('calculateBudgetStats - çoklu yer, para birimi ve kategori toplamlarını hesaplar', () => {
  const dummyVisits = {
    turkeyVisits: {
      '06': {
        name: 'Ankara',
        expenses: {
          currency: 'TRY',
          items: [
            { category: 'transport', amount: 500, note: 'Hızlı Tren' },
            { category: 'food', amount: 250, note: 'Kebap' }
          ]
        }
      },
      '34': {
        name: 'İstanbul',
        expenses: {
          currency: 'TRY',
          items: [
            { category: 'stay', amount: 2000, note: 'Boğaz Oteli' }
          ]
        }
      }
    },
    worldVisits: {
      FR: {
        name: 'Fransa',
        expenses: {
          currency: 'EUR',
          items: [
            { category: 'activity', amount: 80, note: 'Louvre Bileti' }
          ]
        }
      }
    },
    worldCities: [
      {
        id: 'c1',
        name: 'Roma',
        expenses: {
          currency: 'EUR',
          items: [
            { category: 'food', amount: 40, note: 'Pizza' }
          ]
        }
      }
    ]
  };

  const stats = calculateBudgetStats(dummyVisits);

  assert.strictEqual(stats.hasExpenses, true);
  assert.strictEqual(stats.totalRecords, 4);
  assert.strictEqual(stats.totalItems, 5);

  // Para birimi toplamları
  assert.strictEqual(stats.totalByCurrency.TRY, 2750);
  assert.strictEqual(stats.totalByCurrency.EUR, 120);

  // Kategori toplamları
  assert.strictEqual(stats.byCategory.stay.total, 2000);
  assert.strictEqual(stats.byCategory.food.total, 290);
  assert.strictEqual(stats.byCategory.transport.total, 500);
  assert.strictEqual(stats.byCategory.activity.total, 80);

  // En yüksek harcama yapılan yerler (normalize edilmiş kura göre: 80 EUR = 80 EUR > 2000 TRY = 54 EUR > 40 EUR = 40 EUR)
  assert.strictEqual(stats.topPlaces[0].name, 'Fransa');
  assert.strictEqual(stats.topPlaces[0].total, 80);
  assert.strictEqual(stats.topPlaces[1].name, 'İstanbul');
  assert.strictEqual(stats.topPlaces[1].total, 2000);
  assert.strictEqual(stats.topPlaces[2].name, 'Roma');
  assert.strictEqual(stats.topPlaces.length, 3);
});

test('calculateBudgetStats - negatif tutarları eler ve bilinmeyen kategoriyi other yapar', () => {
  const dummyVisits = {
    turkeyVisits: {
      '35': {
        name: 'İzmir',
        expenses: {
          currency: 'TRY',
          items: [
            { category: 'unknown_cat', amount: 300 },
            { category: 'food', amount: -50 },
            { category: 'transport', amount: 0 },
            { category: 'shopping', amount: '150' }
          ]
        }
      }
    }
  };

  const stats = calculateBudgetStats(dummyVisits);
  assert.strictEqual(stats.totalRecords, 1);
  assert.strictEqual(stats.totalItems, 2);
  assert.strictEqual(stats.byCategory.other.total, 300);
  assert.strictEqual(stats.byCategory.shopping.total, 150);
  assert.strictEqual(stats.totalByCurrency.TRY, 450);
});

test('CURRENCY_TO_EUR_RATE ve convertToEur - kurları doğru EUR karşılığına çevirir', () => {
  assert.strictEqual(CURRENCY_TO_EUR_RATE.EUR, 1);
  assert.strictEqual(CURRENCY_TO_EUR_RATE.USD, 0.92);
  assert.strictEqual(CURRENCY_TO_EUR_RATE.TRY, 0.027);

  assert.strictEqual(convertToEur(100, 'EUR'), 100);
  assert.strictEqual(convertToEur(100, 'USD'), 92);
  assert.strictEqual(convertToEur(1000, 'TRY'), 27);
  assert.strictEqual(convertToEur(100, 'UNKNOWN'), 100); // Varsayılan 1
});

test('calculateBudgetStats - döviz ağırlıklarını normalize ederek hesaplar (100 EUR ve 100 TRY eşit görünmez)', () => {
  const multiCurrencyVisits = {
    worldVisits: {
      FR: {
        name: 'Fransa',
        expenses: {
          currency: 'EUR',
          items: [{ category: 'food', amount: 100 }] // 100 EUR = 100 EUR
        }
      }
    },
    turkeyVisits: {
      '34': {
        name: 'İstanbul',
        expenses: {
          currency: 'TRY',
          items: [{ category: 'transport', amount: 100 }] // 100 TRY = ~2.7 EUR
        }
      }
    }
  };

  const stats = calculateBudgetStats(multiCurrencyVisits);

  // Orijinal nominal döviz toplamları aynen korunur
  assert.strictEqual(stats.totalByCurrency.EUR, 100);
  assert.strictEqual(stats.totalByCurrency.TRY, 100);

  // Ancak pasta grafiği yüzdesi (normalize edilmiş ağırlık) 100 EUR için çok yüksek, 100 TRY için çok düşük olmalıdır
  // Toplam normalize = 100 + 2.7 = 102.7 EUR. Food (100 EUR) = ~%97, Transport (100 TRY) = ~%3
  assert.strictEqual(stats.byCategory.food.percentage >= 95, true);
  assert.strictEqual(stats.byCategory.transport.percentage <= 5, true);

  // Kategori listesi ağırlığa göre azalan sırada olmalıdır (Food önce gelir)
  assert.strictEqual(stats.categories[0].id, 'food');
  assert.strictEqual(stats.categories[1].id, 'transport');
});

test('getCategoryBreakdown ve getCountryBreakdown - normalize dağılımları döner', () => {
  const dummy = {
    worldVisits: {
      DE: {
        name: 'Almanya',
        expenses: {
          currency: 'EUR',
          items: [{ category: 'stay', amount: 200 }]
        }
      },
      IT: {
        name: 'İtalya',
        expenses: {
          currency: 'EUR',
          items: [{ category: 'food', amount: 50 }]
        }
      }
    }
  };

  const catBreakdown = getCategoryBreakdown(dummy);
  assert.ok(Array.isArray(catBreakdown));
  assert.strictEqual(catBreakdown[0].id, 'stay');
  assert.strictEqual(catBreakdown[0].percentage, 80);

  const countryBreakdown = getCountryBreakdown(dummy);
  assert.ok(Array.isArray(countryBreakdown));
  assert.strictEqual(countryBreakdown[0].code, 'DE');
  assert.strictEqual(countryBreakdown[0].percentage, 80);
  assert.strictEqual(countryBreakdown[1].code, 'IT');
  assert.strictEqual(countryBreakdown[1].percentage, 20);
});
