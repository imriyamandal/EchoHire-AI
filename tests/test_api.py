import pytest
import uuid
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"

def test_auth_signup_and_login():
    unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    
    # 1. Signup
    signup_resp = client.post("/api/auth/signup", json={
        "name": "Sarah Connor",
        "email": unique_email,
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    assert signup_resp.status_code == 200
    signup_data = signup_resp.json()
    assert "access_token" in signup_data
    assert signup_data["user"]["name"] == "Sarah Connor"
    token = signup_data["access_token"]

    # 2. Get Profile
    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["user"]["email"] == unique_email

    # 3. Save Onboarding
    onboard_resp = client.post("/api/user/onboarding", json={
        "target_role": "AI Engineer",
        "experience_level": "Senior",
        "target_company": "OpenAI",
        "interview_type": "Technical",
        "preferred_language": "en",
        "difficulty": "hard"
    }, headers={"Authorization": f"Bearer {token}"})
    assert onboard_resp.status_code == 200
    assert onboard_resp.json()["user"]["is_onboarded"] == True

    # 4. Login
    login_resp = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "Password123!"
    })
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

def test_dynamic_interview_start():
    resp = client.post("/api/interview/start", json={
        "target_role": "AI Engineer",
        "target_company": "Google",
        "interview_type": "Technical",
        "difficulty": "medium",
        "language": "en"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "session_id" in data
    assert "initial_greeting" in data
    assert "Google" in data["initial_greeting"] or "AI Engineer" in data["initial_greeting"]

def test_tts_rime_endpoint():
    resp = client.post("/api/tts/rime", json={
        "text": "Hello world from EchoHire voice coach",
        "target_company": "google"
    })
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "audio/wav"
    assert len(resp.content) > 500
