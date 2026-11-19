"""
Domain Entities & Value Objects (DDD)
Mô hình hóa các thực thể cốt lõi trong nhà máy ép nhựa:
Machine, Material, Box, Product, Operator, JobBlock, ShippingOrder, User, MoldChangeLog, MaterialPrepLog
"""
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from backend.domain.enums import (
    MachineStatus,
    OperatorMode,
    ReadinessStatus,
    ShiftType,
    EventType,
    UserRole,
)

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
    code: str                   # Mã con hàng (e.g. W165, 154, 700B GY, 21-83, AR-05/06)
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
    name: str                   # Tên người đứng máy (Quỳnh, Chí, Thu, Cẩm, Phan, Nhi...)
    shift_type: str             # DAY, NIGHT, PART_TIME
    shift_start_hour: float     # Giờ vào ca
    shift_end_hour: float       # Giờ tan ca
    mode_pref: OperatorMode = OperatorMode.BY_MACHINE
    assigned_product_code: Optional[str] = None
    assigned_machine_id: Optional[str] = None
    skill_level: int = 2
    is_relief_operator: bool = False # Người chạy chuyền thay thế giải lao

@dataclass
class Machine:
    id: str                     # Mã máy ("2号機" -> "25号機")
    tonnage: int                # Trọng tải máy (50T - 350T)
    is_new: bool = False        # Máy đời mới (新号機) hay cũ (旧号機)
    current_status: MachineStatus = MachineStatus.PLANNED_STOP
    current_product: Optional[str] = None
    current_operator: Optional[str] = None
    power_kw: float = 22.0      # Công suất điện (kW)

@dataclass
class JobBlock:
    job_id: str
    machine_id: str
    product_code: str
    start_hour: float           # 7.0 -> 31.0
    end_hour: float
    planned_qty: int
    event_type: str             # PROD, MOLD_CHANGE, COLOR_CHANGE, STOP
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
    ship_date: str              # Ngày xuất ("2026-11-13")
    customer: str
    is_fulfilled: bool = False
    ready_time_est: Optional[float] = None
    safety_buffer_units: int = 0

@dataclass
class UserEntity:
    id: int
    username: str
    full_name: str
    role: UserRole
    avatar_url: Optional[str] = None
    assigned_machine_or_task: Optional[str] = None
    is_active: bool = True
