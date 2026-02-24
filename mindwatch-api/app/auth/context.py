"""Auth context. Supports header-based (dev) or JWT (prod). Swappable via config."""
from typing import Optional
from fastapi import Header, HTTPException, status, Depends

from app.config import get_settings
from app.auth.jwt import decode_token


def _get_user_from_header(x_user_id: Optional[str]) -> str:
    if not x_user_id or not x_user_id.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-User-Id header",
        )
    return x_user_id.strip()


def _get_user_from_jwt(authorization: Optional[str]) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )
    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject",
        )
    return str(sub)


def get_current_user_id(
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
) -> str:
    """
    Resolve user identity.
    - When AUTH_MODE=header: use X-User-Id (dev/testing)
    - When AUTH_MODE=jwt: use Authorization: Bearer <token>
    """
    settings = get_settings()
    if settings.auth_mode == "header":
        return _get_user_from_header(x_user_id)
    if settings.auth_mode == "jwt":
        return _get_user_from_jwt(authorization)
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Unsupported auth_mode configuration",
    )

