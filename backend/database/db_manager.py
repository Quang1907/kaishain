"""
Enterprise Database Manager supporting PostgreSQL Server (Primary) & SQLite (Fallback)
Hệ thống Quản lý Cơ sở Dữ liệu Đa nền tảng Cấp Doanh nghiệp:
- Hỗ trợ PostgreSQL Server với Threaded Connection Pooling
- Fallback thông minh sang SQLite nếu không có server ngoài
- Tự động Migration / DDL schema khi khởi động
- Cung cấp Transaction context manager an toàn tuyệt đối
"""
import os
import sys
import time
from contextlib import contextmanager
from typing import Generator, Any, Dict, Optional, Tuple

from backend.database.config import config

# Kiểm tra thư viện driver PostgreSQL
HAS_PSYCOPG2 = False
try:
    import psycopg2
    from psycopg2 import pool, extras
    from psycopg2.extras import RealDictCursor
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False

import sqlite3

POSTGRES_SCHEMA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "postgres_schema.sql"))
SQLITE_DB_PATH = config.SQLITE_PATH

class DatabaseManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if getattr(self, "_initialized", False):
            return
        self.backend = config.DB_BACKEND
        self.pg_pool = None
        self.server_version = "Unknown"
        self._initialized = True
        self.init_database()

    def init_database(self):
        """Khởi tạo kết nối và DDL cho database được cấu hình"""
        if self.backend == "postgres" and HAS_PSYCOPG2:
            try:
                print(f"🐘 Đang kết nối tới PostgreSQL Server tại {config.DB_HOST}:{config.DB_PORT}/{config.DB_NAME}...")
                self.pg_pool = pool.ThreadedConnectionPool(
                    minconn=config.POOL_MIN_CONN,
                    maxconn=config.POOL_MAX_CONN,
                    host=config.DB_HOST,
                    port=config.DB_PORT,
                    dbname=config.DB_NAME,
                    user=config.DB_USER,
                    password=config.DB_PASSWORD,
                    cursor_factory=RealDictCursor
                )
                
                # Kiểm tra version và tạo bảng
                conn = self.pg_pool.getconn()
                try:
                    with conn.cursor() as cur:
                        cur.execute("SELECT version();")
                        ver_row = cur.fetchone()
                        self.server_version = ver_row["version"].split(",")[0] if ver_row else "PostgreSQL"
                        
                        # Chạy file DDL schema
                        if os.path.exists(POSTGRES_SCHEMA_PATH):
                            with open(POSTGRES_SCHEMA_PATH, "r", encoding="utf-8") as f:
                                ddl = f.read()
                            cur.execute(ddl)
                            conn.commit()
                            print(f"✅ Đã khởi tạo schema thành công trên PostgreSQL Server ({self.server_version})!")
                finally:
                    self.pg_pool.putconn(conn)
                return
            except Exception as e:
                print(f"⚠️ Cảnh báo: Không thể kết nối PostgreSQL Server ({e}). Chuyển sang chế độ SQLite dự phòng!")
                self.backend = "sqlite"

        # Khởi tạo SQLite fallback nếu cấu hình hoặc kết nối Postgres thất bại
        self.backend = "sqlite"
        self.init_sqlite()

    def init_sqlite(self):
        """Khởi tạo SQLite dự phòng"""
        os.makedirs(os.path.dirname(SQLITE_DB_PATH), exist_ok=True)
        from backend.database.db_manager_sqlite_ddl import SQLITE_SCHEMA_SQL
        with sqlite3.connect(SQLITE_DB_PATH) as conn:
            conn.execute("PRAGMA foreign_keys = ON;")
            conn.execute("PRAGMA journal_mode = WAL;")
            conn.executescript(SQLITE_SCHEMA_SQL)
            conn.commit()
        self.server_version = f"SQLite {sqlite3.sqlite_version}"
        print(f"📦 Đang sử dụng SQLite Database dự phòng tại: {SQLITE_DB_PATH}")

    @contextmanager
    def get_connection(self) -> Generator[Any, None, None]:
        """
        Context manager quản lý kết nối an toàn cho cả PostgreSQL và SQLite:
        - Tự động Commit khi hoàn thành
        - Tự động Rollback khi gặp ngoại lệ
        - Trả kết nối về Pool khi dùng PostgreSQL
        """
        if self.backend == "postgres" and self.pg_pool:
            conn = self.pg_pool.getconn()
            try:
                yield conn
                conn.commit()
            except Exception:
                conn.rollback()
                raise
            finally:
                self.pg_pool.putconn(conn)
        else:
            conn = sqlite3.connect(SQLITE_DB_PATH)
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA foreign_keys = ON;")
            conn.execute("PRAGMA journal_mode = WAL;")
            try:
                yield conn
                conn.commit()
            except Exception:
                conn.rollback()
                raise
            finally:
                conn.close()

    def check_health(self) -> Dict[str, Any]:
        """Kiểm tra sức khỏe và độ trễ của Database Server"""
        start_time = time.time()
        status = "HEALTHY"
        active_connections = 1
        db_size_str = "Unknown"

        try:
            with self.get_connection() as conn:
                cur = conn.cursor()
                if self.backend == "postgres":
                    cur.execute("SELECT pg_database_size(current_database()) as size, count(*) as conns FROM pg_stat_activity WHERE datname = current_database();")
                    row = cur.fetchone()
                    if row:
                        bytes_size = row["size"]
                        db_size_str = f"{round(bytes_size / 1024, 2)} KB"
                        active_connections = row["conns"]
                else:
                    if os.path.exists(SQLITE_DB_PATH):
                        db_size_str = f"{round(os.path.getsize(SQLITE_DB_PATH) / 1024, 2)} KB"

            latency_ms = round((time.time() - start_time) * 1000, 2)
        except Exception as e:
            status = f"UNHEALTHY: {str(e)}"
            latency_ms = -1

        return {
            "status": status,
            "backend": self.backend,
            "server_version": self.server_version,
            "host": config.DB_HOST if self.backend == "postgres" else "localhost (file)",
            "port": config.DB_PORT if self.backend == "postgres" else "N/A",
            "database_name": config.DB_NAME if self.backend == "postgres" else os.path.basename(SQLITE_DB_PATH),
            "latency_ms": latency_ms,
            "active_connections": active_connections,
            "db_size": db_size_str
        }

# Khởi tạo singleton
db_manager = DatabaseManager()
