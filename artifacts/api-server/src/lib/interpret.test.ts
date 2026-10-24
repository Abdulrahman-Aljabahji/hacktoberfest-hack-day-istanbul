import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { HttpError, annotatePlan, interpret, parseAnswer, upstreamError } from "./interpret";

const TEXT = "Kayıt için 27 Ekim saat 17.00'ye kadar formu doldurunuz. Salon B zemin kat.";

const goodModelJson = JSON.stringify({
  headline: "Register this week",
  sourceLang: "tr-TR",
  summary: "Fill in the form before the deadline.",
  steps: [
    { title: "Fill in the form", detail: "Before Oct 27, 17:00", source: "Kayıt için 27 Ekim saat 17.00'ye kadar formu doldurunuz." },
    { title: "Invented step", detail: "Not in the notice", source: "Ücret 500 liradır." },
    { title: "No quote", detail: "Model gave none", source: "" },
  ],
  facts: [{ label: "Place", value: "Hall B, ground floor", source: "Salon B zemin kat" }],
  phrase: { native: "Merhaba", meaning: "Hello" },
  caution: "",
});

const realFetch = globalThis.fetch;
beforeEach(() => { process.env["GEMINI_API_KEY"] = "test-key"; });
afterEach(() => { globalThis.fetch = realFetch; });

function stubFetch(impl: () => Promise<Response> | Response) {
  globalThis.fetch = (async () => impl()) as typeof fetch;
}
function modelReply(text: string) {
  return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), { status: 200 });
}
async function failureOf(p: Promise<unknown>): Promise<HttpError> {
  try { await p; } catch (e) { assert.ok(e instanceof HttpError, `expected HttpError, got ${String(e)}`); return e; }
  assert.fail("expected the call to fail");
}

test("text input: evidence is verified, unverified or none per item", async () => {
  stubFetch(() => modelReply(goodModelJson));
  const plan = await interpret({ lang: "en", text: TEXT });
  assert.deepEqual(plan.steps.map((s) => s.evidence), ["verified", "unverified", "none"]);
  assert.equal(plan.facts[0]?.evidence, "verified");
});

test("image input: quotes are labelled ai-extracted, never verified", async () => {
  stubFetch(() => modelReply(goodModelJson));
  const plan = await interpret({ lang: "en", image: "data:image/jpeg;base64,AAAA" });
  assert.deepEqual(plan.steps.map((s) => s.evidence), ["ai-extracted", "ai-extracted", "none"]);
  assert.equal(plan.facts[0]?.evidence, "ai-extracted");
});

test("annotatePlan tags every item", () => {
  const parsed = parseAnswer(goodModelJson);
  const plan = annotatePlan(parsed, { sourceText: TEXT, hasImage: false });
  assert.ok([...plan.steps, ...plan.facts].every((i) => typeof i.evidence === "string"));
});

test("model returning prose or broken JSON becomes bad_model_response", async () => {
  stubFetch(() => modelReply("Sorry, I cannot help with that."));
  assert.equal((await failureOf(interpret({ lang: "en", text: TEXT }))).code, "bad_model_response");
  stubFetch(() => modelReply("{ not valid json"));
  assert.equal((await failureOf(interpret({ lang: "en", text: TEXT }))).code, "bad_model_response");
});

test("empty model answer becomes bad_model_response", async () => {
  stubFetch(() => new Response(JSON.stringify({ candidates: [] }), { status: 200 }));
  const e = await failureOf(interpret({ lang: "en", text: TEXT }));
  assert.equal(e.code, "bad_model_response");
  assert.equal(e.status, 502);
});

test("upstream status codes map to safe error codes", () => {
  assert.equal(upstreamError(429, false).code, "quota_exceeded");
  assert.equal(upstreamError(429, false).status, 429);
  assert.equal(upstreamError(401, false).code, "not_configured");
  assert.equal(upstreamError(403, false).code, "not_configured");
  assert.equal(upstreamError(400, true).code, "invalid_image");
  assert.equal(upstreamError(400, false).code, "upstream_unavailable");
  assert.equal(upstreamError(504, false).code, "timeout");
  assert.equal(upstreamError(500, false).code, "upstream_unavailable");
});

test("upstream 429 and 5xx responses surface as coded errors without upstream details", async () => {
  stubFetch(() => new Response(JSON.stringify({ error: { message: "secret quota detail key=abc" } }), { status: 429 }));
  const quota = await failureOf(interpret({ lang: "en", text: TEXT }));
  assert.equal(quota.code, "quota_exceeded");
  assert.ok(!quota.message.includes("secret"));
  stubFetch(() => new Response("oops", { status: 503 }));
  assert.equal((await failureOf(interpret({ lang: "en", text: TEXT }))).code, "upstream_unavailable");
});

test("network failure becomes upstream_unavailable and a timeout becomes timeout", async () => {
  stubFetch(() => { throw new TypeError("fetch failed"); });
  assert.equal((await failureOf(interpret({ lang: "en", text: TEXT }))).code, "upstream_unavailable");
  stubFetch(() => { const e = new Error("t"); e.name = "TimeoutError"; throw e; });
  assert.equal((await failureOf(interpret({ lang: "en", text: TEXT }))).code, "timeout");
});

test("missing API key is not_configured", async () => {
  delete process.env["GEMINI_API_KEY"];
  assert.equal((await failureOf(interpret({ lang: "en", text: TEXT }))).code, "not_configured");
});

test("bad input is rejected before calling the model", async () => {
  stubFetch(() => assert.fail("model must not be called"));
  assert.equal((await failureOf(interpret({ lang: "en" }))).code, "invalid_request");
  assert.equal((await failureOf(interpret({ lang: "en", image: "data:image/gif;base64,AAAA" }))).code, "invalid_image");
  const huge = "A".repeat(Math.ceil((4 * 1024 * 1024 + 10) * 4 / 3));
  assert.equal((await failureOf(interpret({ lang: "en", image: `data:image/jpeg;base64,${huge}` }))).code, "image_too_large");
});
