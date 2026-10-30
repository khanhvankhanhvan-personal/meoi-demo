from collections.abc import Callable
from datetime import UTC, datetime
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.chat import get_now, llm_provider
from app.llm import LLMClient, LLMNotConfigured
from app.main import create_app


@pytest.fixture
def web(tmp_path: Path) -> Path:
    (tmp_path / "index.html").write_text('<div id="root"></div>', encoding="utf-8")
    return tmp_path


def test_without_static_dir_it_is_the_plain_api() -> None:
    client = TestClient(create_app(None))
    assert client.get("/health").json()["status"] == "ok"
    assert client.get("/").status_code == 404


def test_missing_static_dir_falls_back_to_the_plain_api(tmp_path: Path) -> None:
    client = TestClient(create_app(str(tmp_path / "does-not-exist")))
    assert client.get("/").status_code == 404


def test_single_container_serves_web_and_api_on_one_origin(web: Path) -> None:
    client = TestClient(create_app(str(web)))
    assert '<div id="root">' in client.get("/").text
    assert client.get("/health").json()["status"] == "ok"
    assert client.get("/api/health").json()["status"] == "ok"
    assert any(c["phone"] == "115" for c in client.get("/api/support").json()["contacts"])


def test_health_reports_the_deployed_commit(web: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("RENDER_GIT_COMMIT", "abc1234")
    client = TestClient(create_app(str(web)))
    assert client.get("/health").json() == {"status": "ok", "commit": "abc1234"}


def test_tier3_still_works_under_api_prefix_without_an_llm_key(web: Path) -> None:
    app = create_app(str(web))

    def no_llm() -> Callable[[], LLMClient]:
        def factory() -> LLMClient:
            raise LLMNotConfigured("not configured")

        return factory

    # the mounted sub-app owns the dependency graph
    sub = app.state.api
    sub.dependency_overrides[llm_provider] = no_llm
    sub.dependency_overrides[get_now] = lambda: datetime(2026, 11, 2, 10, 0, tzinfo=UTC)
    client = TestClient(app)

    crisis = client.post(
        "/api/chat/send", json={"messages": [{"role": "user", "content": "Em muốn chết"}]}
    ).json()
    assert crisis["tier"] == "3-PSYCHIATRIC" and crisis["pinnable"] is False

    normal = client.post(
        "/api/chat/send", json={"messages": [{"role": "user", "content": "Hôm nay em mệt"}]}
    )
    assert normal.status_code == 503
