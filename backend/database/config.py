"""
Database Server Configuration for Enterprise Manufacturing APS
Hỗ trợ PostgreSQL Server (Chính) và SQLite (Dự phòng)
"""
import os
import getpass
from urllib.parse import urlparse

class DatabaseConfig:
    # Lấy thông tin người dùng hệ thống hiện tại làm default user cho PostgreSQL trên Mac
    CURRENT_USER = getpass.getuser()
    
    # Kiểu DB: 'postgres' hoặc 'sqlite'
    DB_BACKEND = os.environ.get("DB_BACKEND", "postgres").lower()
    
    # Cấu hình PostgreSQL Server
    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_PORT = int(os.environ.get("DB_PORT", 5432))
    DB_NAME = os.environ.get("DB_NAME", "factory_aps")
    DB_USER = os.environ.get("DB_USER", CURRENT_USER)
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
    
    # Hỗ trợ DATABASE_URL (chuẩn Heroku / Railway / Docker / Kubernetes)
    DATABASE_URL = os.environ.get("DATABASE_URL")
    if DATABASE_URL:
        parsed = urlparse(DATABASE_URL)
        DB_BACKEND = "postgres" if "postgres" in parsed.scheme else "sqlite"
        DB_USER = parsed.username or DB_USER
        DB_PASSWORD = parsed.password or DB_PASSWORD
        DB_HOST = parsed.hostname or DB_HOST
        DB_PORT = parsed.port or DB_PORT
        DB_NAME = parsed.path.lstrip("/") or DB_NAME

    # Cấu hình Connection Pool cho PostgreSQL
    POOL_MIN_CONN = int(os.environ.get("DB_POOL_MIN", 2))
    POOL_MAX_CONN = int(os.environ.get("DB_POOL_MAX", 20))
    
    # Đường dẫn file SQLite dự phòng
    SQLITE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "factory_aps.db"))

config = DatabaseConfig()
