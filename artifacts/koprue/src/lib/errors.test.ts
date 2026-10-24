import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeFailure, describeFileProblem } from './errors';

const api = (status: number, code?: string) => ({ status, data: code ? { error: 'internal detail', code } : null });

test('each API error code maps to a distinct, actionable message', () => {
  const codes = ['invalid_image', 'image_too_large', 'timeout', 'upstream_unavailable', 'rate_limited', 'quota_exceeded', 'not_configured', 'bad_model_response', 'invalid_request', 'server_error'];
  for (const c of codes) {
    const f = describeFailure(api(500, c));
    assert.ok(f.title.length > 5 && f.body.length > 20, c);
  }
  assert.equal(describeFailure(api(400, 'invalid_image')).kind, 'bad_image');
  assert.equal(describeFailure(api(413, 'image_too_large')).kind, 'too_large');
  assert.equal(describeFailure(api(504, 'timeout')).kind, 'timeout');
  assert.equal(describeFailure(api(429, 'quota_exceeded')).kind, 'busy');
  assert.equal(describeFailure(api(429, 'rate_limited')).kind, 'busy');
  assert.equal(describeFailure(api(503, 'not_configured')).kind, 'not_configured');
  assert.equal(describeFailure(api(502, 'bad_model_response')).kind, 'bad_answer');
});

test('retry is only offered when repeating the same request can help', () => {
  assert.equal(describeFailure(api(400, 'invalid_image')).retry, false);
  assert.equal(describeFailure(api(413, 'image_too_large')).retry, false);
  assert.equal(describeFailure(api(503, 'not_configured')).retry, false);
  assert.equal(describeFailure(api(504, 'timeout')).retry, true);
  assert.equal(describeFailure(api(502, 'bad_model_response')).retry, true);
});

test('failures without a body fall back on the HTTP status', () => {
  assert.equal(describeFailure({ status: 413, data: null }).kind, 'too_large');
  assert.equal(describeFailure({ status: 429, data: null }).kind, 'busy');
  assert.equal(describeFailure({ status: 504, data: null }).kind, 'timeout');
});

test('a thrown network error (no HTTP status) is reported as a connection problem', () => {
  assert.equal(describeFailure(new TypeError('Failed to fetch')).kind, 'network');
});

test('messages never leak raw server text, stack traces or keys', () => {
  const f = describeFailure({ status: 500, data: { error: 'AIza-secret at /srv/app.js:10 stack', code: 'server_error' } });
  const text = `${f.title} ${f.body}`;
  assert.ok(!/AIza|secret|stack|\.js/.test(text));
});

test('file problems are caught before upload with a next step', () => {
  const MAX = 25 * 1024 * 1024;
  assert.match(describeFileProblem({ type: 'application/pdf', size: 10 }, MAX) ?? '', /JPG, PNG or WebP/);
  assert.match(describeFileProblem({ type: 'image/heic', size: 10 }, MAX) ?? '', /HEIC/);
  assert.match(describeFileProblem({ type: 'image/jpeg', size: MAX + 1 }, MAX) ?? '', /25 MB/);
  assert.equal(describeFileProblem({ type: 'image/png', size: 1000 }, MAX), null);
});
