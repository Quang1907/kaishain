"""
Factory Master Data & Schedules extracted from real production planning sheets
Dữ liệu chuẩn hóa từ 4 bảng kế hoạch sản xuất:
- 11月12日 木曜日 (Máy 2-13 và Máy 15-25)
- 11月13日 金曜日 (Máy 2-13 và Máy 15-25)
"""
from typing import Dict, List, Any
import copy

def get_master_machines() -> List[Dict[str, Any]]:
    return [
        {"id": "2号機", "tonnage": 80, "is_new": False, "power_kw": 18.5, "bay": "A"},
        {"id": "3号機", "tonnage": 80, "is_new": False, "power_kw": 18.5, "bay": "A"},
        {"id": "4号機", "tonnage": 110, "is_new": False, "power_kw": 22.0, "bay": "A"},
        {"id": "5号機", "tonnage": 110, "is_new": False, "power_kw": 22.0, "bay": "A"},
        {"id": "6号機", "tonnage": 150, "is_new": False, "power_kw": 28.0, "bay": "A"},
        {"id": "7号機", "tonnage": 150, "is_new": False, "power_kw": 28.0, "bay": "A"},
        {"id": "8号機", "tonnage": 180, "is_new": False, "power_kw": 30.0, "bay": "A"},
        {"id": "9号機", "tonnage": 180, "is_new": False, "power_kw": 30.0, "bay": "A"},
        {"id": "10号機", "tonnage": 220, "is_new": False, "power_kw": 37.0, "bay": "A"},
        {"id": "11号機", "tonnage": 220, "is_new": False, "power_kw": 37.0, "bay": "A"},
        {"id": "12号機", "tonnage": 280, "is_new": False, "power_kw": 45.0, "bay": "A"},
        {"id": "13号機", "tonnage": 350, "is_new": False, "power_kw": 55.0, "bay": "A"},
        {"id": "15号機", "tonnage": 110, "is_new": True, "power_kw": 22.0, "bay": "B"},
        {"id": "16号機", "tonnage": 110, "is_new": True, "power_kw": 22.0, "bay": "B"},
        {"id": "17号機", "tonnage": 150, "is_new": False, "power_kw": 28.0, "bay": "B"},
        {"id": "18号機", "tonnage": 150, "is_new": False, "power_kw": 28.0, "bay": "B"},
        {"id": "19号機", "tonnage": 180, "is_new": False, "power_kw": 30.0, "bay": "B"},
        {"id": "21号機", "tonnage": 220, "is_new": False, "power_kw": 37.0, "bay": "B"},
        {"id": "22号機", "tonnage": 220, "is_new": False, "power_kw": 37.0, "bay": "B"},
        {"id": "23号機", "tonnage": 280, "is_new": False, "power_kw": 45.0, "bay": "B"},
        {"id": "24号機", "tonnage": 280, "is_new": False, "power_kw": 45.0, "bay": "B"},
        {"id": "25号機", "tonnage": 350, "is_new": False, "power_kw": 55.0, "bay": "B"},
    ]

