# Codex agent instructions — KÖPRÜ

You are working on KÖPRÜ ("bridge" in Turkish), a hack-day open-source product that transforms photos of real-world notices into multilingual, source-grounded action plans. Keep the project's recognizable identity and deliver a demo that works on a phone.

## Product north star

A first-time visitor must be able to understand the product, try a **clearly labeled fictional sample with no API key**, and—if configured—upload their own notice or paste text for real Gemma analysis. The result should feel like an actionable mini-app rather than a translation chatbot.

### Non-negotiables

- Never imply that a scripted/offline sample is live AI output. Name it "Explore sample" or similar.
- Do not invent dates, rules, links, addresses, eligibility, claims, source quotes, or success states. If uncertain, show uncertainty.
- Uploads may go to a third-party model API. Keep a visible consent/privacy notice; avoid saving images, PII, or text by default.
- Model credentials remain on the server in environment variables; do not add them to client code, logs, commits, screenshots, or docs. Never include `.env` in source control.
- The source code is MIT; Gemma open-weight model weights are **not** MIT-licensed. Do not conflate the two.
- Avoid adding third-party dependencies unless they add clear value and are compatible with open-source licensing. Prefer existing vanilla HTML/CSS/JS and Node 20+ setup.
- Do not redesign everything merely to satisfy a prompt. Build on the existing code and preserve working sample, text, and image flows.
- Prioritize keyboard navigation, readable contrast, meaningful labels, RTL Arabic support, focus indication, reduced-motion preferences, and responsive layouts (360px to desktop).
- Treat model output as untrusted and escape it on rendering. Never use raw model output in `innerHTML` without escaping. Handle network failures and malformed responses clearly.
- No fabricated tests, demo screenshots, deployment status, or model results. Note the limits of what you have actually verified.

## Current code map

- `server.mjs` — dependency-free Node HTTP server, Gemini API calls, response parser, static file serving.
- `server.test.mjs` — built-in `node:test` tests.
- `public/index.html` — site structure and copy.
- `public/styles.css` — dark, modern responsive design system.
- `public/app.js` — client state, sample data, language switching, upload, results, evidence and speech.
- `README.md` — install, architecture, privacy and pitch.
- `DEMO_SCRIPT.md` — 90-second judge script.
- `CODEX_FIRST_TASK.md` — your first task and acceptance criteria.

## Workflow

1. Read `README.md`, `CODEX_FIRST_TASK.md`, and relevant source files; identify any specific problem before editing.
2. Run `npm test` as a baseline and again after changes.
3. Use the smallest coherent implementation and add regression tests for any parsing, validation or API changes.
4. If a browser automation environment is available, verify 360px mobile and desktop sample flows, keyboard interaction, and Arabic RTL. Otherwise provide a manual QA checklist; never claim you ran a browser test you did not run.
5. Do not block a no-key demo on cloud API access. For Gemini live verification, only run with a user-provided server-side key and report outcomes truthfully.
6. Summarize changes, commands/tests actually run, remaining risks, and exactly how to demo.

## Time-boxed decision rule

Ship a working, distinctive product before adding optional infrastructure. Spend effort in this order: (1) working demo, (2) accuracy and safety, (3) compelling mobile UX, (4) accessibility, (5) delight and polish, (6) extra features. Avoid migrating to a framework or building accounts, databases, or complex deployment architecture during the hackathon.
