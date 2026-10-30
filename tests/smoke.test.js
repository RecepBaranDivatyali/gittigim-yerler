import test from 'node:test';
import assert from 'node:assert/strict';
import { stripUndefinedDeep } from '../src/services/syncService.js';
import { sanitizePhotoUrl } from '../src/utils/security.js';
import { BUCKET_LISTS, calculateBucketListProgress } from '../src/data/bucketLists.js';

test('stripUndefinedDeep - nesnelerdeki undefined alanları temizler', () => {
  const input = { a: 1, b: undefined, c: 'gezgin' };
  const expected = { a: 1, c: 'gezgin' };
  assert.deepStrictEqual(stripUndefinedDeep(input), expected);
});

test('stripUndefinedDeep - iç içe (nested) nesneleri özyinelemeli temizler', () => {
  const input = {
    user: {
      id: 'u123',
      name: 'Gezgin',
      bio: undefined,
      settings: {
        theme: 'dark',
        notif: undefined
      }
    },
    flag: undefined
  };
  const expected = {
    user: {
      id: 'u123',
      name: 'Gezgin',
      settings: {
        theme: 'dark'
      }
    }
  };
  assert.deepStrictEqual(stripUndefinedDeep(input), expected);
});

test('stripUndefinedDeep - dizileri ve dizi elemanlarındaki undefined alanları işler', () => {
  const input = [
    { id: 1, note: undefined },
    { id: 2, note: 'ziyaret edildi' },
    [undefined, { a: undefined, b: 10 }]
  ];
  const expected = [
    { id: 1 },
    { id: 2, note: 'ziyaret edildi' },
    [null, { b: 10 }]
  ];
  assert.deepStrictEqual(stripUndefinedDeep(input), expected);
});

test('stripUndefinedDeep - undefined veya null girdi durumunda null döner', () => {
  assert.strictEqual(stripUndefinedDeep(undefined), null);
  assert.strictEqual(stripUndefinedDeep(null), null);
});

test('sanitizePhotoUrl - geçerli HTTPS ve base64 görselleri kabul eder', () => {
  assert.strictEqual(
    sanitizePhotoUrl('https://images.unsplash.com/photo-123.jpg'),
    'https://images.unsplash.com/photo-123.jpg'
  );
  assert.strictEqual(
    sanitizePhotoUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='),
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  );
});

test('sanitizePhotoUrl - tırnak, açılı ayraç ve XSS girişimlerini reddeder', () => {
  // Stored XSS ve img src kırma denemeleri
  assert.strictEqual(sanitizePhotoUrl('https://example.com/pic.jpg" onerror="alert(1)'), null);
  assert.strictEqual(sanitizePhotoUrl("https://example.com/pic.jpg' onload='alert(1)"), null);
  assert.strictEqual(sanitizePhotoUrl('https://example.com/<script>alert(1)</script>'), null);
  assert.strictEqual(sanitizePhotoUrl('javascript:alert(1)'), null);
  assert.strictEqual(sanitizePhotoUrl('https://example.com/pic.jpg\x00extra'), null);
  assert.strictEqual(sanitizePhotoUrl('https://example.com/pic with spaces.jpg'), null);
  assert.strictEqual(sanitizePhotoUrl(''), null);
  assert.strictEqual(sanitizePhotoUrl(null), null);
});

test('bucketLists - 6 keşif paketi ve alanları eksiksiz tanımlı', () => {
  assert.strictEqual(BUCKET_LISTS.length, 6);
  const ids = BUCKET_LISTS.map(b => b.id);
  assert.ok(ids.includes('seven_wonders'));
  assert.ok(ids.includes('visa_free_gems'));
  assert.ok(ids.includes('euro_capitals'));
  assert.ok(ids.includes('ancient_worlds'));
  assert.ok(ids.includes('nordic_lights'));
  assert.ok(ids.includes('asia_express'));

  BUCKET_LISTS.forEach(b => {
    assert.ok(b.id);
    assert.ok(b.titleTr);
    assert.ok(b.titleEn);
    assert.ok(b.descTr);
    assert.ok(b.descEn);
    assert.ok(b.icon);
    assert.ok(Array.isArray(b.countries) && b.countries.length > 0);
    b.countries.forEach(c => {
      assert.ok(c.code);
      assert.ok(c.nameTr);
      assert.ok(c.nameEn);
      assert.ok(c.flag);
    });
  });
});

test('calculateBucketListProgress - ilerleme yüzdesi ve tamamlanma durumunu doğru hesaplar', () => {
  const wonders = BUCKET_LISTS.find(b => b.id === 'seven_wonders');
  assert.ok(wonders);

  // 1. Ziyaretsiz durum
  const zeroProgress = calculateBucketListProgress(wonders, {});
  assert.strictEqual(zeroProgress.total, 7);
  assert.strictEqual(zeroProgress.visited, 0);
  assert.strictEqual(zeroProgress.remaining, 7);
  assert.strictEqual(zeroProgress.percentage, 0);
  assert.strictEqual(zeroProgress.isCompleted, false);

  // 2. Kısmi ziyaret durumu (İtalya ve Ürdün)
  const partialVisits = {
    IT: { status: 'visited' },
    JO: { status: 'visited' },
    FR: { status: 'visited' } // Harika listesinde yok
  };
  const partialProgress = calculateBucketListProgress(wonders, partialVisits);
  assert.strictEqual(partialProgress.visited, 2);
  assert.strictEqual(partialProgress.remaining, 5);
  assert.strictEqual(partialProgress.percentage, Math.round((2 / 7) * 100)); // %29
  assert.strictEqual(partialProgress.isCompleted, false);

  // 3. Tamamlama durumu (7 harikanın hepsi)
  const fullVisits = {
    IT: { status: 'visited' },
    JO: { status: 'visited' },
    PE: { status: 'visited' },
    MX: { status: 'visited' },
    BR: { status: 'visited' },
    IN: { status: 'visited' },
    CN: { status: 'visited' }
  };
  const fullProgress = calculateBucketListProgress(wonders, fullVisits);
  assert.strictEqual(fullProgress.visited, 7);
  assert.strictEqual(fullProgress.remaining, 0);
  assert.strictEqual(fullProgress.percentage, 100);
  assert.strictEqual(fullProgress.isCompleted, true);
});
