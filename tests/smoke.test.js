import test from 'node:test';
import assert from 'node:assert/strict';
import { stripUndefinedDeep } from '../src/services/syncService.js';

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
