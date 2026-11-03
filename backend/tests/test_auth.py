import logging

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import Engine, func, select
from sqlalchemy.orm import Session

from app.models import Note, Profile, RefreshToken, User
from app.security import hash_secret, verify_secret

PIN = "123456"


def register(c: TestClient, nickname: str = "mebong", pin: str = PIN) -> dict[str, object]:
    r = c.post("/auth/register", json={"nickname": nickname, "pin": pin})
    assert r.status_code == 201, r.text
    body: dict[str, object] = r.json()
    return body


def login(c: TestClient, nickname: str = "mebong", pin: str = PIN):  # type: ignore[no-untyped-def]
    return c.post("/auth/login", json={"nickname": nickname, "pin": pin})


def test_register_returns_recovery_code_once_and_sets_http_only_cookies(client: TestClient) -> None:
    body = register(client)
    code = str(body["recovery_code"])
    assert len(code) == 19 and code.count("-") == 3
    cookies = client.cookies
    assert cookies.get("meoi_at") and cookies.get("meoi_rt")
    r = client.post("/auth/register", json={"nickname": "khac", "pin": PIN})
    set_cookie = " ".join(r.headers.get_list("set-cookie")).lower()
    assert "httponly" in set_cookie and "samesite=lax" in set_cookie
    assert client.get("/auth/me").json()["nickname"] == "khac"


def test_pin_and_recovery_code_are_stored_as_argon2id_hashes(
    client: TestClient, engine: Engine
) -> None:
    body = register(client)
    with Session(engine) as s:
        user = s.scalars(select(User)).one()
        assert user.pin_hash.startswith("$argon2id$")
        assert user.recovery_hash.startswith("$argon2id$")
        assert PIN not in user.pin_hash
        assert str(body["recovery_code"]) not in user.recovery_hash
        assert verify_secret(user.pin_hash, PIN) and not verify_secret(user.pin_hash, "654321")


@pytest.mark.parametrize("pin", ["12345", "1234567", "12345a", ""])
def test_pin_must_be_six_digits(client: TestClient, pin: str) -> None:
    assert client.post("/auth/register", json={"nickname": "mebong", "pin": pin}).status_code == 422


@pytest.mark.parametrize("nick", ["ab", "x" * 25, "me<script>", "me@bong"])
def test_nickname_is_validated(client: TestClient, nick: str) -> None:
    assert client.post("/auth/register", json={"nickname": nick, "pin": PIN}).status_code == 422


def test_nickname_is_unique_ignoring_case(client: TestClient) -> None:
    register(client, "MeBong")
    r = client.post("/auth/register", json={"nickname": "mebong", "pin": PIN})
    assert r.status_code == 409


def test_login_errors_do_not_reveal_whether_a_nickname_exists(client: TestClient) -> None:
    register(client)
    client.cookies.clear()
    wrong_pin = login(client, "mebong", "000000")
    no_user = login(client, "khongco", "000000")
    assert wrong_pin.status_code == no_user.status_code == 401
    assert wrong_pin.json() == no_user.json()


def test_login_is_case_insensitive_and_logout_ends_the_session(client: TestClient) -> None:
    register(client, "MeBong")
    client.cookies.clear()
    assert login(client, "mebong").status_code == 200
    assert client.get("/auth/me").status_code == 200
    assert client.post("/auth/logout").status_code == 204
    assert client.get("/auth/me").status_code == 401


def test_exponential_lockout_per_nickname_applies_even_to_unknown_nicknames(
    client: TestClient,
) -> None:
    register(client)
    client.cookies.clear()
    for _ in range(5):
        assert login(client, "mebong", "000000").status_code == 401
    locked = login(client, "mebong", "000000")
    assert locked.status_code == 429 and int(locked.headers["retry-after"]) > 0
    # the correct PIN is refused too while locked
    assert login(client, "mebong", PIN).status_code == 429
    # an unknown nickname behaves the same, so locks reveal nothing
    for _ in range(5):
        assert login(client, "khongco", "000000").status_code == 401
    assert login(client, "khongco", "000000").status_code == 429


def test_requests_without_a_session_are_refused(client: TestClient) -> None:
    for method, path in [
        ("get", "/auth/me"),
        ("get", "/profile"),
        ("get", "/notes"),
        ("get", "/checkins"),
    ]:
        assert getattr(client, method)(path).status_code == 401


