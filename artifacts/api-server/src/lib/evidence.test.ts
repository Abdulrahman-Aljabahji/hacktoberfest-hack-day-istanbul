import { test } from "node:test";
import assert from "node:assert/strict";
import { checkQuote, normalizeForMatch } from "./evidence";

const SOURCE = `DUYURU: ÜCRETSİZ YAPAY ZEKA VE YAZILIM ATÖLYESİ
Kayıt için 27 Ekim saat 17.00’ye kadar formu doldurunuz.
Atölye  28 Ekim\tÇarşamba günü saat 14.00–16.30 arasında yapılacaktır.`;

test("a quote copied from the text is verified", () => {
  assert.equal(checkQuote("Kayıt için 27 Ekim saat 17.00’ye kadar formu doldurunuz.", SOURCE, false), "verified");
});

test("a quote that does not exist in the text is unverified", () => {
  assert.equal(checkQuote("Katılım ücreti 500 liradır.", SOURCE, false), "unverified");
});

test("whitespace, case, curly apostrophes and dash differences still verify", () => {
  assert.equal(checkQuote("atölye 28 ekim çarşamba   günü", SOURCE, false), "verified");
  assert.equal(checkQuote("saat 17.00'ye kadar", SOURCE, false), "verified");
  assert.equal(checkQuote("14.00-16.30 arasında", SOURCE, false), "verified");
});

test("empty or whitespace-only evidence is reported as none", () => {
  assert.equal(checkQuote("", SOURCE, false), "none");
  assert.equal(checkQuote("   \n ", SOURCE, false), "none");
  assert.equal(checkQuote("", null, true), "none");
});

test("quotes that are too short to prove anything are not verified", () => {
  assert.equal(checkQuote("27", SOURCE, false), "unverified");
});

test("image input is never marked verified without text to check against", () => {
  assert.equal(checkQuote("Son Başvuru: 27 Ekim 2026", null, true), "ai-extracted");
  assert.equal(checkQuote("Son Başvuru: 27 Ekim 2026", "", true), "ai-extracted");
});

test("no source text and no image cannot verify anything", () => {
  assert.equal(checkQuote("Kayıt için", null, false), "unverified");
});

test("conservative matching: dotless ı is not folded into i, and words are not dropped", () => {
  assert.equal(checkQuote("kızlar", "KIZLAR toplandı", false), "unverified");
  assert.equal(checkQuote("kayıt formu", "Kayit formu", false), "unverified");
  assert.equal(checkQuote("Kayıt formu doldurunuz", "Kayıt için formu doldurunuz", false), "unverified");
});

test("normalizeForMatch is idempotent", () => {
  const once = normalizeForMatch(SOURCE);
  assert.equal(normalizeForMatch(once), once);
});
