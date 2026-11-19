"""
Authentication & User Management Service
Điều phối quy trình đăng nhập, bảo mật mật khẩu và phân quyền RBAC
"""
from typing import Dict, Any, Optional, List
from backend.core.security import (
    verify_password,
    create_session,
    get_session,
    destroy_session,
    ROLE_PERMISSIONS,
)
from backend.core.exceptions import UnauthorizedException, ValidationException
from backend.infrastructure.repositories.facade import repository

class AuthService:
    def __init__(self, repo=None):
        self.repo = repo or repository

    def login(self, username: str, password: str) -> Dict[str, Any]:
        """Xác thực tài khoản và phát hành Token phiên làm việc"""
        if not username or not password:
            raise ValidationException("Tên đăng nhập và mật khẩu không được để trống")

        user = self.repo.get_user_by_username(username.strip())
        if not user or not verify_password(password, user["password_hash"]):
            raise UnauthorizedException("Tên đăng nhập hoặc mật khẩu không chính xác")

        token = create_session(user)
        self.repo.update_user_last_login(user["id"])
        perms = ROLE_PERMISSIONS.get(user["role"], {})

        return {
            "token": token,
            "user": {
                "id": user["id"],
                "username": user["username"],
                "full_name": user["full_name"],
                "role": user["role"],
                "avatar_url": user.get("avatar_url", ""),
                "assigned_machine_or_task": user.get("assigned_machine_or_task", "")
            },
            "permissions": perms
        }

    def get_me(self, token: Optional[str]) -> Dict[str, Any]:
        """Truy xuất thông tin người dùng từ Token"""
        sess = get_session(token)
        if sess:
            perms = ROLE_PERMISSIONS.get(sess["role"], {})
            return {"status": "success", "user": sess, "permissions": perms}
        return {"status": "guest", "user": None, "permissions": {}}

    def logout(self, token: Optional[str]) -> bool:
        """Thu hồi phiên làm việc"""
        if token:
            return destroy_session(token)
        return False

    def get_all_users(self) -> List[Dict[str, Any]]:
        return self.repo.get_all_users()

    def upsert_user(self, user_data: Dict[str, Any]) -> int:
        return self.repo.upsert_user(user_data)

auth_service = AuthService()
