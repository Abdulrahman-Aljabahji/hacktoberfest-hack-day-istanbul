import type { ActionPlan, EvidenceStatus } from '@workspace/api-client-react';
import { checkDate, statusLabel, todayIn } from '@/lib/deadlines';
import { NOTICE_ZONE, formatEventDate } from '@/components/calendar-export';
import { A } from '@/lib/i18n-actions';
import { T } from '@/lib/sample';
import type { Lang } from '@/lib/sample';

export type SourceKind = 'sample' | 'image' | 'text';

/** Warnings that must always be printed when they apply. Exported for tests. */
export function passportWarnings(plan: ActionPlan, kind: SourceKind, lang: Lang, today: string = todayIn(NOTICE_ZONE)): string[] {
  const a = A[lang];
  const all = [...plan.steps, ...plan.facts, ...plan.events, ...plan.requirements];
  const has = (s: EvidenceStatus) => all.some((i) => i.evidence === s);
  const out: string[] = [a.ppWarnAi!];
  if (kind === 'image' || has('ai-extracted')) out.push(a.ppWarnImage!);
  if (has('unverified')) out.push(a.ppWarnUnverified!);
  if (has('none')) out.push(a.ppWarnNoQuote!);
  if (plan.events.some((e) => !/^\d{4}-/.test(e.date))) out.push(a.ppWarnYear!);
  const checks = plan.events.map((e) => checkDate(e, today).status);
  if (checks.includes('passed')) out.push(a.ppWarnPassed!);
  if (checks.includes('uncertain')) out.push(a.ppWarnUncertainDate!);
  if (plan.caution) out.push(`${T[lang].caution}: ${plan.caution}`);
  return out;
}

function Quote({ quote, evidence, lang }: { quote: string; evidence: EvidenceStatus; lang: Lang }) {
  const label = { verified: T[lang].evVerified, unverified: T[lang].evUnverified, 'ai-extracted': T[lang].evImage, none: T[lang].evNone }[evidence];
  return (
    <p className="pp-quote">
      {quote && <q lang="tr" dir="auto">{quote}</q>} <span className={`pp-status pp-${evidence}`}>[{label}]</span>
    </p>
  );
}

/** A one-page printable plan. Hidden on screen; shown by the print stylesheet. */
export function ActionPassport({ plan, lang, done, kind, today }: { plan: ActionPlan; lang: Lang; done: Set<number>; kind: SourceKind; today: string }) {
  const a = A[lang];
  const warnings = passportWarnings(plan, kind, lang, today);
  const source = kind === 'sample' ? a.ppSourceSample : kind === 'image' ? a.ppSourceImage : a.ppSourceText;
  const created = new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : lang === 'tr' ? 'tr-TR' : 'en-GB', { dateStyle: 'long' }).format(new Date());
  return (
    <section className="passport-print" lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} aria-hidden="true" data-testid="passport">
      <header className="pp-head">
        <p className="pp-brand">{a.ppTitle}</p>
        <h1>{plan.headline}</h1>
        <p className="pp-meta">{source} · {a.ppCreated} {created}</p>
      </header>

      <h2>{a.ppSummary}</h2>
      <p>{plan.summary}</p>

      <h2>{a.ppDeadlines}</h2>
      {plan.events.length === 0 ? <p>{a.ppNone}</p> : (
        <ul>
          {plan.events.map((e, i) => (
            <li key={i}>
              <strong>{e.kind === 'deadline' ? a.calKindDeadline : a.calKindEvent}: {e.title}</strong> — {formatEventDate(e.date, lang)} [{statusLabel(a, e.kind, checkDate(e, today).status)}]
              {e.time ? ` · ${e.time}` : ` · ${a.ppAllDay}`}{!/^\d{4}-/.test(e.date) ? ` · ${a.ppNoYear}` : ''}
              {e.location ? <> · <span lang="tr" dir="auto">{e.location}</span></> : null}
              <Quote quote={e.source} evidence={e.evidence} lang={lang} />
            </li>
          ))}
        </ul>
      )}

      {plan.facts.length > 0 && (<>
        <h2>{a.ppFacts}</h2>
        <ul>{plan.facts.map((f, i) => <li key={i}><strong>{f.label}:</strong> {f.value}<Quote quote={f.source} evidence={f.evidence} lang={lang} /></li>)}</ul>
      </>)}

      <h2>{a.ppRequirements}</h2>
      {plan.requirements.length === 0 ? <p>{a.ppNone}</p> : (
        <ul>{plan.requirements.map((r, i) => <li key={i}>{r.text}<Quote quote={r.source} evidence={r.evidence} lang={lang} /></li>)}</ul>
      )}

      <h2>{a.ppChecklist}</h2>
      {plan.steps.length === 0 ? <p>{a.ppNone}</p> : (
        <ol className="pp-checklist">
          {plan.steps.map((s, i) => (
            <li key={i}>
              <span className="pp-box">{done.has(i) ? '☑' : '☐'}</span>
              <div><strong>{s.title}</strong> — {s.detail}<Quote quote={s.source} evidence={s.evidence} lang={lang} /></div>
            </li>
          ))}
        </ol>
      )}

      <h2>{a.ppWarnings}</h2>
      <ul className="pp-warn">
        {warnings.map((w, i) => <li key={i}>{w}</li>)}
        {plan.missing.map((m, i) => <li key={`m${i}`}><strong>{a.ppMissing}:</strong> {m}</li>)}
      </ul>
    </section>
  );
}
