import logging
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.chat import router as chat_router
from app.support import router as support_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")


def build_api() -> FastAPI:
    api = FastAPI(title="MeOi! API", version="0.0.1")
    api.include_router(chat_router)
    api.include_router(support_router)

    @api.get("/health")
    def health() -> dict[str, str]:
        # RENDER_GIT_COMMIT lets the deploy check know which version is live.
        return {"status": "ok", "commit": os.environ.get("RENDER_GIT_COMMIT", "unknown")}

    return api


def create_app(static_dir: str | None = None) -> FastAPI:
    """Local dev / docker compose: the API alone (nginx serves the web app and proxies /api).

    Production (one container): the API under /api, `/health` at the root for the host's health
    check, and the built web app at `/`. One origin, so no CORS and cookies stay first-party.
    """
    api = build_api()
    if not static_dir or not Path(static_dir).is_dir():
        return api

    app = FastAPI(title="MeOi!", docs_url=None, redoc_url=None, openapi_url=None)

    @app.get("/health")
    def root_health() -> dict[str, str]:
        return {"status": "ok", "commit": os.environ.get("RENDER_GIT_COMMIT", "unknown")}

    app.state.api = api  # reachable for tests
    app.mount("/api", api)
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="web")
    return app


app = create_app(os.environ.get("STATIC_DIR"))
