"""Auth context. Supports header-based (dev) or JWT (prod). Swappable via config."""
from typing import Optional
from fastapi import Header, HTTPException, status

from app.config import get_settings


def get_current_user_id(x_user_id: Optional[str] = Header(None, alias="X-User-Id")) -> str:
    """Resolve user identity. Header-based for dev; extend for JWT when ready."""
    settings = get_settings()
    if settings.auth_mode == "header":
        if not x_user_id or not x_user_id.strip():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing X-User-Id header",
            )
        return x_user_id.strip()
    # Future: JWT validation via supabase_jwt_secret or jwt_secret
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="JWT auth not yet implemented",
    )
