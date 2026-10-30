import logging

from fastapi import FastAPI

from app.chat import router as chat_router
from app.support import router as support_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

app = FastAPI(title="MeOi! API", version="0.0.1")
app.include_router(chat_router)
app.include_router(support_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
