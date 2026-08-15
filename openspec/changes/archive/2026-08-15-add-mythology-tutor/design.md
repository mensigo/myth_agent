## Context

Greenfield repository (empty README, `.gitignore`, `openspec/` scaffold). No existing app code or framework choices to preserve. See `proposal.md` — Why for motivation. The driving constraint is that mythology knowledge must live as **data** (curated packs) so new pantheons are drop-in, while the app stays a thin teaching layer. A single pantheon's core content is small (order of a few thousand tokens), which removes the need for retrieval infrastructure at this stage.

## Goals / Non-Goals

**Goals:**
- One codebase for UI + server so the Anthropic key stays server-side with minimal moving parts.
- Content packs that are human-authorable, git-diffable, and parseable enough to later support quizzing.
- Grounding approach that keeps the tutor consistent and honest about coverage.
- Adding a pantheon requires zero code changes.

**Non-Goals:**
- Retrieval/RAG, embeddings, or a vector store (deferred until a pantheon outgrows the prompt budget).
- Persistence of conversations or learner progress.
- Multi-pantheon blending in a single conversation (one active pantheon at a time).
- Authentication, multi-user accounts, rate limiting beyond what the platform provides.

## Decisions

### Stack: Next.js (App Router) + TypeScript
One framework provides both the React chat UI and server-side route handlers, so the API key never reaches the client and there is no separate backend to deploy. Alternative considered: Python FastAPI backend + separate frontend — rejected as more moving parts for a "simple" app with no Python-specific need.

### Grounding by full-pack injection, not retrieval
The active pantheon's entities (frontmatter + prose) are concatenated into the model's system prompt, with an instruction to answer only from that content and to say when something is not covered. Rationale: with small packs this is simpler, cheaper to reason about, and fully deterministic in what the model can see. Alternative: RAG — rejected as premature; the content schema (structured frontmatter per entity) keeps the door open to add retrieval later without changing pack format. Trigger to revisit: a pantheon whose concatenated content approaches the context/cost budget (rough guideline ~15–20k tokens).

### Content pack format: markdown + YAML frontmatter, one file per entity
Frontmatter carries structured fields (`id`, `type`, `name`, optional relations); the body carries prose the model reads. This is readable and git-friendly for authoring, and structured enough for a future quiz engine to parse. A per-pantheon `manifest.json` supplies pantheon identity/metadata. Alternative: one big JSON per pantheon — rejected as harder to author and review. Alternative: pure prose with no frontmatter — rejected because it forecloses structured features (quizzing, relationship traversal).

### Pantheon discovery is filesystem-driven
Available pantheons are discovered by scanning `content/*/manifest.json` at load time, so a new valid folder is picked up on restart with no registry edit. Validation (required frontmatter fields, unique ids, manifest presence) runs at load and surfaces a clear error identifying the offending entity/field rather than loading partial content.

### LLM access via OpenRouter (OpenAI-compatible)
The `api/chat` route uses an OpenAI-compatible client pointed at `https://openrouter.ai/api/v1` with `OPENROUTER_API_KEY`, calling the chat-completions API with streaming and relaying tokens to the browser (streamed HTTP response consumed incrementally by the client). The client sends the full current conversation with each request (stateless server); the server prepends the grounded system prompt. Rationale: OpenRouter makes the model a swappable config string across providers without code changes, which suits an app where we want to trade off cost/quality freely. Alternative: a provider-native SDK (e.g. Anthropic) — rejected for v1 because it couples the app to one provider; can be revisited if a provider-specific feature is needed (see risk below).

### Model as configuration
The model is a config value of the form `<vendor>/<model>` (an OpenRouter model id), e.g. an Anthropic, OpenAI, Google, or open-weights model. It is set via environment/config at build time, not hardcoded. The **default is `openai/gpt-4o-mini`** (cheap, good enough for a grounded tutor). When choosing a Claude model id instead, consult the claude-api reference rather than relying on memory.

### Content sourcing and licensing
Entity **prose is original writing** we author (facts are not copyrightable; reference sources such as Theoi, Wikipedia, and Project Gutenberg may be read but their wording is not copied — this avoids CC BY-SA share-alike/attribution obligations and copyright issues). Structured relationship frontmatter (`parents`, `consort`, `domain`, etc.) may be **seeded from Wikidata (CC0)**, which is public-domain and well-suited to entity relationships. Drafts may be LLM-generated but require human review, since myths carry variant traditions that must be chosen deliberately.

## Risks / Trade-offs

- **Model ignores grounding and answers from training** → System prompt explicitly instructs "answer only from the provided content; if not covered, say so." Keep packs authoritative; accept that grounding is guidance, not a hard guarantee, and revisit with stricter techniques if drift is observed.
- **Pack grows beyond prompt budget** → Documented trigger to introduce retrieval; frontmatter schema already supports per-entity selection when that day comes.
- **Frontmatter authoring errors** → Load-time validation with specific, actionable error messages (which entity, which field) rather than silent partial loads.
- **API key leakage** → `OPENROUTER_API_KEY` read only from server environment; never imported into client components; verified by the web-chat-interface spec's "key absent from client" scenario.
- **Cost/latency of injecting full pack each turn** → Acceptable at current pack size; prompt caching of the static content portion is a later optimization, but note OpenRouter may not pass through every provider's caching — revisit if it becomes material.
- **Provider-specific features unavailable through the gateway** (e.g. Anthropic prompt caching) → Accept for v1; the OpenAI-compatible boundary makes it straightforward to swap to a provider-native client later if needed.
- **Wikidata relationship data mismatches a chosen tradition** → Human review of frontmatter against the authored prose; prose is the authoritative narrative, frontmatter the structured index.
