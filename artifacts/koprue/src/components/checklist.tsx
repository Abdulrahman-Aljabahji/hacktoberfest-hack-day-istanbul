import { Check } from 'lucide-react';
import { A, fill } from '@/lib/i18n-actions';
import type { Lang } from '@/lib/sample';

export function ChecklistProgress({ done, total, lang }: { done: number; total: number; lang: Lang }) {
  if (total === 0) return null;
  const a = A[lang];
  const pct = Math.round((done / total) * 100);
  const label = done === total ? a.chkAll! : fill(a.chkProgress!, { done, total });
  return (
    <div className="mb-4" data-testid="checklist-progress">
      <div className="flex items-center justify-between gap-3 mono">
        <span data-testid="text-progress" role="status" aria-live="polite">{label}</span>
        <span dir="ltr" aria-hidden="true">{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-label={label}
        className="mt-2 h-3 border-2 border-secondary bg-card overflow-hidden"
      >
        <div className={`h-full transition-[width] duration-500 ${done === total ? 'bg-secondary' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-muted-foreground mt-1">{a.chkPrivacy}</p>
    </div>
  );
}

export function StepToggle({ done, onToggle, lang, id }: { done: boolean; onToggle: () => void; lang: Lang; id: string }) {
  const a = A[lang];
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      onClick={onToggle}
      data-testid={`checkbox-${id}`}
      className={`mono mt-2 inline-flex items-center gap-2 border-2 border-secondary px-2.5 py-1.5 min-h-9 transition-colors ${done ? 'bg-secondary text-secondary-foreground' : 'bg-card hover:bg-accent'}`}
    >
      <span className={`inline-flex w-4 h-4 items-center justify-center border-2 ${done ? 'border-accent bg-accent text-accent-foreground' : 'border-current'}`} aria-hidden="true">
        {done && <Check size={12} strokeWidth={4} />}
      </span>
      {done ? a.chkUndo : a.chkMark}
    </button>
  );
}
