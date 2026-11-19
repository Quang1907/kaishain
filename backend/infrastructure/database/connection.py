"""
Enterprise Database Connection Manager
Quản lý Threaded Connection Pool cho PostgreSQL Server (Chính) & SQLite (Dự phòng)
"""
import os
import time
import sqlite3
from contextlib import contextmanager
from typing import Generator, Any, Dict, Optional
from backend.config.settings import settings

# Kiểm tra driver psycopg2 cho PostgreSQL
HAS_PSYCOPG2 = False
try:
    import psycopg2
    from psycopg2 import pool, extras
    from psycopg2.extras import RealDictCursor
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False

class DatabaseManager:
    _instance: Optional["DatabaseManager"] = None

    def __new__(cls) -> "DatabaseManager":
        if cls._instance is None:
            cls._instance = super(DatabaseManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if getattr(self, "_initialized", False):
            return
        self.backend = "postgres" if HAS_PSYCOPG2 and settings.is_postgres_configured else "sqlite"
        self.pg_pool = None
        self.server_version = "Unknown"
        self._initialized = True
        self.init_database()

    def init_database(self):
        """Khởi tạo Connection Pool và thực hiện Auto-migration Schema"""
        if self.backend == "postgres":
            try:
                print(f"🐘 Đang kết nối tới PostgreSQL Server tại {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}...")
                conn_kwargs = {
                    "minconn": settings.POOL_MIN_CONN,
                    "maxconn": settings.POOL_MAX_CONN,
                    "cursor_factory": RealDictCursor
                }
                if settings.DATABASE_URL:
                    conn_kwargs["dsn"] = settings.DATABASE_URL
                else:
                    conn_kwargs.update({
                        "host": settings.DB_HOST,
                        "port": settings.DB_PORT,
                        "dbname": settings.DB_NAME,
                        "user": settings.DB_USER,
                        "password": settings.DB_PASSWORD,
                    })

                self.pg_pool = pool.ThreadedConnectionPool(**conn_kwargs)

                # Migration Schema
                schema_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "database", "postgres_schema.sql"))
                with self.get_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute("SELECT version();")
                        self.server_version = cur.fetchone()["version"]
                        if os.path.exists(schema_path):
                            with open(schema_path, "r", encoding="utf-8") as f:
                                ddl_script = f.read()
                            cur.execute(ddl_script)
                print(f"✅ Đã khởi tạo schema thành công trên PostgreSQL Server ({self.server_version})!")
            except Exception as e:
                print(f"⚠️ Không thể kết nối PostgreSQL Server: {e}. Tự động fallback sang SQLite...")
                self.backend = "sqlite"
                self.init_sqlite_schema()
        else:
            self.init_sqlite_schema()

    def init_sqlite_schema(self):
        """Khởi tạo SQLite cục bộ với WAL mode và Foreign Keys enforced"""
        os.makedirs(os.path.dirname(settings.SQLITE_PATH), exist_ok=True)
        from backend.database.db_manager_sqlite_ddl import init_sqlite_ddl
        init_sqlite_ddl(settings.SQLITE_PATH)
        self.server_version = f"SQLite {sqlite3.sqlite_version}"
        print(f"📁 Đã kích hoạt SQLite Database tại: {settings.SQLITE_PATH}")

    @contextmanager
    def get_connection(self) -> Generator[Any, None, None]:
        """Cung cấp Transaction Context Manager thread-safe"""
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
            conn = sqlite3.connect(settings.SQLITE_PATH)
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
        """Kiểm tra độ trễ và số kết nối hoạt động của Database"""
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
                    if os.path.exists(settings.SQLITE_PATH):
                        db_size_str = f"{round(os.path.getsize(settings.SQLITE_PATH) / 1024, 2)} KB"

            latency_ms = round((time.time() - start_time) * 1000, 2)
        except Exception as e:
            status = f"UNHEALTHY: {str(e)}"
            latency_ms = -1

        return {
            "status": status,
            "backend": self.backend,
            "server_version": self.server_version,
            "host": settings.DB_HOST if self.backend == "postgres" else "localhost (file)",
            "port": settings.DB_PORT if self.backend == "postgres" else "N/A",
            "database_name": settings.DB_NAME if self.backend == "postgres" else os.path.basename(settings.SQLITE_PATH),
            "latency_ms": latency_ms,
            "active_connections": active_connections,
            "db_size": db_size_str
        }

db_manager = DatabaseManager()
