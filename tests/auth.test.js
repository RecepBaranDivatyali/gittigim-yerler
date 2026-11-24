import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  getUsernameLookupKeys,
  isUsernameAvailableInCloud,
  getUsernameLoginHint
} from '../src/services/syncService.js';

test('getUsernameLookupKeys - alt tire, nokta ve tire içeren kullanıcı adını korur ve legacy fallback üretir', () => {
  assert.deepStrictEqual(getUsernameLookupKeys('gezgin_mert'), ['gezgin_mert', 'gezgin mert']);
  assert.deepStrictEqual(getUsernameLookupKeys('  @Gezgin_Mert  '), ['gezgin_mert', 'gezgin mert']);
  assert.deepStrictEqual(getUsernameLookupKeys('gezgin.mert-01'), ['gezgin.mert-01', 'gezgin mert 01']);
  assert.deepStrictEqual(getUsernameLookupKeys('gezginmert'), ['gezginmert']);
  assert.deepStrictEqual(getUsernameLookupKeys(''), []);
  assert.deepStrictEqual(getUsernameLookupKeys(null), []);
});

test('isUsernameAvailableInCloud & getUsernameLoginHint - geçersiz girdilerde güvenli varsayılan döner', async () => {
  assert.strictEqual(await isUsernameAvailableInCloud(''), false);
  assert.strictEqual(await isUsernameAvailableInCloud('ab'), false);
  assert.strictEqual(await isUsernameAvailableInCloud(null), false);

  assert.deepStrictEqual(await getUsernameLoginHint(''), { exists: false });
  assert.deepStrictEqual(await getUsernameLoginHint(null), { exists: false });
});

test('firebase.js - Capacitor native platform için initializeAuth ve persistentSingleTabManager yapılandırması içerir', () => {
  const src = fs.readFileSync(new URL('../src/services/firebase.js', import.meta.url), 'utf8');
  assert.match(src, /initializeAuth/);
  assert.match(src, /browserLocalPersistence/);
  assert.match(src, /browserSessionPersistence/);
  assert.match(src, /inMemoryPersistence/);
  assert.match(src, /persistentSingleTabManager/);
  assert.match(src, /isNativePlatform/);
});

test('LoginPage.js - novalidate, inline mesaj kutusu, kompakt avatar seçici ve alert()-siz akış kullanır', () => {
  const src = fs.readFileSync(new URL('../src/components/LoginPage.js', import.meta.url), 'utf8');
  assert.match(src, /<form id="auth-main-form" class="login-form" novalidate>/);
  assert.match(src, /id="auth-inline-message"/);
  assert.match(src, /id="btn-toggle-avatars"/);
  assert.match(src, /avatar-section-compact/);
  assert.doesNotMatch(src, /\balert\s*\(/);
  assert.doesNotMatch(src, /profileUsername\.replace\(\/\[._-\]\/g/);
});
