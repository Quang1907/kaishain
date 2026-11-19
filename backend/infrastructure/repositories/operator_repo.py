"""
Operator & Shift Repository
Quản lý nhân sự đứng máy (Operators), chế độ đứng máy và lịch trình nghỉ ngơi, xoay tua (Break Schedules)
"""
from typing import Dict, Any, List, Optional
from backend.infrastructure.repositories.base_repository import BaseRepository

class OperatorRepository(BaseRepository):
    # ==========================================
    # 1. NHÂN SỰ ĐỨNG MÁY (OPERATORS)
    # ==========================================
    def get_all_operators(self) -> List[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute("""
                SELECT id, name, shift_type, 
                       CAST(shift_start_hour AS FLOAT) as shift_start_hour, 
                       CAST(shift_end_hour AS FLOAT) as shift_end_hour, 
                       mode_pref, assigned_product_code, assigned_machine_id, 
                       skill_level, is_relief
                FROM operators 
                ORDER BY shift_type, shift_start_hour, name
            """)
            rows = cur.fetchall()
            return [{
                "id": r["id"],
                "name": r["name"],
                "shift": r["shift_type"],
                "shift_type": r["shift_type"],
                "start": r["shift_start_hour"],
                "shift_start_hour": r["shift_start_hour"],
                "end": r["shift_end_hour"],
                "shift_end_hour": r["shift_end_hour"],
                "mode": r["mode_pref"],
                "mode_pref": r["mode_pref"],
                "assigned_product": r["assigned_product_code"],
                "assigned_product_code": r["assigned_product_code"],
                "assigned_machine": r["assigned_machine_id"],
                "assigned_machine_id": r["assigned_machine_id"],
                "skill": r["skill_level"],
                "skill_level": r["skill_level"],
                "is_relief": bool(r["is_relief"]),
                "is_relief_operator": bool(r["is_relief"])
            } for r in rows]

    def upsert_operator(self, op: Dict[str, Any]):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("""
                INSERT INTO operators (name, shift_type, shift_start_hour, shift_end_hour, mode_pref, assigned_product_code, assigned_machine_id, skill_level, is_relief)
                VALUES (%(name)s, %(shift_type)s, %(shift_start_hour)s, %(shift_end_hour)s, %(mode_pref)s, %(assigned_product_code)s, %(assigned_machine_id)s, %(skill_level)s, %(is_relief)s)
                ON CONFLICT(name) DO UPDATE SET
                    shift_type=EXCLUDED.shift_type,
                    shift_start_hour=EXCLUDED.shift_start_hour,
                    shift_end_hour=EXCLUDED.shift_end_hour,
                    mode_pref=EXCLUDED.mode_pref,
                    assigned_product_code=EXCLUDED.assigned_product_code,
                    assigned_machine_id=EXCLUDED.assigned_machine_id,
                    skill_level=EXCLUDED.skill_level,
                    is_relief=EXCLUDED.is_relief
            """)
            cur.execute(sql, {
                "name": op["name"],
                "shift_type": op.get("shift", op.get("shift_type", "DAY")),
                "shift_start_hour": float(op.get("start", op.get("shift_start_hour", 8.0))),
                "shift_end_hour": float(op.get("end", op.get("shift_end_hour", 17.0))),
                "mode_pref": op.get("mode", op.get("mode_pref", "BY_MACHINE")),
                "assigned_product_code": op.get("assigned_product", op.get("assigned_product_code")),
                "assigned_machine_id": op.get("assigned_machine", op.get("assigned_machine_id")),
                "skill_level": int(op.get("skill", op.get("skill_level", 2))),
                "is_relief": bool(op.get("is_relief", op.get("is_relief_operator", False)))
            })

    def delete_operator(self, operator_identifier: Any):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            if isinstance(operator_identifier, int) or (isinstance(operator_identifier, str) and operator_identifier.isdigit()):
                cur.execute(self._prepare_sql("DELETE FROM operators WHERE id = %(id)s"), {"id": int(operator_identifier)})
            else:
                cur.execute(self._prepare_sql("DELETE FROM operators WHERE name = %(name)s"), {"name": str(operator_identifier)})

    # ==========================================
    # 2. LỊCH NGHỈ NGƠI & XOAY TUA (BREAK SCHEDULES)
    # ==========================================
    def get_break_schedules(self) -> List[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT id, name, shift, CAST(start_hour AS FLOAT) as start_hour, CAST(end_hour AS FLOAT) as end_hour, coverage FROM break_schedules ORDER BY start_hour")
            return self._rows_to_list(cur.fetchall())

    def seed_break_schedules(self, breaks: List[Dict[str, Any]]):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute("DELETE FROM break_schedules")
            ins_sql = self._prepare_sql("INSERT INTO break_schedules (name, shift, start_hour, end_hour, coverage) VALUES (%(name)s, %(shift)s, %(start_hour)s, %(end_hour)s, %(coverage)s)")
            for b in breaks:
                cur.execute(ins_sql, {
                    "name": b["name"],
                    "shift": b["shift"],
                    "start_hour": float(b.get("start", b.get("start_hour", 8.0))),
                    "end_hour": float(b.get("end", b.get("end_hour", 17.0))),
                    "coverage": b.get("coverage", "")
                })
