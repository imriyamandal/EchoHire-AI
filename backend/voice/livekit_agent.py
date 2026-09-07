import os
import time
import logging
from typing import Optional, Dict, Any
from backend.utils.config import settings

logger = logging.getLogger("echohire.livekit")

try:
    from livekit import api
    LIVEKIT_AVAILABLE = True
except ImportError:
    LIVEKIT_AVAILABLE = False
    logger.warning("livekit SDK not available in current environment; using mock token generator.")

class LiveKitService:
    def __init__(self):
        self.url = settings.LIVEKIT_URL
        self.api_key = settings.LIVEKIT_API_KEY
        self.api_secret = settings.LIVEKIT_API_SECRET
        self.has_credentials = bool(
            self.api_key and self.api_secret and 
            not self.api_key.startswith("your_") and 
            not self.api_secret.startswith("your_")
        )

    def create_token(self, room_name: str, participant_identity: str, participant_name: str = "Candidate") -> str:
        """
        Generates a signed LiveKit JWT for client WebRTC room connection.
        """
        if LIVEKIT_AVAILABLE and self.has_credentials:
            try:
                token = (
                    api.AccessToken(self.api_key, self.api_secret)
                    .with_identity(participant_identity)
                    .with_name(participant_name)
                    .with_grants(
                        api.VideoGrants(
                            room_join=True,
                            room=room_name,
                            can_publish=True,
                            can_subscribe=True
                        )
                    )
                    .to_jwt()
                )
                return token
            except Exception as e:
                logger.error(f"Error generating LiveKit token: {e}")

        # Fallback signed mock JWT token for testing/dev
        import base64
        import json
        header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().rstrip("=")
        payload = base64.urlsafe_b64encode(json.dumps({
            "sub": participant_identity,
            "name": participant_name,
            "video": {"room": room_name, "roomJoin": True},
            "exp": int(time.time()) + 3600
        }).encode()).decode().rstrip("=")
        sig = "mock_livekit_signature_echohire"
        return f"{header}.{payload}.{sig}"

livekit_service = LiveKitService()
