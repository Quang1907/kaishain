"""
Base Repository
Cung cấp các tiện ích xử lý câu lệnh SQL đa phương ngữ (PostgreSQL vs SQLite) và chuyển đổi kết quả truy vấn
"""
import re
from typing import Dict, Any, List, Optional
from backend.infrastructure.database.connection import DatabaseManager, db_manager

class BaseRepository:
    def __init__(self, database_manager: Optional[DatabaseManager] = None):
        self.db = database_manager or db_manager

    def _prepare_sql(self, sql: str) -> str:
        """
        Chuyển đổi cú pháp placeholder giữa các hệ quản trị CSDL:
        - PostgreSQL: %(param)s
        - SQLite: :param
        """
        if self.db.backend == "sqlite":
            return re.sub(r"%\(([\w_]+)\)s", r":\1", sql)
        return sql

    def _row_to_dict(self, row: Any) -> Optional[Dict[str, Any]]:
        if row is None:
            return None
        return dict(row)

    def _rows_to_list(self, rows: List[Any]) -> List[Dict[str, Any]]:
        return [dict(r) for r in rows]
