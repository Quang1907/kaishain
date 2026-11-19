"""
Schedule, Job Blocks & Shipping Orders Repository
Quản lý lịch trình sản xuất 24H, phân bổ các block công việc và các lệnh xuất hàng của khách
"""
import json
from typing import Dict, Any, List, Optional
from backend.infrastructure.repositories.base_repository import BaseRepository

class ScheduleRepository(BaseRepository):
    # ==========================================
    # 1. LỊCH TRÌNH 24H (SCHEDULES & JOBS)
    # ==========================================
    def get_all_schedules(self) -> List[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT id, date_str as date, day_of_week, is_optimized FROM schedules ORDER BY date_str")
            return self._rows_to_list(cur.fetchall())

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
                "notes": json.dumps(notes, ensure_ascii=False) if isinstance(notes, list) else str(notes)
            })

            # Xóa các job cũ và ghi lại toàn bộ
            cur.execute(self._prepare_sql("DELETE FROM job_blocks WHERE schedule_id = %(sched_id)s"), {"sched_id": sched_id})

            ins_job_sql = self._prepare_sql("""
                INSERT INTO job_blocks (id, schedule_id, machine_id, product_code, start_hour, end_hour, planned_qty, event_type, operator_name, material_status, box_status)
                VALUES (%(id)s, %(schedule_id)s, %(machine_id)s, %(product_code)s, %(start_hour)s, %(end_hour)s, %(planned_qty)s, %(event_type)s, %(operator_name)s, %(material_status)s, %(box_status)s)
            """)
            for j in jobs:
                cur.execute(ins_job_sql, {
                    "id": j.get("id", f"JOB-{sched_id}-{j['machine']}-{int(j['start'])}"),
                    "schedule_id": sched_id,
                    "machine_id": j["machine"],
                    "product_code": j["product"],
                    "start_hour": float(j["start"]),
                    "end_hour": float(j["end"]),
                    "planned_qty": int(j.get("planned_qty", 0)),
                    "event_type": j.get("event", "PROD"),
                    "operator_name": j.get("op"),
                    "material_status": j.get("material_status", "READY"),
                    "box_status": j.get("box_status", "READY")
                })

    def upsert_schedule(self, schedule_data: Dict[str, Any]):
        return self.save_schedule(
            sched_id=schedule_data["id"],
            date_str=schedule_data.get("date", schedule_data["id"]),
            day_of_week=schedule_data.get("day_of_week", ""),
            notes=schedule_data.get("notes", []),
            jobs=schedule_data.get("jobs", []),
            is_optimized=schedule_data.get("is_optimized", False)
        )

    def upsert_job_block(self, schedule_id: str, job: Dict[str, Any]) -> str:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            j_id = job.get("id") or f"JOB-{schedule_id}-{job['machine']}-{int(job['start'])}"
            sql = self._prepare_sql("""
                INSERT INTO job_blocks (
                    id, schedule_id, machine_id, product_code, start_hour, end_hour,
                    planned_qty, event_type, operator_name, material_status, box_status
                ) VALUES (
                    %(id)s, %(sched_id)s, %(m_id)s, %(p_code)s, %(start)s, %(end)s,
                    %(qty)s, %(event)s, %(op)s, %(mat_st)s, %(box_st)s
                )
                ON CONFLICT (id) DO UPDATE SET
                    machine_id = EXCLUDED.machine_id,
                    product_code = EXCLUDED.product_code,
                    start_hour = EXCLUDED.start_hour,
                    end_hour = EXCLUDED.end_hour,
                    planned_qty = EXCLUDED.planned_qty,
                    event_type = EXCLUDED.event_type,
                    operator_name = EXCLUDED.operator_name,
                    material_status = EXCLUDED.material_status,
                    box_status = EXCLUDED.box_status
            """)
            cur.execute(sql, {
                "id": j_id,
                "sched_id": schedule_id,
                "m_id": job["machine"],
                "p_code": job["product"],
                "start": float(job["start"]),
                "end": float(job["end"]),
                "qty": int(job.get("planned_qty", 0)),
                "event": job.get("event", "PROD"),
                "op": job.get("op"),
                "mat_st": job.get("material_status", "READY"),
                "box_st": job.get("box_status", "READY")
            })
            return j_id

    def delete_job_block(self, job_id: str):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute(self._prepare_sql("DELETE FROM job_blocks WHERE id = %(id)s"), {"id": job_id})

    # ==========================================
    # 2. LỆNH XUẤT HÀNG (SHIPPING ORDERS)
    # ==========================================
    def get_all_shipping_orders(self) -> List[Dict[str, Any]]:
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute("""
                SELECT so.order_id, so.customer, so.product_code as product, p.name as product_name,
                       so.order_qty, so.ship_date,
                       CAST(so.ship_deadline_hour AS FLOAT) as ship_deadline_hour,
                       so.status, so.safety_buffer_units
                FROM shipping_orders so
                LEFT JOIN products p ON so.product_code = p.code
                ORDER BY so.ship_date, so.ship_deadline_hour
            """)
            return self._rows_to_list(cur.fetchall())

    def upsert_shipping_order(self, order: Dict[str, Any]):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            sql = self._prepare_sql("""
                INSERT INTO shipping_orders (
                    order_id, customer, product_code, order_qty, ship_date, ship_deadline_hour, status, safety_buffer_units
                ) VALUES (
                    %(order_id)s, %(customer)s, %(product_code)s, %(order_qty)s, %(ship_date)s, %(ship_deadline_hour)s, %(status)s, %(safety_buffer_units)s
                )
                ON CONFLICT (order_id) DO UPDATE SET
                    customer = EXCLUDED.customer,
                    product_code = EXCLUDED.product_code,
                    order_qty = EXCLUDED.order_qty,
                    ship_date = EXCLUDED.ship_date,
                    ship_deadline_hour = EXCLUDED.ship_deadline_hour,
                    status = EXCLUDED.status,
                    safety_buffer_units = EXCLUDED.safety_buffer_units
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

    def delete_shipping_order(self, order_id: str):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute(self._prepare_sql("DELETE FROM shipping_orders WHERE order_id = %(id)s"), {"id": order_id})
