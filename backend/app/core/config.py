from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Application settings loaded from environment variables and .env."""

    model_config = SettingsConfigDict(
        env_file=(BACKEND_DIR / ".env", BACKEND_DIR / ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str = "sqlite:///./homefin.db"
    PROJECT_NAME: str = "Financial AI API"
    VERSION: str = "1.0.0"
    DEBUG: bool = False


@lru_cache
def get_settings() -> Settings:
    """Return a cached settings instance."""
    return Settings()


settings = get_settings()
