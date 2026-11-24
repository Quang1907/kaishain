"""
Database Seeder for Factory APS Brain
Khởi tạo và nạp dữ liệu gốc từ 4 bảng kế hoạch sản xuất vào Cơ sở dữ liệu SQLite
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.database.repository import repository
from backend.data_store import (
    get_master_machines,
    get_master_products,
    get_master_operators,
    get_schedule_day1_nov12,
    get_schedule_day2_nov13,
    get_master_shipping_orders
)

def seed_database(force_reseed: bool = False):
    print("🌱 Bắt đầu nạp dữ liệu vào Cơ sở Dữ liệu chuyên dụng...")
    
    # 1. Nạp danh sách 22 máy ép
    machines = get_master_machines()
    for m in machines:
        repository.upsert_machine(m)
    print(f"✅ Đã nạp {len(machines)} máy ép (Khu Bay A: 2-13, Khu Bay B: 15-25).")

    # 2. Nạp Nguyên liệu (Materials) & Thùng (Boxes) & Sản phẩm (Products)
    products_data = get_master_products()
    materials_seen = set()
    boxes_seen = set()

    for p_code, p_info in products_data.items():
        mat = p_info["material"]
        mat_id = mat["resin_id"]
        if mat_id not in materials_seen:
            repository.upsert_material({
                "id": mat_id,
                "resin_name": mat["name"],
                "color_code": mat.get("color", "Black"),
                "is_dry_coat": mat.get("is_dry_coat", False),
                "dry_temp_celsius": mat.get("dry_temp", 80),
                "dry_time_hours": mat.get("dry_hours", 3.0),
                "hopper_id": f"HOPPER-{mat_id[:4]}"
            })
            materials_seen.add(mat_id)

        box = p_info["box"]
        box_id = box["box_id"]
        if box_id not in boxes_seen:
            repository.upsert_box({
                "id": box_id,
                "box_name": box["name"],
                "pcs_per_box": box.get("pcs_per_box", 100),
                "staging_lead_hours": box.get("staging_lead_hours", 1.0),
                "inventory_qty": 600
            })
            boxes_seen.add(box_id)

        # Lưu sản phẩm và máy tương thích
        repository.upsert_product({
            "code": p_code,
            "name": p_info["name"],
            "material_id": mat_id,
            "box_id": box_id,
            "cycle_time_sec": p_info["cycle_time_sec"],
            "cavity": p_info["cavity"],
            "preferred_mode": p_info.get("preferred_mode", "BY_MACHINE"),
            "dedicated_operator_name": p_info.get("dedicated_operator"),
            "defect_buffer_pct": p_info.get("defect_buffer_pct", 3.0)
        }, p_info.get("compatible_machines", []))

    print(f"✅ Đã nạp {len(materials_seen)} nguyên liệu hạt nhựa & {len(boxes_seen)} quy cách thùng bao bì.")
    print(f"✅ Đã nạp {len(products_data)} con hàng kèm định mức BOM & máy tương thích.")

    # 3. Nạp danh sách Nhân sự đứng máy
    operators = get_master_operators()
    for op in operators:
        repository.upsert_operator(op)
    print(f"✅ Đã nạp {len(operators)} nhân sự (Ca ngày, Tăng ca, Ca đêm, Setup khuôn, Người chạy chuyền).")

    # 4. Nạp Lịch nghỉ ngơi & chạy chuyền
    breaks = [
        {"name": "Nghỉ giải lao sáng (10m)", "start": 10.0, "end": 10.17, "shift": "DAY", "coverage": "Xoay tua theo cặp"},
        {"name": "Nghỉ ăn trưa (45m)", "start": 12.0, "end": 12.75, "shift": "DAY", "coverage": "Người chạy chuyền (Giang, Kawabata) hỗ trợ giữ máy"},
        {"name": "Nghỉ giải lao chiều (10m)", "start": 15.0, "end": 15.17, "shift": "DAY", "coverage": "Xoay tua theo cặp"},
        {"name": "Bàn giao ca & Ăn tối", "start": 16.0, "end": 17.0, "shift": "TRANSITION", "coverage": "Tắt các máy hết kế hoạch (□)"},
        {"name": "Ăn khuya ca đêm (45m)", "start": 24.0, "end": 24.75, "shift": "NIGHT", "coverage": "Hùng A & Linh chạy chuyền"},
        {"name": "Nghỉ giải lao rạng sáng (10m)", "start": 27.0, "end": 27.17, "shift": "NIGHT", "coverage": "Xoay tua theo cặp"},
    ]
    repository.seed_break_schedules(breaks)
    print(f"✅ Đã nạp {len(breaks)} khung giờ nghỉ ngơi & phân công người chạy chuyền.")

    # 5. Nạp Lịch trình 2 ngày thực tế từ ảnh chụp (Tự động tính sản lượng chuẩn theo Cycle Time & Trừ phế phẩm)
    def _enrich_job_planned_qty(job_list, products_dict):
        for j in job_list:
            if j.get("event") == "PROD":
                p_code = j.get("product")
                curr_qty = j.get("planned_qty", 0)
                if curr_qty <= 0 or curr_qty == 11:
                    p = products_dict.get(p_code)
                    if p:
                        c_time = float(p.get("cycle_time_sec", 30.0))
                        cav = int(p.get("cavity", 1))
                        def_pct = float(p.get("defect_buffer_pct", 2.5))
                        run_h = max(0.0, float(j["end"]) - float(j["start"]))
                        total_sec = int(run_h * 3600)
                        shots = total_sec // int(c_time) if c_time > 0 else 0
                        gross = shots * cav
                        def_qty = int((gross * def_pct) / 100.0 + 0.999)
                        j["planned_qty"] = max(0, gross - def_qty)
            elif j.get("event") == "STOP":
                j["planned_qty"] = 0
        return job_list

    sched_d1 = get_schedule_day1_nov12()
    enriched_jobs_d1 = _enrich_job_planned_qty(sched_d1["jobs"], products_data)
    repository.save_schedule(
        sched_id="2026-11-12",
        date_str="2026-11-12",
        day_of_week=sched_d1["day_of_week"],
        notes=sched_d1["notes"],
        jobs=enriched_jobs_d1,
        is_optimized=False
    )

    sched_d2 = get_schedule_day2_nov13()
    enriched_jobs_d2 = _enrich_job_planned_qty(sched_d2["jobs"], products_data)
    repository.save_schedule(
        sched_id="2026-11-13",
        date_str="2026-11-13",
        day_of_week=sched_d2["day_of_week"],
        notes=sched_d2["notes"],
        jobs=enriched_jobs_d2,
        is_optimized=False
    )
    print("✅ Đã nạp 2 ngày lịch trình thực tế (11/12 & 11/13) với đầy đủ ○ (型替), △ (色替), □ (計画停止) & Sản lượng chuẩn Cycle Time.")

    # 6. Nạp Lệnh xuất hàng
    orders = get_master_shipping_orders()
    for o in orders:
        repository.upsert_shipping_order(o)
    print(f"✅ Đã nạp {len(orders)} lệnh xuất hàng của khách hàng.")

    # 7. Nạp Tài Khoản Người Dùng 4 Vai Trò Phân Quyền
    from backend.auth import hash_password
    users = [
        {
            "username": "admin",
            "password_hash": hash_password("admin123"),
            "full_name": "川端 (Kawabata - Quản lý xưởng)",
            "role": "admin",
            "avatar_url": "👑",
            "assigned_machine_or_task": "Toàn quyền điều hành & Lập lịch AI"
        },
        {
            "username": "congnhan",
            "password_hash": hash_password("user123"),
            "full_name": "チー (Chí - Nhân viên đứng máy)",
            "role": "user",
            "avatar_url": "👤",
            "assigned_machine_or_task": "15号機 / Con hàng W165"
        },
        {
            "username": "thomay",
            "password_hash": hash_password("tech123"),
            "full_name": "宮地 (Miyaji - Trưởng ban Kỹ thuật Thay khuôn)",
            "role": "technician",
            "avatar_url": "🔧",
            "assigned_machine_or_task": "Kỹ thuật thay khuôn ○ & Nghiệm thu"
        },
        {
            "username": "nguyenlieu",
            "password_hash": hash_password("mat123"),
            "full_name": "エジソン (Edison - Quản lý Nguyên liệu & Sấy nhựa)",
            "role": "material_manager",
            "avatar_url": "🌾",
            "assigned_machine_or_task": "Trạm phễu sấy & Quản lý tồn kho thùng"
        }
    ]
    for u in users:
        repository.upsert_user(u)
    print(f"✅ Đã nạp {len(users)} tài khoản phân quyền: admin, user, technician (thợ máy), material_manager (nguyên liệu).")

    # 8. Nạp Nhật ký Thay khuôn ban đầu từ Lịch trình 11/13
    mold_jobs = [j for j in sched_d2["jobs"] if j["event"] == "MOLD_CHANGE" and j["product"] in products_data]
    for mj in mold_jobs:
        repository.upsert_mold_log({
            "schedule_id": "2026-11-13",
            "machine_id": mj["machine"],
            "product_code": mj["product"],
            "technician_name": mj.get("op", "宮地 (Miyaji)"),
            "status": "PENDING",
            "cooling_line_checked": False,
            "clamping_torque_checked": False,
            "temp_barrel_checked": False,
            "first_shot_passed": False,
            "notes": "Chờ thợ máy tiến hành thay khuôn và nghiệm thu thông số"
        })
    print(f"✅ Đã nạp {len(mold_jobs)} đợt thay khuôn ○ (型替) vào bảng nhật ký nghiệm thu thợ máy.")

    # 9. Nạp Nhật ký Sấy nhựa ban đầu
    prod_jobs = [j for j in sched_d2["jobs"] if j["event"] == "PROD" and j["product"] not in ["STOP", "TRY"]]
    seen_mats = set()
    for pj in prod_jobs[:8]:
        p_code = pj["product"]
        if p_code in products_data and p_code not in seen_mats:
            p_inf = products_data[p_code]
            mat_inf = p_inf["material"]
            repository.upsert_material_log({
                "schedule_id": "2026-11-13",
                "machine_id": pj["machine"],
                "product_code": p_code,
                "resin_id": mat_inf["resin_id"],
                "hopper_id": f"HOPPER-{mat_inf['resin_id'][:4]}",
                "target_temp": mat_inf["dry_temp"],
                "target_hours": mat_inf["dry_hours"],
                "actual_temp": mat_inf["dry_temp"],
                "status": "READY" if mat_inf["dry_hours"] <= 3.0 else "DRYING",
                "is_dry_coat": mat_inf.get("is_dry_coat", False),
                "staging_boxes_ready": True,
                "notes": f"Nhựa {mat_inf['name']} cho đơn hàng kế tiếp"
            })
            seen_mats.add(p_code)
    print(f"✅ Đã nạp {len(seen_mats)} phễu sấy hạt nhựa vào bảng điều phối quản lý nguyên liệu.")

    # 7. In thông tin thống kê DB
    stats = repository.get_db_stats()
    print("=================================================================")
    print(f"🚀 DATABASE SEED THÀNH CÔNG!")
    print(f"🐘 Hệ quản trị: {stats['db_type']} ({stats['server_version']})")
    print(f"📍 Máy chủ: {stats['host']}:{stats['port']} | DB: {stats['database_name']}")
    print(f"📊 Dung lượng DB: {stats['file_size_kb']}")
    print(f"📋 Số lượng bản ghi: {stats['table_counts']}")
    print("=================================================================")

if __name__ == "__main__":
    seed_database()

