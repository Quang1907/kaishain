"""
Workflow Repository (Technician & Material Manager Operations)
Quản lý Nhật ký nghiệm thu thay khuôn (○ 型替) và Nhật ký cấp liệu phễu sấy (Material Prep)
"""
from typing import Dict, Any, List, Optional
from backend.infrastructure.repositories.base_repository import BaseRepository

class WorkflowRepository(BaseRepository):
    # ==========================================
    # 1. NHẬT KÝ THAY KHUÔN (THỢ MÁY - 型替 ○)
    # ==========================================
    def get_mold_change_logs(self, schedule_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            query = "SELECT mcl.*, m.tonnage, p.name as product_name FROM mold_change_logs mcl JOIN machines m ON mcl.machine_id = m.id JOIN products p ON mcl.product_code = p.code WHERE 1=1"
            params = {}
            if schedule_id:
                query += " AND mcl.schedule_id = %(sched_id)s"
                params["sched_id"] = schedule_id
            if status:
                query += " AND mcl.status = %(status)s"
                params["status"] = status
            query += " ORDER BY mcl.machine_id, mcl.id"
            cur.execute(self._prepare_sql(query), params)
            return self._rows_to_list(cur.fetchall())

    def upsert_mold_log(self, data: Dict[str, Any]) -> int:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("""
                INSERT INTO mold_change_logs (
                    schedule_id, machine_id, product_code, technician_name, status,
                    cooling_line_checked, clamping_torque_checked, temp_barrel_checked, first_shot_passed,
                    confirmed_by, notes
                ) VALUES (
                    %(schedule_id)s, %(machine_id)s, %(product_code)s, %(technician_name)s, %(status)s,
                    %(cooling_line_checked)s, %(clamping_torque_checked)s, %(temp_barrel_checked)s, %(first_shot_passed)s,
                    %(confirmed_by)s, %(notes)s
                ) RETURNING id
            """ if self.db.backend == "postgres" else """
                INSERT INTO mold_change_logs (
                    schedule_id, machine_id, product_code, technician_name, status,
                    cooling_line_checked, clamping_torque_checked, temp_barrel_checked, first_shot_passed,
                    confirmed_by, notes
                ) VALUES (
                    %(schedule_id)s, %(machine_id)s, %(product_code)s, %(technician_name)s, %(status)s,
                    %(cooling_line_checked)s, %(clamping_torque_checked)s, %(temp_barrel_checked)s, %(first_shot_passed)s,
                    %(confirmed_by)s, %(notes)s
                )
            """)
            cur.execute(sql, {
                "schedule_id": data["schedule_id"],
                "machine_id": data["machine_id"],
                "product_code": data["product_code"],
                "technician_name": data.get("technician_name", "宮地 (Miyaji)"),
                "status": data.get("status", "PENDING"),
                "cooling_line_checked": bool(data.get("cooling_line_checked", False)),
                "clamping_torque_checked": bool(data.get("clamping_torque_checked", False)),
                "temp_barrel_checked": bool(data.get("temp_barrel_checked", False)),
                "first_shot_passed": bool(data.get("first_shot_passed", False)),
                "confirmed_by": data.get("confirmed_by"),
                "notes": data.get("notes", "")
            })
            if self.db.backend == "postgres":
                row = cur.fetchone()
                return row["id"]
            return cur.lastrowid

    def confirm_mold_change(self, log_id: int, technician_name: str, notes: str = "", checks: Dict[str, bool] = None) -> bool:
        """Ký xác nhận hoàn tất nghiệm thu thay khuôn (○ 型替) 4 bước an toàn"""
        checks = checks or {}
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("""
                UPDATE mold_change_logs SET
                    status = 'CONFIRMED',
                    completed_at = CURRENT_TIMESTAMP,
                    confirmed_by = %(tech)s,
                    confirmed_at = CURRENT_TIMESTAMP,
                    cooling_line_checked = %(cooling)s,
                    clamping_torque_checked = %(clamping)s,
                    temp_barrel_checked = %(temp)s,
                    first_shot_passed = %(first_shot)s,
                    notes = %(notes)s
                WHERE id = %(id)s
            """)
            cur.execute(sql, {
                "id": log_id,
                "tech": technician_name,
                "cooling": bool(checks.get("cooling_water", True)),
                "clamping": bool(checks.get("clamping_force", True)),
                "temp": bool(checks.get("barrel_temp", True)),
                "first_shot": bool(checks.get("first_shot_qc", True)),
                "notes": notes
            })
            return True

    # ==========================================
    # 2. NHẬT KÝ SẤY NHỰA & CẤP LIỆU (QUẢN LÝ NGUYÊN LIỆU)
    # ==========================================
    def get_material_prep_logs(self, schedule_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            query = """
                SELECT mpl.*, m.resin_name, m.color_code, m.is_dry_coat as mat_dry_coat, p.name as product_name 
                FROM material_prep_logs mpl 
                JOIN materials m ON mpl.resin_id = m.id 
                JOIN products p ON mpl.product_code = p.code 
                WHERE 1=1
            """
            params = {}
            if schedule_id:
                query += " AND mpl.schedule_id = %(sched_id)s"
                params["sched_id"] = schedule_id
            if status:
                query += " AND mpl.status = %(status)s"
                params["status"] = status
            query += " ORDER BY mpl.machine_id, mpl.id"
            cur.execute(self._prepare_sql(query), params)
            return self._rows_to_list(cur.fetchall())

    def upsert_material_log(self, data: Dict[str, Any]) -> int:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("""
                INSERT INTO material_prep_logs (
                    schedule_id, machine_id, product_code, resin_id, hopper_id,
                    target_temp, target_hours, actual_temp, status, is_dry_coat, staging_boxes_ready, notes
                ) VALUES (
                    %(schedule_id)s, %(machine_id)s, %(product_code)s, %(resin_id)s, %(hopper_id)s,
                    %(target_temp)s, %(target_hours)s, %(actual_temp)s, %(status)s, %(is_dry_coat)s, %(staging_boxes_ready)s, %(notes)s
                ) RETURNING id
            """ if self.db.backend == "postgres" else """
                INSERT INTO material_prep_logs (
                    schedule_id, machine_id, product_code, resin_id, hopper_id,
                    target_temp, target_hours, actual_temp, status, is_dry_coat, staging_boxes_ready, notes
                ) VALUES (
                    %(schedule_id)s, %(machine_id)s, %(product_code)s, %(resin_id)s, %(hopper_id)s,
                    %(target_temp)s, %(target_hours)s, %(actual_temp)s, %(status)s, %(is_dry_coat)s, %(staging_boxes_ready)s, %(notes)s
                )
            """)
            cur.execute(sql, {
                "schedule_id": data["schedule_id"],
                "machine_id": data["machine_id"],
                "product_code": data["product_code"],
                "resin_id": data["resin_id"],
                "hopper_id": data.get("hopper_id", f"HOPPER-{data['resin_id'][:8]}"),
                "target_temp": int(data.get("target_temp", 80)),
                "target_hours": float(data.get("target_hours", 3.0)),
                "actual_temp": int(data.get("actual_temp", data.get("target_temp", 80))),
                "status": data.get("status", "WAITING"),
                "is_dry_coat": bool(data.get("is_dry_coat", False)),
                "staging_boxes_ready": bool(data.get("staging_boxes_ready", True)),
                "notes": data.get("notes", "")
            })
            if self.db.backend == "postgres":
                row = cur.fetchone()
                return row["id"]
            return cur.lastrowid

    def confirm_material_prep(self, log_id: int, manager_name: str, actual_temp: int, notes: str = "", boxes_ready: bool = True) -> bool:
        """Ký xác nhận hoàn tất sấy nhựa & tập kết bao bì thùng ra line"""
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("""
                UPDATE material_prep_logs SET
                    status = 'READY',
                    actual_temp = %(actual_temp)s,
                    staging_boxes_ready = %(boxes_ready)s,
                    confirmed_by = %(mgr)s,
                    confirmed_at = CURRENT_TIMESTAMP,
                    notes = %(notes)s
                WHERE id = %(id)s
            """)
            cur.execute(sql, {
                "id": log_id,
                "mgr": manager_name,
                "actual_temp": actual_temp,
                "boxes_ready": boxes_ready,
                "notes": notes
            })
            return True
