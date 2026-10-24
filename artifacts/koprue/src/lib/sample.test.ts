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

test('sample events and requirements are backed by verbatim quotes that contain their day and time', () => {
  const notice = [SAMPLE_NOTICE.title, ...SAMPLE_NOTICE.lines].join('\n');
  for (const lang of ['en', 'tr', 'ar'] as const) {
    const plan = SAMPLE[lang];
    assert.ok(plan.events.length >= 2 && plan.requirements.length >= 1 && plan.missing.length >= 1);
    for (const e of plan.events) {
      assert.ok(notice.includes(e.source));
      const [, mm, dd] = /^(?:\d{4}-)?(\d{2})-(\d{2})$/.exec(e.date)!;
      assert.ok(mm);
      assert.ok(new RegExp(`(?<!\\d)${Number(dd)}(?!\\d)`).test(e.source), `${lang} day`);
      assert.ok(new RegExp(`(?<!\\d)${Number(e.time.slice(0, 2))}[.:]`).test(e.source), `${lang} time`);
    }
    for (const r of plan.requirements) assert.ok(notice.includes(r.source));
  }
  assert.deepEqual(SAMPLE.en.events.map((e) => e.kind), ['deadline', 'event']);
});
