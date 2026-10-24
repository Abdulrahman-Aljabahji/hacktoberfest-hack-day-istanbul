# KÖPRÜ

**Point. Understand. Act.**

KÖPRÜ ("bridge" in Turkish) turns a photo or pasted text of a confusing notice into a clear action plan in English, Arabic or Turkish. Translation alone does not tell you what to do next, so KÖPRÜ extracts the steps, the key facts and a phrase you can say aloud.

Built for Hacktoberfest Hack Day Istanbul x Hadith Tech 2026.

## What it does

- Take a photo of a notice, upload an image, or paste text
- Get a mini-interface in English, Arabic (right-to-left) or Turkish
- Next steps, key facts, a caution when the model is unsure, and a say-it-aloud phrase with text-to-speech
- Every step and fact links to the verbatim original wording, so claims can be checked
- An offline, clearly labelled fictional sample works without any AI

## Built on Gemma 4

The API server calls the open-weight `gemma-4-26b-a4b-it` model through the Gemini API. The model is multimodal, so it reads photos directly. Its output is requested as structured JSON, then validated and length-capped on the server before it reaches the UI.

## Project layout

| Path | What it is |
| --- | --- |
| `artifacts/koprue` | React + Vite web app (3D bridge hero, workbench, result view) |
| `artifacts/api-server` | Express API: `POST /api/interpret`, `GET /api/interpret/status` |
| `artifacts/koprue-deck` | Pitch deck |
| `lib/api-spec` | OpenAPI spec |
| `lib/api-zod`, `lib/api-client-react` | Generated validation schemas and API client |

## Run it

Requirements: Node.js, pnpm, and a Gemini API key.

```bash
pnpm install
export GEMINI_API_KEY=your_key_here
# API server (needs a PORT)
PORT=8080 pnpm --filter @workspace/api-server run dev
# Web app (needs PORT and BASE_PATH)
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/koprue run dev
```

Without `GEMINI_API_KEY`, the interactive sample still works and live analysis reports that it is not configured.

## Responsible by design

- Evidence quotes for every step and fact
- An uncertainty notice is always visible when the model is unsure
- The offline sample is labelled fictional and uses no AI
- Not legal, medical or government advice
- The API is rate limited per IP (12 requests per minute) to protect the key
- Uploads go to the Gemini API: do not upload IDs or private documents

## License

MIT. See [LICENSE](LICENSE).

## Link 

https://kopru-hackathon.replit.app/
