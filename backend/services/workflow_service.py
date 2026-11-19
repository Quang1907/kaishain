"""
Workflow Service
Quản lý quy trình kiểm tra an toàn thay khuôn của Thợ máy và cấp liệu phễu sấy của Quản lý nguyên liệu
"""
from typing import Dict, Any, List, Optional
from backend.core.exceptions import ValidationException
from backend.infrastructure.repositories.facade import repository

class WorkflowService:
    def __init__(self, repo=None):
        self.repo = repo or repository

    def get_mold_logs(self, schedule_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        return self.repo.get_mold_change_logs(schedule_id, status)

    def confirm_mold_change(self, log_id: int, technician_name: str, notes: str = "", checks: Dict[str, bool] = None) -> bool:
        if not log_id:
            raise ValidationException("Mã nhật ký thay khuôn (log_id) là bắt buộc")
        return self.repo.confirm_mold_change(log_id, technician_name, notes, checks)

    def get_material_logs(self, schedule_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        return self.repo.get_material_prep_logs(schedule_id, status)

    def confirm_material_prep(self, log_id: int, manager_name: str, actual_temp: int, notes: str = "", boxes_ready: bool = True) -> bool:
        if not log_id:
            raise ValidationException("Mã nhật ký cấp liệu (log_id) là bắt buộc")
        return self.repo.confirm_material_prep(log_id, manager_name, actual_temp, notes, boxes_ready)

workflow_service = WorkflowService()
