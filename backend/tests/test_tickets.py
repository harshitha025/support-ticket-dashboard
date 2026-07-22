from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


def override_get_db() -> Generator[Session, None, None]:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def reset_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def create_sample_ticket():
    response = client.post(
        "/api/tickets",
        json={
            "title": "Login issue",
            "description": "Customer cannot sign in.",
            "customer_name": "Taylor Reed",
            "customer_email": "taylor@example.com",
            "priority": "high",
        },
    )
    assert response.status_code == 201
    return response.json()


def test_rejects_ticket_without_title():
    response = client.post(
        "/api/tickets",
        json={
            "description": "Missing title.",
            "customer_name": "Taylor Reed",
            "customer_email": "taylor@example.com",
            "priority": "high",
        },
    )
    assert response.status_code == 422


def test_creates_ticket():
    ticket = create_sample_ticket()
    assert ticket["status"] == "open"


def test_updates_ticket_status():
    ticket = create_sample_ticket()

    response = client.patch(
        f"/api/tickets/{ticket['id']}",
        json={"status": "resolved"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "resolved"