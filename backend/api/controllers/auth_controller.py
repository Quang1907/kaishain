"""
Authentication & RBAC Controller
Xử lý các endpoint /api/auth/* và /api/users
"""
from typing import Dict, Any, Optional
from backend.services.auth_service import auth_service
from backend.core.response import success_response

class AuthController:
    def login(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        username = payload.get("username", "")
        password = payload.get("password", "")
        result = auth_service.login(username, password)
        return success_response(result)

    def me(self, token: Optional[str]) -> Dict[str, Any]:
        return auth_service.get_me(token)

    def logout(self, token: Optional[str]) -> Dict[str, Any]:
        auth_service.logout(token)
        return success_response(message="Đã đăng xuất thành công")

    def get_users(self) -> Any:
        return auth_service.get_all_users()

    def upsert_user(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        user_id = auth_service.upsert_user(payload)
        return success_response({"id": user_id}, message="Cập nhật tài khoản người dùng thành công")

auth_controller = AuthController()
