export type CalendarZone = 'Europe/Istanbul' | 'UTC' | 'floating';

export interface IcsInput {
  title: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM, or empty for an all-day event. Never defaulted. */
  time: string;
  /** HH:MM, or empty. Without it no end time is written. */
  endTime: string;
  zone: CalendarZone;
  location: string;
  description: string;
  uid?: string;
  now?: Date;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** RFC 5545 TEXT escaping. */
export function escapeText(v: string): string {
  return v.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Fold lines longer than 75 octets (UTF-8 aware) with CRLF + space. */
export function foldLine(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const out: string[] = [];
  let cur = '';
  let size = 0;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    const limit = out.length === 0 ? 75 : 74;
    if (size + n > limit) {
      out.push(cur);
      cur = '';
      size = 0;
    }
    cur += ch;
    size += n;
  }
  out.push(cur);
  return out.join('\r\n ');
}

const dateParts = (d: string) => d.replace(/-/g, '');
const timeParts = (t: string) => t.replace(':', '') + '00';

export function isValidDate(d: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return false;
  const dt = new Date(Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!));
  return dt.getUTCFullYear() === +m[1]! && dt.getUTCMonth() === +m[2]! - 1 && dt.getUTCDate() === +m[3]!;
}

function nextDay(d: string): string {
  const [y, m, day] = d.split('-').map(Number) as [number, number, number];
  const dt = new Date(Date.UTC(y, m - 1, day + 1));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

const VTIMEZONE_ISTANBUL = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/Istanbul',
  'BEGIN:STANDARD',
  'DTSTART:19700101T000000',
  'TZOFFSETFROM:+0300',
  'TZOFFSETTO:+0300',
  'TZNAME:+03',
  'END:STANDARD',
  'END:VTIMEZONE',
];

/** Build an .ics file. Throws on an invalid date or time so a bad file is never produced. */
export function buildIcs(i: IcsInput): string {
  if (!isValidDate(i.date)) throw new Error('Invalid date');
  if (i.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(i.time)) throw new Error('Invalid time');
  if (i.endTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(i.endTime)) throw new Error('Invalid end time');
  const now = i.now ?? new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
  const uid = i.uid ?? `${stamp}-${Math.random().toString(36).slice(2, 10)}@koprue`;

  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//KOPRU//Notice to Calendar//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  if (i.time && i.zone === 'Europe/Istanbul') lines.push(...VTIMEZONE_ISTANBUL);
  lines.push('BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${stamp}`, `SUMMARY:${escapeText(i.title)}`);

  if (!i.time) {
    lines.push(`DTSTART;VALUE=DATE:${dateParts(i.date)}`, `DTEND;VALUE=DATE:${dateParts(nextDay(i.date))}`);
  } else {
    const fmt = (t: string) => {
      const base = `${dateParts(i.date)}T${timeParts(t)}`;
      if (i.zone === 'UTC') return { key: '', val: `${base}Z` };
      if (i.zone === 'Europe/Istanbul') return { key: ';TZID=Europe/Istanbul', val: base };
      return { key: '', val: base };
    };
    const s = fmt(i.time);
    lines.push(`DTSTART${s.key}:${s.val}`);
    if (i.endTime) {
      const e = fmt(i.endTime);
      lines.push(`DTEND${e.key}:${e.val}`);
    }
  }
  if (i.location) lines.push(`LOCATION:${escapeText(i.location)}`);
  if (i.description) lines.push(`DESCRIPTION:${escapeText(i.description)}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/** Today's upcoming occurrence of month/day: this year if not yet past, otherwise next year. */
export function upcomingYear(month: number, day: number, now = new Date()): number {
  const y = now.getFullYear();
  const today = new Date(y, now.getMonth(), now.getDate());
  return new Date(y, month - 1, day) >= today ? y : y + 1;
}

export interface ResolvedDate {
  date: string;
  /** True when the notice gave no year and one was filled in for the user to confirm. */
  yearAssumed: boolean;
}

export function resolveEventDate(date: string, now = new Date()): ResolvedDate {
  const full = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (full) return { date, yearAssumed: false };
  const md = /^(\d{2})-(\d{2})$/.exec(date);
  if (!md) return { date: '', yearAssumed: false };
  const y = upcomingYear(+md[1]!, +md[2]!, now);
  return { date: `${y}-${md[1]}-${md[2]}`, yearAssumed: true };
}
