import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.utils.config import settings
from backend.models.database import init_db
from backend.api.routes import router as api_router
from backend.api.ws_duplex import router as ws_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("echohire")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing EchoHire AI database...")
    init_db()
    logger.info("EchoHire AI backend ready on port %s", settings.PORT)
    yield
    logger.info("EchoHire AI backend shutting down...")

app = FastAPI(
    title="EchoHire AI - Real-Time Voice Interview Coach",
    description="Full-duplex voice interview AI with instant interruption cancellation powered by Rime TTS & LiveKit.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST & WebSocket routes
app.include_router(api_router)
app.include_router(ws_router)

@app.get("/")
def root():
    return {
        "app": "EchoHire AI",
        "tagline": "The Interview Coach That Listens Like a Human",
        "status": "online",
        "docs": "/docs",
        "primary_tts": "Rime TTS (https://rime.ai)",
        "full_duplex": "Active"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
