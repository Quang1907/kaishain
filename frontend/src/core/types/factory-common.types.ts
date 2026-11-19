/**
 * Master TypeScript Domain Models
 * Khớp chuẩn xác 100% với Schema Cơ Sở Dữ Liệu PostgreSQL & Python Backend
 */

export type UserRole = "admin" | "user" | "technician" | "material_manager";

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  assigned_machine_or_task?: string;
  last_login?: string;
}

export interface MoldChangeLog {
  id: number;
  schedule_id: string;
  machine_id: string;
  from_product: string;
  to_product: string;
  start_hour: number;
  end_hour: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  technician_name?: string;
  confirmed_at?: string;
  inspection_water?: number | boolean;
  inspection_clamping?: number | boolean;
  inspection_barrel_temp?: number | boolean;
  inspection_first_shot?: number | boolean;
  notes?: string;
}

export interface MaterialPrepLog {
  id: number;
  schedule_id: string;
  machine_id: string;
  product_code: string;
  resin_name: string;
  color_code?: string;
  hopper_id?: string;
  target_temp: number;
  actual_temp?: number;
  drying_lead_hours: number;
  is_dry_coat: number | boolean;
  boxes_ready: number | boolean;
  status: "WAITING" | "DRYING" | "READY" | "CONFIRMED";
  manager_name?: string;
  confirmed_at?: string;
  notes?: string;
}

export interface Machine {
  id: string; // "2号機", "3号機", ... "25号機"
  tonnage: number;
  is_new?: number;
  power_kw: number;
  bay: "A" | "B";
  status: string; // "RUNNING" | "PLANNED_STOP" | "MAINTENANCE"
}

export interface Material {
  id: string;
  resin_name: string;
  color_code?: string;
  is_dry_coat: number | boolean;
  dry_temp_celsius: number;
  dry_time_hours: number;
  hopper_id?: string;
}

export interface Box {
  id: string;
  box_name: string;
  pcs_per_box: number;
  staging_lead_hours: number;
  inventory_qty?: number;
}

export interface ProductDetail {
  code: string;
  name: string;
  material?: {
    resin_id: string;
    name: string;
    color: string;
    is_dry_coat: boolean;
    dry_temp: number;
    dry_hours: number;
    hopper: string;
  };
  box?: {
    box_id: string;
    name: string;
    pcs_per_box: number;
  };
  cavity?: number;
  cycle_time?: number;
  cycle_time_sec?: number;
  scrap_buffer_pct?: number;
  preferred_mode?: "BY_PRODUCT" | "BY_MACHINE";
  compatible_machines?: (string | number)[];
}

export interface Operator {
  id: number | string;
  name: string;
  shift: "DAY" | "OVERTIME" | "NIGHT";
  start: number;
  end: number;
  mode: "BY_PRODUCT" | "BY_MACHINE";
  assigned_product?: string | null;
  assigned_machine?: string | null;
  skill: number;
}

export interface JobPrerequisites {
  product_name?: string;
  material?: {
    status: string;
    resin: string;
    resin_name: string;
    color: string;
    dry_temp: number;
    dry_hours: number;
    dry_progress_hours?: number;
    is_dry_coat?: boolean;
    is_ready?: boolean;
    note?: string;
  };
  box?: {
    status: string;
    box_id: string;
    box_name: string;
    pcs_per_box: number;
    required_boxes: number;
    is_ready?: boolean;
    note?: string;
  };
  operator?: {
    status: string;
    mode: string;
    operator_name: string;
    is_ready?: boolean;
    note?: string;
  };
  all_ready?: boolean;
}

export interface JobBlock {
  id: string;
  machine: string; // "10号機", khớp với Machine.id
  product: string; // "21-83", "STOP", ...
  start: number;   // 7.0
  end: number;     // 14.5
  planned_qty: number;
  actual_qty?: number;
  event: "PROD" | "STOP" | "MOLD_CHANGE" | "COLOR_CHANGE" | "MAINTENANCE";
  op: string | null; // "トゥー (Thu)"
  material_status?: string;
  box_status?: string;
  is_auto?: boolean;
  prerequisites?: JobPrerequisites;
}

export interface Schedule {
  id: string;
  date: string;
  day_of_week: string;
  is_optimized: boolean;
  notes?: string[];
  jobs: JobBlock[];
}

export interface ShippingOrder {
  order_id: string;
  customer: string;
  product: string;
  product_name?: string;
  order_qty: number;
  ship_date: string;
  ship_deadline_hour: number;
  required_boxes?: number;
  box_type?: string;
  status?: string;
}

export interface DbStats {
  db_type: string;
  backend: string;
  server_version: string;
  host?: string;
  port?: string;
  database_name?: string;
  file_size_kb: number;
  wal_mode?: boolean;
  active_connections?: number;
  table_counts?: Record<string, number>;
}

export interface FeedbackLog {
  id: number;
  product_code: string;
  machine_id: number | string;
  scraps: number;
  buffer_pct: number;
  logged_at: string;
}
