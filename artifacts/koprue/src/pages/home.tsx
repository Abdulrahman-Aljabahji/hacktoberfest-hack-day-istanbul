import { useCallback, useEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Camera, Check, Copy, Quote, RotateCcw, Type, Upload, Volume2 } from 'lucide-react';
import { interpretNotice, useGetInterpretStatus } from '@workspace/api-client-react';
import type { ActionPlan } from '@workspace/api-client-react';
import { BridgeScene } from '@/components/bridge-scene';
import { SAMPLE, SAMPLE_NOTICE, T } from '@/lib/sample';
import type { Lang } from '@/lib/sample';

type Source = { kind: 'sample' } | { kind: 'image'; value: string } | { kind: 'text'; value: string };
type Status = 'ready' | 'loading' | 'error';

const MAX = 4 * 1024 * 1024;
const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function Evidence({ quote, lang, id }: { quote: string; lang: Lang; id: string }) {
  const [open, setOpen] = useState(false);
  if (!quote) return null;
  return (
    <div className="mt-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`ev-${id}`}
        onClick={() => setOpen((o) => !o)}
        data-testid={`button-evidence-${id}`}
        className="mono inline-flex items-center gap-1.5 border-2 border-secondary px-2.5 py-1.5 min-h-9 bg-card hover:bg-accent transition-colors"
      >
        <Quote size={13} aria-hidden="true" /> {open ? T[lang].hide : T[lang].evidence}
      </button>
      {open && (
        <blockquote id={`ev-${id}`} lang="tr" dir="auto" data-testid={`text-evidence-${id}`} className="mt-2 border-s-4 border-primary bg-muted/70 px-3 py-2 font-medium text-sm break-words">
          {quote}
        </blockquote>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Analyzing notice" data-testid="state-loading">
      <div className="skeleton h-9 w-3/4" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-5/6" />
      <div className="grid sm:grid-cols-3 gap-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-20" />)}</div>
      {[0, 1, 2].map((i) => <div key={i} className="skeleton h-24" />)}
      <div className="road" aria-hidden="true" />
      <p className="mono text-muted-foreground">Building your bridge...</p>
    </div>
  );
}

