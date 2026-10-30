# ADR-005: Hosting on Render (free plan), one container

- Status: Accepted (Vân chose Render free on 2026-10-30; she has no international payment card)
- Date: 2026-10-30

## Context

M4 needs a public URL with HTTPS, an always-reachable API and a chat round trip. Open decision #4 (hosting and
budget) was answered: Render free plan, no international card, so card-only providers were out.

Facts checked in Render's documentation: free web services spin down after 15 minutes without traffic and take
about a minute to wake; each workspace gets 750 free instance hours per month; free Postgres expires after 30 days;
Blueprints support `plan: free`, `region: singapore` and `autoDeployTrigger: checksPass`. Whether the free plan
needs a payment method was not stated in the docs; Vân checks this when signing up.

## Decisions

- **One service, one image.** The root `Dockerfile` builds the web app and serves it from the FastAPI container
  (API under `/api`, `/health` at the root). One always-on service fits the 750 hours (744 h in a 31-day month);
  two services would not. One origin also means no CORS and first-party cookies for M5. `docker-compose.yml`
  (separate api / web / db) stays for local development.
- **Deploy only after CI passes** (`autoDeployTrigger: checksPass`). Render does the deploy itself, so there is no
  deploy secret in GitHub. `.github/workflows/deploy.yml` does not deploy: it waits until `/health` reports the new
  commit (`RENDER_GIT_COMMIT`, accepted as "unknown" after 5 minutes if Render does not expose it) and then smoke-tests
  the public URL. It stays silent until the repository variable `PUBLIC_URL` is set.
- **The API key lives only in Render** (`sync: false` in `render.yaml`); the model name is in `render.yaml`.
- **Keep-alive is an external monitor** (`/health` every 5 minutes), not a scheduled GitHub workflow: a private
  repository has a limited monthly quota of Actions minutes that a 5-10 minute schedule would exceed.

## Consequences and risks

- The free plan can still be asleep after a restart or a deploy, and a mother who opens the app at that moment waits
  about a minute. The support numbers are inside the web bundle, but Tier 3 replies need the API. This is accepted
  for the defense and a small beta; a paid plan (about $7/month, needs a card) removes it.
- No database yet. Render's free Postgres is deleted after 30 days, so M5 needs another plan or provider.
- Free-plan limits and the card requirement were read from documentation and secondary sources; verify on the
  Render dashboard.
