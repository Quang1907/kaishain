/**
 * Factory APS System Constants
 */

// Giờ vận hành công nghiệp (7:00 sáng đến 31:00 = 7:00 sáng hôm sau)
export const FACTORY_TIMELINE = {
  START_HOUR: 7.0,
  END_HOUR: 31.0,
  STEP_HOUR: 0.5,
  DAY_SHIFT_START: 8.0,
  DAY_SHIFT_END: 17.0,
  NIGHT_SHIFT_START: 20.0,
  NIGHT_SHIFT_END: 29.0, // 5:00 (+1)
};

// 22 Máy ép được phân bổ theo 2 khu Bay
export const MACHINE_BAYS = {
  BAY_A: {
    name: "Khu Bay A (Máy 2-13)",
  },
  BAY_B: {
    name: "Khu Bay B (Máy 15-25)",
  },
};

// Màu sắc quy ước trực quan cho các loại khối việc trên bảng Gantt (chuẩn nhà máy Nhật)
export const JOB_TYPE_CONFIGS: Record<
  string,
  { bg: string; border: string; badge: string; label: string; icon: string }
> = {
  PROD: {
    bg: "bg-gradient-to-r from-emerald-700 to-teal-600 text-white",
    border: "border-emerald-400/80 shadow-sm shadow-emerald-500/20",
    badge: "bg-emerald-950/80 text-emerald-300 border-emerald-500/40",
    label: "Sản xuất (PROD)",
    icon: "cube",
  },
  MOLD_CHANGE: {
    bg: "bg-gradient-to-r from-amber-600 to-orange-600 text-white",
    border: "border-amber-400/80 shadow-sm shadow-amber-500/20",
    badge: "bg-amber-950/80 text-amber-300 border-amber-500/40",
    label: "○ Gá khuôn (型替)",
    icon: "wrench",
  },
  COLOR_CHANGE: {
    bg: "bg-gradient-to-r from-purple-700 to-pink-600 text-white",
    border: "border-purple-400/80 shadow-sm shadow-purple-500/20",
    badge: "bg-purple-950/80 text-purple-300 border-purple-500/40",
    label: "△ Đổi màu (色替)",
    icon: "palette",
  },
  STOP: {
    bg: "bg-slate-900/90 text-rose-300",
    border: "border-rose-900/60",
    badge: "bg-rose-950/80 text-rose-300 border-rose-500/40",
    label: "□ Kế hoạch dừng / Tắt máy",
    icon: "power-off",
  },
  MAINTENANCE: {
    bg: "bg-slate-800 text-slate-300",
    border: "border-slate-600",
    badge: "bg-slate-900 text-slate-300 border-slate-700",
    label: "Bảo trì định kỳ",
    icon: "tool",
  },
};
