# KÖPRÜ — judge demo, 90 seconds

**00:00–00:12 — The tension**

"We live among instructions: Turkish office signs, school announcements, medical leaflets, forms. Translation gives us words; it doesn't always give us clarity."

**00:12–00:26 — The reveal**

"KÖPRÜ turns anything you see into an interface you can act on. Watch this Turkish coding-workshop notice." Click **Experience a live example**. Clearly identify this as a curated offline demo.

**00:26–00:45 — Transformation**

"The original is dense. The result tells me what to do: fill out the form, bring my ID and laptop, go to Room 2. Dates and place are elevated. It's not a chat log; it's a task interface."

**00:45–01:00 — Multilingual and grounded**

Switch **English → العربية**. Tap **View original wording** on a task or fact to show the exact evidence. Mention AI quotes can be imperfect and should be verified.

**01:00–01:12 — Action in the real world**

Tap **Speak** on the say-it card. "It gives me the Turkish sentence I can actually use with the person behind the counter."

**01:12–01:30 — Technical depth**

"The live mode sends an image or text to Google's hosted open-weight Gemma 4 26B A4B model. Our original contribution is prompt-to-structured-action orchestration and an accessible, multilingual experience. We keep the API key on the server, publish the complete app under MIT, and show evidence rather than pretending certainty."

If a Gemma API key has been configured and tested, optionally show the live custom input. If not, **don't claim the sample used live AI**.

# What the judges might ask

- **What is original?** Real-world input → intent-preserving structured action schema → multilingual UX with evidence chips and a say-it phrase, not plain translation.
- **Where is open source?** Public MIT repository with server, prompts, frontend, documentation, tests.
- **Is Gemma open source?** It is an *open-weight* model under its own terms; our app code uses MIT. Avoid saying Gemma's weights are MIT.
- **How do you avoid hallucinations?** Strict source-fidelity prompting, exact source quotes, visible uncertainty and transparent errors; these reduce, but do not eliminate, mistakes.
- **Why multilingual?** The Istanbul context includes Turkish, Arabic and English speakers; the organizer's registration lists all three languages.
- **What about privacy?** No persistent storage in the prototype, but uploaded content goes to Google's API. Avoid sensitive documents. Production requires a privacy assessment and abuse protections.

# Ship checklist

- [ ] Replace placeholder GitHub link with your real repo link in `public/index.html`.
- [ ] Configure a Gemini API key server-side and verify one text request and one image request.
- [ ] Test on a phone and with keyboard only.
- [ ] Never show curated sample mode as live AI.
- [ ] Create a public repository; verify MIT license and README.
- [ ] Deploy the Node server where environment secrets can be stored.
- [ ] Add screenshots and 60–90 second demo video.
- [ ] Confirm the correct submission form/track(s) with the on-site organizer; the event's category detail pages currently say "Submissions aren't open" while the main page lists a 6:30 PM deadline.
- [ ] Submit before 6:30 PM Istanbul time (or earlier if the host specifies).
