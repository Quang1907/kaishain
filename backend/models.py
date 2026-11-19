"""
Legacy models re-export facade for backward compatibility
Toàn bộ logic thực thể và enums đã được chuẩn hóa tại `backend.domain`
"""
from backend.domain.enums import (
    MachineStatus,
    OperatorMode,
    ReadinessStatus,
    ShiftType,
    EventType,
    UserRole,
)
from backend.domain.entities import (
    MaterialSpec,
    BoxSpec,
    Product,
    Operator,
    Machine,
    JobBlock,
    ShippingOrder,
    UserEntity,
)

__all__ = [
    "MachineStatus",
    "OperatorMode",
    "ReadinessStatus",
    "ShiftType",
    "EventType",
    "UserRole",
    "MaterialSpec",
    "BoxSpec",
    "Product",
    "Operator",
    "Machine",
    "JobBlock",
    "ShippingOrder",
    "UserEntity",
]
