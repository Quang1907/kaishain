# DATABASE MAP: ĐẶC TẢ CHI TIẾT CƠ SỞ DỮ LIỆU
- **Mục đích:** Tài liệu hóa toàn bộ 14 bảng quan hệ, khóa chính, khóa ngoại, kiểu dữ liệu và cơ chế toàn vẹn.
- **Ngày cập nhật:** 2026-11-20
- **Phạm vi:** SQLite `backend/database/factory_aps.db` và PostgreSQL `postgres_schema.sql`.
- **Trạng thái:** VERIFIED

---

## 1. CẤU HÌNH & TÍNH TOÀN VẸN
- **Chế độ WAL (Write-Ahead Logging):** Bật mặc định trên SQLite cho phép đọc ghi đồng thời cực nhanh.
- **Foreign Key Constraints:** Bắt buộc (`PRAGMA foreign_keys = ON;`), ngăn ngừa dữ liệu mồ côi.
- **Cascade Deletes:** Xóa lịch trình tự động xóa sạch các `job_blocks` liên quan.

---

## 2. DANH MỤC 14 BẢNG DỮ LIỆU QUAN HỆ

### 1. `machines` (22 máy ép nhựa)
- `id` VARCHAR(32) PRIMARY KEY ("2号機" -> "25号機", trừ 1 và 14).
- `tonnage` INTEGER (50 đến 350 tấn).
- `is_new` BOOLEAN (Máy đời mới / cũ).
- `power_kw` NUMERIC(6,2) (Công suất điện 18.5kW - 45.0kW).
- `bay` VARCHAR(16) ('Bay A': 2-13, 'Bay B': 15-25).
- `status` VARCHAR(32) (Mặc định: 'PLANNED_STOP').

### 2. `materials` (27 chủng loại hạt nhựa)
- `id` VARCHAR(64) PRIMARY KEY (Mã nguyên liệu: PP-Homo, ABS-750, POM, PC-ABS...).
- `resin_name` VARCHAR(128) NOT NULL.
- `color_code` VARCHAR(32).
- `dry_temp_celsius` INTEGER (Nhiệt độ sấy bắt buộc: 80°C - 140°C).
- `dry_time_hours` NUMERIC(4,2) (Thời gian sấy: 2.0h - 4.5h).
- `is_dry_coat` BOOLEAN (Cờ dùng sấy đặc biệt Dry-coat 青○).
- `hopper_id` VARCHAR(32) (Phễu sấy được gán).

### 3. `boxes` (20 quy cách thùng & bao bì)
- `id` VARCHAR(64) PRIMARY KEY (THUNG-KLT-4314, THUNG-CARTON-03...).
- `box_name` VARCHAR(128) NOT NULL.
- `pcs_per_box` INTEGER NOT NULL (Số cái / thùng).
- `staging_lead_hours` NUMERIC(4,2) (Thời gian xuất thùng trước giờ chạy, mặc định 1.0h).

### 4. `products` (28 con hàng sản xuất)
- `code` VARCHAR(64) PRIMARY KEY (Mã con hàng: W165, 154, 700B GY...).
- `name` VARCHAR(128) NOT NULL.
- `material_id` VARCHAR(64) REFERENCES `materials(id)`.
- `box_id` VARCHAR(64) REFERENCES `boxes(id)`.
- `cycle_time_sec` NUMERIC(6,2) NOT NULL (Chu kỳ ép giây/shot).
- `cavity` INTEGER NOT NULL (Số cái/shot).
- `defect_buffer_pct` NUMERIC(4,2) (Đệm hao hụt an toàn %).
- `preferred_mode` VARCHAR(32) ('BY_PRODUCT' hoặc 'BY_MACHINE').
- `dedicated_operator_name` VARCHAR(64) (Thợ chuyên trách nếu đứng theo con hàng).

### 5. `product_machines` (Bảng quan hệ máy tương thích)
- `product_code` VARCHAR(64) REFERENCES `products(code)` ON DELETE CASCADE.
- `machine_id` VARCHAR(32) REFERENCES `machines(id)` ON DELETE CASCADE.
- PRIMARY KEY (`product_code`, `machine_id`).

### 6. `operators` (24 nhân sự vận hành)
- `id` VARCHAR(64) PRIMARY KEY (Quỳnh, Chí, Thu, Kawabata...).
- `name` VARCHAR(64) NOT NULL.
- `shift_type` VARCHAR(16) ('DAY', 'NIGHT', 'PART_TIME').
- `shift_start_hour` NUMERIC(4,2) (7.0, 8.0, 20.5...).
- `shift_end_hour` NUMERIC(4,2) (17.0, 20.5, 31.0...).
- `mode_pref` VARCHAR(32) ('BY_PRODUCT' / 'BY_MACHINE').
- `skill_level` INTEGER (1 -> 5).
- `is_relief_operator` BOOLEAN (Cờ chạy chuyền thay thế giải lao).

