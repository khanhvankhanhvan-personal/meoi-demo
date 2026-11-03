from fastapi.testclient import TestClient

PIN = "123456"
PROFILE = {
    "profile": {"birth_date": "2026-09-21", "birth_type": "csection", "first_time": True},
    "babies": [{"label": "Bí", "formula": "mom", "method": "direct"}],
    "trusted": {"name": "Chồng", "phone": "0900000000", "notes": ""},
}


def signup(c: TestClient, nickname: str) -> None:
    assert c.post("/auth/register", json={"nickname": nickname, "pin": PIN}).status_code == 201


def test_profile_round_trip(client: TestClient) -> None:
    signup(client, "mebong")
    empty = client.get("/profile").json()
    assert empty["profile"] is None and len(empty["babies"]) == 1
    assert client.put("/profile", json=PROFILE).status_code == 200
    assert client.get("/profile").json() == PROFILE
    twins = {**PROFILE, "babies": [{"label": "A"}, {"label": "B"}]}
    client.put("/profile", json=twins)
    assert [b["label"] for b in client.get("/profile").json()["babies"]] == ["A", "B"]


def test_profile_validation(client: TestClient) -> None:
    signup(client, "mebong")
    future = {**PROFILE, "profile": {**PROFILE["profile"], "birth_date": "2031-01-01"}}  # type: ignore[dict-item]
    assert client.put("/profile", json=future).status_code == 422
    assert client.put("/profile", json={**PROFILE, "babies": []}).status_code == 422
    assert client.put("/profile", json={**PROFILE, "profile": None}).status_code == 422


def test_checkin_latest_per_day_wins(client: TestClient) -> None:
    signup(client, "mebong")
    one = {"moods": ["Mệt"], "sleep": "Ít", "bodies": [], "stressors": ["Cho con bú"]}
    assert client.put("/checkins/2026-11-02", json=one).status_code == 200
    client.put("/checkins/2026-11-02", json={**one, "moods": ["Vui"]})
    client.put("/checkins/2026-11-01", json=one)
    rows = client.get("/checkins").json()
    assert [(r["day"], r["moods"]) for r in rows] == [
        ("2026-11-01", ["Mệt"]),
        ("2026-11-02", ["Vui"]),
    ]


def test_checkin_private_note_is_saved_and_limited(client: TestClient) -> None:
    signup(client, "mebong")
    body = {
        "moods": ["Bình yên"],
        "sleep": "Hồi sức",
        "bodies": [],
        "stressors": [],
        "note": "Bé ngủ 4 cữ",
    }
    assert client.put("/checkins/2026-11-02", json=body).json()["note"] == "Bé ngủ 4 cữ"
    assert client.get("/checkins").json()[0]["note"] == "Bé ngủ 4 cữ"
    client.put("/checkins/2026-11-02", json={**body, "note": None})
    assert client.get("/checkins").json()[0]["note"] is None
    assert client.put("/checkins/2026-11-02", json={**body, "note": "x" * 501}).status_code == 422


def test_notes_add_list_delete_and_dedupe(client: TestClient) -> None:
    signup(client, "mebong")
    body = {
        "day": "2026-11-02",
        "text": "Mẹ nghỉ ngơi khi bé ngủ nhé.",
        "topic": "Mệt quá",
        "tier": "1",
    }
    first = client.post("/notes", json=body)
    assert first.status_code == 201
    assert (
        client.post("/notes", json=body).json()["id"] == first.json()["id"]
    )  # same text: one note
    assert len(client.get("/notes").json()) == 1
    assert client.delete(f"/notes/{first.json()['id']}").status_code == 204
    assert client.get("/notes").json() == []
    assert client.delete(f"/notes/{first.json()['id']}").status_code == 404
    assert client.delete("/notes/not-a-uuid").status_code == 404


def test_tier_3_can_never_be_pinned_even_with_a_modified_client(client: TestClient) -> None:
    signup(client, "mebong")
    base = {"day": "2026-11-02", "text": "Mẹ gọi HOPE nhé.", "topic": "hôm nay"}
    # the client says it is Tier 3
    assert client.post("/notes", json={**base, "tier": "3-PSYCHIATRIC"}).status_code == 400
    # the client lies about the tier, but the mother's own words match the safety keywords
    lying = {**base, "tier": "1", "topic": "Có lúc em nghĩ nếu em biến mất thì mọi thứ sẽ dễ hơn"}
    assert client.post("/notes", json=lying).status_code == 400
    assert client.get("/notes").json() == []


def test_one_mother_cannot_see_or_delete_another_mothers_data(client: TestClient) -> None:
    signup(client, "me_a")
    note = client.post(
        "/notes", json={"day": "2026-11-02", "text": "Ghi chú của A", "topic": ""}
    ).json()
    client.put("/profile", json=PROFILE)
    client.cookies.clear()
    signup(client, "me_b")
    assert client.get("/notes").json() == []
    assert client.get("/profile").json()["profile"] is None
    assert client.delete(f"/notes/{note['id']}").status_code == 404
    client.cookies.clear()
    assert client.post("/auth/login", json={"nickname": "me_a", "pin": PIN}).status_code == 200
    assert len(client.get("/notes").json()) == 1
