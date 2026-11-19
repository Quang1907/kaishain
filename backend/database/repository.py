"""
Enterprise Repository Pattern Data Access Layer
Tương thích hoàn toàn với PostgreSQL Server (Primary) & SQLite (Fallback)
Hỗ trợ tham số hóa truy vấn an toàn (Parameterized queries), chống SQL Injection tuyệt đối
"""
import json
import re
from typing import List, Dict, Any, Optional
from backend.database.db_manager import db_manager

class FactoryRepository:
    def __init__(self):
        self.db = db_manager

    def _prepare_sql(self, sql: str) -> str:
        """Chuyển đổi cú pháp placeholder %(name)s (PostgreSQL) sang :name (SQLite) khi chạy SQLite"""
        if self.db.backend == "postgres":
            return sql
        return re.sub(r'%\((\w+)\)s', r':\1', sql)

    # ==========================================
    # 1. QUẢN LÝ MÁY ÉP (MACHINES CRUD)
    # ==========================================
    def get_all_machines(self) -> List[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = (
                r"SELECT id, tonnage, is_new, CAST(power_kw AS FLOAT) as power_kw, bay, status FROM machines ORDER BY bay, CAST(NULLIF(regexp_replace(id, '\D', '', 'g'), '') AS INTEGER)"
                if self.db.backend == "postgres"
                else "SELECT id, tonnage, is_new, power_kw, bay, status FROM machines ORDER BY bay, CAST(REPLACE(REPLACE(id, '号機', ''), '旧', '') AS INTEGER)"
            )
            cur.execute(sql)
            rows = cur.fetchall()
            return [dict(r) for r in rows]

    def get_machine_by_id(self, machine_id: str) -> Optional[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("SELECT * FROM machines WHERE id = %(id)s")
            cur.execute(sql, {"id": machine_id})
            row = cur.fetchone()
            return dict(row) if row else None

    def upsert_machine(self, machine_data: Dict[str, Any]):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("""
                INSERT INTO machines (id, tonnage, is_new, power_kw, bay, status)
                VALUES (%(id)s, %(tonnage)s, %(is_new)s, %(power_kw)s, %(bay)s, %(status)s)
                ON CONFLICT(id) DO UPDATE SET
                    tonnage=EXCLUDED.tonnage,
                    is_new=EXCLUDED.is_new,
                    power_kw=EXCLUDED.power_kw,
                    bay=EXCLUDED.bay,
                    status=EXCLUDED.status
            """)
            cur.execute(sql, {
                "id": machine_data["id"],
                "tonnage": machine_data.get("tonnage", 110),
                "is_new": bool(machine_data.get("is_new", False)),
                "power_kw": float(machine_data.get("power_kw", 22.0)),
                "bay": machine_data.get("bay", "A"),
                "status": machine_data.get("status", "PLANNED_STOP")
            })

    def update_machine_status(self, machine_id: str, new_status: str):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("UPDATE machines SET status = %(status)s WHERE id = %(id)s")
            cur.execute(sql, {"status": new_status, "id": machine_id})

    # ==========================================
    # 2. QUẢN LÝ NGUYÊN LIỆU HẠT NHỰA (MATERIALS CRUD)
    # ==========================================
    def get_all_materials(self) -> List[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT id, resin_name, color_code, is_dry_coat, dry_temp_celsius, CAST(dry_time_hours AS FLOAT) as dry_time_hours, hopper_id FROM materials ORDER BY id")
            rows = cur.fetchall()
            return [dict(r) for r in rows]

    def upsert_material(self, mat: Dict[str, Any]):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("""
                INSERT INTO materials (id, resin_name, color_code, is_dry_coat, dry_temp_celsius, dry_time_hours, hopper_id)
                VALUES (%(id)s, %(resin_name)s, %(color_code)s, %(is_dry_coat)s, %(dry_temp_celsius)s, %(dry_time_hours)s, %(hopper_id)s)
                ON CONFLICT(id) DO UPDATE SET
                    resin_name=EXCLUDED.resin_name,
                    color_code=EXCLUDED.color_code,
                    is_dry_coat=EXCLUDED.is_dry_coat,
                    dry_temp_celsius=EXCLUDED.dry_temp_celsius,
                    dry_time_hours=EXCLUDED.dry_time_hours,
                    hopper_id=EXCLUDED.hopper_id
            """)
            cur.execute(sql, {
                "id": mat["id"],
                "resin_name": mat["resin_name"],
                "color_code": mat.get("color_code", "Black"),
                "is_dry_coat": bool(mat.get("is_dry_coat", False)),
                "dry_temp_celsius": int(mat.get("dry_temp_celsius", 80)),
                "dry_time_hours": float(mat.get("dry_time_hours", 3.0)),
                "hopper_id": mat.get("hopper_id")
            })

    # ==========================================
    # 3. QUẢN LÝ THÙNG ĐÓNG GÓI (BOXES CRUD)
    # ==========================================
    def get_all_boxes(self) -> List[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT id, box_name, pcs_per_box, CAST(staging_lead_hours AS FLOAT) as staging_lead_hours, inventory_qty FROM boxes ORDER BY id")
            rows = cur.fetchall()
            return [dict(r) for r in rows]

    def upsert_box(self, box: Dict[str, Any]):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("""
                INSERT INTO boxes (id, box_name, pcs_per_box, staging_lead_hours, inventory_qty)
                VALUES (%(id)s, %(box_name)s, %(pcs_per_box)s, %(staging_lead_hours)s, %(inventory_qty)s)
                ON CONFLICT(id) DO UPDATE SET
                    box_name=EXCLUDED.box_name,
                    pcs_per_box=EXCLUDED.pcs_per_box,
                    staging_lead_hours=EXCLUDED.staging_lead_hours,
                    inventory_qty=EXCLUDED.inventory_qty
            """)
            cur.execute(sql, {
                "id": box["id"],
                "box_name": box["box_name"],
                "pcs_per_box": int(box.get("pcs_per_box", 100)),
                "staging_lead_hours": float(box.get("staging_lead_hours", 1.0)),
                "inventory_qty": int(box.get("inventory_qty", 500))
            })

    # ==========================================
    # 4. QUẢN LÝ SẢN PHẨM & BOM (PRODUCTS CRUD)
    # ==========================================
    def get_all_products(self) -> Dict[str, Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute("""
                SELECT p.code, p.name, p.material_id, p.box_id, 
                       CAST(p.cycle_time_sec AS FLOAT) as cycle_time_sec, p.cavity, 
                       p.preferred_mode, p.dedicated_operator_name, 
                       CAST(p.defect_buffer_pct AS FLOAT) as defect_buffer_pct,
                       m.resin_name, m.color_code, m.is_dry_coat, m.dry_temp_celsius, 
                       CAST(m.dry_time_hours AS FLOAT) as dry_time_hours,
                       b.box_name, b.pcs_per_box, 
                       CAST(b.staging_lead_hours AS FLOAT) as staging_lead_hours
                FROM products p
                JOIN materials m ON p.material_id = m.id
                JOIN boxes b ON p.box_id = b.id
                ORDER BY p.code
            """)
            prod_rows = cur.fetchall()

            products_dict = {}
            for row in prod_rows:
                code = row["code"]
                # Lấy danh sách máy tương thích
                sql_compat = self._prepare_sql("SELECT machine_id FROM product_machines WHERE product_code = %(code)s ORDER BY priority")
                cur.execute(sql_compat, {"code": code})
                m_rows = cur.fetchall()
                comp_machines = [r["machine_id"] for r in m_rows]

                products_dict[code] = {
                    "code": code,
                    "name": row["name"],
                    "material": {
                        "resin_id": row["material_id"],
                        "name": row["resin_name"],
                        "color": row["color_code"],
                        "is_dry_coat": bool(row["is_dry_coat"]),
                        "dry_temp": row["dry_temp_celsius"],
                        "dry_hours": row["dry_time_hours"]
                    },
                    "box": {
                        "box_id": row["box_id"],
                        "name": row["box_name"],
                        "pcs_per_box": row["pcs_per_box"],
                        "staging_lead_hours": row["staging_lead_hours"]
                    },
                    "cycle_time_sec": row["cycle_time_sec"],
                    "cavity": row["cavity"],
                    "compatible_machines": comp_machines,
                    "preferred_mode": row["preferred_mode"],
                    "dedicated_operator": row["dedicated_operator_name"],
                    "defect_buffer_pct": row["defect_buffer_pct"]
                }
            return products_dict

    def upsert_product(self, prod: Dict[str, Any], compatible_machines: List[str]):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("""
                INSERT INTO products (code, name, material_id, box_id, cycle_time_sec, cavity, preferred_mode, dedicated_operator_name, defect_buffer_pct)
                VALUES (%(code)s, %(name)s, %(material_id)s, %(box_id)s, %(cycle_time_sec)s, %(cavity)s, %(preferred_mode)s, %(dedicated_operator_name)s, %(defect_buffer_pct)s)
                ON CONFLICT(code) DO UPDATE SET
                    name=EXCLUDED.name,
                    material_id=EXCLUDED.material_id,
                    box_id=EXCLUDED.box_id,
                    cycle_time_sec=EXCLUDED.cycle_time_sec,
                    cavity=EXCLUDED.cavity,
                    preferred_mode=EXCLUDED.preferred_mode,
                    dedicated_operator_name=EXCLUDED.dedicated_operator_name,
                    defect_buffer_pct=EXCLUDED.defect_buffer_pct
            """)
            cur.execute(sql, {
                "code": prod["code"],
                "name": prod["name"],
                "material_id": prod["material_id"],
                "box_id": prod["box_id"],
                "cycle_time_sec": float(prod["cycle_time_sec"]),
                "cavity": int(prod.get("cavity", 2)),
                "preferred_mode": prod.get("preferred_mode", "BY_MACHINE"),
                "dedicated_operator_name": prod.get("dedicated_operator_name"),
                "defect_buffer_pct": float(prod.get("defect_buffer_pct", 3.0))
            })

            # Xóa và cập nhật lại quan hệ máy tương thích
            del_sql = self._prepare_sql("DELETE FROM product_machines WHERE product_code = %(code)s")
            cur.execute(del_sql, {"code": prod["code"]})

            ins_compat_sql = self._prepare_sql("INSERT INTO product_machines (product_code, machine_id, priority) VALUES (%(code)s, %(machine_id)s, %(priority)s)")
            for i, m_id in enumerate(compatible_machines):
                cur.execute(ins_compat_sql, {
                    "code": prod["code"],
                    "machine_id": m_id,
                    "priority": i + 1
                })

    # ==========================================
    # 5. QUẢN LÝ NHÂN SỰ ĐỨNG MÁY (OPERATORS CRUD)
    # ==========================================
    def get_all_operators(self) -> List[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT id, name, shift_type, CAST(shift_start_hour AS FLOAT) as shift_start_hour, CAST(shift_end_hour AS FLOAT) as shift_end_hour, mode_pref, assigned_product_code, assigned_machine_id, skill_level, is_relief FROM operators ORDER BY shift_type, shift_start_hour, name")
            rows = cur.fetchall()
            return [{
                "id": r["id"],
                "name": r["name"],
                "shift": r["shift_type"],
                "start": r["shift_start_hour"],
                "end": r["shift_end_hour"],
                "mode": r["mode_pref"],
                "assigned_product": r["assigned_product_code"],
                "assigned_machine": r["assigned_machine_id"],
                "skill": r["skill_level"],
                "is_relief": bool(r["is_relief"])
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
                "shift_type": op.get("shift", "DAY"),
                "shift_start_hour": float(op.get("start", 8.0)),
                "shift_end_hour": float(op.get("end", 17.0)),
                "mode_pref": op.get("mode", "BY_MACHINE"),
                "assigned_product_code": op.get("assigned_product"),
                "assigned_machine_id": op.get("assigned_machine"),
                "skill_level": int(op.get("skill", 2)),
                "is_relief": bool(op.get("is_relief", False))
            })

    # ==========================================
    # 6. QUẢN LÝ LỊCH TRÌNH 24H (SCHEDULES & JOBS)
    # ==========================================
    def get_schedule_by_date(self, date_str: str) -> Optional[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("SELECT id, date_str, day_of_week, is_optimized, notes FROM schedules WHERE id = %(date_str)s OR date_str = %(date_str)s")
            cur.execute(sql, {"date_str": date_str})
            sched_row = cur.fetchone()
            if not sched_row:
                return None

            sched_id = sched_row["id"]
            sql_jobs = self._prepare_sql("""
                SELECT id, machine_id, product_code, 
                       CAST(start_hour AS FLOAT) as start_hour, 
                       CAST(end_hour AS FLOAT) as end_hour, 
                       planned_qty, event_type, operator_name, 
                       material_status, box_status 
                FROM job_blocks 
                WHERE schedule_id = %(sched_id)s 
                ORDER BY machine_id, start_hour
            """)
            cur.execute(sql_jobs, {"sched_id": sched_id})
            job_rows = cur.fetchall()

            jobs = [{
                "id": j["id"],
                "machine": j["machine_id"],
                "product": j["product_code"],
                "start": j["start_hour"],
                "end": j["end_hour"],
                "planned_qty": j["planned_qty"],
                "event": j["event_type"],
                "op": j["operator_name"],
                "material_status": j["material_status"],
                "box_status": j["box_status"]
            } for j in job_rows]

            notes = []
            if sched_row["notes"]:
                try:
                    notes = json.loads(sched_row["notes"])
                except Exception:
                    notes = [sched_row["notes"]]

            return {
                "id": sched_id,
                "date": sched_row["date_str"],
                "day_of_week": sched_row["day_of_week"],
                "is_optimized": bool(sched_row["is_optimized"]),
                "notes": notes,
                "jobs": jobs
            }

    def save_schedule(self, sched_id: str, date_str: str, day_of_week: str, notes: List[str], jobs: List[Dict[str, Any]], is_optimized: bool = False):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql_sched = self._prepare_sql("""
                INSERT INTO schedules (id, date_str, day_of_week, is_optimized, notes)
                VALUES (%(id)s, %(date_str)s, %(day_of_week)s, %(is_optimized)s, %(notes)s)
                ON CONFLICT(id) DO UPDATE SET
                    date_str=EXCLUDED.date_str,
                    day_of_week=EXCLUDED.day_of_week,
                    is_optimized=EXCLUDED.is_optimized,
                    notes=EXCLUDED.notes
            """)
            cur.execute(sql_sched, {
                "id": sched_id,
                "date_str": date_str,
                "day_of_week": day_of_week,
                "is_optimized": bool(is_optimized),
                "notes": json.dumps(notes, ensure_ascii=False)
            })

            # Xóa các job cũ và ghi lại toàn bộ
            del_sql = self._prepare_sql("DELETE FROM job_blocks WHERE schedule_id = %(sched_id)s")
            cur.execute(del_sql, {"sched_id": sched_id})

            ins_job_sql = self._prepare_sql("""
                INSERT INTO job_blocks (id, schedule_id, machine_id, product_code, start_hour, end_hour, planned_qty, event_type, operator_name, material_status, box_status)
                VALUES (%(id)s, %(schedule_id)s, %(machine_id)s, %(product_code)s, %(start_hour)s, %(end_hour)s, %(planned_qty)s, %(event_type)s, %(operator_name)s, %(material_status)s, %(box_status)s)
            """)
            for j in jobs:
                cur.execute(ins_job_sql, {
                    "id": j.get("id"),
                    "schedule_id": sched_id,
                    "machine_id": j.get("machine"),
                    "product_code": j.get("product"),
                    "start_hour": float(j.get("start")),
                    "end_hour": float(j.get("end")),
                    "planned_qty": int(j.get("planned_qty", 0)),
                    "event_type": j.get("event", "PROD"),
                    "operator_name": j.get("op"),
                    "material_status": j.get("material_status", "READY"),
                    "box_status": j.get("box_status", "READY")
                })

    # ==========================================
    # 7. QUẢN LÝ LỆNH XUẤT HÀNG (SHIPPING ORDERS)
    # ==========================================
    def get_all_shipping_orders(self) -> List[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute("""
                SELECT so.order_id, so.customer, so.product_code, so.order_qty, 
                       so.ship_date, CAST(so.ship_deadline_hour AS FLOAT) as ship_deadline_hour, 
                       so.status, so.safety_buffer_units,
                       p.name as product_name, b.id as box_id, b.box_name, b.pcs_per_box
                FROM shipping_orders so
                JOIN products p ON so.product_code = p.code
                JOIN boxes b ON p.box_id = b.id
                ORDER BY so.ship_date, so.ship_deadline_hour
            """)
            rows = cur.fetchall()
            return [{
                "order_id": r["order_id"],
                "customer": r["customer"],
                "product": r["product_code"],
                "product_name": r["product_name"],
                "order_qty": r["order_qty"],
                "ship_date": r["ship_date"],
                "ship_deadline_hour": r["ship_deadline_hour"],
                "box_type": r["box_id"],
                "box_name": r["box_name"],
                "boxes_required": -(-r["order_qty"] // r["pcs_per_box"]),
                "status": r["status"],
                "safety_buffer_units": r["safety_buffer_units"]
            } for r in rows]

    def upsert_shipping_order(self, order: Dict[str, Any]):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("""
                INSERT INTO shipping_orders (order_id, customer, product_code, order_qty, ship_date, ship_deadline_hour, status, safety_buffer_units)
                VALUES (%(order_id)s, %(customer)s, %(product_code)s, %(order_qty)s, %(ship_date)s, %(ship_deadline_hour)s, %(status)s, %(safety_buffer_units)s)
                ON CONFLICT(order_id) DO UPDATE SET
                    customer=EXCLUDED.customer,
                    product_code=EXCLUDED.product_code,
                    order_qty=EXCLUDED.order_qty,
                    ship_date=EXCLUDED.ship_date,
                    ship_deadline_hour=EXCLUDED.ship_deadline_hour,
                    status=EXCLUDED.status,
                    safety_buffer_units=EXCLUDED.safety_buffer_units
            """)
            cur.execute(sql, {
                "order_id": order["order_id"],
                "customer": order["customer"],
                "product_code": order["product"],
                "order_qty": int(order["order_qty"]),
                "ship_date": order["ship_date"],
                "ship_deadline_hour": float(order["ship_deadline_hour"]),
                "status": order.get("status", "PREPARING"),
                "safety_buffer_units": int(order.get("safety_buffer_units", 0))
            })

    # ==========================================
    # 8. LỊCH NGHỈ NGƠI & XOAY TUA (BREAKS)
    # ==========================================
    def get_break_schedules(self) -> List[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT id, name, shift, CAST(start_hour AS FLOAT) as start_hour, CAST(end_hour AS FLOAT) as end_hour, coverage FROM break_schedules ORDER BY start_hour")
            rows = cur.fetchall()
            return [dict(r) for r in rows]

    def seed_break_schedules(self, breaks: List[Dict[str, Any]]):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute("DELETE FROM break_schedules")
            ins_sql = self._prepare_sql("INSERT INTO break_schedules (name, shift, start_hour, end_hour, coverage) VALUES (%(name)s, %(shift)s, %(start_hour)s, %(end_hour)s, %(coverage)s)")
            for b in breaks:
                cur.execute(ins_sql, {
                    "name": b["name"],
                    "shift": b["shift"],
                    "start_hour": float(b["start"]),
                    "end_hour": float(b["end"]),
                    "coverage": b["coverage"]
                })

    # ==========================================
    # 9. NHẬT KÝ HỌC MÁY & ĐỆM AN TOÀN (FEEDBACK LOGS)
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
                "scraps": int(data["scraps"]),
                "actual_run_hours": float(data["actual_run_hours"]),
                "planned_run_hours": float(data["planned_run_hours"]),
                "prev_buffer_pct": float(data["prev_buffer_pct"]),
                "new_buffer_pct": float(data["new_buffer_pct"]),
                "prev_oee": float(data["prev_oee"]),
                "new_oee": float(data["new_oee"]),
                "note": data.get("note", "")
            })

            # Cập nhật trực tiếp đệm an toàn mới vào bảng sản phẩm
            upd_sql = self._prepare_sql("UPDATE products SET defect_buffer_pct = %(buf)s WHERE code = %(code)s")
            cur.execute(upd_sql, {
                "buf": float(data["new_buffer_pct"]),
                "code": data["product_code"]
            })

    def get_recent_feedback_logs(self, limit: int = 20) -> List[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("""
                SELECT id, timestamp, product_code, machine_id, scraps, 
                       CAST(actual_run_hours AS FLOAT) as actual_run_hours, 
                       CAST(planned_run_hours AS FLOAT) as planned_run_hours, 
                       CAST(prev_buffer_pct AS FLOAT) as prev_buffer_pct, 
                       CAST(new_buffer_pct AS FLOAT) as new_buffer_pct, 
                       CAST(prev_oee AS FLOAT) as prev_oee, 
                       CAST(new_oee AS FLOAT) as new_oee, 
                       note 
                FROM learning_feedback_logs 
                ORDER BY timestamp DESC LIMIT %(limit)s
            """)
            cur.execute(sql, {"limit": limit})
            rows = cur.fetchall()
            return [dict(r) for r in rows]

    # ==========================================
    # 10. QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN (USERS)
    # ==========================================
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("SELECT * FROM users WHERE username = %(username)s AND is_active = TRUE" if self.db.backend == "postgres" else "SELECT * FROM users WHERE username = %(username)s AND is_active = 1")
            cur.execute(sql, {"username": username})
            row = cur.fetchone()
            return dict(row) if row else None

    def get_all_users(self) -> List[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT id, username, full_name, role, avatar_url, assigned_machine_or_task, is_active, last_login, created_at FROM users ORDER BY role, username")
            rows = cur.fetchall()
            return [dict(r) for r in rows]

    def upsert_user(self, user: Dict[str, Any]):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("""
                INSERT INTO users (username, password_hash, full_name, role, avatar_url, assigned_machine_or_task, is_active)
                VALUES (%(username)s, %(password_hash)s, %(full_name)s, %(role)s, %(avatar_url)s, %(assigned_machine_or_task)s, %(is_active)s)
                ON CONFLICT(username) DO UPDATE SET
                    password_hash=EXCLUDED.password_hash,
                    full_name=EXCLUDED.full_name,
                    role=EXCLUDED.role,
                    avatar_url=EXCLUDED.avatar_url,
                    assigned_machine_or_task=EXCLUDED.assigned_machine_or_task,
                    is_active=EXCLUDED.is_active
            """)
            cur.execute(sql, {
                "username": user["username"],
                "password_hash": user["password_hash"],
                "full_name": user["full_name"],
                "role": user["role"],
                "avatar_url": user.get("avatar_url", ""),
                "assigned_machine_or_task": user.get("assigned_machine_or_task", ""),
                "is_active": bool(user.get("is_active", True))
            })

    def update_user_last_login(self, user_id: int):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %(id)s")
            cur.execute(sql, {"id": user_id})

    # ==========================================
    # 11. NHẬT KÝ THAY KHUÔN & XÁC NHẬN NGHIỆM THU (THỢ MÁY)
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
            rows = cur.fetchall()
            return [dict(r) for r in rows]

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
        """Ký xác nhận hoàn tất nghiệm thu thay khuôn (○ 型替)"""
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
                WHERE id = %(id)s RETURNING machine_id
            """ if self.db.backend == "postgres" else """
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
                "cooling": bool(checks.get("cooling_line", True)),
                "clamping": bool(checks.get("clamping_torque", True)),
                "temp": bool(checks.get("temp_barrel", True)),
                "first_shot": bool(checks.get("first_shot", True)),
                "notes": notes
            })
            
            # Cập nhật trạng thái máy ép sang RUNNING
            row = cur.fetchone() if self.db.backend == "postgres" else None
            m_id = row["machine_id"] if row else None
            if not m_id:
                cur.execute(self._prepare_sql("SELECT machine_id FROM mold_change_logs WHERE id = %(id)s"), {"id": log_id})
                m_row = cur.fetchone()
                if m_row: m_id = m_row["machine_id"]
            
            if m_id:
                cur.execute(self._prepare_sql("UPDATE machines SET status = 'RUNNING' WHERE id = %(m_id)s"), {"m_id": m_id})
            return True

    # ==========================================
    # 12. NHẬT KÝ SẤY NHỰA & XÁC NHẬN CẤP LIỆU (QUẢN LÝ NGUYÊN LIỆU)
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
            rows = cur.fetchall()
            return [dict(r) for r in rows]

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
                "hopper_id": data.get("hopper_id", "HOPPER-A"),
                "target_temp": int(data.get("target_temp", 80)),
                "target_hours": float(data.get("target_hours", 3.0)),
                "actual_temp": int(data.get("actual_temp", data.get("target_temp", 80))),
                "status": data.get("status", "DRYING"),
                "is_dry_coat": bool(data.get("is_dry_coat", False)),
                "staging_boxes_ready": bool(data.get("staging_boxes_ready", False)),
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

    # ==========================================
    # 13. THỐNG KÊ DATABASE SERVER (STATS & METRICS)
    # ==========================================
    def get_db_stats(self) -> Dict[str, Any]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            counts = {}
            tables = [
                "machines", "materials", "boxes", "products", 
                "operators", "schedules", "job_blocks", "shipping_orders", 
                "break_schedules", "learning_feedback_logs", "users",
                "mold_change_logs", "material_prep_logs"
            ]
            for t in tables:
                try:
                    cur.execute(f"SELECT COUNT(*) as cnt FROM {t}")
                    row = cur.fetchone()
                    counts[t] = row["cnt"]
                except Exception:
                    counts[t] = 0

            health = self.db.check_health()
            return {
                "db_type": f"PostgreSQL 18 Enterprise Server" if self.db.backend == "postgres" else "SQLite 3 Fallback",
                "backend": self.db.backend,
                "server_version": health["server_version"],
                "host": health["host"],
                "port": health["port"],
                "database_name": health["database_name"],
                "file_size_kb": health["db_size"],
                "active_connections": health["active_connections"],
                "latency_ms": health["latency_ms"],
                "table_counts": counts
            }

repository = FactoryRepository()
