import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MIN_CROP, clampRect, displayToNatural, dragRect, targetSize } from './image-prep';

test('crop rectangles stay inside the image and keep a minimum size', () => {
  assert.deepEqual(clampRect({ x: -20, y: -5, w: 100, h: 100 }, 300, 200), { x: 0, y: 0, w: 100, h: 100 });
  assert.deepEqual(clampRect({ x: 280, y: 190, w: 100, h: 100 }, 300, 200), { x: 200, y: 100, w: 100, h: 100 });
  assert.equal(clampRect({ x: 10, y: 10, w: 3, h: 3 }, 300, 200).w, MIN_CROP);
  assert.equal(clampRect({ x: 0, y: 0, w: 900, h: 900 }, 300, 200).w, 300);
});

test('dragging a corner resizes, dragging the body moves, both stay in bounds', () => {
  const start = { x: 50, y: 50, w: 100, h: 100 };
  assert.deepEqual(dragRect(start, 'se', 30, 20, 400, 300), { x: 50, y: 50, w: 130, h: 120 });
  assert.deepEqual(dragRect(start, 'nw', 10, 10, 400, 300), { x: 60, y: 60, w: 90, h: 90 });
  assert.deepEqual(dragRect(start, 'move', 1000, 1000, 400, 300), { x: 300, y: 200, w: 100, h: 100 });
  assert.equal(dragRect(start, 'se', -500, -500, 400, 300).w, MIN_CROP);
  const nw = dragRect(start, 'nw', 500, 500, 400, 300);
  assert.ok(nw.w >= MIN_CROP && nw.x + nw.w <= 400);
});

test('display coordinates map to natural pixels at the right scale', () => {
  assert.deepEqual(displayToNatural({ x: 10, y: 20, w: 100, h: 50 }, 4, 4000, 3000), { x: 40, y: 80, w: 400, h: 200 });
  const edge = displayToNatural({ x: 990, y: 740, w: 10, h: 10 }, 4, 4000, 3000);
  assert.ok(edge.x + edge.w <= 4000 && edge.y + edge.h <= 3000);
});

test('output keeps small text readable: long side 2000, never upscaled', () => {
  assert.deepEqual(targetSize(4032, 3024), { w: 2000, h: 1500 });
  assert.deepEqual(targetSize(800, 600), { w: 800, h: 600 });
  assert.deepEqual(targetSize(900, 3000), { w: 600, h: 2000 });
});

import { cleanOcrText } from './ocr';

test('OCR text is normalized and bounded', () => {
  assert.equal(cleanOcrText('  Son   Başvuru:\t27 Ekim 2026 \r\n\r\n\r\n\r\nSalon B  '), 'Son Başvuru: 27 Ekim 2026\n\nSalon B');
  assert.equal(cleanOcrText('x'.repeat(9000)).length, 6000);
});
