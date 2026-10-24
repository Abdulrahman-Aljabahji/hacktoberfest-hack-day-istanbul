# First Codex task: make KÖPRÜ demo-worthy

## Mission

Take the existing KÖPRÜ starter and improve it into a striking, credible, accessible hackathon demo. This is an implementation task, not a plan-only task. Make focused code edits and tests, and leave the app runnable with `npm start` and `npm test` without an API key.

### P0 — honest, dependable experience (must complete)

1. Rename any sample CTA that implies live AI (e.g. "Experience a live example") to "Explore the interactive sample" or equivalent; keep a visible "fictional / offline demo" indicator before and after clicking.
2. Prevent stale/out-of-order network responses when people switch languages rapidly or submit a second notice. Ensure the latest request owns the rendered result; abort earlier fetches when possible.
3. Strengthen `parseAnswer` validation and tests: empty/unexpected values, malformed JSON, suspiciously long fields, unknown source languages, and steps/facts count caps. Keep warnings visible when grounding is uncertain.
4. Handle upload errors and server-side errors gracefully without breaking the sample. Do not reveal API keys or internal exception details to end users.
5. Add a visible way to reset to the sample and change languages from the result section, with keyboard and screen-reader support.

### P1 — memorable mobile-first interaction (complete after P0)

6. Upgrade the input flow on phones: offer a "Take photo" option using device camera input (with a fallback file picker), and a clear paste-text option; preserve desktop drag/drop.
7. Improve the transformation moment: transition from source to result with restrained tasteful motion, useful skeleton/loading state and readable step cards. Honor `prefers-reduced-motion`.
8. Polish Arabic RTL throughout dynamic result components. Let original Turkish quotations render with `dir="auto"` and appropriate `lang` attributes. Don't force all original-source text to RTL.
9. Make keyboard focus and error messages obvious. Test at 360px, 768px, and 1440px when possible; avoid horizontal overflow.

### P2 — distinctive utility (only if time permits)

10. Add a "Copy action plan" button that exports plain text **with the caution/uncertainty text and note that quotes must be verified**. No fabricated URLs, reminders or calendar entries.
11. Add low-risk empty-state and failure demos so judges can see responsible model behavior.
12. Add a high-level 60-second README demo GIF/screenshot placeholder *only if real assets are captured*; never invent screenshots.

## Acceptance criteria

- `npm start` serves the landing page and a working offline sample without a key.
- `npm test` passes; add meaningful tests of parser behavior and request concurrency logic where practical.
- No credentials or generated/private content committed.
- Original Turkish source, results, and evidence excerpts remain clear and legible in English, Turkish and Arabic.
- Claims about live Gemma inference are conditional on a live test with a valid key.
- Page makes it impossible to confuse the curated offline sample with live AI.
- Existing server endpoint contract `{ plan, mode }` and request `{ lang, image, text }` remain compatible unless there's a compelling documented reason to change.
- Update `README.md` and `DEMO_SCRIPT.md` for actual implemented behavior.

## Demo to rehearse

Start offline → choose sample → three action cards with dates and requirements → switch to Arabic → open original Turkish evidence → use the phrase speech button → explain optional live upload and privacy notice. If live Gemma is verified, add a real image analysis at the end; otherwise explicitly say the offline sample is a curated demonstration.

## How Codex should respond when done

Summarize files changed, what is truly working, tests/run commands and results, blockers to live inference, and the next top-priority task. Include no unverifiable claims.
