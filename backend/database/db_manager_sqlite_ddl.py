"""
SQLite Schema Fallback DDL
"""
SQLITE_SCHEMA_SQL = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS machines (
    id TEXT PRIMARY KEY,
    tonnage INTEGER NOT NULL,
    is_new BOOLEAN NOT NULL DEFAULT 0,
    power_kw REAL NOT NULL DEFAULT 22.0,
    bay TEXT NOT NULL DEFAULT 'A',
    status TEXT NOT NULL DEFAULT 'PLANNED_STOP',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY,
    resin_name TEXT NOT NULL,
    color_code TEXT NOT NULL,
    is_dry_coat BOOLEAN NOT NULL DEFAULT 0,
    dry_temp_celsius INTEGER NOT NULL DEFAULT 80,
    dry_time_hours REAL NOT NULL DEFAULT 3.0,
    hopper_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS boxes (
    id TEXT PRIMARY KEY,
    box_name TEXT NOT NULL,
    pcs_per_box INTEGER NOT NULL DEFAULT 100,
    staging_lead_hours REAL NOT NULL DEFAULT 1.0,
    inventory_qty INTEGER NOT NULL DEFAULT 500,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    material_id TEXT NOT NULL REFERENCES materials(id) ON UPDATE CASCADE,
    box_id TEXT NOT NULL REFERENCES boxes(id) ON UPDATE CASCADE,
    cycle_time_sec REAL NOT NULL,
    cavity INTEGER NOT NULL DEFAULT 2,
    preferred_mode TEXT NOT NULL DEFAULT 'BY_MACHINE',
    dedicated_operator_name TEXT,
    defect_buffer_pct REAL NOT NULL DEFAULT 3.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_machines (
    product_code TEXT NOT NULL REFERENCES products(code) ON DELETE CASCADE,
    machine_id TEXT NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    priority INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (product_code, machine_id)
);

CREATE TABLE IF NOT EXISTS operators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    shift_type TEXT NOT NULL,
    shift_start_hour REAL NOT NULL,
    shift_end_hour REAL NOT NULL,
    mode_pref TEXT NOT NULL DEFAULT 'BY_MACHINE',
    assigned_product_code TEXT,
    assigned_machine_id TEXT,
    skill_level INTEGER NOT NULL DEFAULT 2,
    is_relief BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY,
    date_str TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    is_optimized BOOLEAN NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_blocks (
    id TEXT PRIMARY KEY,
    schedule_id TEXT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    machine_id TEXT NOT NULL REFERENCES machines(id) ON UPDATE CASCADE,
    product_code TEXT NOT NULL,
    start_hour REAL NOT NULL,
    end_hour REAL NOT NULL,
    planned_qty INTEGER NOT NULL DEFAULT 0,
    event_type TEXT NOT NULL,
    operator_name TEXT,
    material_status TEXT DEFAULT 'READY',
    box_status TEXT DEFAULT 'READY'
);

CREATE TABLE IF NOT EXISTS shipping_orders (
    order_id TEXT PRIMARY KEY,
    customer TEXT NOT NULL,
    product_code TEXT NOT NULL REFERENCES products(code) ON UPDATE CASCADE,
    order_qty INTEGER NOT NULL,
    ship_date TEXT NOT NULL,
    ship_deadline_hour REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'PREPARING',
    safety_buffer_units INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS break_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    shift TEXT NOT NULL,
    start_hour REAL NOT NULL,
    end_hour REAL NOT NULL,
    coverage TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS learning_feedback_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    product_code TEXT NOT NULL,
    machine_id TEXT NOT NULL,
    scraps INTEGER NOT NULL,
    actual_run_hours REAL NOT NULL,
    planned_run_hours REAL NOT NULL,
    prev_buffer_pct REAL NOT NULL,
    new_buffer_pct REAL NOT NULL,
    prev_oee REAL NOT NULL,
    new_oee REAL NOT NULL,
    note TEXT
);

CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar_url TEXT,
    assigned_machine_or_task TEXT,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mold_change_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id TEXT NOT NULL,
    machine_id TEXT NOT NULL,
    product_code TEXT NOT NULL,
    technician_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    cooling_line_checked BOOLEAN DEFAULT 0,
    clamping_torque_checked BOOLEAN DEFAULT 0,
    temp_barrel_checked BOOLEAN DEFAULT 0,
    first_shot_passed BOOLEAN DEFAULT 0,
    confirmed_by TEXT,
    confirmed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS material_prep_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id TEXT NOT NULL,
    machine_id TEXT NOT NULL,
    product_code TEXT NOT NULL,
    resin_id TEXT NOT NULL,
    hopper_id TEXT,
    target_temp INTEGER NOT NULL,
    target_hours REAL NOT NULL,
    actual_temp INTEGER,
    status TEXT NOT NULL DEFAULT 'DRYING',
    is_dry_coat BOOLEAN DEFAULT 0,
    staging_boxes_ready BOOLEAN DEFAULT 0,
    confirmed_by TEXT,
    confirmed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""