def get_master_products() -> Dict[str, Dict[str, Any]]:
    return {
        "W165": {
            "name": "Nắp ốp vỏ điện tử W165",
            "material": {"resin_id": "ABS-750", "name": "Nhựa ABS Trắng Sữa", "color": "White", "is_dry_coat": False, "dry_temp": 80, "dry_hours": 3.0},
            "box": {"box_id": "THUNG-CARTON-165", "name": "Thùng Carton Inox 5 lớp", "pcs_per_box": 120, "staging_lead_hours": 1.0},
            "cycle_time_sec": 28.5,
            "cavity": 2,
            "compatible_machines": ["15号機", "16号機", "4号機"],
            "preferred_mode": "BY_PRODUCT",
            "dedicated_operator": "チー (Chí)",
            "defect_buffer_pct": 2.5
        },
        "154": {
            "name": "Khay tản nhiệt số 154",
            "material": {"resin_id": "PP-V30G", "name": "Nhựa PP Đen cường lực", "color": "Black", "is_dry_coat": False, "dry_temp": 80, "dry_hours": 2.0},
            "box": {"box_id": "THUNG-KLT-4314", "name": "Thùng nhựa gập KLT xanh", "pcs_per_box": 80, "staging_lead_hours": 1.0},
            "cycle_time_sec": 32.0,
            "cavity": 2,
            "compatible_machines": ["16号機", "15号機", "5号機"],
            "preferred_mode": "BY_MACHINE",
            "dedicated_operator": None,
            "defect_buffer_pct": 3.0
        },
        "048-04": {
            "name": "Cánh quạt thổi せんぷうき 048-04",
            "material": {"resin_id": "POM-M90", "name": "Nhựa POM Kỹ thuật", "color": "Natural", "is_dry_coat": False, "dry_temp": 90, "dry_hours": 4.0},
            "box": {"box_id": "KHAY-XOP-FAN", "name": "Vỉ định hình xốp chống trầy", "pcs_per_box": 40, "staging_lead_hours": 1.5},
            "cycle_time_sec": 42.0,
            "cavity": 1,
            "compatible_machines": ["15号機", "17号機"],
            "preferred_mode": "BY_PRODUCT",
            "dedicated_operator": "クイン (Quỳnh)",
            "defect_buffer_pct": 4.0
        },
        "W-67": {
            "name": "Khung gia cố W-67",
            "material": {"resin_id": "PC-ABS-FR", "name": "Hạt PC/ABS Chống cháy", "color": "Grey", "is_dry_coat": False, "dry_temp": 110, "dry_hours": 4.0},
            "box": {"box_id": "THUNG-CARTON-W67", "name": "Thùng Carton tiêu chuẩn W-67", "pcs_per_box": 150, "staging_lead_hours": 1.0},
            "cycle_time_sec": 25.0,
            "cavity": 4,
            "compatible_machines": ["16号機", "15号機", "4号機"],
            "preferred_mode": "BY_MACHINE",
            "dedicated_operator": None,
            "defect_buffer_pct": 2.0
        },
        "19801/02": {
            "name": "Cụm chi tiết ghép đôi 19801/02",
            "material": {"resin_id": "PA66-GF30", "name": "Polyamide 66 Thủy tinh 30%", "color": "Black", "is_dry_coat": True, "dry_temp": 100, "dry_hours": 4.5},
            "box": {"box_id": "THUNG-NHUA-198", "name": "Khay chống ẩm có vỉ ngăn", "pcs_per_box": 60, "staging_lead_hours": 2.0},
            "cycle_time_sec": 45.0,
            "cavity": 2,
            "compatible_machines": ["17号機", "18号機"],
            "preferred_mode": "BY_PRODUCT",
            "dedicated_operator": "トレン (Tuyến)",
            "defect_buffer_pct": 3.5
        },
        "55-307": {
            "name": "Nắp bảo vệ 55-307",
            "material": {"resin_id": "PP-HOMO", "name": "PP Đồng trùng hợp", "color": "Blue", "is_dry_coat": False, "dry_temp": 80, "dry_hours": 2.0},
            "box": {"box_id": "THUNG-KLT-4314", "name": "Thùng nhựa gập KLT xanh", "pcs_per_box": 200, "staging_lead_hours": 1.0},
            "cycle_time_sec": 22.0,
            "cavity": 4,
            "compatible_machines": ["17号機", "16号機"],
            "preferred_mode": "BY_MACHINE",
            "dedicated_operator": None,
            "defect_buffer_pct": 2.0
        },
        "25-07/08": {
            "name": "Bộ gá cửa L/R 25-07/08",
            "material": {"resin_id": "ABS-HI121", "name": "Nhựa ABS Chịu va đập cao", "color": "Dark Grey", "is_dry_coat": False, "dry_temp": 85, "dry_hours": 3.0},
            "box": {"box_id": "THUNG-CARTON-25", "name": "Thùng carton chia ô đối xứng", "pcs_per_box": 100, "staging_lead_hours": 1.0},
            "cycle_time_sec": 34.0,
            "cavity": 2,
            "compatible_machines": ["18号機", "19号機"],
            "preferred_mode": "BY_MACHINE",
            "dedicated_operator": None,
            "defect_buffer_pct": 2.5
        },
        "74": {
            "name": "Trục dẫn hướng 74",
            "material": {"resin_id": "POM-FB", "name": "POM Trơn tự bôi trơn", "color": "White", "is_dry_coat": False, "dry_temp": 90, "dry_hours": 3.5},
            "box": {"box_id": "THUNG-KLT-MINI", "name": "Hộp nhựa mini chống xước", "pcs_per_box": 250, "staging_lead_hours": 1.0},
            "cycle_time_sec": 19.5,
            "cavity": 4,
            "compatible_machines": ["19号機", "18号機"],
            "preferred_mode": "BY_MACHINE",
            "dedicated_operator": None,
            "defect_buffer_pct": 2.0
        },
        "21-61/62": {
            "name": "Thân vỏ cảm biến 21-61/62",
            "material": {"resin_id": "PBT-4130", "name": "Nhựa PBT Kỹ thuật cao", "color": "Red (赤)", "is_dry_coat": True, "dry_temp": 120, "dry_hours": 4.0},
            "box": {"box_id": "THUNG-KLT-SPECIAL", "name": "Thùng chuyên dụng chống tĩnh điện", "pcs_per_box": 100, "staging_lead_hours": 1.5},
            "cycle_time_sec": 38.0,
            "cavity": 2,
            "compatible_machines": ["21号機", "22号機", "10号機", "11号機"],
            "preferred_mode": "BY_PRODUCT",
            "dedicated_operator": "クアン (Quang)",
            "defect_buffer_pct": 4.0
        },
        "11-53": {
            "name": "Tai móc treo 11-53",
            "material": {"resin_id": "PA6-NAT", "name": "Polyamide 6 Tự nhiên", "color": "Natural", "is_dry_coat": False, "dry_temp": 90, "dry_hours": 3.0},
            "box": {"box_id": "THUNG-CARTON-1153", "name": "Thùng Carton 3 lớp", "pcs_per_box": 300, "staging_lead_hours": 1.0},
            "cycle_time_sec": 24.0,
            "cavity": 4,
            "compatible_machines": ["21号機", "22号機"],
            "preferred_mode": "BY_MACHINE",
            "dedicated_operator": None,
            "defect_buffer_pct": 2.0
        },
        "147-01": {
            "name": "Tấm ốp hông 147-01",
            "material": {"resin_id": "PP-MD20", "name": "Nhựa PP Độn khoáng 20%", "color": "Dark Grey", "is_dry_coat": False, "dry_temp": 80, "dry_hours": 2.5},
            "box": {"box_id": "THUNG-PALLET-147", "name": "Thùng Pallet nhựa tải nặng", "pcs_per_box": 50, "staging_lead_hours": 2.0},
            "cycle_time_sec": 48.0,
            "cavity": 1,
            "compatible_machines": ["22号機", "23号機"],
            "preferred_mode": "BY_PRODUCT",
            "dedicated_operator": "ビン (Bình)",
            "defect_buffer_pct": 3.0
        },
        "38-66": {
            "name": "Đế giữ rơ le 38-66",
            "material": {"resin_id": "PA66-V0", "name": "PA66 Chống cháy tiêu chuẩn UL94-V0", "color": "Black", "is_dry_coat": False, "dry_temp": 105, "dry_hours": 4.0},
            "box": {"box_id": "THUNG-CARTON-38", "name": "Thùng carton tiêu chuẩn 38", "pcs_per_box": 120, "staging_lead_hours": 1.0},
            "cycle_time_sec": 30.0,
            "cavity": 2,
            "compatible_machines": ["23号機", "22号機"],
            "preferred_mode": "BY_MACHINE",
            "dedicated_operator": None,
            "defect_buffer_pct": 3.0
        },
        "17-31": {
            "name": "Bảng mạch đỡ nút bấm 17-31",
            "material": {"resin_id": "ABS-FR", "name": "ABS Chống cháy", "color": "Ivory", "is_dry_coat": False, "dry_temp": 85, "dry_hours": 3.0},
            "box": {"box_id": "THUNG-KLT-4314", "name": "Thùng nhựa gập KLT", "pcs_per_box": 80, "staging_lead_hours": 1.0},
            "cycle_time_sec": 36.0,
            "cavity": 2,
            "compatible_machines": ["24号機", "23号機"],
            "preferred_mode": "BY_MACHINE",
            "dedicated_operator": "ソイ (Soi)",
            "defect_buffer_pct": 2.5
        },
        "09272": {
            "name": "Vỏ đầu nối cáp 09272",
            "material": {"resin_id": "PBT-GF20", "name": "PBT Gia cường sợi thủy tinh 20%", "color": "Black", "is_dry_coat": False, "dry_temp": 115, "dry_hours": 4.0},
            "box": {"box_id": "THUNG-CARTON-MINI", "name": "Thùng carton nhỏ chia túi PE", "pcs_per_box": 200, "staging_lead_hours": 1.0},
            "cycle_time_sec": 26.0,
            "cavity": 4,
            "compatible_machines": ["24号機", "25号機"],
            "preferred_mode": "BY_MACHINE",
            "dedicated_operator": None,
            "defect_buffer_pct": 2.0
        },
        "AR-05/06": {
            "name": "Cụm tay vịn ô tô AR-05/06",
            "material": {"resin_id": "PC-ABS-AUTO", "name": "Hợp kim PC/ABS chuyên dụng ô tô", "color": "Black Mờ", "is_dry_coat": True, "dry_temp": 110, "dry_hours": 4.5},
            "box": {"box_id": "KHAY-DINH-HINH-AR", "name": "Khay nhựa hút định hình chống trầy mặt A", "pcs_per_box": 30, "staging_lead_hours": 2.0},
            "cycle_time_sec": 55.0,
            "cavity": 2,
            "compatible_machines": ["25号機", "12号機", "13号機"],
            "preferred_mode": "BY_PRODUCT",
            "dedicated_operator": "ティ (Thi)",
            "defect_buffer_pct": 4.5
        },
        "3827": {
            "name": "Tấm che bảng điều khiển 3827",
            "material": {"resin_id": "ABS-METALLIC", "name": "ABS Hạt kim loại ánh kim", "color": "Silver Metallic", "is_dry_coat": True, "dry_temp": 90, "dry_hours": 4.0},
            "box": {"box_id": "THUNG-VIP-3827", "name": "Thùng lót nhung bọt khí", "pcs_per_box": 40, "staging_lead_hours": 1.5},
            "cycle_time_sec": 46.0,
            "cavity": 2,
            "compatible_machines": ["25号機", "24号機"],
            "preferred_mode": "BY_MACHINE",
            "dedicated_operator": None,
            "defect_buffer_pct": 3.0
        },
        "700B GY": {
            "name": "Hộp bảo vệ điện tử 700B Xám (GY)",
            "material": {"resin_id": "ABS-GY", "name": "ABS Màu xám công nghiệp", "color": "Grey", "is_dry_coat": False, "dry_temp": 85, "dry_hours": 3.0},
            "box": {"box_id": "THUNG-CARTON-700", "name": "Thùng Carton 700", "pcs_per_box": 90, "staging_lead_hours": 1.0},
            "cycle_time_sec": 29.0,
            "cavity": 2,
            "compatible_machines": ["2号機", "3号機"],
            "preferred_mode": "BY_MACHINE",
            "dedicated_operator": None,
            "defect_buffer_pct": 2.0
        },
        "76-05/12": {
            "name": "Ống bọc cụm dây dẫn 76-05/12",
            "material": {"resin_id": "PP-SOFT", "name": "PP Mềm chịu uốn", "color": "Black", "is_dry_coat": False, "dry_temp": 80, "dry_hours": 2.0},
            "box": {"box_id": "THUNG-KLT-4314", "name": "Thùng nhựa KLT", "pcs_per_box": 150, "staging_lead_hours": 1.0},
            "cycle_time_sec": 25.0,
            "cavity": 2,
            "compatible_machines": ["2号機", "3号機"],
            "preferred_mode": "BY_MACHINE",
            "dedicated_operator": None,
            "defect_buffer_pct": 2.0
        },
        "700 BN": {
            "name": "Hộp bảo vệ điện tử 700 Nâu (BN)",
            "material": {"resin_id": "ABS-BN", "name": "ABS Màu nâu", "color": "Brown", "is_dry_coat": False, "dry_temp": 85, "dry_hours": 3.0},
            "box": {"box_id": "THUNG-CARTON-700", "name": "Thùng Carton 700", "pcs_per_box": 90, "staging_lead_hours": 1.0},
            "cycle_time_sec": 29.0,
            "cavity": 2,
            "compatible_machines": ["3号機", "2号機"],
            "preferred_mode": "BY_MACHINE",
            "dedicated_operator": None,
            "defect_buffer_pct": 2.0
        },
        "15NB/WY": {
            "name": "Khóa ngàm 15NB/WY",
            "material": {"resin_id": "POM-NAT", "name": "POM Trắng dẻo", "color": "White", "is_dry_coat": False, "dry_temp": 90, "dry_hours": 3.0},
            "box": {"box_id": "THUNG-KLT-MINI", "name": "Thùng KLT nhỏ", "pcs_per_box": 200, "staging_lead_hours": 1.0},
            "cycle_time_sec": 22.0,
            "cavity": 4,
            "compatible_machines": ["4号機", "5号機"],
            "preferred_mode": "BY_MACHINE",
            "dedicated_operator": None,
            "defect_buffer_pct": 2.0
        },
        "166/171": {
            "name": "Khớp nối gập 166/171",
            "material": {"resin_id": "PA66-GF15", "name": "PA66 Thủy tinh 15%", "color": "Black", "is_dry_coat": False, "dry_temp": 100, "dry_hours": 3.5},
            "box": {"box_id": "THUNG-CARTON-166", "name": "Thùng carton 166", "pcs_per_box": 100, "staging_lead_hours": 1.0},
            "cycle_time_sec": 31.0,
            "cavity": 2,
            "compatible_machines": ["5号機", "4号機"],
            "preferred_mode": "BY_MACHINE",
            "dedicated_operator": None,
            "defect_buffer_pct": 2.5
        },
        "51-10": {
            "name": "Mặt dưỡng công tắc 51-10",
            "material": {"resin_id": "PC-OPTICAL", "name": "Nhựa PC Trong suốt quang học", "color": "Clear", "is_dry_coat": True, "dry_temp": 120, "dry_hours": 4.5},
            "box": {"box_id": "KHAY-CHONG-BUI", "name": "Khay phòng sạch bọc màng PE", "pcs_per_box": 50, "staging_lead_hours": 1.5},
            "cycle_time_sec": 35.0,
            "cavity": 2,
            "compatible_machines": ["6号機", "10号機"],
            "preferred_mode": "BY_PRODUCT",
            "dedicated_operator": "ミン (Minh)",
            "defect_buffer_pct": 5.0
        },
        "075F/JV": {
            "name": "Chi tiết van định lượng 075F/JV",
            "material": {"resin_id": "PBT-UL", "name": "PBT Tiêu chuẩn Nhật", "color": "Black", "is_dry_coat": False, "dry_temp": 110, "dry_hours": 4.0},
            "box": {"box_id": "THUNG-CARTON-JV", "name": "Thùng carton chuyên chở Inoac", "pcs_per_box": 73, "staging_lead_hours": 1.0},
            "cycle_time_sec": 41.0,
            "cavity": 1,
            "compatible_machines": ["7号機", "8号機"],
            "preferred_mode": "BY_PRODUCT",
            "dedicated_operator": "ヒエン (Hiền)",
            "defect_buffer_pct": 2.5
        },
        "21-83": {
            "name": "Nắp hộp tiếp điểm 21-83",
            "material": {"resin_id": "PA6-V0", "name": "PA6 Chống cháy", "color": "Black", "is_dry_coat": False, "dry_temp": 95, "dry_hours": 3.5},
            "box": {"box_id": "THUNG-KLT-4314", "name": "Thùng nhựa KLT", "pcs_per_box": 120, "staging_lead_hours": 1.0},
            "cycle_time_sec": 27.0,
            "cavity": 2,
            "compatible_machines": ["10号機", "11号機"],
            "preferred_mode": "BY_MACHINE",
            "dedicated_operator": None,
            "defect_buffer_pct": 2.0
        },
        "21-84": {
            "name": "Thân hộp tiếp điểm 21-84",
            "material": {"resin_id": "PA6-V0", "name": "PA6 Chống cháy", "color": "Black", "is_dry_coat": False, "dry_temp": 95, "dry_hours": 3.5},
            "box": {"box_id": "THUNG-KLT-4314", "name": "Thùng nhựa KLT", "pcs_per_box": 120, "staging_lead_hours": 1.0},
            "cycle_time_sec": 28.0,
            "cavity": 2,
            "compatible_machines": ["10号機", "11号機"],
            "preferred_mode": "BY_MACHINE",
            "dedicated_operator": None,
            "defect_buffer_pct": 2.0
        },
        "21-69/70": {
            "name": "Cặp chốt gài điện từ 21-69/70",
            "material": {"resin_id": "POM-SLIP", "name": "POM Trơn", "color": "Black", "is_dry_coat": False, "dry_temp": 90, "dry_hours": 3.0},
            "box": {"box_id": "THUNG-KLT-MINI", "name": "Thùng KLT nhỏ", "pcs_per_box": 200, "staging_lead_hours": 1.0},
            "cycle_time_sec": 23.0,
            "cavity": 4,
            "compatible_machines": ["11号機", "10号機"],
            "preferred_mode": "BY_MACHINE",
            "dedicated_operator": None,
            "defect_buffer_pct": 2.0
        },
        "135/136": {
            "name": "Bộ gối đỡ trục 135/136",
            "material": {"resin_id": "PA66-GF50", "name": "PA66 Sợi thủy tinh 50% siêu bền", "color": "Black", "is_dry_coat": False, "dry_temp": 110, "dry_hours": 4.5},
            "box": {"box_id": "THUNG-CARTON-HEAVY", "name": "Thùng carton chịu lực", "pcs_per_box": 60, "staging_lead_hours": 1.5},
            "cycle_time_sec": 44.0,
            "cavity": 2,
            "compatible_machines": ["12号機", "13号機"],
            "preferred_mode": "BY_MACHINE",
            "dedicated_operator": None,
            "defect_buffer_pct": 3.0
        },
        "145": {
            "name": "Mặt bích chịu áp lực 145",
            "material": {"resin_id": "PPS-NAT", "name": "Nhựa kỹ thuật PPS đặc biệt", "color": "Brown", "is_dry_coat": True, "dry_temp": 140, "dry_hours": 5.0},
            "box": {"box_id": "THUNG-GO-145", "name": "Thùng gỗ cách ẩm chuyên dùng", "pcs_per_box": 20, "staging_lead_hours": 2.0},
            "cycle_time_sec": 65.0,
            "cavity": 1,
            "compatible_machines": ["13号機", "12号機"],
            "preferred_mode": "BY_PRODUCT",
            "dedicated_operator": "フック (Phúc)",
            "defect_buffer_pct": 4.0
        }
    }

