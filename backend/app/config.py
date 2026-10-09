import os
from pathlib import Path
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Campus Intelligence"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Predict, Optimize & Improve Student Success - KPMG Student Analytics Suite"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = Field(
        default=f"sqlite:///{BASE_DIR / 'smart_campus.db'}",
        description="Database connection string (SQLite for local, PostgreSQL for cloud)"
    )
    
    @property
    def normalized_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql://", 1)
        return url

    # Models directory
    MODELS_DIR: Path = BASE_DIR / "models"
    
    # Security / Auth
    SECRET_KEY: str = Field(
        default=os.getenv("SECRET_KEY", "smart-campus-kpmg-enterprise-secret-key-2026"),
        description="Secret key for JWT generation and verification"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS: Explicit allowed frontend origins (no wildcard with allow_credentials=True)
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "https://smart-campus-intelligence.vercel.app"
    ]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="allow")

settings = Settings()
