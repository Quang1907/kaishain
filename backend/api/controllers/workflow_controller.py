"""
Workflow Controller
Xử lý các quy trình của Thợ máy (○ 型替), Quản lý nguyên liệu (Sấy nhựa) và Báo cáo ca đứng máy
"""
from typing import Dict, Any
from backend.services.workflow_service import workflow_service
from backend.services.brain_service import FactoryBrainOptimizer
from backend.infrastructure.repositories.facade import repository
from backend.core.response import success_response

class WorkflowController:
    def get_mold_logs(self, params: Dict[str, Any]) -> Any:
        sched_id = params.get("schedule_id", [None])[0]
        status = params.get("status", [None])[0]
        return workflow_service.get_mold_logs(sched_id, status)

    def confirm_mold(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        log_id = int(payload.get("log_id", 0))
        tech_name = payload.get("technician_name", "宮地 (Miyaji)")
        notes = payload.get("notes", "")
        checks = payload.get("checks", {})
        workflow_service.confirm_mold_change(log_id, tech_name, notes, checks)
        return success_response(message="Thợ máy đã ký duyệt & nghiệm thu thay khuôn (○ 型替) thành công! Máy đã sẵn sàng chạy.")

    def get_material_logs(self, params: Dict[str, Any]) -> Any:
        sched_id = params.get("schedule_id", [None])[0]
        status = params.get("status", [None])[0]
        return workflow_service.get_material_logs(sched_id, status)

    def confirm_material(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        log_id = int(payload.get("log_id", 0))
        mgr_name = payload.get("manager_name", "エジソン (Edison)")
        actual_temp = int(payload.get("actual_temp", 80))
        notes = payload.get("notes", "")
        boxes_ready = bool(payload.get("boxes_ready", True))
        workflow_service.confirm_material_prep(log_id, mgr_name, actual_temp, notes, boxes_ready)
        return success_response(message="Quản lý nguyên liệu đã ký xác nhận độ ẩm sấy nhựa đạt chuẩn và cấp liệu thành công!")

    def operator_report(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        m_id = payload.get("machine_id", "15号機")
        p_code = payload.get("product_code", "W165")
        act_qty = int(payload.get("actual_qty", 0))
        scraps = int(payload.get("scraps", 0))
        op_name = payload.get("operator_name", "Chí (チー)")
        note = payload.get("note", f"Nhân viên {op_name} báo cáo ca: {act_qty} đạt, {scraps} phế phẩm")

        machines = repository.get_all_machines()
        products = repository.get_all_products()
        operators = repository.get_all_operators()
        brain = FactoryBrainOptimizer(machines, products, operators)
        brain.update_learning_feedback(p_code, m_id, scraps, 8.0, 8.0)

        return success_response(message=f"Nhân viên {op_name} đã gửi báo cáo thành công! AI đã ghi nhận phế phẩm vào DB và tự tính đệm an toàn.")

workflow_controller = WorkflowController()