def get_master_operators() -> List[Dict[str, Any]]:
    return [
        {"name": "チー (Chí)", "shift": "DAY", "start": 8.0, "end": 17.0, "mode": "BY_PRODUCT", "assigned_product": "W165", "assigned_machine": "15号機", "skill": 2, "is_relief": False},
        {"name": "クイン (Quỳnh)", "shift": "DAY", "start": 8.0, "end": 17.0, "mode": "BY_PRODUCT", "assigned_product": "048-04", "assigned_machine": "15号機", "skill": 2, "is_relief": False},
        {"name": "トゥー (Thu)", "shift": "DAY", "start": 8.0, "end": 17.0, "mode": "BY_MACHINE", "assigned_product": None, "assigned_machine": "16号機", "skill": 2, "is_relief": False},
        {"name": "カム (Cẩm)", "shift": "DAY", "start": 8.0, "end": 16.0, "mode": "BY_MACHINE", "assigned_product": None, "assigned_machine": "16号機", "skill": 2, "is_relief": False},
        {"name": "トレン (Tuyến)", "shift": "DAY", "start": 8.0, "end": 17.0, "mode": "BY_PRODUCT", "assigned_product": "19801/02", "assigned_machine": "17号機", "skill": 2, "is_relief": False},
        {"name": "フック (Phúc)", "shift": "DAY", "start": 8.0, "end": 17.0, "mode": "BY_PRODUCT", "assigned_product": "145", "assigned_machine": "13号機", "skill": 3, "is_relief": False},
        {"name": "ホアン (Hoàng)", "shift": "DAY", "start": 8.0, "end": 17.0, "mode": "BY_MACHINE", "assigned_product": None, "assigned_machine": "19号機", "skill": 1, "is_relief": False},
        {"name": "イエン (Yến)", "shift": "DAY", "start": 8.0, "end": 17.0, "mode": "BY_MACHINE", "assigned_product": None, "assigned_machine": "19号機", "skill": 1, "is_relief": False},
        {"name": "クアン (Quang)", "shift": "DAY", "start": 8.0, "end": 17.0, "mode": "BY_PRODUCT", "assigned_product": "21-61/62", "assigned_machine": "21号機", "skill": 2, "is_relief": False},
        {"name": "ホア (Hoa)", "shift": "DAY", "start": 8.0, "end": 17.0, "mode": "BY_MACHINE", "assigned_product": None, "assigned_machine": "21号機", "skill": 1, "is_relief": False},
        {"name": "ビン (Bình)", "shift": "DAY", "start": 8.0, "end": 16.0, "mode": "BY_PRODUCT", "assigned_product": "147-01", "assigned_machine": "22号機", "skill": 2, "is_relief": False},
        {"name": "トゥイ (Thúy)", "shift": "DAY", "start": 8.0, "end": 17.0, "mode": "BY_MACHINE", "assigned_product": None, "assigned_machine": "23号機", "skill": 2, "is_relief": True},
        {"name": "ソイ (Soi)", "shift": "DAY", "start": 8.0, "end": 17.0, "mode": "BY_MACHINE", "assigned_product": None, "assigned_machine": "24号機", "skill": 2, "is_relief": False},
        {"name": "ホー (Hồ)", "shift": "DAY", "start": 8.0, "end": 17.0, "mode": "BY_MACHINE", "assigned_product": None, "assigned_machine": "24号機", "skill": 1, "is_relief": False},
        {"name": "ティ (Thi)", "shift": "DAY", "start": 8.0, "end": 16.0, "mode": "BY_PRODUCT", "assigned_product": "AR-05/06", "assigned_machine": "25号機", "skill": 2, "is_relief": False},
        {"name": "ジャン (Giang)", "shift": "PART_TIME", "start": 8.0, "end": 12.0, "mode": "BY_MACHINE", "assigned_product": None, "assigned_machine": "Line Bay Relief", "skill": 1, "is_relief": True},
        {"name": "宮地 (Miyaji)", "shift": "DAY", "start": 7.0, "end": 11.5, "mode": "BY_MACHINE", "assigned_product": None, "assigned_machine": "Bảo trì khuôn (型替)", "skill": 3, "is_relief": True},
        {"name": "川端 (Kawabata)", "shift": "DAY_OT", "start": 8.0, "end": 20.5, "mode": "BY_MACHINE", "assigned_product": None, "assigned_machine": "Trưởng ca ngày / Setup", "skill": 3, "is_relief": True},
        {"name": "ファン (Phan)", "shift": "NIGHT", "start": 19.0, "end": 28.0, "mode": "BY_MACHINE", "assigned_product": None, "assigned_machine": "17号機/18号機", "skill": 2, "is_relief": False},
        {"name": "ガー (Nga)", "shift": "NIGHT", "start": 20.5, "end": 31.0, "mode": "BY_PRODUCT", "assigned_product": "048-04", "assigned_machine": "15号機", "skill": 2, "is_relief": False},
        {"name": "ニー (Nhi)", "shift": "NIGHT", "start": 20.5, "end": 31.0, "mode": "BY_MACHINE", "assigned_product": None, "assigned_machine": "16号機/24号機", "skill": 2, "is_relief": False},
        {"name": "ラミー (Lamy)", "shift": "NIGHT_EARLY", "start": 19.0, "end": 30.5, "mode": "BY_MACHINE", "assigned_product": None, "assigned_machine": "21号機/22号機", "skill": 2, "is_relief": False},
        {"name": "リン (Linh)", "shift": "NIGHT", "start": 22.0, "end": 30.0, "mode": "BY_MACHINE", "assigned_product": None, "assigned_machine": "Bay A Relief", "skill": 1, "is_relief": True},
        {"name": "フンA (Hùng A)", "shift": "NIGHT", "start": 22.0, "end": 30.0, "mode": "BY_MACHINE", "assigned_product": None, "assigned_machine": "Bay A Relief", "skill": 1, "is_relief": True},
    ]

