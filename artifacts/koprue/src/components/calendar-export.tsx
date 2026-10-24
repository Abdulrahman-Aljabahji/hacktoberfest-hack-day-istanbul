import { useState } from 'react';
import { CalendarPlus, Download, X } from 'lucide-react';
import type { PlanEvent } from '@workspace/api-client-react';
import { Evidence } from '@/components/evidence';
import { A, fill } from '@/lib/i18n-actions';
import { buildIcs, isValidDate, resolveEventDate } from '@/lib/ics';
import type { CalendarZone } from '@/lib/ics';
import { checkDate, needsConfirmation, statusLabel } from '@/lib/deadlines';
import type { Lang } from '@/lib/sample';

/** The notice's timezone for "today" comparisons. */
export const NOTICE_ZONE = 'Europe/Istanbul';

const LOCALE: Record<Lang, string> = { en: 'en-GB', tr: 'tr-TR', ar: 'ar' };

/** Only dates backed by a quote are offered. "unverified" and "none" are never exported. */
export const isExportable = (e: PlanEvent) => e.evidence === 'verified' || e.evidence === 'ai-extracted';

export function formatEventDate(date: string, lang: Lang): string {
  const { date: full } = resolveEventDate(date);
  if (!isValidDate(full)) return date;
  const [y, m, d] = full.split('-').map(Number) as [number, number, number];
  return new Intl.DateTimeFormat(LOCALE[lang], { day: 'numeric', month: 'long', timeZone: 'UTC', ...(/^\d{4}-/.test(date) ? { year: 'numeric' as const } : {}) }).format(new Date(Date.UTC(y, m - 1, d)));
}

