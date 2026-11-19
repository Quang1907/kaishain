"""
Authentication & Role-Based Access Control (RBAC) Module
Quản lý Xác thực, Phân quyền và Mã hóa Mật khẩu
Các vai trò:
- admin (quản lý): Toàn quyền điều hành, lập lịch AI, cấu hình xưởng
- user (nhân viên đứng máy): Xem lịch làm, nhận máy/hàng, báo cáo phế phẩm & sản lượng
- technician (thợ máy): Tiếp nhận lịch thay khuôn ○, kiểm tra thông số kỹ thuật, ký xác nhận nghiệm thu
- material_manager (nguyên liệu): Quản lý trạm sấy nhựa, theo dõi nhiệt độ JIT, ký xác nhận cấp liệu
"""
import hashlib
import os
import secrets
import time
from typing import Dict, Any, Optional

SECRET_KEY = os.environ.get("AUTH_SECRET_KEY", "kaisha_secret_key_aps_brain_2026")
ACTIVE_SESSIONS: Dict[str, Dict[str, Any]] = {}

def hash_password(password: str) -> str:
    """Mã hóa mật khẩu bằng SHA256 + Salt an toàn"""
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password + SECRET_KEY).encode("utf-8")).hexdigest()
    return f"{salt}${hashed}"

def verify_password(password: str, stored_hash: str) -> bool:
    """Kiểm tra mật khẩu đã mã hóa"""
    try:
        salt, expected_hash = stored_hash.split("$", 1)
        actual_hash = hashlib.sha256((salt + password + SECRET_KEY).encode("utf-8")).hexdigest()
        return secrets.compare_digest(actual_hash, expected_hash)
    except Exception:
        return False

def create_session(user: Dict[str, Any]) -> str:
    """Tạo token phiên làm việc"""
    token = secrets.token_urlsafe(32)
    ACTIVE_SESSIONS[token] = {
        "user_id": user["id"],
        "username": user["username"],
        "full_name": user["full_name"],
        "role": user["role"],
        "assigned_machine_or_task": user.get("assigned_machine_or_task"),
        "created_at": time.time(),
        "expires_at": time.time() + (86400 * 7) # 7 ngày
    }
    return token

def get_session(token: str) -> Optional[Dict[str, Any]]:
    """Xác thực token và lấy thông tin phiên"""
    if not token or token not in ACTIVE_SESSIONS:
        return None
    session = ACTIVE_SESSIONS[token]
    if time.time() > session["expires_at"]:
        del ACTIVE_SESSIONS[token]
        return None
    return session

def destroy_session(token: str) -> bool:
    """Đăng xuất phiên làm việc"""
    if token in ACTIVE_SESSIONS:
        del ACTIVE_SESSIONS[token]
        return True
    return False

# Ma trận phân quyền tính năng
ROLE_PERMISSIONS = {
    "admin": {
        "can_view_all": True,
        "can_edit_schedule": True,
        "can_trigger_ai": True,
        "can_manage_machines": True,
        "can_manage_users": True,
        "can_confirm_mold": True,
        "can_confirm_material": True,
        "can_report_scraps": True,
        "can_view_database": True
    },
    "user": {
        "can_view_all": True,
        "can_edit_schedule": False,
        "can_trigger_ai": False,
        "can_manage_machines": False,
        "can_manage_users": False,
        "can_confirm_mold": False,
        "can_confirm_material": False,
        "can_report_scraps": True, # Nhân viên báo cáo phế phẩm & sản lượng
        "can_view_database": False
    },
    "technician": { # Thợ máy thay khuôn
        "can_view_all": True,
        "can_edit_schedule": False,
        "can_trigger_ai": False,
        "can_manage_machines": True,
        "can_manage_users": False,
        "can_confirm_mold": True,  # QUYỀN CỐT LÕI: Ký duyệt & xác nhận thay khuôn
        "can_confirm_material": False,
        "can_report_scraps": True,
        "can_view_database": False
    },
    "material_manager": { # Người quản lý nguyên liệu
        "can_view_all": True,
        "can_edit_schedule": False,
        "can_trigger_ai": False,
        "can_manage_machines": False,
        "can_manage_users": False,
        "can_confirm_mold": False,
        "can_confirm_material": True, # QUYỀN CỐT LÕI: Xác nhận phễu sấy & xuất thùng
        "can_report_scraps": False,
        "can_view_database": False
    }
}

