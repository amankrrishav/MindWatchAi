"""Authentication API: register, login, current user."""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.db.session import get_db
from app.db.models import User, WellnessCheckIn, PHQ9Analysis, RiskAlert
from app.auth.jwt import create_access_token
from app.auth.context import get_current_user_id


router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserOut(BaseModel):
    id: str
    email: EmailStr
    created_at: datetime


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


def _hash_password(password: str) -> str:
    return pwd_context.hash(password)


def _verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = User(
        email=payload.email.lower(),
        password_hash=_hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(subject=str(user.id))
    return AuthResponse(
        access_token=token,
        user=UserOut(id=user.id, email=user.email, created_at=user.created_at),
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not _verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = create_access_token(subject=str(user.id))
    return AuthResponse(
        access_token=token,
        user=UserOut(id=user.id, email=user.email, created_at=user.created_at),
    )


@router.get("/me", response_model=UserOut)
def me(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserOut(id=user.id, email=user.email, created_at=user.created_at)


@router.get("/export")
def export_user_data(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Export all user data to comply with data portability requirements."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    checkins = db.query(WellnessCheckIn).filter(WellnessCheckIn.user_id == user_id).all()
    phq9 = db.query(PHQ9Analysis).filter(PHQ9Analysis.user_id == user_id).all()
    alerts = db.query(RiskAlert).filter(RiskAlert.user_id == user_id).all()

    return {
        "user": {
            "email": user.email,
            "created_at": user.created_at,
        },
        "checkins": [
            {
                "id": c.id,
                "mood": c.mood,
                "sleep_quality": c.sleep_quality,
                "energy": c.energy,
                "anxiety": c.anxiety,
                "social": c.social,
                "focus": c.focus,
                "appetite": c.appetite,
                "wellness_score": c.wellness_score,
                "notes": c.notes,
                "created_at": c.created_at
            } for c in checkins
        ],
        "phq9": [
            {
                "id": p.id,
                "severity": p.severity,
                "raw_score": p.total_score,
                "created_at": p.created_at
            } for p in phq9
        ],
        "alerts": [
            {
                "id": a.id,
                "risk_level": a.risk_level,
                "reasons": a.reasons,
                "created_at": a.created_at
            } for a in alerts
        ]
    }

