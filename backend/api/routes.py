import time
import json
import logging
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header, Response, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from backend.models.database import get_db, DBUser, DBSession, DBMessage, DBScore
from backend.utils.auth import get_password_hash, verify_password, create_access_token, decode_access_token
from backend.agents.interview_agent import interview_agent
from backend.agents.personas import generate_initial_greeting, COMPANY_CULTURES
from backend.voice.rime_service import rime_service
from backend.voice.livekit_agent import livekit_service
from backend.memory.session_store import session_store

logger = logging.getLogger("echohire.routes")
router = APIRouter(prefix="/api")

# ----------------------------------------------------
# Pydantic Schemas
# ----------------------------------------------------
class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, description="Full Name")
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class OnboardingRequest(BaseModel):
    name: Optional[str] = None
    target_role: str = "Software Engineer"
    experience_level: str = "Entry Level"
    target_company: str = "Google"
    interview_type: str = "Technical"
    preferred_language: str = "en"
    difficulty: str = "medium"

class StartInterviewRequest(BaseModel):
    target_role: Optional[str] = None
    target_company: Optional[str] = None
    interview_type: Optional[str] = None
    difficulty: Optional[str] = None
    language: Optional[str] = None

class TurnRequest(BaseModel):
    session_id: str
    user_text: str
    was_interrupted: bool = False
    duration_sec: float = 0.0

class ScoreRequest(BaseModel):
    session_id: str

class TTSRequest(BaseModel):
    text: str
    target_company: Optional[str] = "google"
    speaker: Optional[str] = None

