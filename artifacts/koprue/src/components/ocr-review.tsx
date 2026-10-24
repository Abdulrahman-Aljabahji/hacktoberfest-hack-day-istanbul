import { useEffect, useRef, useState } from 'react';
import { OCR_MIN_CHARS, runOcr } from '@/lib/ocr';

type Phase = { kind: 'running'; pct: number } | { kind: 'review'; text: string } | { kind: 'failed'; message: string };

/**
 * Fallback when the AI could not read a photo: read it on this device with Tesseract OCR, let the person
 * correct the text, then analyze that text. Nothing is invented: what is shown is what the OCR engine found.
 */
export function OcrReview({ image, onAnalyze, onClose, onPaste }: {
  image: string;
  onAnalyze: (text: string) => void;
  onClose: () => void;
  onPaste: () => void;
}) {
  const [phase, setPhase] = useState<Phase>({ kind: 'running', pct: 0 });
  const [draft, setDraft] = useState('');
  const ctrl = useRef<AbortController | null>(null);

  useEffect(() => {
    const c = new AbortController();
    ctrl.current = c;
    setPhase({ kind: 'running', pct: 0 });
    runOcr(image, (pct) => setPhase((p) => (p.kind === 'running' ? { kind: 'running', pct } : p)), c.signal)
      .then((text) => {
        if (c.signal.aborted) return;
        setDraft(text);
        setPhase(text.length >= OCR_MIN_CHARS ? { kind: 'review', text } : { kind: 'failed', message: 'No readable text was found on this device either. Try a closer crop, or paste the text.' });
      })
      .catch(() => {
        if (c.signal.aborted) return;
        setPhase({ kind: 'failed', message: "On-device reading didn't work here (the engine downloads on first use, so it needs an internet connection). You can paste the text instead." });
      });
    return () => c.abort();
  }, [image]);

  return (
    <div className="border-2 border-secondary bg-card p-6 shadow-[8px_8px_0_hsl(var(--accent))]" data-testid="ocr-flow" dir="ltr" lang="en">
      <h3 className="font-display font-extrabold text-2xl">Read the text on this device</h3>
      {phase.kind === 'running' && (
        <div role="status" aria-live="polite" className="mt-3" data-testid="ocr-running">
          <p className="text-muted-foreground">Reading your photo with Tesseract OCR. Your image stays in this browser for this step. The first run downloads the language data.</p>
          <div className="mt-3 h-3 border-2 border-secondary" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={phase.pct}><div className="h-full bg-primary transition-all" style={{ width: `${phase.pct}%` }} /></div>
          <button type="button" onClick={onClose} className="mt-3 border-2 border-secondary font-bold px-4 min-h-11" data-testid="button-ocr-cancel">Cancel</button>
        </div>
      )}
      {phase.kind === 'review' && (
        <div className="mt-3" data-testid="ocr-review">
          <p className="text-muted-foreground">This is what the OCR engine read. It can make mistakes, especially with decorative fonts. Correct anything that is wrong, then continue. Quotes from this text are shown as machine-extracted, never as verified.</p>
          <label htmlFor="ocr-text" className="mono block mt-3 mb-1">Text read from your photo</label>
          <textarea id="ocr-text" dir="auto" rows={9} maxLength={6000} value={draft} onChange={(e) => setDraft(e.target.value)} className="w-full border-2 border-secondary bg-background p-3 text-sm" data-testid="input-ocr-text" />
          <div className="flex flex-wrap gap-2 mt-3">
            <button type="button" disabled={draft.trim().length < OCR_MIN_CHARS} onClick={() => onAnalyze(draft.trim())} className="bg-primary text-primary-foreground font-bold px-5 min-h-11 disabled:opacity-50" data-testid="button-ocr-analyze">Build my plan from this text</button>
            <button type="button" onClick={onClose} className="border-2 border-secondary font-bold px-5 min-h-11 hover:bg-accent" data-testid="button-ocr-close">Close</button>
          </div>
        </div>
      )}
      {phase.kind === 'failed' && (
        <div className="mt-3" role="alert" data-testid="ocr-failed">
          <p className="text-muted-foreground">{phase.message}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button type="button" onClick={onPaste} className="bg-primary text-primary-foreground font-bold px-5 min-h-11" data-testid="button-ocr-paste">Paste the text instead</button>
            <button type="button" onClick={onClose} className="border-2 border-secondary font-bold px-5 min-h-11">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
