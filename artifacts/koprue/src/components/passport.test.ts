import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { ActionPlan } from '@workspace/api-client-react';
import { passportWarnings } from './action-passport';
import { isExportable } from './calendar-export';
import { A } from '../lib/i18n-actions';
import { SAMPLE } from '../lib/sample';

const clone = (): ActionPlan => structuredClone(SAMPLE.en);

test('the AI disclaimer is always printed, in every language', () => {
  for (const l of ['en', 'tr', 'ar'] as const) {
    assert.ok(passportWarnings(SAMPLE[l], 'sample', l).includes(A[l].ppWarnAi!));
  }
});

test('unverified items add an uncertainty warning', () => {
  const p = clone();
  p.steps[0]!.evidence = 'unverified';
  assert.ok(passportWarnings(p, 'text', 'en').includes(A.en.ppWarnUnverified!));
  assert.ok(!passportWarnings(clone(), 'text', 'en').includes(A.en.ppWarnUnverified!));
});

test('photo sources always carry the "not machine-checked" warning', () => {
  assert.ok(passportWarnings(clone(), 'image', 'ar').includes(A.ar.ppWarnImage!));
});

test('missing years, missing quotes and model cautions are never dropped', () => {
  const w = passportWarnings(clone(), 'sample', 'en');
  assert.ok(w.includes(A.en.ppWarnYear!), 'sample dates have no year');
  const p = clone();
  p.requirements[0]!.evidence = 'none';
  assert.ok(passportWarnings(p, 'text', 'en').includes(A.en.ppWarnNoQuote!));
  assert.ok(w.some((x) => x.includes(SAMPLE.en.caution)));
});

test('only events backed by a quote can be exported', () => {
  const e = clone().events[0]!;
  assert.ok(isExportable({ ...e, evidence: 'verified' }));
  assert.ok(isExportable({ ...e, evidence: 'ai-extracted' }));
  assert.ok(!isExportable({ ...e, evidence: 'unverified' }));
  assert.ok(!isExportable({ ...e, evidence: 'none' }));
});