# ----------------------------------------------------
# Auth Dependency
# ----------------------------------------------------
def extract_bearer_token(auth_header: Optional[str]) -> Optional[str]:
    if not auth_header:
        return None
    parts = auth_header.strip().split(None, 1)
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1].strip()
    return None

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> DBUser:
    token = extract_bearer_token(authorization)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid authentication token")
    
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    
    user = db.query(DBUser).filter(DBUser.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account not found")
    return user

def get_optional_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> Optional[DBUser]:
    token = extract_bearer_token(authorization)
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    return db.query(DBUser).filter(DBUser.id == payload["sub"]).first()

# ----------------------------------------------------
# 1. AUTHENTICATION ENDPOINTS
# ----------------------------------------------------
@router.post("/auth/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    if req.password != req.confirm_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match")
    
    existing = db.query(DBUser).filter(DBUser.email == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered")

    user_id = f"usr_{uuid.uuid4().hex[:12]}"
    hashed_pwd = get_password_hash(req.password)

    new_user = DBUser(
        id=user_id,
        name=req.name.strip(),
        email=req.email.lower(),
        password_hash=hashed_pwd,
        is_onboarded=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.id, "email": new_user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user.to_dict()
    }

@router.post("/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token({"sub": user.id, "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user.to_dict()
    }

@router.get("/auth/me")
def get_me(user: DBUser = Depends(get_current_user)):
    return {"user": user.to_dict()}

# ----------------------------------------------------
# 2. USER ONBOARDING & DASHBOARD STATS
# ----------------------------------------------------
@router.post("/user/onboarding")
def save_onboarding(req: OnboardingRequest, user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    if req.name:
        user.name = req.name.strip()
    user.target_role = req.target_role
    user.experience_level = req.experience_level
    user.target_company = req.target_company
    user.interview_type = req.interview_type
    user.preferred_language = req.preferred_language
    user.difficulty = req.difficulty
    user.is_onboarded = True

    db.commit()
    db.refresh(user)
    return {"status": "success", "user": user.to_dict()}

@router.get("/user/stats")
def get_user_stats(user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(DBSession).filter(DBSession.user_id == user.id).order_by(DBSession.created_at.desc()).all()
    scores = db.query(DBScore).filter(DBScore.user_id == user.id).all()

    total_interviews = len(sessions)
    avg_score = round(sum(s.overall_score for s in scores) / len(scores), 1) if scores else 85.0
    
    # Aggregate strengths and weaknesses
    all_strengths = []
    all_weaknesses = []
    for s in scores:
        all_strengths.extend(s.get_strengths()[:2])
        all_weaknesses.extend(s.get_weaknesses()[:2])

    if not all_strengths:
        all_strengths = [
            f"Strong natural communication aligned with {user.target_company} standards.",
            f"Demonstrated solid domain fundamentals in {user.target_role}."
        ]
    if not all_weaknesses:
        all_weaknesses = [
            "Quantify results in the STAR framework with concrete business metrics."
        ]

    return {
        "user": user.to_dict(),
        "total_interviews": total_interviews,
        "avg_score": avg_score,
        "top_strengths": list(set(all_strengths))[:4],
        "top_weaknesses": list(set(all_weaknesses))[:3],
        "recent_sessions": [s.to_dict() for s in sessions[:5]]
    }

# ----------------------------------------------------
# 3. DYNAMIC INTERVIEW SESSIONS
# ----------------------------------------------------
@router.post("/interview/start")
def start_interview(
    req: StartInterviewRequest,
    user: Optional[DBUser] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    session_id = f"sess_{uuid.uuid4().hex[:12]}"
    
    candidate_name = user.name if user else "Candidate"
    target_role = req.target_role or (user.target_role if user else "Software Engineer")
    target_company = req.target_company or (user.target_company if user else "Google")
    interview_type = req.interview_type or (user.interview_type if user else "Technical")
    difficulty = req.difficulty or (user.difficulty if user else "medium")
    language = req.language or (user.preferred_language if user else "en")

    # Generate initial dynamic greeting
    greeting = generate_initial_greeting(
        candidate_name=candidate_name,
        target_role=target_role,
        target_company=target_company,
        interview_type=interview_type,
        difficulty=difficulty
    )

    # Save to database
    db_session = DBSession(
        id=session_id,
        user_id=user.id if user else None,
        target_role=target_role,
        target_company=target_company,
        interview_type=interview_type,
        difficulty=difficulty,
        language=language,
        status="active"
    )
    db.add(db_session)

    # Save initial greeting message
    init_msg = DBMessage(
        id=f"msg_{uuid.uuid4().hex[:12]}",
        session_id=session_id,
        role="assistant",
        content=greeting,
        interrupted=False
    )
    db.add(init_msg)
    db.commit()

    # Register in memory store and track asked questions
    session_mem = session_store.get_or_create(
        session_id=session_id,
        persona=target_company.lower(),
        target_role=target_role,
        target_company=target_company,
        interview_type=interview_type,
        difficulty=difficulty,
        language=language
    )
    session_mem.add_message("assistant", greeting, interrupted=False)
    session_mem.add_asked_question(greeting)

    return {
        "session_id": session_id,
        "candidate_name": candidate_name,
        "target_role": target_role,
        "target_company": target_company,
        "interview_type": interview_type,
        "difficulty": difficulty,
        "language": language,
        "initial_greeting": greeting,
        "stage": session_mem.current_stage,
        "turn_count": session_mem.turn_count,
        "asked_questions_count": len(session_mem.asked_questions)
    }

@router.post("/interview/respond")
async def interview_turn(
    req: TurnRequest,
    user: Optional[DBUser] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    session = db.query(DBSession).filter(DBSession.id == req.session_id).first()
    target_role = session.target_role if session else "Software Engineer"
    target_company = session.target_company if session else "Google"
    interview_type = session.interview_type if session else "Technical"
    difficulty = session.difficulty if session else "medium"
    language = session.language if session else "en"
    candidate_name = user.name if user else "Candidate"
    experience_level = user.experience_level if user else "Mid-Level"

    # Save user message to DB
    user_msg = DBMessage(
        id=f"msg_{uuid.uuid4().hex[:12]}",
        session_id=req.session_id,
        role="user",
        content=req.user_text,
        interrupted=req.was_interrupted
    )
    db.add(user_msg)
    db.commit()

    # Update in-memory session state
    session_mem = session_store.get_or_create(
        session_id=req.session_id,
        persona=target_company.lower(),
        target_role=target_role,
        target_company=target_company,
        interview_type=interview_type,
        difficulty=difficulty,
        experience_level=experience_level,
        language=language
    )
    session_mem.add_message("user", req.user_text, interrupted=req.was_interrupted)

    # Get conversation history from DB
    past_messages = db.query(DBMessage).filter(DBMessage.session_id == req.session_id).order_by(DBMessage.timestamp.asc()).all()
    history = [m.to_dict() for m in past_messages]

    # Generate non-repetitive response advancing through interview stages
    llm_res = await interview_agent.generate_response(
        session_id=req.session_id,
        user_input=req.user_text,
        history=history,
        candidate_name=candidate_name,
        target_role=target_role,
        target_company=target_company,
        interview_type=interview_type,
        difficulty=difficulty,
        experience_level=experience_level,
        language=language,
        was_interrupted=req.was_interrupted,
        asked_questions=session_mem.asked_questions,
        current_stage=session_mem.current_stage,
        turn_count=session_mem.turn_count
    )

    ai_text = llm_res["response_text"]
    session_mem.add_asked_question(ai_text)
    session_mem.add_message("assistant", ai_text, interrupted=False)

    # Save assistant response to DB
    assistant_msg = DBMessage(
        id=f"msg_{uuid.uuid4().hex[:12]}",
        session_id=req.session_id,
        role="assistant",
        content=ai_text,
        latency_ms=llm_res["latency_ms"]
    )
    db.add(assistant_msg)
    db.commit()

    return {
        "session_id": req.session_id,
        "response_text": ai_text,
        "latency_ms": llm_res["latency_ms"],
        "provider": llm_res["provider"],
        "stage": session_mem.current_stage,
        "turn_count": session_mem.turn_count,
        "asked_questions_count": len(session_mem.asked_questions)
    }

@router.post("/interview/score")
async def score_session(
    req: ScoreRequest,
    user: Optional[DBUser] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    session = db.query(DBSession).filter(DBSession.id == req.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = db.query(DBMessage).filter(DBMessage.session_id == req.session_id).order_by(DBMessage.timestamp.asc()).all()
    history = [m.to_dict() for m in messages]

    # Calculate scoring metrics
    mem_session = session_store.get(req.session_id)
    metrics_summary = mem_session.metrics.get_summary() if mem_session else {}

    scoring_data = await interview_agent.evaluate_session_scoring(
        history=history,
        metrics=metrics_summary,
        target_role=session.target_role,
        target_company=session.target_company
    )

    # Save DBScore
    db_score = db.query(DBScore).filter(DBScore.session_id == req.session_id).first()
    if not db_score:
        db_score = DBScore(
            id=f"scr_{uuid.uuid4().hex[:12]}",
            session_id=req.session_id,
            user_id=session.user_id,
            overall_score=scoring_data["overall_score"],
            confidence_score=scoring_data["confidence_score"],
            clarity_score=scoring_data["clarity_score"],
            technical_score=scoring_data["technical_score"],
            star_score=scoring_data["star_score"],
            communication_score=scoring_data["communication_score"],
            wpm=scoring_data["wpm"],
            filler_word_count=scoring_data["filler_word_count"],
            interruption_count=scoring_data["interruption_count"],
            strengths_json=json.dumps(scoring_data["strengths"]),
            weaknesses_json=json.dumps(scoring_data["weaknesses"]),
            tips_json=json.dumps(scoring_data["tips"])
        )
        db.add(db_score)

    session.status = "completed"
    session.end_time = datetime.utcnow()
    db.commit()

    return {
        "session": session.to_dict(),
        "scoring": scoring_data,
        "transcript": history
    }

# ----------------------------------------------------
# 4. SESSIONS & REPORTS
# ----------------------------------------------------
@router.get("/sessions")
def list_sessions(user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(DBSession).filter(DBSession.user_id == user.id).order_by(DBSession.created_at.desc()).all()
    results = []
    for s in sessions:
        s_dict = s.to_dict()
        s_dict["score"] = s.scores.to_dict() if s.scores else None
        results.append(s_dict)
    return {"sessions": results}

@router.get("/sessions/{session_id}")
def get_session_details(session_id: str, db: Session = Depends(get_db)):
    session = db.query(DBSession).filter(DBSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = db.query(DBMessage).filter(DBMessage.session_id == session_id).order_by(DBMessage.timestamp.asc()).all()
    score = db.query(DBScore).filter(DBScore.session_id == session_id).first()

    return {
        "session": session.to_dict(),
        "scoring": score.to_dict() if score else None,
        "transcript": [m.to_dict() for m in messages]
    }

# ----------------------------------------------------
# 5. RIME TTS & LIVEKIT
# ----------------------------------------------------
@router.post("/tts/rime")
async def synthesize_speech(req: TTSRequest):
    comp = req.target_company.lower() if req.target_company else "google"
    speaker = req.speaker or COMPANY_CULTURES.get(comp, COMPANY_CULTURES["default"])["voice"]
    wav_bytes = await rime_service.synthesize_full_wav(req.text, persona=comp)
    return Response(content=wav_bytes, media_type="audio/wav")

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "EchoHire AI Voice Backend 2026",
        "timestamp": time.time(),
        "rime_tts": "Active (Mist/Coda)",
        "full_duplex": "Enabled"
    }
