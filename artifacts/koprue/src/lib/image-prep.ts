export interface Rect { x: number; y: number; w: number; h: number }

export const MIN_CROP = 40;
/** Long side of the uploaded image. Large enough to keep small print readable, small enough to upload quickly. */
export const MAX_SIDE = 2000;
export const JPEG_QUALITY = 0.88;

export function clampRect(r: Rect, width: number, height: number, min = MIN_CROP): Rect {
  const w = Math.min(Math.max(r.w, Math.min(min, width)), width);
  const h = Math.min(Math.max(r.h, Math.min(min, height)), height);
  return { x: Math.min(Math.max(r.x, 0), width - w), y: Math.min(Math.max(r.y, 0), height - h), w, h };
}

/** Convert a rectangle in displayed pixels to natural image pixels. */
export function displayToNatural(r: Rect, scale: number, naturalW: number, naturalH: number): Rect {
  const x = Math.round(r.x * scale);
  const y = Math.round(r.y * scale);
  return clampRect({ x, y, w: Math.round(r.w * scale), h: Math.round(r.h * scale) }, naturalW, naturalH, 1);
}

/** Output size: never upscales, long side capped at maxSide. */
export function targetSize(w: number, h: number, maxSide = MAX_SIDE): { w: number; h: number } {
  const scale = Math.min(1, maxSide / Math.max(w, h));
  return { w: Math.max(1, Math.round(w * scale)), h: Math.max(1, Math.round(h * scale)) };
}

export type Handle = 'move' | 'nw' | 'ne' | 'sw' | 'se';

/** Apply a pointer drag (dx, dy in displayed pixels) to a crop rectangle. */
export function dragRect(start: Rect, handle: Handle, dx: number, dy: number, width: number, height: number): Rect {
  let { x, y, w, h } = start;
  if (handle === 'move') return clampRect({ x: x + dx, y: y + dy, w, h }, width, height);
  if (handle === 'nw' || handle === 'sw') { x += dx; w -= dx; }
  if (handle === 'ne' || handle === 'se') { w += dx; }
  if (handle === 'nw' || handle === 'ne') { y += dy; h -= dy; }
  if (handle === 'sw' || handle === 'se') { h += dy; }
  if (w < MIN_CROP) { if (handle === 'nw' || handle === 'sw') x -= MIN_CROP - w; w = MIN_CROP; }
  if (h < MIN_CROP) { if (handle === 'nw' || handle === 'ne') y -= MIN_CROP - h; h = MIN_CROP; }
  return clampRect({ x, y, w, h }, width, height);
}

/** Load an image file. The browser applies the photo's EXIF orientation when it draws the image. */
export function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image-load-failed')); };
    img.src = url;
  });
}

/** Draw the image (or a crop of it, in natural pixels) to a JPEG data URL. */
export function renderJpeg(img: HTMLImageElement, crop?: Rect | null): string {
  const sx = crop?.x ?? 0;
  const sy = crop?.y ?? 0;
  const sw = crop?.w ?? img.naturalWidth;
  const sh = crop?.h ?? img.naturalHeight;
  const { w, h } = targetSize(sw, sh);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no-canvas');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}
