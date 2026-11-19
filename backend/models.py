"""
Domain Models for Factory Production Planning & Intelligent Scheduling Brain (APS)
Nhà máy ép nhựa - Hệ thống Điều hành & Lập lịch Sản xuất Thông minh
"""
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from enum import Enum
import json

class MachineStatus(str, Enum):
    RUNNING = "RUNNING"           # Đang chạy sản xuất
    SETUP_MOLD = "SETUP_MOLD"     # Đang thay khuôn (型替 ○)
    SETUP_COLOR = "SETUP_COLOR"   # Đang đổi màu / vệ sinh nòng (色替 △)
    PLANNED_STOP = "PLANNED_STOP" # Tắt máy / dừng kế hoạch (計画停止 □)
    MAINTENANCE = "MAINTENANCE"   # Bảo trì khuôn / máy
    WAITING_READY = "WAITING"     # Chờ nguyên liệu / thùng / nhân công

class OperatorMode(str, Enum):
    BY_PRODUCT = "BY_PRODUCT"     # Đứng theo con hàng (chuyên môn, kiểm tra gắt gao, gia công sau ép)
    BY_MACHINE = "BY_MACHINE"     # Đứng theo máy cố định (trông nhiều máy, thu gom sản phẩm)

class ReadinessStatus(str, Enum):
    READY = "READY"               # Đã sẵn sàng 100%
    PREPARING = "PREPARING"       # Đang chuẩn bị (đang sấy, đang chuyển thùng)
    ALERT_SHORTAGE = "SHORTAGE"   # Nguy cơ thiếu / trễ
    NOT_STARTED = "NOT_STARTED"   # Chưa bắt đầu

@dataclass
class MaterialSpec:
    resin_id: str               # Mã hạt nhựa (e.g. PP-Homo, ABS-750, POM, PC-ABS)
    resin_name: str             # Tên nguyên liệu
    color_code: str             # Mã màu
    is_dry_coat: bool = False   # Có dùng dry coat hay không (青○)
    dry_temp_celsius: int = 80  # Nhiệt độ sấy (°C)
    dry_time_hours: float = 3.0 # Thời gian sấy bắt buộc trước khi ép (tiếng)
    hopper_id: Optional[str] = None # Phễu sấy được gán

@dataclass
class BoxSpec:
    box_id: str                 # Mã thùng (e.g. THUNG-KLT-4314, THUNG-CARTON-03, KHAY-XOP-A)
    box_name: str               # Tên quy cách bao bì
    pcs_per_box: int = 100      # Số lượng cái / thùng
    staging_lead_hours: float = 1.0 # Thời gian xuất thùng trước giờ chạy (tiếng)

@dataclass
class Product:
    code: str                   # Mã con hàng (e.g. w165, 154, 700B GY, 21-83, AR-05/06)
    name: str                   # Tên chi tiết
    material: MaterialSpec      # Thông số nguyên liệu bắt buộc
    box: BoxSpec                # Thông số thùng đóng gói
    cycle_time_sec: float       # Chu kỳ ép (giây/shot)
    cavity: int                 # Số cavity trên khuôn (pcs/shot)
    compatible_machines: List[str] # Danh sách các máy có thể chạy (1 hàng có thể chạy nhiều máy)
    preferred_operator_mode: OperatorMode = OperatorMode.BY_MACHINE
    dedicated_operator_name: Optional[str] = None # Nếu đứng theo con hàng thì ai là người đứng
    defect_buffer_pct: float = 3.0 # Tỉ lệ hao hụt / phế phẩm đệm (%)

@dataclass
class Operator:
    name: str                   # Tên người đứng máy (ví dụ: Quỳnh, Chí, Thu, Cẩm, Phan, Nhi...)
    shift_type: str             # DAY (Ngày: 8-17h/20h), NIGHT (Đêm: 20:30-7h / 22-6h), PART_TIME
    shift_start_hour: float     # Giờ vào ca (e.g. 7.0, 8.0, 19.0, 20.5, 22.0)
    shift_end_hour: float       # Giờ tan ca (e.g. 12.0, 16.0, 17.0, 20.5, 4.0, 7.0)
    mode_pref: OperatorMode = OperatorMode.BY_MACHINE
    assigned_product_code: Optional[str] = None # Con hàng chuyên trách nếu là BY_PRODUCT
    assigned_machine_id: Optional[str] = None   # Máy phụ trách nếu là BY_MACHINE
    skill_level: int = 2        # Bậc tay nghề (1: phụ, 2: chính, 3: chuyên gia thay khuôn/kỹ thuật)
    is_relief_operator: bool = False # Người chạy chuyền thay thế nghỉ giải lao

@dataclass
class Machine:
    id: str                     # Mã số máy (e.g. "2号機", "15号機", "25号機")
    tonnage: int                # Trọng tải máy (Tấn, e.g. 50T, 80T, 110T, 180T, 220T, 350T)
    is_new: bool = False        # Máy đời mới (新号機) hay máy cũ (旧号機)
    current_status: MachineStatus = MachineStatus.PLANNED_STOP
    current_product: Optional[str] = None
    current_operator: Optional[str] = None
    power_kw: float = 22.0      # Công suất tiêu thụ điện (kW) - để tối ưu tắt máy tiết kiệm điện

@dataclass
class JobBlock:
    job_id: str
    machine_id: str
    product_code: str
    start_hour: float           # 7.0 -> 31.0 (24h timeline từ 7h sáng đến 7h sáng hôm sau)
    end_hour: float
    planned_qty: int
    event_type: str             # "PROD" (chạy hàng), "MOLD_CHANGE" (○ 型替), "COLOR_CHANGE" (△ 色替), "STOP" (□ 計画停止)
    operator_name: Optional[str] = None
    operator_mode: OperatorMode = OperatorMode.BY_MACHINE
    material_status: ReadinessStatus = ReadinessStatus.READY
    box_status: ReadinessStatus = ReadinessStatus.READY
    is_optimized: bool = False

@dataclass
class ShippingOrder:
    order_id: str
    product_code: str
    order_qty: int
    ship_deadline_hour: float   # Giờ xuất hàng deadline
    ship_date: str              # Ngày xuất (e.g. "2026-11-13")
    customer: str
    is_fulfilled: bool = False
    ready_time_est: Optional[float] = None
    safety_buffer_units: int = 0 # Số lượng đệm phòng ngừa để không thiếu hàng

