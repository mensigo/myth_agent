# Mythology Tutor

A web-based conversational tutor for studying mythology. It answers a learner's
questions and handles follow-ups, grounding every reply in **curated content
packs** rather than freewheeling from a model's training — so facts stay
consistent and the tutor declines to invent details the pack doesn't cover.

New pantheons (Norse, Egyptian, …) are **drop-in**: add a `content/<pantheon>/`
folder that follows the pack format and it is picked up on the next restart with
no code changes.

- **Stack:** Next.js (App Router) + TypeScript. One codebase for the chat UI and
  the server route, so the model API key stays server-side.
- **Model access:** [OpenRouter](https://openrouter.ai) (an OpenAI-compatible
  gateway), so the model is a swappable config string.
- **Grounding:** the active pantheon's content is injected into the system prompt
  (no retrieval/RAG yet — the packs are small).

## Prerequisites

- Node.js 18.18+ (tested on 20.x)
- An OpenRouter API key

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local env file from the example and fill in your key:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env`:

   | Variable             | Required | Default              | Purpose                                                                 |
   | -------------------- | -------- | -------------------- | ----------------------------------------------------------------------- |
   | `OPENROUTER_API_KEY` | yes      | —                    | Your OpenRouter key. **Server-side only** — never exposed to the browser. |
   | `MODEL_ID`           | no       | `openai/gpt-4o-mini` | OpenRouter model id in `<vendor>/<model>` form. Swap freely.            |
   | `ACTIVE_PANTHEON`    | no       | `greek`              | Which pantheon under `content/` the tutor grounds answers in.           |

   Get a key at <https://openrouter.ai/keys>. All `.env*` files except
   `.env.example` are gitignored, so your key is never committed.

## Running

Development (hot reload):

```bash
npm run dev
```

Production:

```bash
npm run build
npm run start
```

Then open <http://localhost:3000> and ask the tutor a question, e.g.
_"Who is Persephone?"_ or _"Why are there seasons?"_.

If `OPENROUTER_API_KEY` is not set, the chat endpoint returns a clear error
(shown in the UI) rather than failing silently.

## How to add a pantheon

Adding a pantheon requires **no code changes** — just content files:

1. Create a directory `content/<pantheon>/` (e.g. `content/egyptian/`).

2. Add a `manifest.json` with at least an `id` and a human-readable `name`:

   ```json
   {
     "id": "egyptian",
     "name": "Egyptian Mythology"
   }
   ```

3. Add one or more **entity files** (`*.md`). Each is YAML frontmatter followed
   by markdown prose. Required frontmatter fields are `id` (unique within the
   pantheon), `type` (e.g. `deity`, `hero`, `myth`, `place`, `concept`), and
   `name`. Any other structured fields (`domain`, `parents`, `consort`, …) are
   optional and are passed to the tutor as facts.

   ```markdown
   ---
   id: ra
   type: deity
   name: Ra
   domain: [sun, creation, kingship]
   symbols: [sun disk, falcon]
   ---

   Ra is the ancient Egyptian sun god... (original prose you author)
   ```

4. Set `ACTIVE_PANTHEON=egyptian` in `.env` (or keep `greek` as the default),
   then restart the server. The new pantheon is discovered automatically.

Validate all packs at any time:

```bash
npm run validate:content
```

This reports the entity count per pantheon, or a specific error naming the
offending entity and field if a pack is malformed (missing required field,
duplicate `id`, invalid manifest).

### Content authoring notes

Entity **prose should be original writing** (facts are not copyrightable, but
wording is — reference sources such as Theoi, Wikipedia, and Project Gutenberg
may be read but not copied). Structured relationship frontmatter may be seeded
from **Wikidata (CC0)**. Drafts may be LLM-generated but should be human-reviewed,
since myths carry variant traditions that must be chosen deliberately. The
included `greek` pack follows the mainstream Hesiodic/Homeric tradition.

## Project layout

```
app/
  page.tsx          Chat page (server component shell)
  chat.tsx          Client chat component (transcript, input, streaming render)
  api/chat/route.ts Server route: holds the key, builds the grounded prompt, streams
lib/
  content.ts        Content pack discovery, loading, and validation
  prompt.ts         Grounded system-prompt assembly
content/
  greek/            Greek starter pack (Olympians + foundational myths)
  norse/            Minimal Norse pack (demonstrates drop-in extensibility)
scripts/
  validate-content.ts  Validates every pantheon under content/
```

## Notes and limitations

- **Stateless:** conversations are not persisted. The client sends the full
  current conversation with each request and the server stores nothing, so a new
  browser session starts with no memory of a prior one.
- **Grounding is guidance, not a hard guarantee.** The system prompt instructs
  the model to answer only from the pack and to say when something is uncovered;
  keep packs authoritative.
- **Out of scope for now:** cross-session progress tracking, quizzing/spaced
  repetition, and retrieval/RAG. The content schema is designed to accommodate
  these later — a pantheon whose concatenated content approaches the context/cost
  budget (rough guideline ~15–20k tokens) is the trigger to introduce retrieval.
