---
name: KÖPRÜ trust and action-feature decisions
description: Non-obvious rules for evidence, calendar and Ask features
---
- Evidence is computed only on the server (api-server evidence.ts); the web app never re-verifies. Sample items are hardcoded "verified" and a test guards that quotes are real substrings.
- Calendar events are dropped server-side unless the cited quote contains the day number; unsupported times are blanked (all-day), never guessed. Missing years are shown as MM-DD and the UI asks the user to confirm.
- Ask is stateless: the source is resent per question, nothing logged or stored. Prompt forbids inferring yes/no rules from related facts (inconsistent across languages before this).
**Why:** user requires "do not invent dates", verified/unverified/AI-extracted distinctions, no server retention.
**How to apply:** keep these invariants when changing prompts or schemas.
