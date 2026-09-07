import datetime
import json
from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from backend.utils.config import settings

def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

Base = declarative_base()
engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class DBUser(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    
    target_role = Column(String, default="Software Engineer")
    experience_level = Column(String, default="Entry Level")
    target_company = Column(String, default="Google")
    interview_type = Column(String, default="Technical")
    preferred_language = Column(String, default="en")
    difficulty = Column(String, default="medium")
    is_onboarded = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=utc_now)

    sessions = relationship("DBSession", back_populates="user", cascade="all, delete-orphan")
    scores = relationship("DBScore", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "target_role": self.target_role,
            "experience_level": self.experience_level,
            "target_company": self.target_company,
            "interview_type": self.interview_type,
            "preferred_language": self.preferred_language,
            "difficulty": self.difficulty,
            "is_onboarded": self.is_onboarded,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class DBSession(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    
    target_role = Column(String, default="Software Engineer")
    target_company = Column(String, default="Google")
    interview_type = Column(String, default="Technical")
    difficulty = Column(String, default="medium")
    language = Column(String, default="en")
    status = Column(String, default="active")
    
    start_time = Column(DateTime, default=utc_now)
    end_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("DBUser", back_populates="sessions")
    messages = relationship("DBMessage", back_populates="session", cascade="all, delete-orphan")
    scores = relationship("DBScore", back_populates="session", uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "target_role": self.target_role,
            "target_company": self.target_company,
            "interview_type": self.interview_type,
            "difficulty": self.difficulty,
            "language": self.language,
            "status": self.status,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class DBMessage(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("sessions.id"))
    role = Column(String)
    content = Column(Text)
    interrupted = Column(Boolean, default=False)
    latency_ms = Column(Float, default=0.0)
    audio_duration_ms = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=utc_now)

    session = relationship("DBSession", back_populates="messages")

    def to_dict(self):
        ts = int(self.timestamp.timestamp() * 1000) if self.timestamp else int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000)
        return {
            "id": self.id,
            "session_id": self.session_id,
            "role": self.role,
            "content": self.content,
            "interrupted": self.interrupted,
            "latency_ms": self.latency_ms,
            "timestamp": ts
        }

class DBScore(Base):
    __tablename__ = "scores"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("sessions.id"), unique=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    
    overall_score = Column(Integer, default=85)
    confidence_score = Column(Integer, default=84)
    clarity_score = Column(Integer, default=88)
    technical_score = Column(Integer, default=86)
    star_score = Column(Integer, default=80)
    communication_score = Column(Integer, default=87)
    
    wpm = Column(Float, default=135.0)
    filler_word_count = Column(Integer, default=0)
    interruption_count = Column(Integer, default=0)
    
    strengths_json = Column(Text, default="[]")
    weaknesses_json = Column(Text, default="[]")
    tips_json = Column(Text, default="[]")
    
    created_at = Column(DateTime, default=utc_now)

    session = relationship("DBSession", back_populates="scores")
    user = relationship("DBUser", back_populates="scores")

    def get_strengths(self):
        try:
            return json.loads(self.strengths_json)
        except Exception:
            return []

    def get_weaknesses(self):
        try:
            return json.loads(self.weaknesses_json)
        except Exception:
            return []

    def get_tips(self):
        try:
            return json.loads(self.tips_json)
        except Exception:
            return []

    def to_dict(self):
        return {
            "id": self.id,
            "session_id": self.session_id,
            "user_id": self.user_id,
            "overall_score": self.overall_score,
            "confidence_score": self.confidence_score,
            "clarity_score": self.clarity_score,
            "technical_score": self.technical_score,
            "star_score": self.star_score,
            "communication_score": self.communication_score,
            "wpm": self.wpm,
            "filler_word_count": self.filler_word_count,
            "interruption_count": self.interruption_count,
            "strengths": self.get_strengths(),
            "weaknesses": self.get_weaknesses(),
            "tips": self.get_tips(),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

def migrate_sqlite_tables():
    if not settings.DATABASE_URL.startswith("sqlite"):
        return
    try:
        with engine.connect() as conn:
            # Check sessions table columns
            res_sess = conn.execute(text("PRAGMA table_info(sessions)"))
            s_cols = [row[1] for row in res_sess.fetchall()]
            if s_cols:
                cols_to_add = [
                    ("target_role", "VARCHAR DEFAULT 'Software Engineer'"),
                    ("target_company", "VARCHAR DEFAULT 'Google'"),
                    ("interview_type", "VARCHAR DEFAULT 'Technical'"),
                    ("difficulty", "VARCHAR DEFAULT 'medium'"),
                    ("language", "VARCHAR DEFAULT 'en'"),
                    ("status", "VARCHAR DEFAULT 'active'"),
                    ("start_time", "DATETIME"),
                    ("end_time", "DATETIME"),
                    ("created_at", "DATETIME")
                ]
                for col_name, col_def in cols_to_add:
                    if col_name not in s_cols:
                        conn.execute(text(f"ALTER TABLE sessions ADD COLUMN {col_name} {col_def}"))
                conn.commit()

            # Check users table columns
            res_user = conn.execute(text("PRAGMA table_info(users)"))
            u_cols = [row[1] for row in res_user.fetchall()]
            if u_cols:
                user_cols_to_add = [
                    ("name", "VARCHAR DEFAULT 'Candidate'"),
                    ("email", "VARCHAR DEFAULT ''"),
                    ("password_hash", "VARCHAR DEFAULT ''"),
                    ("target_role", "VARCHAR DEFAULT 'Software Engineer'"),
                    ("experience_level", "VARCHAR DEFAULT 'Entry Level'"),
                    ("target_company", "VARCHAR DEFAULT 'Google'"),
                    ("interview_type", "VARCHAR DEFAULT 'Technical'"),
                    ("preferred_language", "VARCHAR DEFAULT 'en'"),
                    ("difficulty", "VARCHAR DEFAULT 'medium'"),
                    ("is_onboarded", "BOOLEAN DEFAULT 0"),
                    ("created_at", "DATETIME")
                ]
                for col_name, col_def in user_cols_to_add:
                    if col_name not in u_cols:
                        conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_def}"))
                conn.commit()

            # Check scores table columns
            res_score = conn.execute(text("PRAGMA table_info(scores)"))
            score_cols = [row[1] for row in res_score.fetchall()]
            if score_cols:
                score_cols_to_add = [
                    ("user_id", "VARCHAR REFERENCES users(id)"),
                    ("session_id", "VARCHAR REFERENCES sessions(id)"),
                    ("overall_score", "FLOAT DEFAULT 0.0"),
                    ("confidence_score", "FLOAT DEFAULT 0.0"),
                    ("clarity_score", "FLOAT DEFAULT 0.0"),
                    ("technical_score", "FLOAT DEFAULT 0.0"),
                    ("star_score", "FLOAT DEFAULT 0.0"),
                    ("communication_score", "FLOAT DEFAULT 0.0"),
                    ("wpm", "FLOAT DEFAULT 0.0"),
                    ("filler_word_count", "INTEGER DEFAULT 0"),
                    ("interruption_count", "INTEGER DEFAULT 0"),
                    ("strengths_json", "TEXT DEFAULT '[]'"),
                    ("weaknesses_json", "TEXT DEFAULT '[]'"),
                    ("tips_json", "TEXT DEFAULT '[]'"),
                    ("created_at", "DATETIME")
                ]
                for col_name, col_def in score_cols_to_add:
                    if col_name not in score_cols:
                        conn.execute(text(f"ALTER TABLE scores ADD COLUMN {col_name} {col_def}"))
                conn.commit()

            # Check messages table columns
            res_msg = conn.execute(text("PRAGMA table_info(messages)"))
            msg_cols = [row[1] for row in res_msg.fetchall()]
            if msg_cols:
                msg_cols_to_add = [
                    ("session_id", "VARCHAR REFERENCES sessions(id)"),
                    ("role", "VARCHAR"),
                    ("content", "TEXT"),
                    ("interrupted", "BOOLEAN DEFAULT 0"),
                    ("latency_ms", "FLOAT DEFAULT 0.0"),
                    ("audio_duration_ms", "FLOAT DEFAULT 0.0"),
                    ("timestamp", "DATETIME")
                ]
                for col_name, col_def in msg_cols_to_add:
                    if col_name not in msg_cols:
                        conn.execute(text(f"ALTER TABLE messages ADD COLUMN {col_name} {col_def}"))
                conn.commit()
    except Exception as e:
        pass

def seed_demo_user():
    try:
        from backend.utils.auth import get_password_hash
        db = SessionLocal()
        try:
            demo_email = "demo@echohire.ai"
            existing = db.query(DBUser).filter(DBUser.email == demo_email).first()
            if not existing:
                demo_user = DBUser(
                    id="usr_demo_echohire",
                    name="Alex Mercer",
                    email=demo_email,
                    password_hash=get_password_hash("EchoHire2026!"),
                    target_role="AI Engineer",
                    experience_level="Senior",
                    target_company="Google",
                    interview_type="Technical",
                    preferred_language="en",
                    difficulty="medium",
                    is_onboarded=True
                )
                db.add(demo_user)
                db.commit()
        finally:
            db.close()
    except Exception:
        pass

def init_db():
    Base.metadata.create_all(bind=engine)
    migrate_sqlite_tables()
    seed_demo_user()

# Auto-initialize tables
init_db()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
