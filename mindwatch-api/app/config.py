"""
Host-agnostic configuration. All provider URLs come from environment variables.
Swap Supabase → Neon → RDS by changing DATABASE_URL only.
"""
from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings. Loaded from environment or .env file."""

    # Database - swap provider by changing URL
    database_url: str = Field(
        default="sqlite:///./mindwatch.db",
        description="PostgreSQL or SQLite. Supabase: postgresql://...",
    )

    # Auth - supports header-based (dev) or JWT (prod)
    auth_mode: str = Field(
        default="header",
        description="header | jwt. Use header for dev with X-User-Id.",
    )
    jwt_secret: Optional[str] = Field(
        default=None,
        description="JWT signing secret. Required when auth_mode=jwt.",
    )
    jwt_algorithm: str = Field(
        default="HS256",
        description="JWT signing algorithm.",
    )
    access_token_expire_minutes: int = Field(
        default=60,
        description="Access token lifetime in minutes.",
    )
    supabase_jwt_secret: Optional[str] = Field(
        default=None,
        description="Supabase JWT secret for validating Supabase Auth tokens",
    )

    # CORS - configurable origins
    cors_origins: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        description="Comma-separated allowed origins",
    )

    # Workers
    monitoring_interval_seconds: int = Field(default=300, description="Monitoring worker interval")
    orchestration_interval_seconds: int = Field(default=600, description="Orchestration worker interval")
    snapshot_interval_seconds: int = Field(default=86400, description="Daily snapshot interval (24h)")
    
    monitoring_escalation_threshold: int = Field(default=2)
    monitoring_cooldown_threshold: int = Field(default=3)
    trend_streak_threshold: int = Field(default=2)
    alert_dedup_window_hours: int = Field(default=24)
    trend_dedup_hours: int = Field(default=6)
    
    signal_weights: dict = Field(default={"positive": 0.70, "negative": 0.30})
    phq9_floor_map: dict = Field(default={
        "minimal": None,
        "mild": 40.0,
        "moderate": 25.0,
        "moderately_severe": 15.0,
        "severe": 5.0,
    })

    # App
    debug: bool = Field(default=False, description="Enable debug mode")
    environment: str = Field(default="development", description="development | staging | production")

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()


def get_cors_origins_list():
    """Parse CORS origins from config."""
    s = get_settings()
    return [o.strip() for o in s.cors_origins.split(",") if o.strip()]
