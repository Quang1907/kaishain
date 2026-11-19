"""
Legacy Auth Module Facade
Toàn bộ logic bảo mật, hashing và phân quyền RBAC được quản lý tập trung tại `backend.core.security`
"""
from backend.core.security import (
    hash_password,
    verify_password,
    create_session,
    get_session,
    destroy_session,
    has_permission,
    ROLE_PERMISSIONS,
    ACTIVE_SESSIONS,
)

__all__ = [
    "hash_password",
    "verify_password",
    "create_session",
    "get_session",
    "destroy_session",
    "has_permission",
    "ROLE_PERMISSIONS",
    "ACTIVE_SESSIONS",
]
