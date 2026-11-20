/**
 * Centralized API Endpoints Registry
 * Toàn bộ route backend SQLite & AI Brain được quản lý tập trung ở đây
 * Toàn bộ route backend PostgreSQL Server, Auth RBAC & AI Brain được quản lý tập trung ở đây
 */
export const API_ENDPOINTS = {
  // Auth & Roles
  AUTH_LOGIN: "/auth/login",
  AUTH_ME: "/auth/me",
  AUTH_LOGOUT: "/auth/logout",
  USERS: "/users",

  // Master Entities
  MACHINES: "/machines",
  PRODUCTS: "/products",
  MATERIALS: "/materials",
  BOXES: "/boxes",
  OPERATORS: "/operators",
  BREAKS: "/breaks",

  // Factory Scheduling & Execution
  SCHEDULES: "/schedules",
  SCHEDULE: "/schedule",
  JOBS: "/jobs",
  JOBS_DELETE: "/jobs/delete",
  READINESS: "/readiness",
  OPTIMIZE: "/optimize",
  FEEDBACK: "/feedback",
  LEARNING_PROFILE: "/learning-profile",

  // Orders
  SHIPPING_ORDERS: "/shipping-orders",

  // Roles Workflow
  MOLD_LOGS: "/mold/logs",
  MOLD_CONFIRM: "/mold/confirm",
  MATERIAL_LOGS: "/material/logs",
  MATERIAL_CONFIRM: "/material/confirm",
  OPERATOR_REPORT: "/operator/report",

  // Database Management
  DB_STATS: "/db/stats",
  DB_RESET: "/db/reset",
  DB_EXPORT: "/db/export",
  DB_DOWNLOAD: "/db/download",
  FEEDBACK_LOGS: "/feedback/logs",
  HEALTH: "/health",
} as const;
