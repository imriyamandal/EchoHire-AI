import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from dotenv import load_dotenv, find_dotenv

# Locate and load .env from project root or working directory
dotenv_path = find_dotenv(usecwd=True)
if dotenv_path:
    load_dotenv(dotenv_path)
else:
    load_dotenv()

# Determine canonical project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DEFAULT_DB_PATH = (PROJECT_ROOT / "echohire.db").resolve()

def resolve_db_url(url: Optional[str]) -> str:
    raw = url or os.getenv("DATABASE_URL", "")
    if not raw or raw == "sqlite:///./echohire.db" or raw == "sqlite:///echohire.db":
        return f"sqlite:///{str(DEFAULT_DB_PATH).replace(os.sep, '/')}"
    if raw.startswith("sqlite:///") and not raw.startswith("sqlite:////"):
        rel_path = raw.replace("sqlite:///", "")
        if rel_path.startswith("./"):
            rel_path = rel_path[2:]
        if not os.path.isabs(rel_path):
            abs_path = (PROJECT_ROOT / rel_path).resolve()
            return f"sqlite:///{str(abs_path).replace(os.sep, '/')}"
    return raw

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    ENV: str = os.getenv("ENV", "development")

    # JWT Authentication Secret Key
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "echohire_ai_jwt_secret_2026_super_secure_key")

    # Rime TTS (Primary Voice Engine)
    RIME_API_KEY: Optional[str] = os.getenv("RIME_API_KEY", "")
    RIME_DEFAULT_SPEAKER: str = os.getenv("RIME_DEFAULT_SPEAKER", "allison")
    RIME_MODEL_ID: str = os.getenv("RIME_MODEL_ID", "mist")
    RIME_API_URL: str = os.getenv("RIME_API_URL", "https://users.rime.ai/v1/rime-tts")
    RIME_WS_URL: str = os.getenv("RIME_WS_URL", "wss://users-ws.rime.ai/ws3")
    
    # Deepgram STT
    DEEPGRAM_API_KEY: Optional[str] = os.getenv("DEEPGRAM_API_KEY", "")

    # LiveKit WebRTC
    LIVEKIT_URL: Optional[str] = os.getenv("LIVEKIT_URL", "")
    LIVEKIT_API_KEY: Optional[str] = os.getenv("LIVEKIT_API_KEY", "")
    LIVEKIT_API_SECRET: Optional[str] = os.getenv("LIVEKIT_API_SECRET", "")

    # LLM Providers
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-flash-latest")

    # Database
    DATABASE_URL: str = resolve_db_url(os.getenv("DATABASE_URL"))

settings = Settings()
