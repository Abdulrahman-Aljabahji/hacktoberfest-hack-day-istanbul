import type { Lang } from './sample';

export type DateStatus = 'upcoming' | 'today' | 'passed' | 'uncertain' | 'none';
export type UncertainReason = 'no-year' | 'ambiguous';

export interface DateCheck {
  status: DateStatus;
  reason?: UncertainReason;
  /** Whole days from today to the date (negative when passed). Only for dated, certain results. */
  days?: number;
}

/** YYYY-MM-DD for `now` as seen in the given IANA timezone. */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const get = (t: string) => p.find((x) => x.type === t)!.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/**
 * A slash date such as 04/11/2025 can be read day-first or month-first, so a date taken from it is
 * uncertain unless both readings agree. Dot dates (04.11.2025) are the standard Turkish day-first form.
 */
export function hasAmbiguousSlashDate(quote: string): boolean {
  const re = /(?<!\d)(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{2,4})(?!\d)/g;
  for (const m of quote.matchAll(re)) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (a <= 12 && b <= 12 && a !== b) return true;
  }
  return false;
}

const FULL = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Compare a notice date with `today` (YYYY-MM-DD). Never guesses a missing year. */
export function checkDate(ev: { date: string; source?: string }, today: string): DateCheck {
  const m = FULL.exec(ev.date);
  if (!m) return /^\d{2}-\d{2}$/.test(ev.date) ? { status: 'uncertain', reason: 'no-year' } : { status: 'none' };
  if (hasAmbiguousSlashDate(ev.source ?? '')) return { status: 'uncertain', reason: 'ambiguous' };
  const t = FULL.exec(today);
  if (!t) return { status: 'none' };
  const days = Math.round((Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!) - Date.UTC(+t[1]!, +t[2]! - 1, +t[3]!)) / 86400000);
  return { status: days < 0 ? 'passed' : days === 0 ? 'today' : 'upcoming', days };
}

/** True when exporting to a calendar needs an explicit confirmation from the reader. */
export const needsConfirmation = (c: DateCheck) => c.status === 'passed' || c.status === 'uncertain' || c.status === 'none';

export type StatusLabels = Record<string, string>;

export function statusLabel(a: StatusLabels, kind: 'event' | 'deadline', s: DateStatus): string {
  const d = kind === 'deadline';
  switch (s) {
    case 'upcoming': return d ? a.stUpD! : a.stUpE!;
    case 'today': return d ? a.stTodayD! : a.stTodayE!;
    case 'passed': return d ? a.stPassedD! : a.stPassedE!;
    case 'uncertain': return a.stUncertain!;
    default: return a.stNone!;
  }
}

export type { Lang };
