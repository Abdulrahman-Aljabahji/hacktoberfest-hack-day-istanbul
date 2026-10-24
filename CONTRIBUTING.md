# Contributing to KÖPRÜ

KÖPRÜ is an MIT-licensed open-source, human-centered hack-day app. Contributions that improve accessibility, multilingual clarity, source fidelity, test coverage, and robust model handling are especially welcome.

## Local setup

- Install Node.js 20 or newer.
- Run `npm start` and visit http://localhost:3000 for an offline sample.
- Run `npm test` before opening a pull request.
- Optional: configure `GEMINI_API_KEY` in a local `.env` for live inference. Do not commit that file or paste keys into issues.

## Pull requests

Focus on one change, explain the intended user impact, and include evidence of tests actually run. Flag behavior that needs a live Gemma key to verify. Include accessible labels and an Arabic RTL sanity check for UI changes. Don't add fake deadlines, contact details, calendar links, promises about model accuracy, or sensitive sample documents.

## Community expectations

Be thoughtful and respectful. Avoid submitting personal records or identifiable information as test fixtures. If you find a security or privacy issue, avoid putting exploit details or personal data in a public issue; contact the project maintainers privately once the public repository is published.
