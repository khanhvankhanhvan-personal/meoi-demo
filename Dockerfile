# Production image: the built web app and the API in ONE container (one origin, one service).
# Local development keeps using docker-compose.yml (separate api / web / db).

FROM node:22-alpine AS web
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 STATIC_DIR=/srv/web
WORKDIR /srv
COPY backend/pyproject.toml ./
COPY backend/app ./app
COPY backend/alembic.ini ./
COPY backend/migrations ./migrations
RUN pip install --no-cache-dir .
COPY --from=web /app/dist /srv/web

RUN useradd --create-home --uid 1000 meoi
USER meoi

# Render injects $PORT; 10000 is its default.
EXPOSE 10000
# Apply database migrations first (skipped when no database is configured), then start the API.
CMD ["sh", "-c", "[ -z \"$DATABASE_URL\" ] || alembic upgrade head; exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
