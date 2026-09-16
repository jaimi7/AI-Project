from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_generate_review_with_mock_provider(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "mock")
    response = client.post(
        "/api/reviews/generate",
        json={
            "place_name": "Spice Garden",
            "category": "restaurant",
            "keywords": ["paneer tikka", "friendly staff"],
            "experience_notes": "I visited with my family and service was a little slow.",
            "rating": 4,
            "tone": "natural",
            "length": "medium",
            "language": "English",
        },
    )

    assert response.status_code == 200
    assert response.json()["provider"] == "mock"
    assert "Spice Garden" in response.json()["review"]


def test_generation_requires_experience_details(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "mock")
    response = client.post(
        "/api/reviews/generate",
        json={
            "place_name": "Example Cafe",
            "rating": 5,
            "keywords": [],
            "experience_notes": "",
        },
    )

    assert response.status_code == 422


def test_optimize_review_with_mock_provider(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "mock")
    response = client.post(
        "/api/reviews/optimize",
        json={
            "review": "The food was excellent. The staff were welcoming. I would visit again.",
            "instruction": "Make it shorter",
            "language": "English",
        },
    )

    assert response.status_code == 200
    assert response.json()["review"].count(".") <= 2
