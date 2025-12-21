#swappable with JWT-based identity resolution in future phases

from fastapi import Header, HTTPException, status
from typing import Optional


def get_current_user_id(
    x_user_id: Optional[str] = Header(None),
):
    """
    Phase 16.1.2
    Header-based identity resolution.
    """

    if not x_user_id or not x_user_id.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-User-Id header",
        )

    return x_user_id.strip()