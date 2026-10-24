import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildIcs, escapeText, foldLine, isValidDate, resolveEventDate, upcomingYear } from './ics';

const base = { title: 'Workshop', date: '2026-10-29', time: '14:00', endTime: '', zone: 'Europe/Istanbul' as const, location: '', description: '', uid: 'u@t', now: new Date('2026-10-24T10:00:00Z') };

test('timed event in Istanbul has TZID, a VTIMEZONE and no invented end time', () => {
  const ics = buildIcs(base);
  assert.match(ics, /DTSTART;TZID=Europe\/Istanbul:20261029T140000\r\n/);
  assert.match(ics, /BEGIN:VTIMEZONE/);
  assert.ok(!/DTEND/.test(ics));
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /END:VCALENDAR\r\n$/);
});

test('an end time is written only when supplied', () => {
  assert.match(buildIcs({ ...base, endTime: '16:30' }), /DTEND;TZID=Europe\/Istanbul:20261029T163000/);
});

test('no time means an all-day event, never a made-up hour', () => {
  const ics = buildIcs({ ...base, time: '', endTime: '' });
  assert.match(ics, /DTSTART;VALUE=DATE:20261029/);
  assert.match(ics, /DTEND;VALUE=DATE:20261030/);
  assert.ok(!/T\d{6}/.test(ics.replace(/DTSTAMP:\S+/, '')));
});

test('all-day end rolls over month and year boundaries', () => {
  assert.match(buildIcs({ ...base, date: '2026-12-31', time: '' }), /DTEND;VALUE=DATE:20270101/);
  assert.match(buildIcs({ ...base, date: '2028-02-28', time: '' }), /DTEND;VALUE=DATE:20280229/);
});

test('UTC and floating zones', () => {
  assert.match(buildIcs({ ...base, zone: 'UTC' }), /DTSTART:20261029T140000Z/);
  const f = buildIcs({ ...base, zone: 'floating' });
  assert.match(f, /DTSTART:20261029T140000\r\n/);
  assert.ok(!/VTIMEZONE/.test(f));
});

test('text is escaped and long lines are folded at 75 octets', () => {
  assert.equal(escapeText('a,b;c\\d\ne'), 'a\\,b\\;c\\\\d\\ne');
  const ics = buildIcs({ ...base, title: 'Üçretsiz, yazılım; atölyesi', description: 'ş'.repeat(120), location: 'B Blok' });
  assert.match(ics, /SUMMARY:Üçretsiz\\, yazılım\\; atölyesi/);
  for (const l of ics.split('\r\n')) assert.ok(new TextEncoder().encode(l).length <= 75, l);
  assert.equal(foldLine('x'.repeat(10)), 'x'.repeat(10));
});

test('invalid input throws instead of producing a broken file', () => {
  assert.throws(() => buildIcs({ ...base, date: '2026-02-30' }));
  assert.throws(() => buildIcs({ ...base, time: '25:00' }));
  assert.throws(() => buildIcs({ ...base, endTime: '9am' }));
  assert.ok(isValidDate('2028-02-29'));
  assert.ok(!isValidDate('2027-02-29'));
});

test('missing years are filled with the upcoming occurrence and flagged', () => {
  const now = new Date(2026, 9, 24);
  assert.equal(upcomingYear(10, 28, now), 2026);
  assert.equal(upcomingYear(10, 24, now), 2026);
  assert.equal(upcomingYear(3, 1, now), 2027);
  assert.deepEqual(resolveEventDate('10-28', now), { date: '2026-10-28', yearAssumed: true });
  assert.deepEqual(resolveEventDate('2027-01-05', now), { date: '2027-01-05', yearAssumed: false });
  assert.equal(resolveEventDate('garbage', now).date, '');
});
