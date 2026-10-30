# MeOi! ("Mẹ ơi!") - AI companion for first-time postpartum mothers in Vietnam

Personal project that doubles as a capstone (đồ án cơ sở) at Pacific University, Faculty of IT & Semiconductors.
Vietnamese-language chat companion ("Gỡ rối cùng mẹ") + daily check-in, built around a tiered safety protocol.

## Repository layout

```
backend/                    FastAPI service: /chat/send (safety match + LLM), /support, /health; tests + tier evals
frontend/                   React + Vite + TypeScript app (M2 port of prototype V28), served by nginx
docker-compose.yml          db + api + web; copy .env.example to .env, then `docker compose up --build`
docs/adr/                   Architecture decision records (001-stack.md)
docs/claude_MeOi-build-spec.md    Build spec extracted from prototype V28 (UI source of truth)
docs/prototype/Meoi_v28.html      Prototype V28 (reference only)
docs/content-framework-v3.md      Content bank (content source of truth)
docs/system-prompt-v3.md          System prompt spec + tier test cases
docs/scope-doc-v3.md              Scope document
src/meoi-prototype.jsx      LEGACY v5 React prototype (Claude Artifact only)
LOG.md                      Detailed implementation log (Vietnamese)
NHAT-KY-THUC-HIEN.docx      Official weekly journal (department template)
BAO-CAO.md / BAO-CAO.docx   Capstone report (Vietnamese)
```

## Safety protocol (Tier 3)

The model appends a machine-readable tag `[TIER:X]` to each reply. The UI parses it (`TIER_TAG_RE`) and renders
`CrisisBanner` for Tier 3 (Physical / Psychiatric / Safety). Tier 3 is treated as infrastructure, not a feature.
Hotline data lives in docs/content-framework-v2-vi.md (section 2) with a per-row verification status.

## Known limitations (read before running or deploying)

1. **The legacy prototype `src/meoi-prototype.jsx` runs only inside the Claude Artifact runtime.** It calls `https://api.anthropic.com/v1/messages`
   directly from the client without an API key and persists data via `window.storage`. Both only exist in the
   Claude.ai artifact sandbox. The production app (`backend/` + `frontend/`) replaces it: the API key stays on
   the server and guest state lives in memory only (no accounts or database until M5).
2. Knowledge base is embedded in `SYSTEM_PROMPT` (no retrieval layer). Entries #28-35 are AI-drafted and not yet
   reviewed by a medical professional.
3. Mother's check-in reflection (`reflectOnCheckins`) is rule-based, not model-generated.
4. Ngày Mai hotline phone number and 111 / CSAGA / Ngôi nhà Bình yên numbers are not re-verified (see docs).
5. The 7 tier test cases (docs/system-prompt-v2-vi.md, section 3) were run once on 2026-10-30 (claude-haiku-5-5);
   the reports await Vân's judgement (`backend/evals/out/`). The small beta has not been run.

## How to view the prototype

Open `src/meoi-prototype.jsx` as an artifact in Claude.ai (paste the file into a conversation and ask Claude
to render it as an artifact). No build step required.

## Run and test locally

```bash
cp .env.example .env            # then fill ANTHROPIC_API_KEY and ANTHROPIC_MODEL (never commit .env)
docker compose up --build       # web on http://localhost:8080, api on http://localhost:8000
bash scripts/compose-smoke.sh   # quick check of a running stack (works without an LLM key)
```

Checks that CI runs (run them from the folder shown):

| Where | Command |
|---|---|
| `backend/` | `pip install -e ".[dev]"`, then `ruff check app tests evals`, `ruff format --check app tests evals`, `mypy app tests evals`, `pytest -q` |
| `frontend/` | `npm ci`, then `npm run lint`, `npm test`, `npm run build` |

## CI (GitHub Actions)

- `.github/workflows/ci.yml` runs on every pull request and every push to `main`: backend checks, frontend
  checks, then builds the images, starts `docker compose` and runs `scripts/compose-smoke.sh`. The LLM is mocked
  in all tests, so CI needs no secret and costs nothing.
- `.github/workflows/evals.yml` is manual (**Actions > Tier evals > Run workflow**). It runs the 7 tier cases
  on the real model and uploads the reports as the `tier-evals` artifact. One-time setup in the GitHub repo:
  secret `ANTHROPIC_API_KEY` (Settings > Secrets and variables > Actions > Secrets) and variable
  `ANTHROPIC_MODEL` (same page > Variables). It is not part of CI because it costs money and is not deterministic.
- `.github/workflows/deploy.yml` verifies a deployment: after CI passes on `main`, Render deploys (`render.yaml`), and
  this workflow waits for the new version and smoke-tests the public URL. Setup guide: `docs/deploy-render.md`.
