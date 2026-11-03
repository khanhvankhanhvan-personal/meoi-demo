"""History normalisation in POST /chat/send, and the direct-reply prompt rule."""

from collections.abc import Callable, Iterator
from datetime import UTC, datetime
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.chat import get_now, llm_provider
from app.llm import LLMClient
from app.main import app
from app.prompts import load_system_prompt


class FakeLLM:
    def __init__(self) -> None:
        self.calls: list[tuple[str, list[dict[str, str]]]] = []

    async def complete(self, system: str, messages: list[dict[str, str]]) -> str:
        self.calls.append((system, messages))
        return "Mình ở đây.\n[TIER:1]"


class ExplodingLLM:
    async def complete(self, system: str, messages: list[dict[str, str]]) -> str:
        raise AssertionError("LLM must not be called")


@pytest.fixture
def client() -> Iterator[TestClient]:
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def use(llm: LLMClient) -> None:
    def provider() -> Callable[[], LLMClient]:
        return lambda: llm

    app.dependency_overrides[llm_provider] = provider
    app.dependency_overrides[get_now] = lambda: datetime(2026, 11, 2, 3, 0, tzinfo=UTC)


def send(client: TestClient, *msgs: tuple[str, str]) -> Any:
    return client.post(
        "/chat/send", json={"messages": [{"role": r, "content": c} for r, c in msgs]}
    )


def test_leading_assistant_messages_are_dropped(client: TestClient) -> None:
    llm = FakeLLM()
    use(llm)
    r = send(
        client,
        ("assistant", "Chào mẹ, hôm nay mẹ thế nào?"),
        ("assistant", "Mẹ cứ kể mình nghe."),
        ("user", "Hôm nay em mệt quá."),
    )
    assert r.status_code == 200
    assert llm.calls[0][1] == [{"role": "user", "content": "Hôm nay em mệt quá."}]


def test_consecutive_same_role_messages_are_merged_without_altering_text(
    client: TestClient,
) -> None:
    llm = FakeLLM()
    use(llm)
    send(
        client,
        ("user", "Hôm nay em mệt."),
        ("user", "Con khóc suốt."),
        ("assistant", "Mình nghe mẹ."),
        ("assistant", "Mẹ kể thêm nhé."),
        ("user", "Em chưa ngủ được."),
    )
    assert llm.calls[0][1] == [
        {"role": "user", "content": "Hôm nay em mệt.\n\nCon khóc suốt."},
        {"role": "assistant", "content": "Mình nghe mẹ.\n\nMẹ kể thêm nhé."},
        {"role": "user", "content": "Em chưa ngủ được."},
    ]


def test_last_assistant_message_is_rejected_with_422(client: TestClient) -> None:
    use(FakeLLM())
    r = send(client, ("user", "Hôm nay em mệt."), ("assistant", "Mình nghe mẹ."))
    assert r.status_code == 422
    assert r.json()["detail"] == "last_message_must_be_user"


def test_tier3_in_latest_message_still_caught_when_merged(client: TestClient) -> None:
    use(ExplodingLLM())
    r = send(
        client,
        ("assistant", "Chào mẹ."),
        ("user", "Hôm nay em mệt quá."),
        ("user", "Em muốn chết"),
    )
    body = r.json()
    assert body["tier"] == "3-PSYCHIATRIC" and body["source"] == "script"
    assert body["pinnable"] is False


def test_prompt_has_direct_reply_rule_and_keeps_tier_rules() -> None:
    prompt = load_system_prompt()
    assert "## Trả lời thẳng vào việc (Tier 1/2)" in prompt
    assert "KHÔNG mở đầu bằng lời chào" in prompt
    assert "KHÔNG nhắc lại nguyên văn" in prompt
    assert "TIER 3 — ALWAYS ESCALATE" in prompt
    assert "[TIER:1] hoặc [TIER:2] hoặc [TIER:3-PHYSICAL]" in prompt
    assert "[GỢI_Ý: lựa chọn 1 | lựa chọn 2 | lựa chọn 3]" in prompt
    assert "Không bao giờ chẩn đoán" in prompt
