"""
System & Database Metrics Controller
Xử lý /api/health, /api/db/stats, /api/db/seed, /api/feedback/logs, /api/learning-profile
"""
from typing import Dict, Any
from backend.infrastructure.database.connection import db_manager
from backend.infrastructure.repositories.facade import repository
from backend.services.brain_service import FactoryBrainOptimizer
from backend.core.response import success_response
from backend.database.db_seeder import seed_database

class SystemController:
    def health(self) -> Dict[str, Any]:
        return db_manager.check_health()

    def db_stats(self) -> Dict[str, Any]:
        return repository.get_db_stats()

    def db_seed(self) -> Dict[str, Any]:
        seed_database(force_reseed=True)
        return success_response({"stats": repository.get_db_stats()}, message="Đã nạp lại dữ liệu mẫu thành công")

    def feedback_logs(self, params: Dict[str, Any]) -> Any:
        limit = int(params.get("limit", [20])[0])
        return repository.get_recent_feedback_logs(limit)

    def feedback_submit(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        p_code = payload.get("product_code")
        m_id = payload.get("machine_id")
        scraps = int(payload.get("scraps", 0))
        act_run = float(payload.get("actual_run_hours", 0.0))
        plan_run = float(payload.get("planned_run_hours", 8.0))

        machines = repository.get_all_machines()
        products = repository.get_all_products()
        operators = repository.get_all_operators()
        brain = FactoryBrainOptimizer(machines, products, operators)
        brain.update_learning_feedback(p_code, m_id, scraps, act_run, plan_run)

        return success_response({
            "updated_profile": brain.learning_profile
        }, message="Đã ghi nhận dữ liệu thực tế vào Database. Đệm an toàn đã được cập nhật!")

    def learning_profile(self) -> Any:
        machines = repository.get_all_machines()
        products = repository.get_all_products()
        operators = repository.get_all_operators()
        brain = FactoryBrainOptimizer(machines, products, operators)
        return brain.learning_profile

system_controller = SystemController()
