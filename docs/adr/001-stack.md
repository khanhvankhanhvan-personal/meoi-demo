# ADR-001: Technology stack

- Status: Accepted (locked by the owner in CLAUDE.md)
- Date: 2026-10-30

## Context

MeOi! is a Vietnamese-language companion for first-time postpartum mothers. It must be reachable at a public
URL by 3-5 beta mothers, be built by one non-technical founder with about 10 hours a week, and treat the
Tier 3 safety protocol as infrastructure. The prototype (`docs/prototype/Meoi_v28.html`) runs only inside the
Claude Artifact runtime, so the LLM call and storage must move to a backend.

## Decision

- Frontend: React + Vite + TypeScript, served as static files by nginx.
- Backend: FastAPI on Python 3.12, SQLAlchemy 2 + Alembic.
- Database: PostgreSQL 16.
- LLM: Anthropic API, called only from the backend. The model name comes from `ANTHROPIC_MODEL`.
- Packaging: Docker; `docker compose up` runs `db`, `api`, `web`. nginx proxies `/api/*` to the backend so
  the browser only talks to one origin (no CORS, cookies stay first-party).
- Chat transcripts are not stored server-side; persistence is mother-controlled via pinned notes.

## Consequences

- The build spec section 1.2 sketches a React Native app. We build a mobile-first responsive web app instead:
  no app-store review, one URL to share with beta mothers. A native wrapper can come later.
- Safety matching (`match()`) lives in the backend so a modified client cannot bypass it.
- Python 3.12 in the container; local machines may run a newer Python, so run backend tests in Docker or CI.

## Alternatives considered

- Next.js full-stack: one language, but the safety/LLM logic is better isolated and tested in a Python service.
- React Native: nicer on phones, but slower to ship and deploy for a solo part-time builder.
