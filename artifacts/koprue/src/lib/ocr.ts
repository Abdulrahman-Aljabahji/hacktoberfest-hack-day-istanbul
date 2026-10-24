/**
 * On-device OCR fallback (Tesseract, Apache-2.0). The photo never leaves the browser for this step.
 * The engine and the tur/eng/ara language data download from a CDN the first time it is used.
 */
export const OCR_LANGS = ['tur', 'eng', 'ara'];
export const OCR_MIN_CHARS = 12;
const OCR_TIMEOUT_MS = 90_000;

/** Tidy raw OCR output: normalize line endings, drop empty runs, cap the length the API accepts. */
export function cleanOcrText(raw: string): string {
  return raw
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .filter((l, i, a) => l || (a[i - 1] ?? '') !== '')
    .join('\n')
    .trim()
    .slice(0, 6000);
}

export async function runOcr(image: string, onProgress: (pct: number) => void, signal: AbortSignal): Promise<string> {
  const { createWorker } = await import('tesseract.js');
  if (signal.aborted) throw new DOMException('aborted', 'AbortError');
  const worker = await createWorker(OCR_LANGS, 1, {
    logger: (m: { status?: string; progress?: number }) => {
      if (m.status === 'recognizing text' && typeof m.progress === 'number') onProgress(Math.round(m.progress * 100));
    },
  });
  const stop = () => { void worker.terminate(); };
  signal.addEventListener('abort', stop);
  const timer = window.setTimeout(stop, OCR_TIMEOUT_MS);
  try {
    const { data } = await worker.recognize(image);
    if (signal.aborted) throw new DOMException('aborted', 'AbortError');
    return cleanOcrText(data.text);
  } finally {
    window.clearTimeout(timer);
    signal.removeEventListener('abort', stop);
    void worker.terminate();
  }
}
