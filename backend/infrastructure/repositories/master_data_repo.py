"""
Master Data Repository
Quản lý các thực thể chủ chốt: Máy ép (Machines), Con hàng (Products), Nguyên liệu (Materials), Bao bì thùng (Boxes)
"""
from typing import Dict, Any, List, Optional
from backend.infrastructure.repositories.base_repository import BaseRepository

class MasterDataRepository(BaseRepository):
    # ==========================================
    # 1. MÁY ÉP (MACHINES)
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
            cur.execute(self._prepare_sql("SELECT * FROM machines WHERE id = %(id)s"), {"id": machine_id})
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
                "status": machine_data.get("status", machine_data.get("current_status", "PLANNED_STOP"))
            })

    def update_machine_status(self, machine_id: str, new_status: str):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute(self._prepare_sql("UPDATE machines SET status = %(status)s WHERE id = %(id)s"), {"status": new_status, "id": machine_id})

    def delete_machine(self, machine_id: str):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute(self._prepare_sql("DELETE FROM machines WHERE id = %(id)s"), {"id": machine_id})

    # ==========================================
    # 2. NGUYÊN LIỆU HẠT NHỰA (MATERIALS)
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

    def delete_material(self, mat_id: str):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute(self._prepare_sql("DELETE FROM materials WHERE id = %(id)s"), {"id": mat_id})

    # ==========================================
    # 3. THÙNG BAO BÌ ĐÓNG GÓI (BOXES)
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

    def delete_box(self, box_id: str):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute(self._prepare_sql("DELETE FROM boxes WHERE id = %(id)s"), {"id": box_id})

    # ==========================================
    # 4. CON HÀNG & ĐỊNH MỨC BOM (PRODUCTS)
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
                    "cycle_time": row["cycle_time_sec"],
                    "cavity": row["cavity"],
                    "compatible_machines": comp_machines,
                    "preferred_mode": row["preferred_mode"],
                    "preferred_operator_mode": row["preferred_mode"],
                    "dedicated_operator": row["dedicated_operator_name"],
                    "dedicated_operator_name": row["dedicated_operator_name"],
                    "defect_buffer_pct": row["defect_buffer_pct"],
                    "scrap_buffer_pct": row["defect_buffer_pct"]
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
            mat_info = prod.get("material", {})
            box_info = prod.get("box", {})
            cur.execute(sql, {
                "code": prod["code"],
                "name": prod.get("name", prod["code"]),
                "material_id": mat_info.get("resin_id", prod.get("material_id")),
                "box_id": box_info.get("box_id", prod.get("box_id")),
                "cycle_time_sec": float(prod.get("cycle_time_sec", prod.get("cycle_time", 30.0))),
                "cavity": int(prod.get("cavity", 1)),
                "preferred_mode": prod.get("preferred_mode", prod.get("preferred_operator_mode", "BY_MACHINE")),
                "dedicated_operator_name": prod.get("dedicated_operator_name", prod.get("dedicated_operator")),
                "defect_buffer_pct": float(prod.get("defect_buffer_pct", prod.get("scrap_buffer_pct", 3.0)))
            })

            cur.execute(self._prepare_sql("DELETE FROM product_machines WHERE product_code = %(code)s"), {"code": prod["code"]})
            sql_pm = self._prepare_sql("INSERT INTO product_machines (product_code, machine_id, priority) VALUES (%(code)s, %(m_id)s, %(priority)s)")
            for idx, m_id in enumerate(compatible_machines):
                cur.execute(sql_pm, {"code": prod["code"], "m_id": str(m_id), "priority": idx + 1})

    def delete_product(self, product_code: str):
        with self.db.get_connection() as conn:
            cur = conn.cursor()
            cur.execute(self._prepare_sql("DELETE FROM products WHERE code = %(code)s"), {"code": product_code})
