from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Project Management Dashboard"
    API_V1_STR: str = "/api/v1"
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/pm_dashboard"
    
    # Security
    SECRET_KEY: str = "CHANGE_THIS_TO_A_GOOD_SECRET_KEY"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # File Storage
    MEDIA_DIR: str = "media"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
