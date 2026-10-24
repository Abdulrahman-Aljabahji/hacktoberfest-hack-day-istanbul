import { useState } from 'react';
import { Quote, ShieldCheck, TriangleAlert } from 'lucide-react';
import type { EvidenceStatus } from '@workspace/api-client-react';
import { T } from '@/lib/sample';
import type { Lang } from '@/lib/sample';

const EV_STYLE: Record<EvidenceStatus, string> = {
  verified: 'bg-secondary text-secondary-foreground',
  unverified: 'border-2 border-primary text-primary bg-card',
  'ai-extracted': 'border-2 border-secondary bg-accent/50',
  none: 'text-muted-foreground',
};

export function Evidence({ quote, evidence, lang, id, defaultOpen = false }: { quote: string; evidence: EvidenceStatus; lang: Lang; id: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const label = { verified: T[lang].evVerified, unverified: T[lang].evUnverified, 'ai-extracted': T[lang].evImage, none: T[lang].evNone }[evidence];
  const Icon = evidence === 'verified' ? ShieldCheck : evidence === 'none' ? null : TriangleAlert;
  const badge = (
    <span data-testid={`badge-evidence-${id}`} data-evidence={evidence} className={`mono inline-flex items-center gap-1.5 px-2.5 py-1.5 ${EV_STYLE[evidence]}`}>
      {Icon && <Icon size={13} aria-hidden="true" />} {label}
    </span>
  );
  if (!quote) return <div className="mt-2">{badge}</div>;
  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-2">
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
        {badge}
      </div>
      {open && (
        <blockquote id={`ev-${id}`} lang="tr" dir="auto" data-testid={`text-evidence-${id}`} className="mt-2 border-s-4 border-primary bg-muted/70 px-3 py-2 font-medium text-sm break-words">
          {quote}
        </blockquote>
      )}
    </div>
  );
}
