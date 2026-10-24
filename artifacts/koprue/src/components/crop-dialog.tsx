import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { Crop, X } from 'lucide-react';
import { clampRect, displayToNatural, dragRect } from '@/lib/image-prep';
import type { Handle, Rect } from '@/lib/image-prep';

const HANDLES: { id: Exclude<Handle, 'move'>; cls: string; label: string }[] = [
  { id: 'nw', cls: '-left-3.5 -top-3.5 cursor-nwse-resize', label: 'Top-left corner' },
  { id: 'ne', cls: '-right-3.5 -top-3.5 cursor-nesw-resize', label: 'Top-right corner' },
  { id: 'sw', cls: '-left-3.5 -bottom-3.5 cursor-nesw-resize', label: 'Bottom-left corner' },
  { id: 'se', cls: '-right-3.5 -bottom-3.5 cursor-nwse-resize', label: 'Bottom-right corner' },
];

/**
 * Optional crop step. Works on the original full-resolution photo, so cropping never lowers quality
 * before the image is prepared for upload. Touch, mouse and keyboard (arrow keys on a corner) all work.
 */
export function CropDialog({ src, onApply, onCancel }: {
  src: string;
  onApply: (crop: Rect, scale: number, naturalW: number, naturalH: number) => void;
  onCancel: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const drag = useRef<{ handle: Handle; px: number; py: number; start: Rect } | null>(null);

  const measure = useCallback(() => {
    const img = imgRef.current;
    if (!img || !img.clientWidth) return;
    const w = img.clientWidth;
    const h = img.clientHeight;
    setSize({ w, h });
    setRect((r) => r ? clampRect(r, w, h) : { x: w * 0.05, y: h * 0.05, w: w * 0.9, h: h * 0.9 });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', measure);
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('resize', measure); window.removeEventListener('keydown', onKey); };
  }, [measure, onCancel]);

  const down = (handle: Handle) => (e: PointerEvent) => {
    if (!rect) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { handle, px: e.clientX, py: e.clientY, start: rect };
  };
  const move = (e: PointerEvent) => {
    const d = drag.current;
    if (!d || !size) return;
    setRect(dragRect(d.start, d.handle, e.clientX - d.px, e.clientY - d.py, size.w, size.h));
  };
  const up = () => { drag.current = null; };

  const key = (handle: Handle) => (e: KeyboardEvent) => {
    if (!rect || !size) return;
    const step = e.shiftKey ? 24 : 8;
    const delta: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const d = delta[e.key];
    if (!d) return;
    e.preventDefault();
    setRect(dragRect(rect, handle, d[0], d[1], size.w, size.h));
  };

  const apply = () => {
    const img = imgRef.current;
    if (!img || !rect || !size) return;
    const scale = img.naturalWidth / size.w;
    onApply(displayToNatural(rect, scale, img.naturalWidth, img.naturalHeight), scale, img.naturalWidth, img.naturalHeight);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="crop-title" data-testid="dialog-crop" className="fixed inset-0 z-50 bg-secondary/90 overflow-auto p-3 sm:p-6 flex items-start sm:items-center justify-center">
      <div className="bg-card border-2 border-secondary w-full max-w-3xl p-4 sm:p-5 shadow-[8px_8px_0_hsl(var(--accent))]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="crop-title" className="font-display font-extrabold text-2xl flex items-center gap-2"><Crop size={20} aria-hidden="true" /> Crop to the notice</h2>
            <p className="text-sm text-muted-foreground mt-1">Drag the corners or the box to frame only the notice. A closer crop is read faster and more reliably. Arrow keys also work on a focused corner.</p>
          </div>
          <button type="button" onClick={onCancel} aria-label="Cancel crop" className="border-2 border-secondary min-h-11 min-w-11 grid place-items-center hover:bg-accent"><X size={18} aria-hidden="true" /></button>
        </div>
        <div className="mt-4 grid place-items-center bg-secondary/10 p-3 select-none">
          <div className="relative inline-block max-w-full" style={{ touchAction: 'none' }} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
            <img ref={imgRef} src={src} alt="Your photo, ready to crop" onLoad={measure} draggable={false} className="block max-w-full max-h-[58vh] w-auto h-auto" />
            {rect && (
              <div
                data-testid="crop-box"
                onPointerDown={down('move')}
                className="absolute border-2 border-accent cursor-move"
                style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, boxShadow: '0 0 0 9999px hsl(var(--secondary) / 0.55)' }}
              >
                {HANDLES.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    aria-label={h.label}
                    data-testid={`crop-handle-${h.id}`}
                    onPointerDown={down(h.id)}
                    onKeyDown={key(h.id)}
                    className={`absolute h-7 w-7 bg-accent border-2 border-secondary ${h.cls}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button type="button" onClick={apply} data-testid="button-crop-apply" className="bg-primary text-primary-foreground font-bold px-5 min-h-11">Use this crop</button>
          <button type="button" onClick={() => size && setRect({ x: 0, y: 0, w: size.w, h: size.h })} data-testid="button-crop-all" className="border-2 border-secondary font-bold px-5 min-h-11 hover:bg-accent">Select whole photo</button>
          <button type="button" onClick={onCancel} data-testid="button-crop-cancel" className="border-2 border-secondary font-bold px-5 min-h-11">Cancel</button>
        </div>
      </div>
    </div>
  );
}
