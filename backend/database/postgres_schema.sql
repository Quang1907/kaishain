-- ====================================================================
-- ENTERPRISE POSTGRESQL SCHEMA FOR FACTORY APS (成形工場 生産計画システム)
-- Chuẩn hóa cho môi trường Server công nghiệp (ACID, MVCC, Indexing, Foreign Keys)
-- ====================================================================

-- 1. BẢNG MÁY ÉP (MACHINES)
CREATE TABLE IF NOT EXISTS machines (
    id VARCHAR(50) PRIMARY KEY,                  -- e.g. '2号機', '15号機'
    tonnage INTEGER NOT NULL,                     -- Trọng tải lực kẹp (Tấn): 80, 110, 150, 220, 350
    is_new BOOLEAN NOT NULL DEFAULT FALSE,        -- Máy đời mới (新号機)
    power_kw NUMERIC(6, 2) NOT NULL DEFAULT 22.0, -- Công suất tiêu thụ điện (kW)
    bay VARCHAR(20) NOT NULL DEFAULT 'A',         -- Khu vực: 'A' (Máy 2-13), 'B' (Máy 15-25)
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNED_STOP', -- RUNNING, SETUP_MOLD, SETUP_COLOR, PLANNED_STOP
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG NGUYÊN LIỆU HẠT NHỰA (MATERIALS)
CREATE TABLE IF NOT EXISTS materials (
    id VARCHAR(50) PRIMARY KEY,                  -- e.g. 'ABS-750', 'POM-M90', 'PA66-GF30'
    resin_name VARCHAR(150) NOT NULL,            -- e.g. 'Nhựa ABS Trắng Sữa'
    color_code VARCHAR(50) NOT NULL,             -- 'White', 'Black', 'Red', 'Ivory'
    is_dry_coat BOOLEAN NOT NULL DEFAULT FALSE,  -- Cờ Dry-coat (青○)
    dry_temp_celsius INTEGER NOT NULL DEFAULT 80,-- Nhiệt độ sấy chuẩn (°C)
    dry_time_hours NUMERIC(4, 2) NOT NULL DEFAULT 3.0, -- Thời gian sấy bắt buộc trước khi ép (tiếng)
    hopper_id VARCHAR(50),                       -- Phễu sấy gán
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. BẢNG QUY CÁCH THÙNG ĐÓNG GÓI (BOXES)
CREATE TABLE IF NOT EXISTS boxes (
    id VARCHAR(50) PRIMARY KEY,                  -- e.g. 'THUNG-CARTON-165', 'THUNG-KLT-4314'
    box_name VARCHAR(150) NOT NULL,              -- Tên quy cách bao bì
    pcs_per_box INTEGER NOT NULL DEFAULT 100,    -- Số lượng cái / thùng
    staging_lead_hours NUMERIC(4, 2) NOT NULL DEFAULT 1.0, -- Thời gian xuất thùng trước giờ chạy
    inventory_qty INTEGER NOT NULL DEFAULT 500,  -- Số lượng thùng tồn kho
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. BẢNG CON HÀNG & ĐỊNH MỨC BOM (PRODUCTS)
CREATE TABLE IF NOT EXISTS products (
    code VARCHAR(50) PRIMARY KEY,                -- Mã con hàng: 'W165', '154', '048-04', 'AR-05/06'
    name VARCHAR(150) NOT NULL,                  -- Tên chi tiết
    material_id VARCHAR(50) NOT NULL REFERENCES materials(id) ON UPDATE CASCADE,
    box_id VARCHAR(50) NOT NULL REFERENCES boxes(id) ON UPDATE CASCADE,
    cycle_time_sec NUMERIC(6, 2) NOT NULL,       -- Chu kỳ ép (giây/shot)
    cavity INTEGER NOT NULL DEFAULT 2,           -- Số cavity / khuôn
    preferred_mode VARCHAR(30) NOT NULL DEFAULT 'BY_MACHINE', -- 'BY_PRODUCT' hoặc 'BY_MACHINE'
    dedicated_operator_name VARCHAR(100),        -- Tên thợ chuyên trách nếu là BY_PRODUCT
    defect_buffer_pct NUMERIC(5, 2) NOT NULL DEFAULT 3.0, -- Tỉ lệ bù hao hụt đệm an toàn (%)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. BẢNG QUAN HỆ TƯƠNG THÍCH MÁY - CON HÀNG (PRODUCT_MACHINES)
-- 1 con hàng có thể chạy trên nhiều máy
CREATE TABLE IF NOT EXISTS product_machines (
    product_code VARCHAR(50) NOT NULL REFERENCES products(code) ON DELETE CASCADE ON UPDATE CASCADE,
    machine_id VARCHAR(50) NOT NULL REFERENCES machines(id) ON DELETE CASCADE ON UPDATE CASCADE,
    priority INTEGER NOT NULL DEFAULT 1,         -- 1: Ưu tiên cao nhất
    PRIMARY KEY (product_code, machine_id)
);

-- 6. BẢNG NHÂN SỰ ĐỨNG MÁY (OPERATORS)
CREATE TABLE IF NOT EXISTS operators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,           -- e.g. 'チー (Chí)', 'クイン (Quỳnh)'
    shift_type VARCHAR(50) NOT NULL,             -- 'DAY', 'NIGHT', 'PART_TIME', 'DAY_OT'
    shift_start_hour NUMERIC(4, 2) NOT NULL,     -- 8.0, 19.0, 20.5, 22.0
    shift_end_hour NUMERIC(4, 2) NOT NULL,       -- 12.0, 16.0, 17.0, 31.0
    mode_pref VARCHAR(30) NOT NULL DEFAULT 'BY_MACHINE', -- 'BY_PRODUCT' hoặc 'BY_MACHINE'
    assigned_product_code VARCHAR(50),
    assigned_machine_id VARCHAR(50),
    skill_level INTEGER NOT NULL DEFAULT 2,      -- 1: Phụ, 2: Chính, 3: Trưởng ca / Setup khuôn
    is_relief BOOLEAN NOT NULL DEFAULT FALSE,    -- Người chạy chuyền thay ca ăn trưa/nghỉ
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. BẢNG LỊCH TRÌNH NGÀY (SCHEDULES)
CREATE TABLE IF NOT EXISTS schedules (
    id VARCHAR(50) PRIMARY KEY,                  -- e.g. '2026-11-12', '2026-11-13', 'optimized'
    date_str VARCHAR(20) NOT NULL,               -- '2026-11-12'
    day_of_week VARCHAR(50) NOT NULL,            -- '木曜日 (Thứ 5)'
    is_optimized BOOLEAN NOT NULL DEFAULT FALSE, -- Kế hoạch gốc hay kế hoạch tối ưu bởi AI
    notes TEXT,                                  -- Ghi chú giao ban (JSON string)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. BẢNG CÔNG ĐOẠN CHI TIẾT TRÊN MÁY (JOB_BLOCKS)
-- Mỗi con hàng chỉ chạy 1 lần trên 1 máy trong kỳ lập lịch
CREATE TABLE IF NOT EXISTS job_blocks (
    id VARCHAR(100) PRIMARY KEY,
    schedule_id VARCHAR(50) NOT NULL REFERENCES schedules(id) ON DELETE CASCADE ON UPDATE CASCADE,
    machine_id VARCHAR(50) NOT NULL REFERENCES machines(id) ON UPDATE CASCADE,
    product_code VARCHAR(50) NOT NULL,           -- Mã con hàng hoặc 'STOP', 'TRY'
    start_hour NUMERIC(4, 2) NOT NULL,           -- 7.0 -> 31.0
    end_hour NUMERIC(4, 2) NOT NULL,
    planned_qty INTEGER NOT NULL DEFAULT 0,
    event_type VARCHAR(30) NOT NULL,             -- 'PROD', 'MOLD_CHANGE' (○), 'COLOR_CHANGE' (△), 'STOP' (□)
    operator_name VARCHAR(100),
    material_status VARCHAR(30) DEFAULT 'READY',
    box_status VARCHAR(30) DEFAULT 'READY'
);

-- 9. BẢNG LỆNH XUẤT HÀNG (SHIPPING_ORDERS)
CREATE TABLE IF NOT EXISTS shipping_orders (
    order_id VARCHAR(50) PRIMARY KEY,            -- e.g. 'SO-20261113-001'
    customer VARCHAR(150) NOT NULL,              -- Inoac, Hikari Seimitsu, Denso...
    product_code VARCHAR(50) NOT NULL REFERENCES products(code) ON UPDATE CASCADE,
    order_qty INTEGER NOT NULL,
    ship_date VARCHAR(20) NOT NULL,
    ship_deadline_hour NUMERIC(4, 2) NOT NULL,   -- 16.0, 18.0
    status VARCHAR(30) NOT NULL DEFAULT 'PREPARING', -- 'PREPARING', 'IN_PRODUCTION', 'READY'
    safety_buffer_units INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. BẢNG LỊCH NGHỈ NGƠI & CHẠY CHUYỀN (BREAK_SCHEDULES)
CREATE TABLE IF NOT EXISTS break_schedules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    shift VARCHAR(30) NOT NULL,
    start_hour NUMERIC(4, 2) NOT NULL,
    end_hour NUMERIC(4, 2) NOT NULL,
    coverage VARCHAR(200) NOT NULL
);

-- 11. BẢNG NHẬT KÝ HỌC MÁY ĐỆM AN TOÀN (LEARNING_FEEDBACK_LOGS)
-- Lưu lại lịch sử thực tế để AI học máy tự động tối ưu cho lần chạy sau không thiếu hàng
CREATE TABLE IF NOT EXISTS learning_feedback_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    product_code VARCHAR(50) NOT NULL,
    machine_id VARCHAR(50) NOT NULL,
    scraps INTEGER NOT NULL,
    actual_run_hours NUMERIC(5, 2) NOT NULL,
    planned_run_hours NUMERIC(5, 2) NOT NULL,
    prev_buffer_pct NUMERIC(5, 2) NOT NULL,
    new_buffer_pct NUMERIC(5, 2) NOT NULL,
    prev_oee NUMERIC(5, 3) NOT NULL,
    new_oee NUMERIC(5, 3) NOT NULL,
    note TEXT
);

-- 12. BẢNG THIẾT LẬP HỆ THỐNG (SYSTEM_SETTINGS)
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 13. BẢNG TÀI KHOẢN NGƯỜI DÙNG & PHÂN QUYỀN (USERS)
-- 4 Vai trò: admin (quản lý), user (nhân viên đứng máy), technician (thợ máy thay khuôn), material_manager (quản lý nguyên liệu)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL, -- 'admin', 'user', 'technician', 'material_manager'
    avatar_url VARCHAR(255),
    assigned_machine_or_task VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 14. BẢNG NHẬT KÝ THAY KHUÔN & XÁC NHẬN NGHIỆM THU (MOLD_CHANGE_LOGS)
-- Dành cho 'thợ máy' (người thay khuôn và quản lý xác nhận thay khuôn)
CREATE TABLE IF NOT EXISTS mold_change_logs (
    id SERIAL PRIMARY KEY,
    schedule_id VARCHAR(50) NOT NULL,
    machine_id VARCHAR(50) NOT NULL REFERENCES machines(id) ON UPDATE CASCADE,
    product_code VARCHAR(50) NOT NULL REFERENCES products(code) ON UPDATE CASCADE,
    technician_name VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'CONFIRMED'
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cooling_line_checked BOOLEAN DEFAULT FALSE,
    clamping_torque_checked BOOLEAN DEFAULT FALSE,
    temp_barrel_checked BOOLEAN DEFAULT FALSE,
    first_shot_passed BOOLEAN DEFAULT FALSE,
    confirmed_by VARCHAR(100),
    confirmed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 15. BẢNG NHẬT KÝ SẤY NHỰA & XÁC NHẬN CẤP LIỆU (MATERIAL_PREP_LOGS)
-- Dành cho 'nguyên liệu' (người quản lý nguyên liệu và sấy nhựa)
CREATE TABLE IF NOT EXISTS material_prep_logs (
    id SERIAL PRIMARY KEY,
    schedule_id VARCHAR(50) NOT NULL,
    machine_id VARCHAR(50) NOT NULL REFERENCES machines(id) ON UPDATE CASCADE,
    product_code VARCHAR(50) NOT NULL REFERENCES products(code) ON UPDATE CASCADE,
    resin_id VARCHAR(50) NOT NULL REFERENCES materials(id) ON UPDATE CASCADE,
    hopper_id VARCHAR(50),
    target_temp INTEGER NOT NULL,
    target_hours NUMERIC(4, 2) NOT NULL,
    actual_temp INTEGER,
    status VARCHAR(30) NOT NULL DEFAULT 'DRYING', -- 'DRYING', 'READY', 'LOADED'
    is_dry_coat BOOLEAN DEFAULT FALSE,
    staging_boxes_ready BOOLEAN DEFAULT FALSE,
    confirmed_by VARCHAR(100),
    confirmed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- CHỈ MỤC HIỆU NĂNG CAO (HIGH-PERFORMANCE INDEXES)
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_pg_jobs_sched ON job_blocks(schedule_id);
CREATE INDEX IF NOT EXISTS idx_pg_jobs_mach ON job_blocks(machine_id);
CREATE INDEX IF NOT EXISTS idx_pg_jobs_prod ON job_blocks(product_code);
CREATE INDEX IF NOT EXISTS idx_pg_orders_ship ON shipping_orders(ship_date, ship_deadline_hour);
CREATE INDEX IF NOT EXISTS idx_pg_feedback_prod_ts ON learning_feedback_logs(product_code, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_pg_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_pg_mold_logs_mach ON mold_change_logs(machine_id, status);
CREATE INDEX IF NOT EXISTS idx_pg_mat_logs_mach ON material_prep_logs(machine_id, status);
