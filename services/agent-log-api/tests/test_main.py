import pytest
from fastapi.testclient import TestClient

from app.main import app, logs


@pytest.fixture(autouse=True)
def reset_logs():
    logs.clear()
    yield
    logs.clear()


client = TestClient(app)


def test_health():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_and_list_logs():
    payload = {
        "agent_id": "agent-001",
        "actor_user_id": "user-001@example.com",
        "tool_name": "gmail.search",
        "action": "read_email",
        "status": "success",
    }

    empty_response = client.get("/logs")
    create_response = client.post("/logs", json=payload)
    list_response = client.get("/logs")

    assert empty_response.status_code == 200
    assert empty_response.json() == []
    assert create_response.status_code == 201
    assert create_response.json() == {**payload, "id": 1}
    assert list_response.status_code == 200
    assert list_response.json() == [{**payload, "id": 1}]


def test_create_log_without_required_field():
    response = client.post(
        "/logs",
        json={
            "agent_id": "agent-001",
            "tool_name": "gmail.search",
            "status": "success",
        },
    )

    assert response.status_code == 422


def test_create_log_with_invalid_status():
    response = client.post(
        "/logs",
        json={
            "agent_id": "agent-001",
            "tool_name": "gmail.search",
            "action": "read_email",
            "status": "pending",
        },
    )

    assert response.status_code == 422
