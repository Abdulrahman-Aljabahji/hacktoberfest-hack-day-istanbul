# KÖPRÜ · Make sense of the world

**An open-source, human-first AI prototype for Hacktoberfest Hack Day Istanbul × Hadith Tech (2026).**

Take a photo of a confusing sign or notice. KÖPRÜ converts it into an **actionable mini-interface** in English, Arabic, or Turkish, with original-language evidence quotes and a phrase you can say out loud.

This is not a generic translation chatbot. It is an interface generated from the intent and obligations contained in real-world information.

## What's working

- Beautiful responsive single-page product experience (desktop and mobile).
- Offline illustrated demo using an **explicitly fictional** Turkish coding-workshop notice, in English, Arabic, and Turkish.
- Upload JPG/PNG/WebP images or paste text. A server-side request sends it to **Gemma 4 26B A4B** through the Gemini API.
- Outputs summarized context, important facts, an actionable checklist, supporting verbatim evidence quotes, a useful phrase and uncertainty notices.
- Evidence buttons display the original quote, so the app doesn't silently fabricate confidence.
- Browser-native text-to-speech and copy-to-clipboard on the say-it card.
- No frontend API key, no database, no npm dependencies, no login.

## Run locally

Requires **Node.js 20+**.

```bash
npm start
```

Open **http://localhost:3000**. The demo works immediately, without an API key.

For live Gemma 4 analysis, create `.env` from `.env.example` and enter a key from [Google AI Studio](https://aistudio.google.com/apikey):

```env
GEMINI_API_KEY=your_actual_key
PORT=3000
```

Then restart `npm start`. No `npm install` is required. On supported Node versions you can also launch `node server.mjs`.

## How it works

```text
User photo / pasted notice
  ↓
Tiny Node HTTP server
  ↓
Google Gemini API hosting open-weight gemma-4-26b-a4b-it
  ↓
Prompt for source-grounded structured JSON
  ↓
Safe parser and HTML escaping
  ↓
Facts + next steps + evidence quotes + phrase card
```

**Model ID:** `gemma-4-26b-a4b-it`. The Gemma model is open-weight, and this application source code is MIT-licensed; the weights are subject to Google's Gemma terms. See [Google's official Gemma on Gemini API guide](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api).

## Test

```bash
npm test
```

## Hack-day plan

1. **Verify live model** (first): set API key; paste the sample Turkish text in live mode and confirm it returns useful grounded JSON. Then upload a photo.
2. **Validate UX**: let two people try the sample unaided; fix the confusing points.
3. **Improve grounding**: display exact source quotes, test ambiguity, avoid invented dates and links.
4. **Polish**: test narrow mobile screen, keyboard navigation and screen reader labels.
5. **Deploy and submit**: push public repository with MIT license, add screenshots and a short demo recording, deploy Node server to a provider of your choice, and submit under both eligible challenges before the organizer's deadline.

## Privacy, limitations and responsible use

- **Uploads are sent to the Gemini API for live inference.** Do not upload IDs, personal medical records, private forms or other sensitive documents. No user files are deliberately stored by this app; cloud-provider processing applies.
- The demo notice is fictional and not a real event. Offline sample mode does not call AI; please label it as such in judging.
- Generated evidence quotes can be imperfect or inaccurate. Users must verify important facts from originals. This prototype is not legal, medical, immigration or government advice.
- Visual image-region bounding boxes are **not implemented**. Evidence is text excerpts, not true visual localization.
- Speech is provided by the browser, so voice availability and quality vary by device.
- Tested model responses may vary; a malformed response yields a transparent error instead of a misleading result.
- No production authentication, abuse prevention, persistent storage or rate limits are included in this hack-day starter. Add these before public deployment.

## Submission pitch

**Project** KÖPRÜ — Point. Understand. Act.

**Problem:** People encounter signs, notices and bureaucratic language they can technically translate but still do not know how to act on, particularly across Turkish, Arabic and English.

**Solution:** AI turns a photo into a task-focused, multilingual, evidence-backed interface. Instead of a wall of translated text, it generates the next steps, deadlines, things to bring, and a helpful phrase to speak aloud.

**Tech:** Vanilla JavaScript, accessible HTML, modern CSS, native Node.js HTTP server, open-weight Gemma 4 26B A4B through Google Gemini API. MIT license.

## License

MIT · See [LICENSE](./LICENSE)

## Continue building with Codex

The project includes instructions tuned for a coding agent:

1. Read [`AGENTS.md`](./AGENTS.md) for guardrails and architecture.
2. Give Codex [`CODEX_FIRST_TASK.md`](./CODEX_FIRST_TASK.md) as its first implementation assignment.
3. Run `npm test` and `npm start`, then verify the curated offline sample.
4. Use `.env.example` only as a reference; never commit `.env`.

Codex CLI quick start from this directory:

```bash
npm install -g @openai/codex
codex
```

Then ask Codex to implement `CODEX_FIRST_TASK.md` while following `AGENTS.md`.
