## Why

People learning Greek mythology lack a focused, conversational study companion that answers questions consistently and honestly instead of freewheeling from a model's training. We want a simple web tutor grounded in curated content, built so additional pantheons (Norse, Egyptian, etc.) can be added later without code changes.

## What Changes

- Introduce a **web-based conversational tutor** that answers a learner's Greek mythology questions and can go deeper on follow-ups.
- Ground every answer in **curated content packs** stored as markdown-with-frontmatter files per entity under `content/<pantheon>/`, so facts stay consistent and the tutor declines to invent details not present in the pack.
- Make pantheons **drop-in extensible**: adding a new pantheon means adding a `content/<pantheon>/` folder following the same schema and registering it in a manifest — no code changes.
- Load the active pantheon's content directly into the model's system prompt (no retrieval/RAG initially), which is sufficient while a pantheon's core content stays small.
- Route model requests through **OpenRouter** (an OpenAI-compatible gateway), so the model is a swappable config string. Keep the API key **server-side only**; the browser never sees it. Responses **stream** to the UI.
- Ship an initial **Greek starter pack** (core Olympians plus a few foundational myths) so the tutor is usable immediately. Content is **original prose we author** (clean licensing) with structured relationship fields seeded from **Wikidata (CC0)**.
- Explicitly out of scope for now: cross-session progress tracking, quizzing/spaced repetition, and retrieval — the content schema is designed to accommodate them later.

## Capabilities

### New Capabilities
- `content-packs`: The curated content pack format (markdown + frontmatter per entity), pantheon manifest, loading of an active pantheon, and the drop-in extensibility contract for new pantheons.
- `tutor-conversation`: The grounded conversational tutoring behavior — answering from pack content, declining to fabricate uncovered facts, handling multi-turn follow-ups, and stateless (no persistence) operation.
- `web-chat-interface`: The browser chat UI and the server-side API route that holds the Anthropic key, assembles the grounded prompt, and streams model responses.

### Modified Capabilities
<!-- None: greenfield project. -->

## Impact

- New project scaffolding: Next.js + TypeScript app (chat UI, `api/chat` route, content-loading library).
- New dependency on an OpenAI-compatible client targeting OpenRouter and a server-side `OPENROUTER_API_KEY` environment variable, plus a configurable model id.
- New `content/` directory as authored, versioned data (starting with `content/greek/`): original prose summaries; relationship frontmatter seeded from Wikidata (CC0). Reference sources (Theoi, Wikipedia, Project Gutenberg) may be consulted but not copied.
- No existing code or specs affected (greenfield).
