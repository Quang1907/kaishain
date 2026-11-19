"""
Legacy Database Manager Facade
Quản lý kết nối Database Server và Connection Pooling được mô-đun hóa tại `backend.infrastructure.database.connection`
"""
from backend.infrastructure.database.connection import DatabaseManager, db_manager

__all__ = ["DatabaseManager", "db_manager"]
