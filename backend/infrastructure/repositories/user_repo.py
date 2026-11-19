"""
User & Access Audit Repository
Quản lý người dùng, vai trò phân quyền (RBAC) và nhật ký đăng nhập
"""
from typing import Dict, Any, List, Optional
from backend.infrastructure.repositories.base_repository import BaseRepository

class UserRepository(BaseRepository):
    def get_all_users(self) -> List[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT id, username, full_name, role, avatar_url, assigned_machine_or_task, is_active, last_login, created_at FROM users ORDER BY id")
            return self._rows_to_list(cur.fetchall())

    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute(self._prepare_sql("SELECT * FROM users WHERE username = %(u)s AND is_active = TRUE"), {"u": username})
            row = cur.fetchone()
            return self._row_to_dict(row)

    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute(self._prepare_sql("SELECT * FROM users WHERE id = %(id)s"), {"id": user_id})
            row = cur.fetchone()
            return self._row_to_dict(row)

    def upsert_user(self, user_data: Dict[str, Any]) -> int:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("""
                INSERT INTO users (
                    username, password_hash, full_name, role, avatar_url, assigned_machine_or_task, is_active
                ) VALUES (
                    %(username)s, %(password_hash)s, %(full_name)s, %(role)s, %(avatar_url)s, %(task)s, %(is_active)s
                )
                ON CONFLICT (username) DO UPDATE SET
                    password_hash = CASE WHEN EXCLUDED.password_hash != '' THEN EXCLUDED.password_hash ELSE users.password_hash END,
                    full_name = EXCLUDED.full_name,
                    role = EXCLUDED.role,
                    avatar_url = EXCLUDED.avatar_url,
                    assigned_machine_or_task = EXCLUDED.assigned_machine_or_task,
                    is_active = EXCLUDED.is_active
                RETURNING id
            """ if self.db.backend == "postgres" else """
                INSERT INTO users (
                    username, password_hash, full_name, role, avatar_url, assigned_machine_or_task, is_active
                ) VALUES (
                    %(username)s, %(password_hash)s, %(full_name)s, %(role)s, %(avatar_url)s, %(task)s, %(is_active)s
                )
                ON CONFLICT (username) DO UPDATE SET
                    password_hash = CASE WHEN EXCLUDED.password_hash != '' THEN EXCLUDED.password_hash ELSE users.password_hash END,
                    full_name = EXCLUDED.full_name,
                    role = EXCLUDED.role,
                    avatar_url = EXCLUDED.avatar_url,
                    assigned_machine_or_task = EXCLUDED.assigned_machine_or_task,
                    is_active = EXCLUDED.is_active
            """)
            cur.execute(sql, {
                "username": user_data["username"],
                "password_hash": user_data.get("password_hash", ""),
                "full_name": user_data.get("full_name", user_data["username"]),
                "role": user_data.get("role", "user"),
                "avatar_url": user_data.get("avatar_url", ""),
                "task": user_data.get("assigned_machine_or_task", ""),
                "is_active": bool(user_data.get("is_active", True))
            })
            if self.db.backend == "postgres":
                row = cur.fetchone()
                return row["id"]
            return cur.lastrowid

    def update_user_last_login(self, user_id: int):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %(id)s")
            cur.execute(sql, {"id": user_id})
