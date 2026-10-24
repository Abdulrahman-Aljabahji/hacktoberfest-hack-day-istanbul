import { test } from "node:test";
import assert from "node:assert/strict";
import { quoteHasNumber } from "./evidence";
import { parseAnswer, validateEvent } from "./interpret";

const ev = (o: Record<string, string>) => ({ title: "t", kind: "event", date: "10-29", time: "", endTime: "", location: "", source: "", ...o });

test("quoteHasNumber matches whole numbers only, including Arabic-Indic digits", () => {
  assert.ok(quoteHasNumber("28 Ekim saat 15.00", 28));
  assert.ok(quoteHasNumber("28 Ekim saat 15.00", 15));
  assert.ok(!quoteHasNumber("28 Ekim saat 15.00", 2));
  assert.ok(!quoteHasNumber("28 Ekim saat 15.00", 5));
  assert.ok(quoteHasNumber("٢٨ أكتوبر", 28));
  assert.ok(quoteHasNumber("5 Ekim", 5));
});

test("an event with a supported date is kept; the year stays unknown when not stated", () => {
  const e = validateEvent(ev({ date: "10-29", time: "14:00", source: "Atölye 29 Ekim saat 14.00'te", location: "Salon 2" }));
  assert.equal(e?.date, "10-29");
  assert.equal(e?.time, "14:00");
  assert.equal(e?.kind, "event");
});

test("a date that is not in the cited quote is rejected (not invented)", () => {
  assert.equal(validateEvent(ev({ date: "10-30", source: "Atölye 29 Ekim saat 14.00'te" })), null);
  assert.equal(validateEvent(ev({ date: "10-29", source: "" })), null);
});

test("impossible or malformed dates are rejected", () => {
  assert.equal(validateEvent(ev({ date: "02-30", source: "30 Şubat" })), null);
  assert.equal(validateEvent(ev({ date: "13-01", source: "1 Ocak" })), null);
  assert.equal(validateEvent(ev({ date: "tomorrow", source: "yarın 3" })), null);
});

test("a time that the quote does not support is dropped, not guessed", () => {
  const e = validateEvent(ev({ date: "10-29", time: "09:00", source: "29 Ekim saat 14.00'te" }));
  assert.equal(e?.time, "");
  assert.equal(e?.endTime, "");
});

test("12-hour quotes support 24-hour times; end time needs its own support", () => {
  const e = validateEvent(ev({ date: "2026-10-29", time: "15:00", endTime: "17:30", source: "29 October, 3 PM" }));
  assert.equal(e?.time, "15:00");
  assert.equal(e?.endTime, "");
  assert.equal(e?.date, "2026-10-29");
});

test("deadline and event kinds stay separate", () => {
  const plan = parseAnswer(JSON.stringify({
    headline: "h", summary: "s", sourceLang: "tr-TR", steps: [], facts: [], phrase: {}, caution: "",
    events: [
      { title: "Register", kind: "deadline", date: "10-28", time: "15:00", endTime: "", location: "", source: "28 Ekim saat 15.00'e kadar" },
      { title: "Workshop", kind: "event", date: "10-29", time: "14:00", endTime: "", location: "Salon 2", source: "29 Ekim saat 14.00'te" },
      { title: "Invented", kind: "event", date: "11-05", time: "", endTime: "", location: "", source: "29 Ekim" },
    ],
    requirements: [{ text: "Bring ID", source: "Kimliğinizi" }],
    missing: ["No price stated", ""],
  }));
  assert.deepEqual(plan.events.map((e) => e.kind), ["deadline", "event"]);
  assert.equal(plan.requirements.length, 1);
  assert.deepEqual(plan.missing, ["No price stated"]);
});

test("plans without the new fields still parse with empty lists", () => {
  const plan = parseAnswer(JSON.stringify({ headline: "h", steps: [], facts: [] }));
  assert.deepEqual([plan.events, plan.requirements, plan.missing], [[], [], []]);
});

test("a year stated in the quote is recovered when the model omits it, but never guessed", () => {
  const base = { title: "x", kind: "deadline", time: "", endTime: "", location: "" };
  assert.equal(validateEvent({ ...base, date: "10-27", source: "Son Başvuru: 27 Ekim 2026" })?.date, "2026-10-27");
  assert.equal(validateEvent({ ...base, date: "10-27", source: "Son Başvuru: 27 Ekim" })?.date, "10-27");
  assert.equal(validateEvent({ ...base, date: "10-27", source: "27 Ekim 2026 veya 2027" })?.date, "10-27");
});
