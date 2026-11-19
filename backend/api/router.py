"""
Central API Router & Request Dispatcher
Điều hướng các yêu cầu HTTP tới Controller tương ứng với cơ chế phân tách tầng rõ ràng
"""
from typing import Dict, Any, Optional, Tuple
from backend.core.exceptions import AppException
from backend.core.response import serialize_json, error_response
from backend.api.controllers.auth_controller import auth_controller
from backend.api.controllers.workflow_controller import workflow_controller
from backend.api.controllers.schedule_controller import schedule_controller
from backend.api.controllers.master_data_controller import master_data_controller
from backend.api.controllers.system_controller import system_controller

class ApiRouter:
    def handle_get(self, path: str, params: Dict[str, Any], token: Optional[str]) -> Tuple[int, bytes]:
        try:
            if path == "/api/health":
                data = system_controller.health()
            elif path == "/api/db/stats":
                data = system_controller.db_stats()
            elif path == "/api/machines":
                data = master_data_controller.get_machines()
            elif path == "/api/products":
                data = master_data_controller.get_products()
            elif path == "/api/materials":
                data = master_data_controller.get_materials()
            elif path == "/api/boxes":
                data = master_data_controller.get_boxes()
            elif path == "/api/operators":
                data = master_data_controller.get_operators()
            elif path == "/api/shipping-orders":
                data = schedule_controller.get_shipping_orders()
            elif path == "/api/breaks":
                data = master_data_controller.get_breaks(params)
            elif path == "/api/feedback/logs":
                data = system_controller.feedback_logs(params)
            elif path == "/api/schedules":
                data = schedule_controller.get_all_schedules()
            elif path == "/api/schedule":
                data = schedule_controller.get_schedule(params)
            elif path == "/api/readiness":
                data = schedule_controller.readiness(params)
            elif path == "/api/learning-profile":
                data = system_controller.learning_profile()
            elif path == "/api/auth/me":
                data = auth_controller.me(token)
            elif path == "/api/users":
                data = auth_controller.get_users()
            elif path == "/api/mold/logs":
                data = workflow_controller.get_mold_logs(params)
            elif path == "/api/material/logs":
                data = workflow_controller.get_material_logs(params)
            else:
                return 404, serialize_json(error_response(f"API endpoint không tồn tại: {path}", code="NOT_FOUND"))

            return 200, serialize_json(data)
        except AppException as e:
            return e.status_code, serialize_json(error_response(e.message, code="APP_ERROR"))
        except Exception as e:
            return 500, serialize_json(error_response(f"Lỗi máy chủ nội bộ: {str(e)}", code="INTERNAL_SERVER_ERROR"))

    def handle_post(self, path: str, payload: Dict[str, Any], params: Dict[str, Any], token: Optional[str]) -> Tuple[int, bytes]:
        try:
            if path == "/api/auth/login":
                data = auth_controller.login(payload)
            elif path == "/api/auth/logout":
                data = auth_controller.logout(token)
            elif path == "/api/optimize":
                data = schedule_controller.optimize(payload)
            elif path == "/api/feedback":
                data = system_controller.feedback_submit(payload)
            elif path == "/api/shipping-orders":
                data = schedule_controller.upsert_shipping_order(payload)
            elif path == "/api/shipping-orders/delete":
                data = schedule_controller.delete_shipping_order(payload, params)
            elif path in ("/api/db/seed", "/api/db/reset"):
                data = system_controller.db_seed()
            elif path == "/api/machines":
                data = master_data_controller.upsert_machine(payload)
            elif path == "/api/machines/delete":
                data = master_data_controller.delete_machine(payload, params)
            elif path == "/api/products":
                data = master_data_controller.upsert_product(payload)
            elif path == "/api/products/delete":
                data = master_data_controller.delete_product(payload, params)
            elif path == "/api/operators":
                data = master_data_controller.upsert_operator(payload)
            elif path == "/api/operators/delete":
                data = master_data_controller.delete_operator(payload, params)
            elif path == "/api/jobs":
                data = schedule_controller.upsert_job(payload)
            elif path == "/api/jobs/delete":
                data = schedule_controller.delete_job(payload, params)
            elif path == "/api/materials":
                data = master_data_controller.upsert_material(payload)
            elif path == "/api/materials/delete":
                data = master_data_controller.delete_material(payload, params)
            elif path == "/api/boxes":
                data = master_data_controller.upsert_box(payload)
            elif path == "/api/boxes/delete":
                data = master_data_controller.delete_box(payload, params)
            elif path == "/api/mold/confirm":
                data = workflow_controller.confirm_mold(payload)
            elif path == "/api/material/confirm":
                data = workflow_controller.confirm_material(payload)
            elif path == "/api/operator/report":
                data = workflow_controller.operator_report(payload)
            elif path == "/api/users":
                data = auth_controller.upsert_user(payload)
            else:
                return 404, serialize_json(error_response(f"POST endpoint không tồn tại: {path}", code="NOT_FOUND"))

            return 200, serialize_json(data)
        except AppException as e:
            return e.status_code, serialize_json(error_response(e.message, code="APP_ERROR"))
        except Exception as e:
            return 500, serialize_json(error_response(f"Lỗi khi xử lý POST: {str(e)}", code="INTERNAL_SERVER_ERROR"))

    def handle_delete(self, path: str, params: Dict[str, Any]) -> Tuple[int, bytes]:
        try:
            payload: Dict[str, Any] = {}
            if path.startswith("/api/machines"):
                data = master_data_controller.delete_machine(payload, params)
            elif path.startswith("/api/products"):
                data = master_data_controller.delete_product(payload, params)
            elif path.startswith("/api/operators"):
                data = master_data_controller.delete_operator(payload, params)
            elif path.startswith("/api/shipping-orders"):
                data = schedule_controller.delete_shipping_order(payload, params)
            elif path.startswith("/api/jobs"):
                data = schedule_controller.delete_job(payload, params)
            else:
                return 404, serialize_json(error_response(f"DELETE endpoint không tồn tại: {path}", code="NOT_FOUND"))

            return 200, serialize_json(data)
        except AppException as e:
            return e.status_code, serialize_json(error_response(e.message, code="APP_ERROR"))
        except Exception as e:
            return 500, serialize_json(error_response(f"Lỗi khi xử lý DELETE: {str(e)}", code="INTERNAL_SERVER_ERROR"))

api_router = ApiRouter()
