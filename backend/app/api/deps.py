"""API dependencies for authentication and common utilities."""

from typing import Annotated

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.services.supabase import get_public_supabase_client


security = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> dict:
    """
    Validate JWT token and return user information.

    Args:
        credentials: Bearer token from Authorization header.

    Returns:
        User data from Supabase auth.

    Raises:
        HTTPException: If token is invalid or expired.
    """
    token = credentials.credentials

    try:
        client = get_public_supabase_client()
        response = client.auth.get_user(token)

        if not response or not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return {
            "id": response.user.id,
            "email": response.user.email,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


CurrentUser = Annotated[dict, Depends(get_current_user)]
