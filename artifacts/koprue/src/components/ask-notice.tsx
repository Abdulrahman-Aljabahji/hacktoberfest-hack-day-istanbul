import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircleQuestion, Send } from 'lucide-react';
import { askNotice } from '@workspace/api-client-react';
import type { AskResult } from '@workspace/api-client-react';
import { Evidence } from '@/components/evidence';
import { describeFailure } from '@/lib/errors';
import type { Failure } from '@/lib/errors';
import { A } from '@/lib/i18n-actions';
import type { Lang } from '@/lib/sample';

export interface AskSource {
  text?: string;
  image?: string;
}

/**
 * Stateless Q&A. The source is sent with each question and only the latest answer is kept
 * in memory here. The parent remounts this component (key) when a different document is analyzed.
 */
export function AskNotice({ lang, source, available }: { lang: Lang; source: AskSource; available: boolean }) {
  const a = A[lang];
  const [q, setQ] = useState('');
  const [asked, setAsked] = useState('');
  const [answer, setAnswer] = useState<AskResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const ctrl = useRef<AbortController | null>(null);
  const reqId = useRef(0);
  const first = useRef(true);

  const ask = useCallback(async (question: string, l: Lang) => {
    const text = question.trim();
    if (!text) return;
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    const id = ++reqId.current;
    setAsked(text);
    setBusy(true);
    setFailure(null);
    try {
      const res = await askNotice({ lang: l, question: text, ...(source.image ? { image: source.image } : { text: source.text ?? '' }) }, { signal: c.signal });
      if (id !== reqId.current) return;
      setAnswer(res);
    } catch (err) {
      if (id !== reqId.current || c.signal.aborted) return;
      setAnswer(null);
      setFailure(describeFailure(err));
    } finally {
      if (id === reqId.current) setBusy(false);
    }
  }, [source.image, source.text]);

  // If the reader switches language, answer the same question again in the new language.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (asked) void ask(asked, lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => () => ctrl.current?.abort(), []);

  const chips = [a.askChip1!, a.askChip2!, a.askChip3!, a.askChip4!];

  return (
    <section aria-labelledby="ask-title" className="border-2 border-secondary bg-card p-5 md:p-6" data-testid="section-ask">
      <h4 id="ask-title" className="mono flex items-center gap-2"><MessageCircleQuestion size={16} aria-hidden="true" /> {a.askTitle}</h4>
      <p className="text-sm text-muted-foreground mt-1">{a.askHint}</p>
      {!available ? (
        <p className="mt-3 text-sm font-bold" data-testid="text-ask-unavailable">{a.askNeedsLive}</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mt-3" role="group" aria-label={a.askTitle}>
            {chips.map((c, i) => (
              <button key={i} type="button" disabled={busy} onClick={() => { setQ(c); void ask(c, lang); }} data-testid={`chip-ask-${i}`} className="border-2 border-secondary px-3 py-1.5 min-h-9 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50">{c}</button>
            ))}
          </div>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); void ask(q, lang); }}>
            <label htmlFor="ask-input" className="sr-only">{a.askLabel}</label>
            <input id="ask-input" value={q} onChange={(e) => setQ(e.target.value)} maxLength={300} placeholder={a.askPlaceholder} dir="auto" data-testid="input-ask" className="flex-1 min-w-0 border-2 border-secondary bg-background px-3 min-h-11 text-sm" />
            <button type="submit" disabled={busy || !q.trim()} data-testid="button-ask" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-4 min-h-11 disabled:opacity-50"><Send size={16} aria-hidden="true" className="rtl:-scale-x-100" /> {a.askButton}</button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">{a.askNote}</p>
        </>
      )}

      <div role="status" aria-live="polite" className="mt-4" data-testid="region-ask">
        {busy && <p className="mono" data-testid="state-ask-loading">{a.askBusy}</p>}
        {failure && !busy && (
          <div role="alert" data-testid="state-ask-error" className="border-2 border-primary p-3 text-sm" dir="ltr" lang="en">
            <strong>{failure.title}.</strong> {failure.body}
          </div>
        )}
        {answer && !busy && (
          <div data-testid="card-answer" data-found={answer.found}>
            <p className="mono text-muted-foreground" dir="auto" data-testid="text-asked">{asked}</p>
            <span data-testid="badge-answer" className={`mono inline-block mt-2 px-2.5 py-1.5 ${answer.found ? 'bg-secondary text-secondary-foreground' : 'border-2 border-primary text-primary'}`}>
              {answer.found ? a.askFound : a.askNotFound}
            </span>
            <p className="mt-2 text-lg font-medium" data-testid="text-answer">{answer.answer}</p>
            {answer.found && answer.evidence.length === 0 && <Evidence quote="" evidence="none" lang={lang} id="ask-none" />}
            {answer.evidence.map((e, i) => (
              <Evidence key={i} quote={e.quote} evidence={e.evidence} lang={lang} id={`ask-${i}`} defaultOpen />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
