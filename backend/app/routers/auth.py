from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import create_access_token, require_owner, verify_password
from app.schemas import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    if not verify_password(payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Wrong password"
        )
    token, expires_in = create_access_token()
    return TokenResponse(access_token=token, expires_in=expires_in)


@router.get("/me")
def me(owner: str = Depends(require_owner)) -> dict[str, str]:
    return {"sub": owner}