def test_refresh_rotates_the_token_and_a_reused_token_ends_all_sessions(client: TestClient) -> None:
    register(client)
    old_refresh = client.cookies.get("meoi_rt")
    assert client.post("/auth/refresh").status_code == 200
    new_refresh = client.cookies.get("meoi_rt")
    assert new_refresh != old_refresh
    # replay the old (now revoked) token: refused, and the whole account is signed out
    client.cookies.clear()
    client.cookies.set("meoi_rt", old_refresh or "")
    assert client.post("/auth/refresh").status_code == 401
    # the new token that was issued in between is dead too
    assert client.post("/auth/login", json={"nickname": "mebong", "pin": PIN}).status_code == 200
    client.cookies.clear()
    client.cookies.set("meoi_rt", new_refresh or "")
    assert client.post("/auth/refresh").status_code == 401


def test_expired_access_token_can_be_refreshed(client: TestClient) -> None:
    register(client)
    client.cookies.delete("meoi_at")
    assert client.get("/auth/me").status_code == 401
    assert client.post("/auth/refresh").status_code == 200
    assert client.get("/auth/me").status_code == 200


def test_forgot_pin_with_recovery_code(client: TestClient) -> None:
    code = str(register(client)["recovery_code"])
    client.cookies.clear()
    # lower case and missing dashes are accepted
    r = client.post(
        "/auth/reset-pin",
        json={
            "nickname": "mebong",
            "recovery_code": code.lower().replace("-", " "),
            "new_pin": "654321",
        },
    )
    assert r.status_code == 200
    new_code = r.json()["recovery_code"]
    assert new_code and new_code != code
    assert client.get("/auth/me").status_code == 200
    client.cookies.clear()
    assert login(client, pin=PIN).status_code == 401  # old PIN is gone
    assert login(client, pin="654321").status_code == 200
    # the old recovery code no longer works
    r = client.post(
        "/auth/reset-pin", json={"nickname": "mebong", "recovery_code": code, "new_pin": "111111"}
    )
    assert r.status_code == 401


def test_wrong_recovery_code_is_generic_and_rate_limited(client: TestClient) -> None:
    register(client)
    client.cookies.clear()
    body = {"nickname": "mebong", "recovery_code": "AAAA-BBBB-CCCC-DDDD", "new_pin": "654321"}
    ghost = {**body, "nickname": "khongco"}
    assert (
        client.post("/auth/reset-pin", json=body).json()
        == client.post("/auth/reset-pin", json=ghost).json()
    )
    for _ in range(4):
        client.post("/auth/reset-pin", json=body)
    assert client.post("/auth/reset-pin", json=body).status_code == 429


def test_delete_account_needs_the_pin_and_removes_everything(
    client: TestClient, engine: Engine
) -> None:
    register(client)
    client.put(
        "/profile",
        json={
            "profile": {"birth_date": "2026-09-21", "birth_type": "normal", "first_time": True},
            "babies": [{}],
        },
    )
    client.post("/notes", json={"day": "2026-11-02", "text": "Mẹ nghỉ ngơi nhé.", "topic": "mệt"})
    assert client.request("DELETE", "/account", json={"pin": "000000"}).status_code == 401
    assert client.request("DELETE", "/account", json={"pin": PIN}).status_code == 204
    assert client.get("/auth/me").status_code == 401
    with Session(engine) as s:
        for model in (User, Profile, Note, RefreshToken):
            assert s.scalar(select(func.count()).select_from(model)) == 0
    assert login(client).status_code == 401


def test_logs_never_contain_nickname_pin_or_recovery_code(
    client: TestClient, caplog: pytest.LogCaptureFixture
) -> None:
    caplog.set_level(logging.DEBUG)
    code = str(register(client, "SecretNick")["recovery_code"])
    login(client, "SecretNick", "999999")
    client.post(
        "/auth/reset-pin",
        json={"nickname": "SecretNick", "recovery_code": "X" * 12, "new_pin": "888888"},
    )
    logged = caplog.text.lower()
    for secret in ("secretnick", PIN, "999999", "888888", code.lower()):
        assert secret not in logged


def test_hash_secret_is_salted() -> None:
    assert hash_secret(PIN) != hash_secret(PIN)


def test_accounts_report_unavailable_without_a_database(monkeypatch: pytest.MonkeyPatch) -> None:
    from app.main import app

    monkeypatch.delenv("DATABASE_URL", raising=False)
    with TestClient(app) as c:
        assert c.post("/auth/login", json={"nickname": "mebong", "pin": PIN}).status_code == 503
        assert c.get("/support").status_code == 200  # guests are unaffected
