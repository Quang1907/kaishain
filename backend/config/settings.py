"""
Enterprise Configuration Management
Hệ thống cấu hình môi trường tập trung, hỗ trợ biến môi trường .env và cấu hình chuẩn Docker/K8s
"""
import os
from dataclasses import dataclass
from typing import Optional

@dataclass(frozen=True)
class Settings:
    # Environment
    ENV: str = os.getenv("APP_ENV", "production")
    DEBUG: bool = os.getenv("APP_DEBUG", "false").lower() in ("true", "1", "yes")

    # Database Configuration
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")
    DB_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    DB_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
    DB_NAME: str = os.getenv("POSTGRES_DB", "factory_aps")
    DB_USER: str = os.getenv("POSTGRES_USER", os.getenv("USER", "postgres"))
    DB_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "")

    # Connection Pool Settings
    POOL_MIN_CONN: int = int(os.getenv("POOL_MIN_CONN", "2"))
    POOL_MAX_CONN: int = int(os.getenv("POOL_MAX_CONN", "20"))
    POOL_TIMEOUT_SEC: float = float(os.getenv("POOL_TIMEOUT_SEC", "10.0"))

    # SQLite Fallback Path
    SQLITE_PATH: str = os.getenv(
        "SQLITE_PATH",
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "database", "factory_aps.db"))
    )

    # Server Settings
    SERVER_HOST: str = os.getenv("SERVER_HOST", "0.0.0.0")
    SERVER_PORT: int = int(os.getenv("PORT", "8080"))

    # Frontend Assets Paths
    FRONTEND_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend"))
    FRONTEND_DIST_DIR: str = os.path.join(FRONTEND_DIR, "dist")

    # Authentication & Security
    AUTH_SECRET_KEY: str = os.getenv("AUTH_SECRET_KEY", "kaisha_secret_key_aps_brain_2026")
    SESSION_EXPIRY_SECONDS: int = int(os.getenv("SESSION_EXPIRY_SECONDS", "604800")) # 7 days

    @property
    def is_postgres_configured(self) -> bool:
        return bool(self.DATABASE_URL or self.DB_HOST)

settings = Settings()
