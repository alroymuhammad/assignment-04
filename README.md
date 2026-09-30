# Compensation Research Agent

An agent that answers "what does a `<title>` with `<years>` years of experience earn in `<location>`?" using **web evidence only** — no model memory, no invented numbers, no guessed URLs.

Built on [Anvia](https://github.com/anvia-hq/anvia): `@anvia/core` for the agent loop, `@anvia/openai` for the model client, `@anvia/sandbox` for a Docker workspace, `@anvia/lens` for traces and eval reporting, `@tavily/core` for web search.

## What it does

Given a job title, years of experience, and a location, the agent:

1. Runs at most three `searchWeb` queries (one per distinct fact, no repeats).
2. Answers with a salary **range** in a fixed format:

   ```
   ## Answer
   IDR 30,000,000 - 45,000,000 per month — Senior Backend Engineer, 5 years, Jakarta, Indonesia, 2025
   ## Evidence
   - <claim> — <source URL>
   ## Gaps
   - <what no source confirmed> | none
   ```

3. If asked, writes the same content to `/workspace/report.md` in the sandbox.

It refuses to fabricate instead of guessing:

| Situation | Behaviour |
| --- | --- |
| Title, years, or location missing | Asks exactly one clarifying question; no tool calls, no Answer section |
| Unsearchable subject ("my employer", "this role") | Asks for the name instead of searching |
| Private/internal data (someone's salary, an internal band) | Says it is not publicly available |
| Unverifiable place (Atlantis, Wakanda, Narnia) | Writes `No public source states this.` |
| No source states a figure | Writes `No public source states this.` |

## Source-quality policy

Enforced via the agent context (`src/context.ts`), best source first:

1. Pay-transparency reports and national statistics offices
2. Published salary bands on company career pages
3. Salary aggregators (levels.fyi, Glassdoor) and salary surveys
4. News articles and forum posts — weakest, corroboration only

Reporting rules: always a range, never a point estimate; always name city + level + currency and never mix them in one figure; never average across countries, cities, or levels; never convert currencies; flag figures older than 18 months as dated; when sources conflict, report both and say which is newer.

## Project layout

```
src/
  index.ts              # serves the agent through Studio on :3000
  agents.ts             # agent wiring: model, instructions, context, tools, tracing
  prompts.ts            # BASE_INSTRUCTION — search rules and answer format
  context.ts            # compResearchPolicy — source quality and reporting rules
  models.ts             # OpenAI client + getModel()
  observer.ts           # LensClient for traces
  sandbox.ts            # Docker sandbox ("uv:alpine") + file/process tools
  tools/
    search-web.ts       # searchWeb tool (Tavily, 5 results, answer included)
    tavily-client.ts    # Tavily client with API-key check
  evals/                # eval suite (see below)
lens/                   # Docker Compose stack for the Lens trace/eval backend
```

## Setup

Prerequisites:

- **Node.js 24+** — `@anvia/lens` declares `engines.node >= 24`.
- **pnpm** — 11.24.0 is pinned by the `packageManager` field in `package.json`.
- **Docker** — `src/sandbox.ts` pulls `ghcr.io/astral-sh/uv:alpine` and creates an ephemeral workspace when the agent starts.

```bash
pnpm install
cp .env.example .env   # then fill in the keys below
```

### Configure the keys

`.env` is gitignored — never commit real keys. The clients read their variables at import time, so a missing key fails `pnpm start` immediately instead of on the first request.

| Variable | Required | Value |
| --- | --- | --- |
| `OPENAI_API_KEY` | yes | Key for the model endpoint. `src/models.ts` throws at import if unset. |
| `OPENAI_BASE_URL` | no | Base URL of a custom OpenAI-compatible gateway (e.g. `https://gateway.example.com/v1`). Leave blank to use the OpenAI default. |
| `TAVILY_API_KEY` | yes | Tavily API key from <https://app.tavily.com>; powers the `searchWeb` tool. `src/tools/tavily-client.ts` throws at import if unset. |
| `ANVIA_LENS_BASE_URL` | yes | Lens base URL: `http://localhost` for the bundled stack below, or your hosted Lens URL. |
| `ANVIA_LENS_PUBLIC_KEY` | yes | `pk-lens-…` ingestion key from Project settings → Ingestion keys. |
| `ANVIA_LENS_SECRET_KEY` | yes | `sk-lens-…` secret issued alongside the public key. |
| `ANVIA_LENS_SERVICE_NAME` | no | Service label on traces. `src/observer.ts` already passes `support-agent`, so this only acts as a fallback. |

Model ids are not environment variables: the agent defaults to `gpt-6-luna` (`src/models.ts`) and the eval judges call `glm-5.3-flash` (`src/evals/*.ts`). Point `OPENAI_BASE_URL` at a gateway that serves those ids, or change the ids in those files.

### Run the Lens backend locally (optional)

The `lens/` folder is a Docker Compose stack (web, API, worker, Postgres, ClickHouse, Redis). It needs its own `lens/.env` with secrets, which is not committed:

```bash
cd lens
cat > .env <<EOF
PUBLIC_APP_URL=http://localhost
WEB_ORIGIN=http://localhost
docker compose up -d
```

Open <http://localhost>, create an account and a project, then copy the project's ingestion keys into the root `.env` as `ANVIA_LENS_PUBLIC_KEY` / `ANVIA_LENS_SECRET_KEY` and set `ANVIA_LENS_BASE_URL=http://localhost`. If you already run a Lens instance, skip this step and point the three connection variables at it.

## Usage

```bash
pnpm start                 # Studio on http://localhost:3000 (playground at /ui/playground)
pnpm typecheck             # tsc --noEmit
```

The agent is registered under the id `assistant`. Shutdown destroys the sandbox and closes the Lens client.

## Evals

Each eval script runs its case set against the live agent and reports to Lens.

| Script | Checks |
| --- | --- |
| `pnpm eval-contain` | Regex that a correctly formatted range (IDR / EUR / GBP) appears for Jakarta, Germany, UK |
| `pnpm eval-relevancy` | Incomplete requests get one clarifying question, never a salary figure |
| `pnpm eval-abstention` | No salary figures for private data or fictional places; LLM judge confirms abstention |
| `pnpm eval-faithfulness` | LLM judge scores every claim against the `searchWeb` tool output actually retrieved |
| `pnpm eval-report` | Asks for `report.md`, reads it back from the sandbox, asserts the three sections |

Case inputs live in `src/evals/*-cases.ts` next to their runner.
