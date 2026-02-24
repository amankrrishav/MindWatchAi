from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from jose import JWTError, jwt

from app.config import get_settings


class JWTConfigError(RuntimeError):
    pass


def _get_jwt_params() -> tuple[str, str, int]:
    settings = get_settings()
    if not settings.jwt_secret:
        raise JWTConfigError("JWT_SECRET (jwt_secret) is not configured")
    return settings.jwt_secret, settings.jwt_algorithm, settings.access_token_expire_minutes


def create_access_token(subject: str, extra_claims: Optional[Dict[str, Any]] = None) -> str:
    """
    Create a signed JWT access token.

    subject: user identifier (user_id)
    """
    secret, algorithm, expire_minutes = _get_jwt_params()
    to_encode: Dict[str, Any] = {"sub": subject}
    if extra_claims:
        to_encode.update(extra_claims)
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, secret, algorithm=algorithm)


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and validate a JWT, returning its claims."""
    secret, algorithm, _ = _get_jwt_params()
    try:
        payload = jwt.decode(token, secret, algorithms=[algorithm])
    except JWTError as e:
        raise JWTError(f"Invalid token: {e}") from e
    return payload

