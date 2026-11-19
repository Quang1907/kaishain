"""
Resource Management Module: Materials (Resin Drying), Packaging (Boxes), Operators & Rest Rotation
Quản lý Tài nguyên: Sấy Nhựa, Thùng Đóng Gói, Phân Công Đứng Máy & Xoay Tua Nghỉ Ngơi
"""
from typing import Dict, List, Any, Optional
from backend.models import ReadinessStatus, OperatorMode

class ResourceManager:
    def __init__(self, products: Dict[str, Any], operators: List[Dict[str, Any]]):
        self.products = products
        self.operators = operators

    def evaluate_job_prerequisites(self, job: Dict[str, Any], current_hour: float = 8.0) -> Dict[str, Any]:
        """
        Đánh giá 3 chân kiềng của máy: Thùng, Nguyên liệu, Người đứng máy
        Cho từng Job tại thời điểm vận hành
        """
        prod_code = job.get("product")
        if not prod_code or prod_code in ["STOP", "TRY"]:
            return {
                "material": {"status": ReadinessStatus.READY.value, "detail": "Không yêu cầu cấp liệu"},
                "box": {"status": ReadinessStatus.READY.value, "detail": "Không yêu cầu thùng"},
                "operator": {"status": ReadinessStatus.READY.value, "detail": "Không yêu cầu nhân công"},
                "overall_ready": True
            }

        prod_info = self.products.get(prod_code)
        if not prod_info:
            return {
                "material": {"status": ReadinessStatus.READY.value, "detail": "Hàng tiêu chuẩn"},
                "box": {"status": ReadinessStatus.READY.value, "detail": "Thùng tiêu chuẩn"},
                "operator": {"status": ReadinessStatus.READY.value, "detail": job.get("op", "Chưa gán")},
                "overall_ready": True
            }

        start_hour = job.get("start", 7.0)
        mat_spec = prod_info["material"]
        box_spec = prod_info["box"]

        # 1. Tính toán sấy nguyên liệu (Resin Drying)
        dry_lead = mat_spec["dry_hours"]
        dry_start_hour = start_hour - dry_lead
        dry_time_remaining = max(0.0, start_hour - current_hour)
        
        if current_hour >= start_hour:
            mat_status = ReadinessStatus.READY.value
            mat_msg = f"Đã sấy xong {mat_spec['dry_temp']}°C ({mat_spec['name']})"
        elif current_hour >= dry_start_hour:
            mat_status = ReadinessStatus.PREPARING.value
            mat_msg = f"Đang sấy {mat_spec['dry_temp']}°C (Còn {dry_time_remaining:.1f}h nữa mới được ép)"
        else:
            time_until_drying_needed = dry_start_hour - current_hour
            mat_status = ReadinessStatus.NOT_STARTED.value
            mat_msg = f"Cần khởi động sấy trước giờ chạy: vào lúc {dry_start_hour:.1f}h (sau {time_until_drying_needed:.1f}h nữa)"

        # 2. Tính toán thùng đóng gói (Box Packaging)
        box_lead = box_spec["staging_lead_hours"]
        box_prep_hour = start_hour - box_lead
        if current_hour >= box_prep_hour:
            box_status = ReadinessStatus.READY.value
            box_msg = f"Đã tập kết tại chân máy ({box_spec['name']})"
        else:
            box_status = ReadinessStatus.PREPARING.value
            box_msg = f"Cần xuất thùng {box_spec['box_id']} ra line trước {box_prep_hour:.1f}h"

        # 3. Đánh giá người đứng máy (Operator)
        assigned_op = job.get("op")
        op_mode = prod_info.get("preferred_mode", "BY_MACHINE")
        dedicated_op = prod_info.get("dedicated_operator")

        if assigned_op:
            if op_mode == "BY_PRODUCT":
                op_status = ReadinessStatus.READY.value
                op_msg = f"Chuyên trách theo con hàng: {assigned_op}"
            else:
                op_status = ReadinessStatus.READY.value
                op_msg = f"Trông máy cố định: {assigned_op}"
        else:
            op_status = ReadinessStatus.ALERT_SHORTAGE.value
            op_msg = f"CHƯA PHÂN CÔNG người đứng máy! (Ưu tiên: {dedicated_op or 'Bất kỳ'})"

        overall_ready = (mat_status == ReadinessStatus.READY.value) and (op_status == ReadinessStatus.READY.value)

        return {
            "product_name": prod_info["name"],
            "material": {
                "status": mat_status,
                "resin": mat_spec["resin_id"],
                "resin_name": mat_spec["name"],
                "color": mat_spec["color"],
                "dry_temp": mat_spec["dry_temp"],
                "dry_hours": mat_spec["dry_hours"],
                "is_dry_coat": mat_spec["is_dry_coat"],
                "dry_start_hour": dry_start_hour,
                "detail": mat_msg
            },
            "box": {
                "status": box_status,
                "box_id": box_spec["box_id"],
                "box_name": box_spec["name"],
                "pcs_per_box": box_spec["pcs_per_box"],
                "detail": box_msg
            },
            "operator": {
                "status": op_status,
                "assigned": assigned_op,
                "mode": op_mode,
                "dedicated": dedicated_op,
                "detail": op_msg
            },
            "overall_ready": overall_ready
        }

    def solve_operator_assignments(self, active_jobs: List[Dict[str, Any]], current_hour: float) -> List[Dict[str, Any]]:
        """
        Tự động phân công người đứng máy theo 2 nguyên tắc:
        1. Đứng theo con hàng (Ưu tiên số 1): Sản phẩm yêu cầu tay nghề cao, kiểm tra gắt gao
        2. Đứng theo máy cố định (Ưu tiên số 2): Vận hành máy, giám sát robot gắp và đóng hộp
        3. Phân bổ người chạy chuyền (Relief) cho các ca nghỉ trưa / nghỉ giữa giờ
        """
        assignments = []
        available_ops = [
            op for op in self.operators
            if op["start"] <= current_hour <= op["end"]
        ]
        
        assigned_names = set()

        # Bước 1: Gán nhân sự theo con hàng trước
        for job in active_jobs:
            prod_code = job.get("product")
            if not prod_code or prod_code in ["STOP", "TRY"]:
                continue
            
            prod_info = self.products.get(prod_code)
            if not prod_info:
                continue

            if prod_info.get("preferred_mode") == "BY_PRODUCT":
                pref_op_name = prod_info.get("dedicated_operator")
                # Tìm xem nhân sự này có đang trong ca làm việc không
                matched = next((op for op in available_ops if pref_op_name and op["name"].startswith(pref_op_name.split()[0])), None)
                if matched and matched["name"] not in assigned_names:
                    assignments.append({
                        "machine": job["machine"],
                        "job_id": job["id"],
                        "product": prod_code,
                        "operator": matched["name"],
                        "mode": "BY_PRODUCT",
                        "status": "ASSIGNED_DEDICATED"
                    })
                    assigned_names.add(matched["name"])
                else:
                    # Nếu người chuyên trách vắng, gán thợ bậc cao thay thế
                    substitute = next((op for op in available_ops if op["name"] not in assigned_names and op["skill"] >= 2), None)
                    if substitute:
                        assignments.append({
                            "machine": job["machine"],
                            "job_id": job["id"],
                            "product": prod_code,
                            "operator": substitute["name"],
                            "mode": "BY_PRODUCT (Thay thế)",
                            "status": "SUBSTITUTE_ASSIGNED"
                        })
                        assigned_names.add(substitute["name"])

        # Bước 2: Gán nhân sự theo máy cố định
        for job in active_jobs:
            # Bỏ qua nếu đã được gán ở bước 1
            if any(a["job_id"] == job["id"] for a in assignments):
                continue
            if job.get("product") in ["STOP", "TRY"]:
                continue

            # Tìm thợ phụ trách máy hoặc người bất kỳ còn trống
            free_op = next((op for op in available_ops if op["name"] not in assigned_names), None)
            if free_op:
                assignments.append({
                    "machine": job["machine"],
                    "job_id": job["id"],
                    "product": job.get("product"),
                    "operator": free_op["name"],
                    "mode": "BY_MACHINE",
                    "status": "ASSIGNED_MACHINE"
                })
                assigned_names.add(free_op["name"])
            else:
                assignments.append({
                    "machine": job["machine"],
                    "job_id": job["id"],
                    "product": job.get("product"),
                    "operator": "THIẾU NHÂN CÔNG",
                    "mode": "BY_MACHINE",
                    "status": "UNSTAFFED_WARNING"
                })

        return assignments

    def get_break_schedule(self, current_hour: float) -> List[Dict[str, Any]]:
        """
        Lịch trình nghỉ ngơi và phân công xoay tua người chạy chuyền
        """
        breaks = [
            {"name": "Nghỉ giải lao sáng (10m)", "start": 10.0, "end": 10.17, "shift": "DAY", "coverage": "Xoay tua theo cặp"},
            {"name": "Nghỉ ăn trưa (45m)", "start": 12.0, "end": 12.75, "shift": "DAY", "coverage": "Người chạy chuyền (Giang, Kawabata) hỗ trợ giữ máy"},
            {"name": "Nghỉ giải lao chiều (10m)", "start": 15.0, "end": 15.17, "shift": "DAY", "coverage": "Xoay tua theo cặp"},
            {"name": "Bàn giao ca & Ăn tối", "start": 16.0, "end": 17.0, "shift": "TRANSITION", "coverage": "Tắt các máy hết kế hoạch (□)"},
            {"name": "Ăn khuya ca đêm (45m)", "start": 24.0, "end": 24.75, "shift": "NIGHT", "coverage": "Hùng A & Linh chạy chuyền"},
            {"name": "Nghỉ giải lao rạng sáng (10m)", "start": 27.0, "end": 27.17, "shift": "NIGHT", "coverage": "Xoay tua theo cặp"},
        ]
        return breaks

