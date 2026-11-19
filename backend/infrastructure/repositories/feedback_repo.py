"""
Feedback & Metrics Repository
Quản lý lịch sử học máy thích ứng (Machine Learning Feedback Loops) và thống kê Database Server
"""
import os
from typing import Dict, Any, List
from backend.infrastructure.repositories.base_repository import BaseRepository
from backend.config.settings import settings

class FeedbackRepository(BaseRepository):
    # ==========================================
    # 1. NHẬT KÝ HỌC MÁY (LEARNING FEEDBACK LOGS)
    # ==========================================
    def log_learning_feedback(self, data: Dict[str, Any]):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("""
                INSERT INTO learning_feedback_logs (
                    product_code, machine_id, scraps, actual_run_hours, planned_run_hours,
                    prev_buffer_pct, new_buffer_pct, prev_oee, new_oee, note
                ) VALUES (
                    %(product_code)s, %(machine_id)s, %(scraps)s, %(actual_run_hours)s, %(planned_run_hours)s,
                    %(prev_buffer_pct)s, %(new_buffer_pct)s, %(prev_oee)s, %(new_oee)s, %(note)s
                )
            """)
            cur.execute(sql, {
                "product_code": data["product_code"],
                "machine_id": data["machine_id"],
                "scraps": int(data.get("scraps", 0)),
                "actual_run_hours": float(data.get("actual_run_hours", 8.0)),
                "planned_run_hours": float(data.get("planned_run_hours", 8.0)),
                "prev_buffer_pct": float(data.get("prev_buffer_pct", 3.0)),
                "new_buffer_pct": float(data.get("new_buffer_pct", 3.0)),
                "prev_oee": float(data.get("prev_oee", 0.95)),
                "new_oee": float(data.get("new_oee", 0.95)),
                "note": data.get("note", "")
            })

            # Cập nhật trực tiếp đệm an toàn mới vào bảng sản phẩm
            upd_sql = self._prepare_sql("UPDATE products SET defect_buffer_pct = %(buf)s WHERE code = %(code)s")
            cur.execute(upd_sql, {
                "buf": float(data["new_buffer_pct"]),
                "code": data["product_code"]
            })

    def get_recent_feedback_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute(self._prepare_sql("""
                SELECT id, timestamp, product_code, machine_id, scraps,
                       CAST(actual_run_hours AS FLOAT) as actual_run_hours,
                       CAST(planned_run_hours AS FLOAT) as planned_run_hours,
                       CAST(prev_buffer_pct AS FLOAT) as prev_buffer_pct,
                       CAST(new_buffer_pct AS FLOAT) as new_buffer_pct,
                       CAST(prev_oee AS FLOAT) as prev_oee,
                       CAST(new_oee AS FLOAT) as new_oee,
                       note
                FROM learning_feedback_logs
                ORDER BY id DESC
                LIMIT %(limit)s
            """), {"limit": limit})
            return self._rows_to_list(cur.fetchall())

    # ==========================================
    # 2. THỐNG KÊ DATABASE SERVER (METRICS & STATS)
    # ==========================================
    def get_db_stats(self) -> Dict[str, Any]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            counts = {}
            tables = [
                "machines", "materials", "boxes", "products", "product_machines",
                "operators", "schedules", "job_blocks", "shipping_orders",
                "break_schedules", "learning_feedback_logs", "users",
                "mold_change_logs", "material_prep_logs"
            ]
            for t in tables:
                try:
                    cur.execute(f"SELECT count(*) as c FROM {t}")
                    res = cur.fetchone()
                    counts[t] = res["c"] if isinstance(res, dict) else res[0]
                except Exception:
                    counts[t] = 0

            file_size_kb = 0
            active_connections = 1
            if self.db.backend == "postgres":
                try:
                    cur.execute("SELECT pg_database_size(current_database()) as size, count(*) as conns FROM pg_stat_activity WHERE datname = current_database();")
                    row = cur.fetchone()
                    if row:
                        file_size_kb = round(row["size"] / 1024, 2)
                        active_connections = row["conns"]
                except Exception:
                    file_size_kb = 0
            else:
                if os.path.exists(settings.SQLITE_PATH):
                    file_size_kb = round(os.path.getsize(settings.SQLITE_PATH) / 1024, 2)

            return {
                "db_type": f"Enterprise RDBMS ({self.db.backend.upper()})",
                "backend": self.db.backend,
                "server_version": self.db.server_version,
                "host": settings.DB_HOST if self.db.backend == "postgres" else "localhost (file)",
                "port": settings.DB_PORT if self.db.backend == "postgres" else "N/A",
                "database_name": settings.DB_NAME if self.db.backend == "postgres" else os.path.basename(settings.SQLITE_PATH),
                "db_file": settings.DB_NAME if self.db.backend == "postgres" else settings.SQLITE_PATH,
                "file_size_kb": file_size_kb,
                "wal_mode": True,
                "active_connections": active_connections,
                "table_counts": counts
            }
