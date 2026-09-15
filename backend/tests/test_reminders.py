from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def reminder_payload() -> dict[str, object]:
    return {
        "title": "Daily Standup",
        "details": "Join the development team standup meeting.",
        "date": "2026-09-20",
        "time": "09:00:00",
        "scheduleType": "weekdays",
        "customDays": [],
        "enabled": True,
    }


def test_reminder_crud_flow() -> None:
    created = client.post("/api/v1/reminders", json=reminder_payload())
    assert created.status_code == 201
    reminder = created.json()
    assert reminder["title"] == "Daily Standup"
    assert reminder["scheduleType"] == "weekdays"

    reminder_id = reminder["id"]
    assert client.get(f"/api/v1/reminders/{reminder_id}").status_code == 200
    assert len(client.get("/api/v1/reminders").json()) == 1

    updated_payload = reminder_payload() | {"title": "Updated Standup"}
    updated = client.put(
        f"/api/v1/reminders/{reminder_id}", json=updated_payload
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Updated Standup"

    disabled = client.patch(
        f"/api/v1/reminders/{reminder_id}/status", json={"enabled": False}
    )
    assert disabled.status_code == 200
    assert disabled.json()["enabled"] is False

    assert client.delete(f"/api/v1/reminders/{reminder_id}").status_code == 204
    assert client.get(f"/api/v1/reminders/{reminder_id}").status_code == 404


def test_custom_schedule_requires_days() -> None:
    payload = reminder_payload() | {"scheduleType": "custom", "customDays": []}
    response = client.post("/api/v1/reminders", json=payload)
    assert response.status_code == 422
