"""
Security, Password Hashing & Role-Based Access Control (RBAC)
Cung cấp giải pháp bảo mật cấp doanh nghiệp:
- Băm mật khẩu SHA-256 kèm Salt 32 ký tự ngẫu nhiên
- Cơ chế quản lý Token Session độc lập và tự thu hồi khi hết hạn
- Ma trận phân quyền 4 vai trò: Admin, User (Nhân viên), Technician (Thợ máy), Material Manager (Nguyên liệu)
"""
import hashlib
import secrets
import time
from typing import Dict, Any, Optional
from backend.config.settings import settings

ACTIVE_SESSIONS: Dict[str, Dict[str, Any]] = {}

ROLE_PERMISSIONS: Dict[str, Dict[str, bool]] = {
    "admin": {
        "can_view_all": True,
        "can_edit_schedule": True,
        "can_trigger_ai": True,
        "can_manage_machines": True,
        "can_manage_users": True,
        "can_confirm_mold": True,
        "can_confirm_material": True,
        "can_report_scraps": True,
        "can_view_database": True,
    },
    "technician": {
        "can_view_all": True,
        "can_edit_schedule": False,
        "can_trigger_ai": False,
        "can_manage_machines": True,
        "can_manage_users": False,
        "can_confirm_mold": True,
        "can_confirm_material": False,
        "can_report_scraps": True,
        "can_view_database": False,
    },
    "material_manager": {
        "can_view_all": True,
        "can_edit_schedule": False,
        "can_trigger_ai": False,
        "can_manage_machines": False,
        "can_manage_users": False,
        "can_confirm_mold": False,
        "can_confirm_material": True,
        "can_report_scraps": False,
        "can_view_database": False,
    },
    "user": {
        "can_view_all": True,
        "can_edit_schedule": False,
        "can_trigger_ai": False,
        "can_manage_machines": False,
        "can_manage_users": False,
        "can_confirm_mold": False,
        "can_confirm_material": False,
        "can_report_scraps": True,
        "can_view_database": False,
    }
}

def hash_password(password: str) -> str:
    """Mã hóa mật khẩu bằng SHA-256 + Salt an toàn tuyệt đối"""
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password + settings.AUTH_SECRET_KEY).encode("utf-8")).hexdigest()
    return f"{salt}${hashed}"

def verify_password(password: str, stored_hash: str) -> bool:
    """Kiểm tra mật khẩu khớp với hash đã lưu"""
    try:
        salt, expected_hash = stored_hash.split("$", 1)
        actual_hash = hashlib.sha256((salt + password + settings.AUTH_SECRET_KEY).encode("utf-8")).hexdigest()
        return secrets.compare_digest(actual_hash, expected_hash)
    except Exception:
        return False

def create_session(user: Dict[str, Any]) -> str:
    """Tạo token phiên làm việc ngẫu nhiên (URL-safe) và ghi nhớ thông tin người dùng"""
    token = secrets.token_urlsafe(32)
    ACTIVE_SESSIONS[token] = {
        "user_id": user.get("id"),
        "username": user.get("username"),
        "full_name": user.get("full_name"),
        "role": user.get("role", "user"),
        "assigned_machine_or_task": user.get("assigned_machine_or_task"),
        "created_at": time.time(),
        "expires_at": time.time() + settings.SESSION_EXPIRY_SECONDS
    }
    return token

def get_session(token: Optional[str]) -> Optional[Dict[str, Any]]:
    """Lấy thông tin phiên làm việc còn hiệu lực"""
    if not token or token not in ACTIVE_SESSIONS:
        return None
    sess = ACTIVE_SESSIONS[token]
    if time.time() > sess["expires_at"]:
        del ACTIVE_SESSIONS[token]
        return None
    return sess

def destroy_session(token: str) -> bool:
    """Hủy phiên làm việc (Đăng xuất)"""
    if token in ACTIVE_SESSIONS:
        del ACTIVE_SESSIONS[token]
        return True
    return False

def has_permission(role: str, permission_key: str) -> bool:
    """Kiểm tra xem vai trò có quyền thực thi chức năng tương ứng không"""
    perms = ROLE_PERMISSIONS.get(role, {})
    return perms.get(permission_key, False)
