import React from "react";
import {
  CalendarDays,
  Truck,
  Factory,
  Boxes,
  Users2,
  Database,
  Wrench,
  Wheat,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { useAppStore, ViewType } from "@/app/store/useAppStore";
import { cn } from "@/shared/utils/cn";

interface NavItem {
  key: ViewType;
  label: string;
  icon: LucideIcon;
  badge?: string;
  roleHighlight?: string;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { key: "gantt", label: "Bảng Lập Lịch 24H", icon: CalendarDays },
  {
    key: "technician",
    label: "Thợ Máy: Thay Khuôn (○ 型替)",
    icon: Wrench,
    badge: "Thợ máy",
    roleHighlight: "technician",
  },
  {
    key: "material",
    label: "Nguyên Liệu & Sấy Nhựa",
    icon: Wheat,
    badge: "Nguyên liệu",
    roleHighlight: "material_manager",
  },
  {
    key: "my-job",
    label: "Máy Của Tôi & Báo Cáo Ca",
    icon: UserCheck,
    badge: "Đứng máy",
    roleHighlight: "user",
  },
  { key: "orders", label: "Lệnh Xuất Hàng", icon: Truck },
  { key: "machines", label: "22 Máy Ép", icon: Factory },
  { key: "products", label: "Hàng & BOM", icon: Boxes },
  { key: "operators", label: "Nhân Lực", icon: Users2 },
  { key: "database", label: "Cơ Sở Dữ Liệu", icon: Database },
];

export const NavigationTabs: React.FC = () => {
  const { currentView, setView, currentUser } = useAppStore();

  return (
    <nav className="flex items-center gap-1.5 px-6 py-2 overflow-x-auto bg-factory-panel border-b border-factory-border/40 scrollbar-none">
      {ALL_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.key;
        const isUserRoleMatch = currentUser && currentUser.role === item.roleHighlight;

        return (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all whitespace-nowrap border",
              isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 border-blue-400/40"
                : isUserRoleMatch
                ? "bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-transparent"
            )}
          >
            <Icon size={14} className={isActive ? "text-white" : isUserRoleMatch ? "text-amber-400" : "text-slate-400"} />
            <span>{item.label}</span>
            {item.badge && !isActive && (
              <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold bg-slate-800 text-slate-400 border border-slate-700">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
