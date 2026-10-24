import test from 'node:test';
import assert from 'node:assert/strict';
import { makePrompt, parseAnswer } from './server.mjs';

test('prompt prioritizes evidence and target language', () => {
  assert.match(makePrompt('ar'), /Arabic/);
  assert.match(makePrompt('en'), /Never invent/);
});

test('model response is parsed, clipped, and sanitized', () => {
  const value = parseAnswer('```json\n{"headline":"Ready","summary":"Test","steps":[{"title":"Bring ID","detail":"Go","source":"Kimlik"}],"facts":[],"phrase":{"native":"Merhaba","meaning":"Hello"}}\n```');
  assert.equal(value.headline, 'Ready');
  assert.equal(value.steps[0].source, 'Kimlik');
  assert.equal(value.facts.length, 0);
});
