"""
Domain Enums
Hệ thống Enum chuẩn mực phản ánh bản chất vận hành xưởng ép nhựa
"""
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"                       # Quản lý xưởng
    USER = "user"                         # Nhân viên đứng máy
    TECHNICIAN = "technician"             # Thợ máy thay khuôn & nghiệm thu
    MATERIAL_MANAGER = "material_manager" # Quản lý nguyên liệu & sấy

class MachineStatus(str, Enum):
    RUNNING = "RUNNING"           # Đang chạy sản xuất
    SETUP_MOLD = "SETUP_MOLD"     # Đang thay khuôn (型替 ○)
    SETUP_COLOR = "SETUP_COLOR"   # Đang đổi màu / vệ sinh nòng (色替 △)
    PLANNED_STOP = "PLANNED_STOP" # Tắt máy / dừng kế hoạch (計画停止 □)
    MAINTENANCE = "MAINTENANCE"   # Bảo trì khuôn / máy
    WAITING_READY = "WAITING"     # Chờ nguyên liệu / thùng / nhân công

class OperatorMode(str, Enum):
    BY_PRODUCT = "BY_PRODUCT"     # Đứng theo con hàng (chuyên trách kiểm tra khắt khe)
    BY_MACHINE = "BY_MACHINE"     # Đứng theo máy cố định (trông máy, thu gom hàng)

class ReadinessStatus(str, Enum):
    READY = "READY"               # Đã sẵn sàng 100%
    PREPARING = "PREPARING"       # Đang chuẩn bị (đang sấy, đang chuyển thùng)
    ALERT_SHORTAGE = "SHORTAGE"   # Nguy cơ thiếu / trễ
    NOT_STARTED = "NOT_STARTED"   # Chưa bắt đầu

class ShiftType(str, Enum):
    DAY = "DAY"                   # Ca ngày (8:00 - 17:00 / 20:30)
    NIGHT = "NIGHT"               # Ca đêm (20:30 - 7:00 / 22:00 - 6:00)
    PART_TIME = "PART_TIME"       # Bán thời gian / Tăng cường

class EventType(str, Enum):
    PROD = "PROD"                 # Sản xuất bình thường
    MOLD_CHANGE = "MOLD_CHANGE"   # Thay khuôn (○ 型替)
    COLOR_CHANGE = "COLOR_CHANGE" # Đổi màu (△ 色替)
    STOP = "STOP"                 # Tắt máy / Dừng kế hoạch (□ 計画停止)
    MAINTENANCE = "MAINTENANCE"   # Bảo trì máy