function download(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function EventRow({ ev, lang, id, today }: { ev: PlanEvent; lang: Lang; id: string; today: string }) {
  const a = A[lang];
  const check = checkDate(ev, today);
  const confirmNeeded = needsConfirmation(check);
  const [confirmed, setConfirmed] = useState(false);
  const resolved = resolveEventDate(ev.date);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(ev.title);
  const [date, setDate] = useState(resolved.date);
  const [time, setTime] = useState(ev.time);
  const [end, setEnd] = useState(ev.endTime);
  const [zone, setZone] = useState<CalendarZone>('Europe/Istanbul');
  const [place, setPlace] = useState(ev.location);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const deadline = ev.kind === 'deadline';

  const submit = () => {
    if (!isValidDate(date)) { setError(a.calBadDate!); return; }
    if (confirmNeeded && !confirmed) { setError(a.calNeedConfirm!); return; }
    try {
      const ics = buildIcs({ title: title.trim() || ev.title, date, time, endTime: end, zone, location: place.trim(), description: `${a.calNotes}\n"${ev.source}"` });
      download(`${(title || 'koprue').replace(/[^\p{L}\p{N}]+/gu, '-').slice(0, 40)}.ics`, ics);
      setError('');
      setSaved(true);
    } catch {
      setError(a.calBadDate!);
    }
  };

  const field = 'border-2 border-secondary bg-background px-3 min-h-11 text-sm w-full';
  return (
    <li className="border-2 border-secondary bg-card p-4 min-w-0" data-testid={`card-event-${id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span data-testid={`chip-kind-${id}`} className={`mono inline-block px-2 py-1 ${deadline ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>{deadline ? a.calKindDeadline : a.calKindEvent}</span>
          <span data-testid={`chip-status-${id}`} data-status={check.status} className={`mono inline-block px-2 py-1 ms-2 border-2 ${check.status === 'passed' ? 'border-primary text-primary' : check.status === 'uncertain' || check.status === 'none' ? 'border-secondary border-dashed' : 'border-secondary'}`}>{statusLabel(a, ev.kind, check.status)}</span>
          {check.days !== undefined && check.status !== 'today' && <span className="text-xs text-muted-foreground ms-2" data-testid={`text-days-${id}`}>{check.days > 0 ? fill(a.stDaysLeft!, { n: check.days }) : fill(a.stDaysAgo!, { n: -check.days })}</span>}
          {check.reason && <p className="text-xs font-bold mt-1" data-testid={`text-reason-${id}`}>{check.reason === 'no-year' ? a.stReasonNoYear : a.stReasonAmbiguous}</p>}
          <p className="font-display font-bold text-xl mt-2 break-words">{ev.title}</p>
          <p className="mt-1 text-muted-foreground" data-testid={`text-event-when-${id}`}>
            {formatEventDate(ev.date, lang)}{ev.time ? ` · ${ev.time}` : ` · ${a.ppAllDay}`}{!/^\d{4}-/.test(ev.date) ? ` · ${a.ppNoYear}` : ''}
          </p>
          {ev.location && <p className="text-sm break-words" dir="auto" lang="tr">{ev.location}</p>}
        </div>
        <button type="button" aria-expanded={open} onClick={() => { setOpen((o) => !o); setSaved(false); }} data-testid={`button-calendar-${id}`} className="inline-flex items-center gap-2 border-2 border-secondary font-bold px-4 min-h-11 hover:bg-accent transition-colors">
          {open ? <X size={16} aria-hidden="true" /> : <CalendarPlus size={16} aria-hidden="true" />} {open ? a.calClose : a.calAdd}
        </button>
      </div>
      <Evidence quote={ev.source} evidence={ev.evidence} lang={lang} id={`event-${id}`} />

      {open && (
        <form className="mt-4 border-t-2 border-secondary pt-4 space-y-3" data-testid={`form-calendar-${id}`} onSubmit={(e) => { e.preventDefault(); submit(); }}>
          {deadline && <p className="text-sm font-bold" data-testid="note-deadline">{a.calDeadlineNote}</p>}
          {confirmNeeded && (
            <label className="flex items-start gap-2 text-sm font-bold border-2 border-primary p-3" data-testid={`confirm-box-${id}`}>
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 h-5 w-5 shrink-0" data-testid={`checkbox-confirm-${id}`} />
              <span>{check.status === 'passed' ? a.calConfirmPassed : a.calConfirmUncertain}</span>
            </label>
          )}
          {resolved.yearAssumed && <p className="text-sm font-bold text-primary" data-testid="note-year">{a.calYear}</p>}
          {!time && <p className="text-sm" data-testid="note-allday">{a.calAllDay}</p>}
          <div>
            <label className="mono block mb-1" htmlFor={`cal-title-${id}`}>{a.calEventTitle}</label>
            <input id={`cal-title-${id}`} className={field} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} dir="auto" data-testid={`input-cal-title-${id}`} />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="mono block mb-1" htmlFor={`cal-date-${id}`}>{a.calDate}</label>
              <input id={`cal-date-${id}`} type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} data-testid={`input-cal-date-${id}`} />
            </div>
            <div>
              <label className="mono block mb-1" htmlFor={`cal-time-${id}`}>{a.calTime}</label>
              <input id={`cal-time-${id}`} type="time" className={field} value={time} onChange={(e) => { setTime(e.target.value); if (!e.target.value) setEnd(''); }} data-testid={`input-cal-time-${id}`} />
            </div>
            <div>
              <label className="mono block mb-1" htmlFor={`cal-end-${id}`}>{a.calEnd}</label>
              <input id={`cal-end-${id}`} type="time" className={field} value={end} disabled={!time} onChange={(e) => setEnd(e.target.value)} data-testid={`input-cal-end-${id}`} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="mono block mb-1" htmlFor={`cal-zone-${id}`}>{a.calZone}</label>
              <select id={`cal-zone-${id}`} className={field} value={zone} onChange={(e) => setZone(e.target.value as CalendarZone)} data-testid={`select-cal-zone-${id}`}>
                <option value="Europe/Istanbul">{a.calZoneIst}</option>
                <option value="UTC">{a.calZoneUtc}</option>
                <option value="floating">{a.calZoneFloat}</option>
              </select>
            </div>
            <div>
              <label className="mono block mb-1" htmlFor={`cal-place-${id}`}>{a.calLocation}</label>
              <input id={`cal-place-${id}`} className={field} value={place} onChange={(e) => setPlace(e.target.value)} maxLength={160} dir="auto" data-testid={`input-cal-location-${id}`} />
            </div>
          </div>
          <div role="status" aria-live="polite" className="min-h-5 text-sm font-bold text-primary" data-testid={`text-cal-status-${id}`}>{error || (saved ? a.calDone : '')}</div>
          <button type="submit" data-testid={`button-download-ics-${id}`} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 min-h-11"><Download size={16} aria-hidden="true" /> {a.calDownload}</button>
        </form>
      )}
    </li>
  );
}

export function CalendarExport({ events, lang, today }: { events: PlanEvent[]; lang: Lang; today: string }) {
  const a = A[lang];
  const ok = events.filter(isExportable);
  const skipped = events.length - ok.length;
  if (events.length === 0) return null;
  return (
    <section aria-labelledby="cal-title" data-testid="section-calendar">
      <h4 id="cal-title" className="mono mb-1">{a.calTitle}</h4>
      <p className="text-sm text-muted-foreground mb-3">{a.calHint}</p>
      {ok.length > 0 && (
        <ul className="space-y-3">{ok.map((ev, i) => <EventRow key={`${ev.date}-${ev.kind}-${i}`} ev={ev} lang={lang} id={String(i)} today={today} />)}</ul>
      )}
      {skipped > 0 && <p className="mt-3 text-sm font-bold text-primary" data-testid="text-cal-skipped">{fill(a.calSkipped!, { n: skipped })}</p>}
    </section>
  );
}
