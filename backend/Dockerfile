FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /srv

COPY pyproject.toml ./
COPY app ./app
COPY alembic.ini ./
COPY migrations ./migrations
RUN pip install --no-cache-dir .

RUN useradd --create-home --uid 1000 meoi
USER meoi

EXPOSE 8000
CMD ["sh", "-c", "[ -z \"$DATABASE_URL\" ] || alembic upgrade head; exec uvicorn app.main:app --host 0.0.0.0 --port 8000"]