### 7. `schedules` (Bảng kế hoạch ngày)
- `id` VARCHAR(64) PRIMARY KEY ("SCHED-2026-11-12", "SCHED-2026-11-13"...).
- `date_str` VARCHAR(32) NOT NULL.
- `day_of_week` VARCHAR(32).
- `is_optimized` BOOLEAN DEFAULT FALSE.
- `notes` TEXT.

### 8. `job_blocks` (188+ khối công việc trên 22 máy)
- `id` VARCHAR(64) PRIMARY KEY.
- `schedule_id` VARCHAR(64) REFERENCES `schedules(id)` ON DELETE CASCADE.
- `machine_id` VARCHAR(32) REFERENCES `machines(id)`.
- `product_code` VARCHAR(64) REFERENCES `products(code)`.
- `start_hour` NUMERIC(4,2) NOT NULL (Trục 7.0 -> 31.0).
- `end_hour` NUMERIC(4,2) NOT NULL.
- `planned_qty` INTEGER NOT NULL.
- `event_type` VARCHAR(32) ('PROD', 'MOLD_CHANGE', 'COLOR_CHANGE', 'STOP').
- `operator_name` VARCHAR(64).
- `operator_mode` VARCHAR(32).
- `material_status` VARCHAR(32).
- `box_status` VARCHAR(32).
- `is_optimized` BOOLEAN.

### 9. `shipping_orders` (Lệnh xuất hàng khách hàng)
- `order_id` VARCHAR(64) PRIMARY KEY.
- `product_code` VARCHAR(64) REFERENCES `products(code)`.
- `order_qty` INTEGER NOT NULL.
- `ship_deadline_hour` NUMERIC(4,2) NOT NULL.
- `ship_date` VARCHAR(32) NOT NULL.
- `customer` VARCHAR(128) NOT NULL.
- `is_fulfilled` BOOLEAN DEFAULT FALSE.
- `ready_time_est` NUMERIC(4,2).
- `safety_buffer_units` INTEGER.

### 10. `break_schedules` (Khung giờ nghỉ ngơi & Chạy chuyền)
- `id` VARCHAR(64) PRIMARY KEY.
- `name` VARCHAR(64).
- `shift` VARCHAR(16).
- `start_hour` NUMERIC(4,2).
- `end_hour` NUMERIC(4,2).
- `relief_operator_name` VARCHAR(64).

### 11. `learning_feedback_logs` (Nhật ký học máy tự bù đệm)
- `id` INTEGER PRIMARY KEY AUTOINCREMENT.
- `product_code` VARCHAR(64) REFERENCES `products(code)`.
- `machine_id` VARCHAR(32) REFERENCES `machines(id)`.
- `actual_qty` INTEGER.
- `scraps` INTEGER NOT NULL.
- `old_buffer_pct` NUMERIC(4,2).
- `new_buffer_pct` NUMERIC(4,2).
- `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP.

### 12. `users` (Tài khoản người dùng & Phân quyền RBAC)
- `id` INTEGER PRIMARY KEY AUTOINCREMENT.
- `username` VARCHAR(64) UNIQUE NOT NULL.
- `password_hash` VARCHAR(128) NOT NULL.
- `salt` VARCHAR(64) NOT NULL.
- `full_name` VARCHAR(128) NOT NULL.
- `role` VARCHAR(32) NOT NULL ('admin', 'technician', 'material_manager', 'user').
- `is_active` BOOLEAN DEFAULT TRUE.

### 13. `mold_change_logs` (Nhật ký nghiệm thu thợ máy)
- `id` INTEGER PRIMARY KEY AUTOINCREMENT.
- `job_id` VARCHAR(64) REFERENCES `job_blocks(id)`.
- `technician_id` VARCHAR(64).
- `safety_pins_checked` BOOLEAN.
- `cooling_water_checked` BOOLEAN.
- `hydraulic_checked` BOOLEAN.
- `sample_shot_passed` BOOLEAN.
- `signed_off_at` DATETIME.

### 14. `material_prep_logs` (Nhật ký chuẩn bị & Cấp phễu sấy)
- `id` INTEGER PRIMARY KEY AUTOINCREMENT.
- `job_id` VARCHAR(64) REFERENCES `job_blocks(id)`.
- `material_manager_id` VARCHAR(64).
- `hopper_id` VARCHAR(32).
- `temp_achieved` NUMERIC(5,2).
- `dry_duration_actual` NUMERIC(4,2).
- `boxes_staged_qty` INTEGER.
- `approved_at` DATETIME.
