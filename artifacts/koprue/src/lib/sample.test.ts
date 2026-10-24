import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLE, SAMPLE_NOTICE } from './sample';

// The offline sample marks its quotes "verified". That label is only honest while every
// quote is a verbatim piece of the sample notice, so this test guards it.
test('every verified quote in the sample really appears in the sample notice', () => {
  const notice = [SAMPLE_NOTICE.title, ...SAMPLE_NOTICE.lines].join('\n');
  for (const lang of ['en', 'tr', 'ar'] as const) {
    for (const item of [...SAMPLE[lang].steps, ...SAMPLE[lang].facts]) {
      assert.equal(item.evidence, 'verified');
      assert.ok(notice.includes(item.source), `${lang}: "${item.source}" is not in the sample notice`);
    }
  }
});

test('all UI strings exist in every language', () => {
  // imported lazily so a missing key fails with a clear message
  return import('./sample').then(({ T }) => {
    const keys = Object.keys(T.en);
    for (const l of ['tr', 'ar'] as const) {
      for (const k of keys) assert.ok(T[l][k], `${l} is missing "${k}"`);
    }
  });
});