def get_schedule_day1_nov12() -> Dict[str, Any]:
    """11月12日 木曜日 (Thursday Nov 12) - Exact representation of Photo 2 & 3"""
    jobs = [
        # Máy 2 -> 13 (Photo 3)
        {"id": "j_d1_m2_1", "machine": "2号機", "product": "700B GY", "start": 7.0, "end": 14.0, "event": "PROD", "op": "クアン (Quang)"},
        {"id": "j_d1_m2_2", "machine": "2号機", "product": "76-05/12", "start": 14.0, "end": 16.0, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d1_m2_3", "machine": "2号機", "product": "76-05/12", "start": 16.0, "end": 24.0, "event": "PROD", "op": "クイン (Quỳnh)"},
        {"id": "j_d1_m2_4", "machine": "2号機", "product": "STOP", "start": 24.0, "end": 31.0, "event": "STOP", "op": None}, # □ 計画停止 ca đêm
        {"id": "j_d1_m3_1", "machine": "3号機", "product": "86", "start": 7.0, "end": 16.0, "event": "PROD", "op": "トゥー (Thu)"},
        {"id": "j_d1_m3_2", "machine": "3号機", "product": "700 BN", "start": 16.0, "end": 18.0, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d1_m3_3", "machine": "3号機", "product": "700 BN", "start": 18.0, "end": 31.0, "event": "PROD", "op": "ラミー (Lamy)"},
        {"id": "j_d1_m4_1", "machine": "4号機", "product": "15NB/WY", "start": 7.0, "end": 9.5, "event": "MOLD_CHANGE", "op": "宮地 (Miyaji)"},
        {"id": "j_d1_m4_2", "machine": "4号機", "product": "15NB/WY", "start": 9.5, "end": 31.0, "event": "PROD", "op": "トゥ (Tú)"},
        {"id": "j_d1_m5_1", "machine": "5号機", "product": "72/73", "start": 7.0, "end": 13.0, "event": "PROD", "op": "ミン (Minh)"},
        {"id": "j_d1_m5_2", "machine": "5号機", "product": "166/171", "start": 13.0, "end": 15.0, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d1_m5_3", "machine": "5号機", "product": "166/171", "start": 15.0, "end": 31.0, "event": "PROD", "op": "ジャン (Giang)"},
        {"id": "j_d1_m6_1", "machine": "6号機", "product": "C0704", "start": 7.0, "end": 23.0, "event": "PROD", "op": "ミン (Minh)"},
        {"id": "j_d1_m6_2", "machine": "6号機", "product": "51-10", "start": 23.0, "end": 25.0, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d1_m6_3", "machine": "6号機", "product": "51-10", "start": 25.0, "end": 31.0, "event": "PROD", "op": "リン (Linh)"},
        {"id": "j_d1_m7_1", "machine": "7号機", "product": "77-44", "start": 7.0, "end": 14.0, "event": "PROD", "op": "ヒエン (Hiền)"},
        {"id": "j_d1_m7_2", "machine": "7号機", "product": "075F/JV", "start": 14.0, "end": 16.0, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d1_m7_3", "machine": "7号機", "product": "075F/JV", "start": 16.0, "end": 31.0, "event": "PROD", "op": "ヒエン (Hiền)"},
        {"id": "j_d1_m8_1", "machine": "8号機", "product": "37-57/58", "start": 7.0, "end": 10.5, "event": "PROD", "op": "ティ (Thi)"},
        {"id": "j_d1_m8_2", "machine": "8号機", "product": "STOP", "start": 10.5, "end": 31.0, "event": "STOP", "op": None}, # □ 計画停止
        {"id": "j_d1_m9_1", "machine": "9号機", "product": "34-99", "start": 7.0, "end": 15.5, "event": "PROD", "op": "イエン (Yến)"},
        {"id": "j_d1_m9_2", "machine": "9号機", "product": "49-53/54", "start": 15.5, "end": 17.5, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d1_m9_3", "machine": "9号機", "product": "49-53/54", "start": 17.5, "end": 31.0, "event": "PROD", "op": "フンA (Hùng A)"},
        {"id": "j_d1_m10_1", "machine": "10号機", "product": "21-83", "start": 7.0, "end": 14.5, "event": "PROD", "op": "トゥー (Thu)"},
        {"id": "j_d1_m10_2", "machine": "10号機", "product": "STOP", "start": 14.5, "end": 21.0, "event": "STOP", "op": None}, # □
        {"id": "j_d1_m10_3", "machine": "10号機", "product": "21-84", "start": 21.0, "end": 22.5, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d1_m10_4", "machine": "10号機", "product": "21-84", "start": 22.5, "end": 31.0, "event": "PROD", "op": "ファン (Phan)"},
        {"id": "j_d1_m11_1", "machine": "11号機", "product": "21-84", "start": 7.0, "end": 8.5, "event": "MOLD_CHANGE", "op": "宮地 (Miyaji)"},
        {"id": "j_d1_m11_2", "machine": "11号機", "product": "21-84", "start": 8.5, "end": 17.0, "event": "PROD", "op": "ホア (Hoa)"},
        {"id": "j_d1_m11_3", "machine": "11号機", "product": "21-71/72", "start": 17.0, "end": 18.5, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d1_m11_4", "machine": "11号機", "product": "21-71/72", "start": 18.5, "end": 24.0, "event": "PROD", "op": "ファン (Phan)"},
        {"id": "j_d1_m11_5", "machine": "11号機", "product": "21-69/70", "start": 24.0, "end": 25.5, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d1_m11_6", "machine": "11号機", "product": "21-69/70", "start": 25.5, "end": 31.0, "event": "PROD", "op": "ファン (Phan)"},
        {"id": "j_d1_m12_1", "machine": "12号機", "product": "AR-09/10", "start": 7.0, "end": 23.0, "event": "PROD", "op": "クアン (Quang)"},
        {"id": "j_d1_m12_2", "machine": "12号機", "product": "135/136", "start": 23.0, "end": 25.0, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d1_m12_3", "machine": "12号機", "product": "135/136", "start": 25.0, "end": 31.0, "event": "PROD", "op": "リン (Linh)"},
        {"id": "j_d1_m13_1", "machine": "13号機", "product": "09802", "start": 7.0, "end": 20.0, "event": "PROD", "op": "フック (Phúc)"},
        {"id": "j_d1_m13_2", "machine": "13号機", "product": "145", "start": 20.0, "end": 22.0, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d1_m13_3", "machine": "13号機", "product": "145", "start": 22.0, "end": 31.0, "event": "PROD", "op": "フック (Phúc)"},

        # Máy 15 -> 25 (Photo 2)
        {"id": "j_d1_m15_1", "machine": "15号機", "product": "W165", "start": 7.0, "end": 22.0, "event": "PROD", "op": "チー (Chí)"},
        {"id": "j_d1_m15_2", "machine": "15号機", "product": "W165", "start": 22.0, "end": 31.0, "event": "PROD", "op": "クイン (Quỳnh)"},
        {"id": "j_d1_m16_1", "machine": "16号機", "product": "C0291", "start": 7.0, "end": 12.0, "event": "PROD", "op": "トゥー (Thu)"},
        {"id": "j_d1_m16_2", "machine": "16号機", "product": "38-54", "start": 12.0, "end": 14.0, "event": "MOLD_CHANGE", "op": "宮地 (Miyaji)"},
        {"id": "j_d1_m16_3", "machine": "16号機", "product": "38-54", "start": 14.0, "end": 22.0, "event": "PROD", "op": "カム (Cẩm)"},
        {"id": "j_d1_m16_4", "machine": "16号機", "product": "154", "start": 22.0, "end": 31.0, "event": "PROD", "op": "ニー (Nhi)"},
        {"id": "j_d1_m17_1", "machine": "17号機", "product": "38-60", "start": 7.0, "end": 22.0, "event": "PROD", "op": "トレン (Tuyến)"},
        {"id": "j_d1_m17_2", "machine": "17号機", "product": "19801/02", "start": 22.0, "end": 31.0, "event": "PROD", "op": "ファン (Phan)"},
        {"id": "j_d1_m18_1", "machine": "18号機", "product": "48-53/54", "start": 7.0, "end": 12.0, "event": "PROD", "op": "トレン (Tuyến)"},
        {"id": "j_d1_m18_2", "machine": "18号機", "product": "25-07/08", "start": 12.0, "end": 14.0, "event": "MOLD_CHANGE", "op": "宮地 (Miyaji)"},
        {"id": "j_d1_m18_3", "machine": "18号機", "product": "25-07/08", "start": 14.0, "end": 31.0, "event": "PROD", "op": "トレン (Tuyến)"},
        {"id": "j_d1_m19_1", "machine": "19号機", "product": "10WX", "start": 7.0, "end": 17.0, "event": "PROD", "op": "ホアン (Hoàng)"},
        {"id": "j_d1_m19_2", "machine": "19号機", "product": "74", "start": 17.0, "end": 19.0, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d1_m19_3", "machine": "19号機", "product": "74", "start": 19.0, "end": 31.0, "event": "PROD", "op": "イエン (Yến)"},
        {"id": "j_d1_m21_1", "machine": "21号機", "product": "21-61/62", "start": 7.0, "end": 22.0, "event": "PROD", "op": "クアン (Quang)"},
        {"id": "j_d1_m21_2", "machine": "21号機", "product": "21-61/62", "start": 22.0, "end": 31.0, "event": "PROD", "op": "ラミー (Lamy)"},
        {"id": "j_d1_m22_1", "machine": "22号機", "product": "147-01", "start": 7.0, "end": 22.0, "event": "PROD", "op": "ビン (Bình)"},
        {"id": "j_d1_m22_2", "machine": "22号機", "product": "147-01", "start": 22.0, "end": 31.0, "event": "PROD", "op": "ラミー (Lamy)"},
        {"id": "j_d1_m23_1", "machine": "23号機", "product": "38-60", "start": 7.0, "end": 22.0, "event": "PROD", "op": "トゥイ (Thúy)"},
        {"id": "j_d1_m23_2", "machine": "23号機", "product": "38-66", "start": 22.0, "end": 31.0, "event": "PROD", "op": "トゥイ (Thúy)"},
        {"id": "j_d1_m24_1", "machine": "24号機", "product": "17x17/18", "start": 7.0, "end": 10.5, "event": "PROD", "op": "ソイ (Soi)"},
        {"id": "j_d1_m24_2", "machine": "24号機", "product": "36-24", "start": 10.5, "end": 12.0, "event": "MOLD_CHANGE", "op": "宮地 (Miyaji)"},
        {"id": "j_d1_m24_3", "machine": "24号機", "product": "36-24", "start": 12.0, "end": 14.5, "event": "PROD", "op": "ソイ (Soi)"},
        {"id": "j_d1_m24_4", "machine": "24号機", "product": "17-31", "start": 14.5, "end": 16.5, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d1_m24_5", "machine": "24号機", "product": "17-31", "start": 16.5, "end": 31.0, "event": "PROD", "op": "ホー (Hồ)"},
        {"id": "j_d1_m25_1", "machine": "25号機", "product": "AR-05/06", "start": 7.0, "end": 8.5, "event": "MOLD_CHANGE", "op": "宮地 (Miyaji)"},
        {"id": "j_d1_m25_2", "machine": "25号機", "product": "AR-05/06", "start": 8.5, "end": 22.0, "event": "PROD", "op": "ティ (Thi)"},
        {"id": "j_d1_m25_3", "machine": "25号機", "product": "AR-05/06", "start": 22.0, "end": 31.0, "event": "PROD", "op": "ニー (Nhi)"},
    ]
    return {
        "date": "2026-11-12",
        "day_of_week": "木曜日 (Thứ 5)",
        "notes": [
            "宮地: Hỗ trợ kỹ thuật 4h",
            "エラワン: Làm việc đến 17:00",
            "トン: Làm việc đến 17:00",
            "ティ: Làm việc đến 16:00",
            "ジャン: Làm việc đến 16:00",
            "カム: Làm việc đến 16:00",
            "ファン: Vào ca đêm từ 22:00",
            "ニー: Vào ca đêm từ 22:00",
            "リン: Vào ca đêm 22:00",
            "フンA: Vào ca đêm 22:00",
            "ガー: Vào ca đêm 22:00",
            "14:00~: Họp tiến độ POP"
        ],
        "jobs": jobs
    }

def get_schedule_day2_nov13() -> Dict[str, Any]:
    """11月13日 金曜日 (Friday Nov 13) - Exact representation of Photo 1 & 4"""
    jobs = [
        # Máy 2 -> 13 (Photo 4)
        {"id": "j_d2_m2_1", "machine": "2号機", "product": "76-05/12", "start": 7.0, "end": 16.0, "event": "PROD", "op": "クアン (Quang)"},
        {"id": "j_d2_m2_2", "machine": "2号機", "product": "STOP", "start": 16.0, "end": 22.0, "event": "STOP", "op": None}, # □
        {"id": "j_d2_m2_3", "machine": "2号機", "product": "01VN", "start": 22.0, "end": 31.0, "event": "PROD", "op": "ラミー (Lamy)"},
        {"id": "j_d2_m3_1", "machine": "3号機", "product": "700 BN", "start": 7.0, "end": 16.0, "event": "PROD", "op": "トゥー (Thu)"},
        {"id": "j_d2_m3_2", "machine": "3号機", "product": "STOP", "start": 16.0, "end": 22.0, "event": "STOP", "op": None}, # □
        {"id": "j_d2_m3_3", "machine": "3号機", "product": "700 BN", "start": 22.0, "end": 31.0, "event": "PROD", "op": "ラミー (Lamy)"},
        {"id": "j_d2_m4_1", "machine": "4号機", "product": "TRY", "start": 7.0, "end": 9.0, "event": "MOLD_CHANGE", "op": "宮地 (Miyaji)"},
        {"id": "j_d2_m4_2", "machine": "4号機", "product": "15NB/WY", "start": 9.0, "end": 16.0, "event": "PROD", "op": "トゥ (Tú)"},
        {"id": "j_d2_m4_3", "machine": "4号機", "product": "STOP", "start": 16.0, "end": 22.0, "event": "STOP", "op": None}, # □
        {"id": "j_d2_m4_4", "machine": "4号機", "product": "15NB/WY", "start": 22.0, "end": 31.0, "event": "PROD", "op": "リン (Linh)"},
        {"id": "j_d2_m5_1", "machine": "5号機", "product": "166/171", "start": 7.0, "end": 16.0, "event": "PROD", "op": "ミン (Minh)"},
        {"id": "j_d2_m5_2", "machine": "5号機", "product": "STOP", "start": 16.0, "end": 22.0, "event": "STOP", "op": None}, # □
        {"id": "j_d2_m5_3", "machine": "5号機", "product": "166/171", "start": 22.0, "end": 31.0, "event": "PROD", "op": "フンA (Hùng A)"},
        {"id": "j_d2_m6_1", "machine": "6号機", "product": "51-10", "start": 7.0, "end": 14.5, "event": "PROD", "op": "ミン (Minh)"},
        {"id": "j_d2_m6_2", "machine": "6号機", "product": "51-12", "start": 14.5, "end": 16.5, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d2_m6_3", "machine": "6号機", "product": "51-12", "start": 16.5, "end": 31.0, "event": "PROD", "op": "リン (Linh)"},
        {"id": "j_d2_m7_1", "machine": "7号機", "product": "075F/JV", "start": 7.0, "end": 18.0, "event": "PROD", "op": "ヒエン (Hiền)"},
        {"id": "j_d2_m7_2", "machine": "7号機", "product": "30-38", "start": 18.0, "end": 20.0, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d2_m7_3", "machine": "7号機", "product": "30-38", "start": 20.0, "end": 25.0, "event": "PROD", "op": "ヒエン (Hiền)"},
        {"id": "j_d2_m7_4", "machine": "7号機", "product": "47-44", "start": 25.0, "end": 26.5, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d2_m7_5", "machine": "7号機", "product": "47-44", "start": 26.5, "end": 31.0, "event": "PROD", "op": "ヒエン (Hiền)"},
        {"id": "j_d2_m8_1", "machine": "8号機", "product": "37-57/58", "start": 7.0, "end": 13.0, "event": "PROD", "op": "ティ (Thi)"},
        {"id": "j_d2_m8_2", "machine": "8号機", "product": "STOP", "start": 13.0, "end": 31.0, "event": "STOP", "op": None}, # □ 停止
        {"id": "j_d2_m9_1", "machine": "9号機", "product": "49-53/54", "start": 7.0, "end": 11.0, "event": "PROD", "op": "イエン (Yến)"},
        {"id": "j_d2_m9_2", "machine": "9号機", "product": "34-99", "start": 11.0, "end": 13.0, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d2_m9_3", "machine": "9号機", "product": "34-99", "start": 13.0, "end": 16.0, "event": "PROD", "op": "イエン (Yến)"},
        {"id": "j_d2_m9_4", "machine": "9号機", "product": "STOP", "start": 16.0, "end": 22.0, "event": "STOP", "op": None}, # □
        {"id": "j_d2_m9_5", "machine": "9号機", "product": "34-99", "start": 22.0, "end": 31.0, "event": "PROD", "op": "フンA (Hùng A)"},
        {"id": "j_d2_m10_1", "machine": "10号機", "product": "21-84", "start": 7.0, "end": 11.0, "event": "PROD", "op": "トゥー (Thu)"},
        {"id": "j_d2_m10_2", "machine": "10号機", "product": "48-52", "start": 11.0, "end": 13.0, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d2_m10_3", "machine": "10号機", "product": "48-52", "start": 13.0, "end": 16.0, "event": "PROD", "op": "トゥー (Thu)"},
        {"id": "j_d2_m10_4", "machine": "10号機", "product": "STOP", "start": 16.0, "end": 22.0, "event": "STOP", "op": None}, # □
        {"id": "j_d2_m10_5", "machine": "10号機", "product": "51-10", "start": 22.0, "end": 24.0, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d2_m10_6", "machine": "10号機", "product": "51-10", "start": 24.0, "end": 31.0, "event": "PROD", "op": "ファン (Phan)"},
        {"id": "j_d2_m11_1", "machine": "11号機", "product": "21-69/70", "start": 7.0, "end": 12.0, "event": "PROD", "op": "ホア (Hoa)"},
        {"id": "j_d2_m11_2", "machine": "11号機", "product": "21-83", "start": 12.0, "end": 14.0, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d2_m11_3", "machine": "11号機", "product": "21-83", "start": 14.0, "end": 19.0, "event": "PROD", "op": "ホア (Hoa)"},
        {"id": "j_d2_m11_4", "machine": "11号機", "product": "21-69/70", "start": 19.0, "end": 31.0, "event": "PROD", "op": "ファン (Phan)"},
        {"id": "j_d2_m12_1", "machine": "12号機", "product": "135/136", "start": 7.0, "end": 11.0, "event": "PROD", "op": "クアン (Quang)"},
        {"id": "j_d2_m12_2", "machine": "12号機", "product": "AR-05/06", "start": 11.0, "end": 13.0, "event": "MOLD_CHANGE", "op": "宮地 (Miyaji)"},
        {"id": "j_d2_m12_3", "machine": "12号機", "product": "AR-05/06", "start": 13.0, "end": 16.0, "event": "PROD", "op": "ティ (Thi)"},
        {"id": "j_d2_m12_4", "machine": "12号機", "product": "STOP", "start": 16.0, "end": 22.0, "event": "STOP", "op": None}, # □
        {"id": "j_d2_m12_5", "machine": "12号機", "product": "AR-05/06", "start": 22.0, "end": 31.0, "event": "PROD", "op": "リン (Linh)"},
        {"id": "j_d2_m13_1", "machine": "13号機", "product": "146", "start": 7.0, "end": 8.5, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d2_m13_2", "machine": "13号機", "product": "146", "start": 8.5, "end": 16.0, "event": "PROD", "op": "フック (Phúc)"},
        {"id": "j_d2_m13_3", "machine": "13号機", "product": "STOP", "start": 16.0, "end": 18.0, "event": "STOP", "op": None}, # □
        {"id": "j_d2_m13_4", "machine": "13号機", "product": "70B 03/04", "start": 18.0, "end": 20.0, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d2_m13_5", "machine": "13号機", "product": "70B 03/04", "start": 20.0, "end": 22.0, "event": "PROD", "op": "フック (Phúc)"},
        {"id": "j_d2_m13_6", "machine": "13号機", "product": "WD-12", "start": 22.0, "end": 31.0, "event": "PROD", "op": "フック (Phúc)"},

        # Máy 15 -> 25 (Photo 1)
        {"id": "j_d2_m15_1", "machine": "15号機", "product": "W165", "start": 7.0, "end": 16.0, "event": "PROD", "op": "チー (Chí)"},
        {"id": "j_d2_m15_2", "machine": "15号機", "product": "STOP", "start": 16.0, "end": 19.0, "event": "STOP", "op": None}, # □
        {"id": "j_d2_m15_3", "machine": "15号機", "product": "048-04", "start": 19.0, "end": 20.5, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d2_m15_4", "machine": "15号機", "product": "048-04", "start": 20.5, "end": 31.0, "event": "PROD", "op": "ガー (Nga)"},
        {"id": "j_d2_m16_1", "machine": "16号機", "product": "154", "start": 7.0, "end": 16.0, "event": "PROD", "op": "トゥー (Thu)"},
        {"id": "j_d2_m16_2", "machine": "16号機", "product": "STOP", "start": 16.0, "end": 20.5, "event": "STOP", "op": None}, # □
        {"id": "j_d2_m16_3", "machine": "16号機", "product": "W-67", "start": 20.5, "end": 31.0, "event": "PROD", "op": "ニー (Nhi)"},
        {"id": "j_d2_m17_1", "machine": "17号機", "product": "19801/02", "start": 7.0, "end": 12.0, "event": "PROD", "op": "トレン (Tuyến)"},
        {"id": "j_d2_m17_2", "machine": "17号機", "product": "55-307", "start": 12.0, "end": 13.5, "event": "MOLD_CHANGE", "op": "宮地 (Miyaji)"},
        {"id": "j_d2_m17_3", "machine": "17号機", "product": "55-307", "start": 13.5, "end": 16.0, "event": "PROD", "op": "フック (Phúc)"},
        {"id": "j_d2_m17_4", "machine": "17号機", "product": "STOP", "start": 16.0, "end": 19.0, "event": "STOP", "op": None}, # □
        {"id": "j_d2_m17_5", "machine": "17号機", "product": "55-307", "start": 19.0, "end": 28.0, "event": "PROD", "op": "ファン (Phan)"},
        {"id": "j_d2_m17_6", "machine": "17号機", "product": "STOP", "start": 28.0, "end": 31.0, "event": "STOP", "op": None}, # □ 計画停止 rạng sáng
        {"id": "j_d2_m18_1", "machine": "18号機", "product": "25-07/08", "start": 7.0, "end": 12.0, "event": "PROD", "op": "トレン (Tuyến)"},
        {"id": "j_d2_m18_2", "machine": "18号機", "product": "STOP", "start": 12.0, "end": 16.0, "event": "STOP", "op": None}, # □
        {"id": "j_d2_m18_3", "machine": "18号機", "product": "25-07/08", "start": 16.0, "end": 31.0, "event": "PROD", "op": "トレン (Tuyến)"},
        {"id": "j_d2_m19_1", "machine": "19号機", "product": "74", "start": 7.0, "end": 16.0, "event": "PROD", "op": "ホアン (Hoàng)"},
        {"id": "j_d2_m19_2", "machine": "19号機", "product": "STOP", "start": 16.0, "end": 31.0, "event": "STOP", "op": None}, # □ 16時停止
        {"id": "j_d2_m21_1", "machine": "21号機", "product": "21-61/62", "start": 7.0, "end": 16.0, "event": "PROD", "op": "クアン (Quang)"},
        {"id": "j_d2_m21_2", "machine": "21号機", "product": "STOP", "start": 16.0, "end": 19.0, "event": "STOP", "op": None}, # □
        {"id": "j_d2_m21_3", "machine": "21号機", "product": "11-53", "start": 19.0, "end": 30.5, "event": "PROD", "op": "ラミー (Lamy)"},
        {"id": "j_d2_m21_4", "machine": "21号機", "product": "STOP", "start": 30.5, "end": 31.0, "event": "STOP", "op": None}, # □ 計画停止
        {"id": "j_d2_m22_1", "machine": "22号機", "product": "147-01", "start": 7.0, "end": 16.0, "event": "PROD", "op": "ビン (Bình)"},
        {"id": "j_d2_m22_2", "machine": "22号機", "product": "STOP", "start": 16.0, "end": 19.0, "event": "STOP", "op": None}, # □
        {"id": "j_d2_m22_3", "machine": "22号機", "product": "147-01", "start": 19.0, "end": 31.0, "event": "PROD", "op": "トゥイ (Thúy)"},
        {"id": "j_d2_m23_1", "machine": "23号機", "product": "38-66", "start": 7.0, "end": 12.0, "event": "PROD", "op": "トゥイ (Thúy)"},
        {"id": "j_d2_m23_2", "machine": "23号機", "product": "STOP", "start": 12.0, "end": 19.0, "event": "STOP", "op": None}, # □
        {"id": "j_d2_m23_3", "machine": "23号機", "product": "38-66", "start": 19.0, "end": 31.0, "event": "PROD", "op": "トゥイ (Thúy)"},
        {"id": "j_d2_m24_1", "machine": "24号機", "product": "17-31", "start": 7.0, "end": 11.5, "event": "PROD", "op": "ソイ (Soi)"},
        {"id": "j_d2_m24_2", "machine": "24号機", "product": "09272", "start": 11.5, "end": 13.0, "event": "MOLD_CHANGE", "op": "川端 (Kawabata)"},
        {"id": "j_d2_m24_3", "machine": "24号機", "product": "09272", "start": 13.0, "end": 16.0, "event": "PROD", "op": "ソイ (Soi)"},
        {"id": "j_d2_m24_4", "machine": "24号機", "product": "STOP", "start": 16.0, "end": 19.0, "event": "STOP", "op": None}, # □
        {"id": "j_d2_m24_5", "machine": "24号機", "product": "09272", "start": 19.0, "end": 31.0, "event": "PROD", "op": "ニー (Nhi)"},
        {"id": "j_d2_m25_1", "machine": "25号機", "product": "AR-05/06", "start": 7.0, "end": 9.5, "event": "PROD", "op": "ティ (Thi)"},
        {"id": "j_d2_m25_2", "machine": "25号機", "product": "3827", "start": 9.5, "end": 11.5, "event": "MOLD_CHANGE", "op": "宮地 (Miyaji)"},
        {"id": "j_d2_m25_3", "machine": "25号機", "product": "3827", "start": 11.5, "end": 16.0, "event": "PROD", "op": "ティ (Thi)"},
        {"id": "j_d2_m25_4", "machine": "25号機", "product": "STOP", "start": 16.0, "end": 19.0, "event": "STOP", "op": None}, # □
        {"id": "j_d2_m25_5", "machine": "25号機", "product": "3827", "start": 19.0, "end": 31.0, "event": "PROD", "op": "ニー (Nhi)"},
    ]
    return {
        "date": "2026-11-13",
        "day_of_week": "金曜日 (Thứ 6)",
        "notes": [
            "4:00 Sấy nhựa chu kỳ mới từ 12:25",
            "エジソン: Làm việc đến 16:00",
            "ジャン: Làm việc ca sáng 8:00〜12:00",
            "宮地: Làm việc 7:00〜11:30 (Setup khuôn)",
            "ビン: Làm việc đến 16:00",
            "川端: Trưởng ca ngày hỗ trợ đến 20:30",
            "ガー: Vào ca đêm 20:30〜7:00",
            "ファン: Vào ca đêm 19:00〜4:00",
            "ニー: Vào ca đêm 20:30〜7:00",
            "075F/JV: Kế hoạch giao hàng: 11/13 (73 cái), 16 (72 cái), 17 (76 cái), 18 (96 cái), 19 (51 cái)"
        ],
        "jobs": jobs
    }

def get_master_shipping_orders() -> List[Dict[str, Any]]:
    """Lệnh xuất hàng / Đơn hàng giao khách (Shipping Orders)"""
    return [
        {
            "order_id": "SO-20261113-001",
            "customer": "Inoac Corporation",
            "product": "075F/JV",
            "order_qty": 73,
            "ship_date": "2026-11-13",
            "ship_deadline_hour": 18.0,
            "box_type": "THUNG-CARTON-JV",
            "boxes_required": 1,
            "status": "READY"
        },
        {
            "order_id": "SO-20261113-002",
            "customer": "Hikari Seimitsu Kogyo",
            "product": "W165",
            "order_qty": 1200,
            "ship_date": "2026-11-13",
            "ship_deadline_hour": 16.0,
            "box_type": "THUNG-CARTON-165",
            "boxes_required": 10,
            "status": "READY"
        },
        {
            "order_id": "SO-20261113-003",
            "customer": "Denso Automotive",
            "product": "21-61/62",
            "order_qty": 600,
            "ship_date": "2026-11-13",
            "ship_deadline_hour": 17.0,
            "box_type": "THUNG-KLT-SPECIAL",
            "boxes_required": 6,
            "status": "READY"
        },
        {
            "order_id": "SO-20261114-001",
            "customer": "Toyota Boshoku",
            "product": "AR-05/06",
            "order_qty": 300,
            "ship_date": "2026-11-14",
            "ship_deadline_hour": 10.0,
            "box_type": "KHAY-DINH-HINH-AR",
            "boxes_required": 10,
            "status": "PREPARING"
        },
        {
            "order_id": "SO-20261114-002",
            "customer": "Mitsubishi Electric",
            "product": "048-04",
            "order_qty": 400,
            "ship_date": "2026-11-14",
            "ship_deadline_hour": 11.0,
            "box_type": "KHAY-XOP-FAN",
            "boxes_required": 10,
            "status": "PREPARING"
        },
        {
            "order_id": "SO-20261114-003",
            "customer": "Hikari Seimitsu Kogyo",
            "product": "154",
            "order_qty": 800,
            "ship_date": "2026-11-14",
            "ship_deadline_hour": 14.0,
            "box_type": "THUNG-KLT-4314",
            "boxes_required": 10,
            "status": "PREPARING"
        }
    ]

