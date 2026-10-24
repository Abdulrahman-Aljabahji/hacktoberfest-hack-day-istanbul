---
name: KÖPRÜ trust and action-feature decisions
description: Non-obvious rules for evidence, calendar and Ask features
---
- Evidence is computed only on the server (api-server evidence.ts); the web app never re-verifies. Sample items are hardcoded "verified" and a test guards that quotes are real substrings.
- Calendar events are dropped server-side unless the cited quote contains the day number; unsupported times are blanked (all-day), never guessed. Missing years are shown as MM-DD and the UI asks the user to confirm.
- Ask is stateless: the source is resent per question, nothing logged or stored. Prompt forbids inferring yes/no rules from related facts (inconsistent across languages before this).
**Why:** user requires "do not invent dates", verified/unverified/AI-extracted distinctions, no server retention.
**How to apply:** keep these invariants when changing prompts or schemas.

## Photo pipeline (timeout root cause)
- gemma-4-26b-a4b-it spends a random 0-3000 "thought" tokens on photos even with thinkingLevel "minimal" (14 s vs 52-64 s for the same image). thinkingBudget and "low" are rejected by the API. Fix: photos go through a short transcription call first, then a text-only analysis call; slow calls are hedged with a second attempt (resilientCall).
- Photo quotes are checked against the AI transcript: found = ai-extracted, missing = unverified, never "verified". Ask on photos reuses the transcript (fromPhoto) and takes ~2 s.
**Why:** the production 504 was our own 45 s limit being hit by thinking tokens. **How to apply:** don't just raise timeouts; keep the model output small.