export default function Home() {
  const reduce = useReducedMotion();
  const status = useGetInterpretStatus();
  const [lang, setLang] = useState<Lang>('en');
  const [src, setSrc] = useState<Source>({ kind: 'sample' });
  const [live, setLive] = useState<ActionPlan | null>(null);
  const [state, setState] = useState<Status>('ready');
  const [textOpen, setTextOpen] = useState(false);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const [drag, setDrag] = useState(false);
  const [copied, setCopied] = useState('');
  const ctrl = useRef<AbortController | null>(null);
  const reqId = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const msgTimer = useRef<number | undefined>(undefined);

  const flash = useCallback((m: string) => {
    setMsg(m);
    window.clearTimeout(msgTimer.current);
    msgTimer.current = window.setTimeout(() => setMsg(''), 4500);
  }, []);

  useEffect(() => () => { ctrl.current?.abort(); window.speechSynthesis?.cancel(); }, []);

  const run = useCallback(async (s: Exclude<Source, { kind: 'sample' }>, l: Lang, scroll = true) => {
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    const id = ++reqId.current;
    setSrc(s);
    setState('loading');
    if (scroll) resultRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    try {
      const res = await interpretNotice(
        { lang: l, ...(s.kind === 'image' ? { image: s.value } : { text: s.value }) },
        { signal: c.signal },
      );
      if (id !== reqId.current) return;
      setLive(res.plan);
      setState('ready');
    } catch {
      if (id !== reqId.current || c.signal.aborted) return;
      setState('error');
    }
  }, [reduce]);

  const changeLang = (l: Lang) => {
    setLang(l);
    if (src.kind !== 'sample') void run(src, l, false);
  };

  const resetSample = () => {
    ctrl.current?.abort();
    reqId.current++;
    setSrc({ kind: 'sample' });
    setLive(null);
    setState('ready');
  };

  const handleFile = (file?: File | null) => {
    if (!file) return;
    if (!OK_TYPES.includes(file.type)) return flash('Choose a JPG, PNG or WebP image.');
    if (file.size > MAX) return flash('That image is too large. Please choose one under 4 MB.');
    const r = new FileReader();
    r.onload = () => { if (typeof r.result === 'string') void run({ kind: 'image', value: r.result }, lang); };
    r.onerror = () => flash('Could not read the image.');
    r.readAsDataURL(file);
  };

  const onDrop = (e: DragEvent) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0]); };

  const submitText = () => {
    const v = text.trim();
    if (!v) return flash('Paste a short notice first.');
    void run({ kind: 'text', value: v }, lang);
  };

  const isSample = src.kind === 'sample';
  const plan: ActionPlan | null = isSample ? SAMPLE[lang] : live;
  const t = T[lang];
  const rtl = lang === 'ar';

  const speak = () => {
    if (!plan || !('speechSynthesis' in window)) return flash('Speech is unavailable in this browser.');
    const u = new SpeechSynthesisUtterance(plan.phrase.native);
    u.lang = plan.sourceLang || 'tr-TR';
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const copy = async (what: 'phrase' | 'plan') => {
    if (!plan) return;
    const body = what === 'phrase'
      ? plan.phrase.native
      : [
          plan.headline, '', plan.summary, '',
          ...plan.facts.map((f) => `${f.label}: ${f.value}`), '',
          ...plan.steps.map((s, i) => `${i + 1}. ${s.title} - ${s.detail}`), '',
          `${t.say}: ${plan.phrase.native} (${plan.phrase.meaning})`,
          ...(plan.caution ? ['', `${t.caution}: ${plan.caution}`] : []),
          '', 'Note: original-language quotes must be verified against the real notice.',
          isSample ? 'Source: KÖPRÜ interactive sample (fictional, offline, no AI).' : 'Source: KÖPRÜ live analysis (Gemma 4).',
        ].join('\n');
    try {
      await navigator.clipboard.writeText(body);
      setCopied(what);
      flash(what === 'phrase' ? 'Phrase copied.' : 'Action plan copied.');
      window.setTimeout(() => setCopied(''), 1800);
    } catch { flash('Clipboard access is unavailable in this browser.'); }
  };

  const connected = status.data?.connected;
  const modeLabel = isSample ? 'Interactive sample (fictional, offline, no AI)' : state === 'loading' ? 'Analyzing - Gemma 4' : state === 'error' ? 'Needs attention' : 'Live - Gemma 4';

  const rise = reduce ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.6 } };

  return (
    <div className="min-h-[100dvh] overflow-x-clip">
      {/* HERO */}
      <section className="on-ink bg-secondary text-secondary-foreground relative overflow-hidden" aria-labelledby="hero-title">
        <div className="absolute inset-x-0 bottom-0 h-px bg-accent/40" aria-hidden="true" />
        <header className="max-w-6xl mx-auto px-5 py-5 flex items-center justify-between gap-3">
          <a href="#top" className="flex items-center gap-2 font-display font-extrabold text-2xl tracking-tight" aria-label="KÖPRÜ home" data-testid="link-home">
            <svg width="34" height="22" viewBox="0 0 34 22" fill="none" aria-hidden="true"><path d="M1 20C6 2 28 2 33 20" stroke="hsl(44 96% 58%)" strokeWidth="3" /><path d="M0 20h34" stroke="hsl(11 88% 52%)" strokeWidth="3" /></svg>
            KÖPRÜ
          </a>
          <div className="mono flex items-center gap-2 text-right" role="status" data-testid="status-connection">
            <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${connected ? 'bg-accent' : 'bg-primary'}`} aria-hidden="true" />
            <span>{status.isLoading ? 'Checking...' : connected ? 'Gemma 4 connected' : 'Sample mode only - live analysis not configured'}</span>
          </div>
        </header>
        <div id="top" className="max-w-6xl mx-auto px-5 pt-8 pb-14 md:pt-14">
          <motion.p {...(reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 } })} className="mono text-accent">Istanbul / Turkish, English, Arabic</motion.p>
          <motion.h1
            id="hero-title"
            {...(reduce ? {} : { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.1 } })}
            className="font-display font-extrabold leading-[0.9] tracking-tight text-[clamp(2.8rem,10vw,7.5rem)] mt-4"
          >
            Cross the gap<br /><span className="text-accent">between a notice</span><br />and your next step.
          </motion.h1>
          <p className="mt-6 max-w-xl text-lg text-secondary-foreground/80">
            Point KÖPRÜ at a sign, a poster or a form. It builds you a small interface: what to do, the facts that matter, the exact original words, and a sentence to say out loud.
          </p>
          <a href="#workbench" data-testid="link-start" className="mt-8 inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3.5 min-h-12 shadow-[6px_6px_0_hsl(var(--accent))] hover:-translate-y-0.5 transition-transform">
            Build a bridge
          </a>
          <div className="mt-10"><BridgeScene /></div>
        </div>
      </section>

      <div className="road" aria-hidden="true" />

      {/* WORKBENCH */}
      <main id="workbench" className="max-w-6xl mx-auto px-5 py-14 md:py-20">
        <motion.div {...rise} className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="mono text-primary">The span</p>
            <h2 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight leading-none mt-2">Bring a notice.<br />Leave with a plan.</h2>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="lang" className="mono">Explain in</label>
            <select
              id="lang"
              value={lang}
              onChange={(e) => changeLang(e.target.value as Lang)}
              aria-label="Select result language"
              data-testid="select-language"
              className="bg-card border-2 border-secondary px-3 py-2.5 min-h-11 font-bold"
            >
              <option value="en">English</option>
              <option value="tr">Türkçe</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 lg:gap-10 items-start">
          {/* INPUT + SOURCE */}
          <div className="space-y-5 lg:sticky lg:top-4 min-w-0">
            <div
              onDragEnter={(e) => { e.preventDefault(); setDrag(true); }}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              role="group"
              aria-label="Add a notice"
              data-testid="dropzone"
              className={`border-2 border-dashed border-secondary p-5 transition-colors ${drag ? 'bg-accent' : 'bg-card'}`}
            >
              <p className="font-display font-bold text-xl">Drop a photo of the notice</p>
              <p className="text-sm text-muted-foreground mt-1">JPG, PNG or WebP, up to 4 MB. Uploads go to the Gemini API. Do not upload IDs or private documents.</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <button type="button" onClick={() => fileRef.current?.click()} data-testid="button-upload" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-bold px-4 min-h-11 hover:bg-primary transition-colors"><Upload size={16} aria-hidden="true" /> Choose image</button>
                <button type="button" onClick={() => camRef.current?.click()} data-testid="button-camera" className="inline-flex items-center gap-2 border-2 border-secondary font-bold px-4 min-h-11 hover:bg-accent transition-colors"><Camera size={16} aria-hidden="true" /> Take photo</button>
                <button type="button" aria-expanded={textOpen} aria-controls="paste-panel" onClick={() => setTextOpen((o) => !o)} data-testid="button-paste-toggle" className="inline-flex items-center gap-2 border-2 border-secondary font-bold px-4 min-h-11 hover:bg-accent transition-colors"><Type size={16} aria-hidden="true" /> Paste text</button>
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }} data-testid="input-file" />
              <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }} data-testid="input-camera" />
              {textOpen && (
                <div id="paste-panel" className="mt-4">
                  <label htmlFor="paste" className="mono block mb-1">Paste a notice, email or instruction</label>
                  <textarea id="paste" value={text} onChange={(e) => setText(e.target.value)} maxLength={6000} rows={5} placeholder="Paste Turkish, English or Arabic text..." data-testid="input-text" className="w-full border-2 border-secondary bg-background p-3 text-sm" />
                  <button type="button" onClick={submitText} data-testid="button-analyze-text" className="mt-2 bg-primary text-primary-foreground font-bold px-4 min-h-11">Interpret text</button>
                </div>
              )}
              <div role="status" aria-live="polite" className="min-h-5 mt-3 text-sm font-bold text-primary" data-testid="text-message">{msg}</div>
            </div>

            <div className="bg-[hsl(44_45%_95%)] text-secondary border-2 border-secondary p-5 rotate-[-0.6deg] shadow-[8px_8px_0_hsl(var(--primary))] min-w-0">
              <p className="mono flex justify-between gap-2"><span>Original</span><span>{src.kind === 'sample' ? 'Sample notice' : src.kind === 'image' ? 'Your image' : 'Your text'}</span></p>
              {src.kind === 'sample' && (
                <div lang="tr" className="mt-3" data-testid="text-sample-notice">
                  <h3 className="font-display font-extrabold text-2xl leading-tight">{SAMPLE_NOTICE.title}</h3>
                  {SAMPLE_NOTICE.lines.map((l) => <p key={l} className="mt-2 text-sm">{l}</p>)}
                </div>
              )}
              {src.kind === 'image' && <img src={src.value} alt="Your uploaded notice" className="mt-3 max-h-80 w-full object-contain" />}
              {src.kind === 'text' && <p dir="auto" className="mt-3 text-sm whitespace-pre-wrap break-words max-h-80 overflow-auto">{src.value}</p>}
              <p className="text-xs mt-4 text-secondary/70">
                {src.kind === 'sample' ? 'Invented for demonstration. Not a real event announcement.' : 'Processed only for this request and sent to the Gemini API. Avoid private documents.'}
              </p>
            </div>
          </div>

          {/* RESULT */}
          <div ref={resultRef} className="min-w-0 scroll-mt-4" lang={lang} dir={rtl ? 'rtl' : 'ltr'} aria-live="polite" data-testid="region-result">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span data-testid="label-mode" className={`mono px-3 py-2 font-bold ${isSample ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'}`} dir="ltr" lang="en">{modeLabel}</span>
              <div className="flex gap-2">
                {!isSample && (
                  <button type="button" onClick={resetSample} data-testid="button-reset-sample" className="mono inline-flex items-center gap-1.5 border-2 border-secondary px-3 min-h-10 hover:bg-accent"><RotateCcw size={13} aria-hidden="true" /> <span dir="ltr" lang="en">Reset to sample</span></button>
                )}
              </div>
            </div>

            {state === 'loading' && <Skeleton />}

            {state === 'error' && !isSample && (
              <div role="alert" data-testid="state-error" className="border-2 border-secondary bg-card p-6 shadow-[8px_8px_0_hsl(var(--primary))]" dir="ltr" lang="en">
                <h3 className="font-display font-extrabold text-2xl">The bridge didn't hold this time.</h3>
                <p className="mt-2 text-muted-foreground">We could not read that notice right now. Check your connection, try a clearer photo, or try again in a moment.</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <button type="button" onClick={() => void run(src, lang, false)} data-testid="button-retry" className="bg-primary text-primary-foreground font-bold px-5 min-h-11">Try again</button>
                  <button type="button" onClick={resetSample} data-testid="button-error-reset" className="border-2 border-secondary font-bold px-5 min-h-11">Back to sample</button>
                </div>
              </div>
            )}

            {state === 'ready' && plan && (
              <motion.article key={`${src.kind}-${lang}-${plan.headline}`} {...(reduce ? {} : { initial: { opacity: 0, y: 20, rotateX: 8 }, animate: { opacity: 1, y: 0, rotateX: 0 } })} className="space-y-8" data-testid="result-plan">
                <div>
                  <h3 className="font-display font-extrabold text-3xl md:text-5xl leading-[1.02] tracking-tight" data-testid="text-headline">{plan.headline}</h3>
                  <p className="mt-3 text-lg text-muted-foreground" data-testid="text-summary">{plan.summary}</p>
                </div>

                {plan.caution && (
                  <div className="border-2 border-secondary bg-accent/60 p-4 text-sm font-medium" data-testid="text-caution"><strong className="mono me-2">{t.caution}</strong>{plan.caution}</div>
                )}

                {plan.facts.length > 0 && (
                  <section aria-label={t.facts}>
                    <h4 className="mono mb-3">{t.facts}</h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {plan.facts.map((f, i) => (
                        <div key={i} className="tilt-card bg-card border-2 border-secondary p-4 min-w-0" data-testid={`card-fact-${i}`}>
                          <p className="mono text-muted-foreground">{f.label}</p>
                          <p className="font-display font-bold text-xl mt-1 break-words">{f.value}</p>
                          <Evidence quote={f.source} lang={lang} id={`fact-${i}`} />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section aria-label={t.steps}>
                  <h4 className="mono mb-3">{plan.steps.length ? t.steps : t.none}</h4>
                  <ol className="relative space-y-4">
                    {plan.steps.map((s, i) => (
                      <li key={i} className="tilt-card flex gap-4 bg-card border-2 border-secondary p-4 min-w-0" data-testid={`card-step-${i}`}>
                        <span className="font-display font-extrabold text-4xl text-primary leading-none shrink-0" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                        <div className="min-w-0">
                          <h5 className="font-display font-bold text-xl leading-tight">{s.title}</h5>
                          <p className="mt-1 text-muted-foreground">{s.detail}</p>
                          <Evidence quote={s.source} lang={lang} id={`step-${i}`} />
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>

                {plan.phrase?.native && (
                  <section aria-label={t.say} className="on-ink bg-secondary text-secondary-foreground p-5 md:p-6 shadow-[8px_8px_0_hsl(var(--accent))]" data-testid="card-phrase">
                    <p className="mono text-accent">{t.say}</p>
                    <p lang="tr" dir="auto" className="font-display font-extrabold text-2xl md:text-3xl leading-tight mt-2 break-words" data-testid="text-phrase-native">{plan.phrase.native}</p>
                    <p className="mt-2 text-secondary-foreground/80">{plan.phrase.meaning}</p>
                    <div className="flex gap-2 mt-4">
                      <button type="button" onClick={speak} aria-label={t.speak} data-testid="button-speak" className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-4 min-h-11"><Volume2 size={18} aria-hidden="true" /> {t.speak}</button>
                      <button type="button" onClick={() => void copy('phrase')} aria-label={t.copy} data-testid="button-copy-phrase" className="inline-flex items-center gap-2 border-2 border-secondary-foreground/60 font-bold px-4 min-h-11 hover:bg-secondary-foreground/10">{copied === 'phrase' ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />} {t.copy}</button>
                    </div>
                  </section>
                )}

                <div className="flex flex-wrap items-center gap-3 border-t-2 border-secondary pt-5">
                  <button type="button" onClick={() => void copy('plan')} data-testid="button-copy-plan" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 min-h-11">{copied === 'plan' ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />} {t.plan}</button>
                  <p className="text-xs text-muted-foreground flex-1 min-w-[12rem]">{t.verify}</p>
                </div>
                {!isSample && (
                  <button type="button" onClick={resetSample} data-testid="button-reset-bottom" className="mono inline-flex items-center gap-1.5 underline underline-offset-4" dir="ltr" lang="en"><RotateCcw size={13} aria-hidden="true" /> Reset to sample</button>
                )}
              </motion.article>
            )}
          </div>
        </div>
      </main>

      {/* HOW */}
      <section className="max-w-6xl mx-auto px-5 pb-16" aria-labelledby="how-title">
        <motion.h2 {...rise} id="how-title" className="font-display font-extrabold text-3xl md:text-5xl tracking-tight mb-8">Three planks. One crossing.</motion.h2>
        <div className="grid md:grid-cols-12 gap-5">
          {[
            ['01', 'See', 'A photo or pasted text goes in. No perfect prompt, no translation app juggling.', 'md:col-span-5'],
            ['02', 'Span', 'Gemma 4 pulls out deadlines, places and obligations as steps, not a wall of translated text.', 'md:col-span-4 md:mt-8'],
            ['03', 'Step', 'Every claim carries its verbatim Turkish quote, plus a sentence to say at the counter.', 'md:col-span-3 md:mt-16'],
          ].map(([n, h, p, c]) => (
            <motion.div key={n} {...rise} className={`${c} tilt-card bg-card border-2 border-secondary p-6`}>
              <span className="mono text-primary">{n}</span>
              <h3 className="font-display font-extrabold text-3xl mt-2">{h}</h3>
              <p className="mt-2 text-muted-foreground">{p}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="on-ink bg-secondary text-secondary-foreground" data-testid="footer">
        <div className="road" aria-hidden="true" />
        <div className="max-w-6xl mx-auto px-5 py-12 grid md:grid-cols-2 gap-8">
          <div>
            <p className="font-display font-extrabold text-4xl">KÖPRÜ</p>
            <p className="mt-3 text-secondary-foreground/80 max-w-md">Open source (MIT), built with open-weight Gemma 4. Made for Hacktoberfest Hack Day Istanbul.</p>
          </div>
          <ul className="space-y-2 text-sm text-secondary-foreground/85 list-disc ps-5">
            <li>Photos and text you submit are sent to the Gemini API. Do not upload IDs or private documents.</li>
            <li>KÖPRÜ is not legal, medical or government advice.</li>
            <li>Generated quotes can be wrong. Always verify the original notice.</li>
            <li>The sample notice is fictional and runs offline with no AI.</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
