## 1. Project scaffolding

- [x] 1.1 Initialize a Next.js (App Router) + TypeScript project in the repo root
- [x] 1.2 Add an OpenAI-compatible client (for OpenRouter) and a YAML frontmatter parser as dependencies
- [x] 1.3 Add `.env` handling for `OPENROUTER_API_KEY` (filled in by the user later) and a configurable `MODEL_ID` defaulting to `openai/gpt-4o-mini`; provide a `.env.example`; document both in the README; ensure `.env*` (except `.env.example`) is gitignored
- [x] 1.4 Verify a clean dev server boot (`npm run dev`) renders a placeholder page

## 2. Content pack format and loader

- [x] 2.1 Define the entity frontmatter schema (`id`, `type`, `name` required; optional relation fields) and the `manifest.json` shape (`id`, `name`)
- [x] 2.2 Implement a loader that scans `content/*/manifest.json` to discover available pantheons
- [x] 2.3 Implement per-pantheon entity loading (parse frontmatter + prose for every entity file)
- [x] 2.4 Implement validation: required frontmatter fields present, unique `id` per pantheon, valid manifest — with errors naming the offending entity/field
- [x] 2.5 Implement "load active pantheon" returning its entities as grounding content

## 3. Greek starter content pack

- [x] 3.1 Create `content/greek/manifest.json`
- [x] 3.2 Seed structured relationship fields (`parents`, `consort`, `domain`, etc.) from Wikidata (CC0) for the core entities
- [x] 3.3 Author original prose summaries for core Olympians (e.g. Zeus, Hera, Poseidon, Demeter, Athena, Apollo, Artemis, Ares, Aphrodite, Hephaestus, Hermes, Hestia/Dionysus, Hades, Persephone) — LLM-drafted, human-reviewed for correct tradition
- [x] 3.4 Author a few foundational myth/concept entities (e.g. Titanomachy, the Persephone/seasons myth, xenia)
- [x] 3.5 Confirm the pack loads and validates with no errors

## 4. Grounded chat endpoint

- [x] 4.1 Implement the `api/chat` server route with an OpenAI-compatible client pointed at OpenRouter, reading `OPENROUTER_API_KEY` and the model id from the environment
- [x] 4.2 Build the grounded system prompt: tutor persona + injected active-pantheon content + instruction to answer only from it and to say when uncovered
- [x] 4.3 Accept the conversation history from the client and call OpenRouter with streaming enabled
- [x] 4.4 Stream tokens back to the client incrementally
- [x] 4.5 Return a clear error when the API key is missing (no silent failure)

## 5. Chat UI

- [x] 5.1 Build the chat page: message input, submit, and an ordered transcript of learner/tutor turns
- [x] 5.2 Send the full current conversation to `api/chat` and render the streamed reply progressively
- [x] 5.3 Surface endpoint errors (e.g. missing key) to the user
- [x] 5.4 Confirm no API key or secret is present in client bundles/network payloads

## 6. Verification and docs

- [x] 6.1 Manually verify: covered question answered from pack; uncovered question declined without fabrication; multi-turn follow-up understood
- [x] 6.2 Verify a new session starts with no memory of a prior session
- [x] 6.3 Verify drop-in extensibility: add a minimal second pantheon folder and confirm it is discovered on restart with no code changes
- [x] 6.4 Update README with setup (OpenRouter key + model id), running, and "how to add a pantheon" instructions
