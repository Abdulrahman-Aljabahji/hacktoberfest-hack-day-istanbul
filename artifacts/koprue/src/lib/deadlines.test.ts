import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkDate, hasAmbiguousSlashDate, needsConfirmation, statusLabel, todayIn } from './deadlines';
import { A, fill } from './i18n-actions';
import { passportWarnings } from '../components/action-passport';
import { SAMPLE } from './sample';

// Fixed reference date: tests never depend on the day they run.
const TODAY = '2026-10-24';
const ev = (date: string, source = '') => ({ date, source });

test('a deadline before the reference date has passed (the 4 November 2025 poster)', () => {
  const c = checkDate(ev('2025-11-04', 'Son Başvuru: 4 Kasım 2025'), TODAY);
  assert.equal(c.status, 'passed');
  assert.ok(c.days! < -300);
  assert.ok(needsConfirmation(c));
});

test('a deadline after the reference date is upcoming (the 27 October 2026 poster)', () => {
  const c = checkDate(ev('2026-10-27', 'Son Başvuru: 27 Ekim 2026'), TODAY);
  assert.deepEqual({ s: c.status, d: c.days }, { s: 'upcoming', d: 3 });
  assert.ok(!needsConfirmation(c));
});

test('a deadline on the reference date is "today", not passed', () => {
  const c = checkDate(ev('2026-10-24'), TODAY);
  assert.equal(c.status, 'today');
  assert.equal(c.days, 0);
  assert.ok(!needsConfirmation(c));
  assert.equal(checkDate(ev('2026-10-23'), TODAY).status, 'passed');
});

test('a missing year is uncertain and never guessed', () => {
  const c = checkDate(ev('10-27', 'Son Başvuru: 27 Ekim'), TODAY);
  assert.deepEqual({ s: c.status, r: c.reason, d: c.days }, { s: 'uncertain', r: 'no-year', d: undefined });
  assert.ok(needsConfirmation(c));
});

test('no or invalid date means "not provided"', () => {
  assert.equal(checkDate(ev(''), TODAY).status, 'none');
  assert.equal(checkDate(ev('2027-2028'), TODAY).status, 'none');
  assert.ok(needsConfirmation(checkDate(ev(''), TODAY)));
});

test('ambiguous slash dates are uncertain; dot dates and unambiguous slashes are not', () => {
  assert.ok(hasAmbiguousSlashDate('Son tarih 04/11/2025'));
  assert.equal(checkDate(ev('2025-11-04', 'Son tarih 04/11/2025'), TODAY).reason, 'ambiguous');
  assert.ok(!hasAmbiguousSlashDate('Son tarih 04.11.2025'), 'dd.mm.yyyy is the Turkish convention');
  assert.ok(!hasAmbiguousSlashDate('Son tarih 27/10/2026'), 'day 27 cannot be a month');
  assert.ok(!hasAmbiguousSlashDate('05/05/2026'), 'both readings agree');
  assert.equal(checkDate(ev('2026-10-27', 'Son tarih 27.10.2026'), TODAY).status, 'upcoming');
});

test('an academic year is not a deadline: only the explicit application date drives status', () => {
  // The model may report the application deadline from "2027 - 2028 ... Son Başvuru: 27 Ekim 2026".
  const c = checkDate(ev('2026-10-27', '2027 - 2028 Son Başvuru: 27 Ekim 2026'), TODAY);
  assert.equal(c.status, 'upcoming');
  assert.equal(checkDate(ev('2027-2028'), TODAY).status, 'none');
});

test('"today" depends on the timezone', () => {
  const instant = new Date('2026-10-24T22:30:00Z'); // 01:30 on 25 Oct in Istanbul (UTC+3)
  assert.equal(todayIn('Europe/Istanbul', instant), '2026-10-25');
  assert.equal(todayIn('UTC', instant), '2026-10-24');
  assert.equal(todayIn('America/Los_Angeles', instant), '2026-10-24');
  assert.equal(checkDate(ev('2026-10-24'), todayIn('Europe/Istanbul', instant)).status, 'passed');
  assert.equal(checkDate(ev('2026-10-24'), todayIn('UTC', instant)).status, 'today');
});

test('status labels exist and differ for deadlines and events in en, tr and ar', () => {
  for (const l of ['en', 'tr', 'ar'] as const) {
    for (const s of ['upcoming', 'today', 'passed', 'uncertain', 'none'] as const) {
      assert.ok(statusLabel(A[l], 'deadline', s), `${l} ${s}`);
    }
    assert.notEqual(statusLabel(A[l], 'deadline', 'passed'), statusLabel(A[l], 'event', 'passed'));
  }
  assert.equal(statusLabel(A.en, 'deadline', 'passed'), 'Deadline passed');
  assert.equal(statusLabel(A.tr, 'deadline', 'passed'), 'Son tarih geçti');
  assert.equal(statusLabel(A.ar, 'deadline', 'today'), 'الموعد النهائي اليوم');
});

test('the passed-date warning interpolates the date in every language', () => {
  for (const l of ['en', 'tr', 'ar'] as const) assert.match(fill(A[l].stPassedWarn!, { today: TODAY }), /2026-10-24/);
});

test('Arabic and Turkish dates format with the right month names', () => {
  const fmt = (l: string) => new Intl.DateTimeFormat(l, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, 9, 27)));
  assert.match(fmt('tr-TR'), /27 Ekim 2026/);
  assert.match(fmt('ar'), /أكتوبر/);
  assert.match(fmt('en-GB'), /27 October 2026/);
});

test('the passport prints a passed-date warning and an uncertain-date warning, never silently', () => {
  const past = structuredClone(SAMPLE.en);
  past.events = [{ ...past.events[0]!, date: '2025-11-04' }];
  assert.ok(passportWarnings(past, 'text', 'en', TODAY).includes(A.en.ppWarnPassed!));
  assert.ok(!passportWarnings(past, 'text', 'en', '2025-01-01').includes(A.en.ppWarnPassed!));
  const noYear = structuredClone(SAMPLE.en); // sample dates have no year
  assert.ok(passportWarnings(noYear, 'sample', 'ar', TODAY).includes(A.ar.ppWarnUncertainDate!));
});
