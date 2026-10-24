import { test } from 'node:test';
import assert from 'node:assert/strict';
import { A, fill } from './i18n-actions';

test('every action string exists in en, tr and ar', () => {
  for (const l of ['tr', 'ar'] as const) {
    for (const k of Object.keys(A.en)) assert.ok(A[l][k], `${l} missing ${k}`);
    for (const k of Object.keys(A[l])) assert.ok(A.en[k], `en missing ${k}`);
  }
});

test('placeholders are preserved in every language', () => {
  for (const l of ['en', 'tr', 'ar'] as const) {
    assert.match(A[l].chkProgress!, /\{done\}.*\{total\}|\{total\}.*\{done\}/);
    assert.match(A[l].calSkipped!, /\{n\}/);
  }
  assert.equal(fill(A.en.chkProgress!, { done: 2, total: 3 }), '2 of 3 steps done');
});
