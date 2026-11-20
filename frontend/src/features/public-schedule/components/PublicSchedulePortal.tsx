import React from "react";
import { useAppStore } from "@/app/store/useAppStore";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import {
  Cpu,
  RefreshCw,
  Zap,
  LogIn,
  LogOut,
  Shield,
  Wrench,
  Wheat,
  User,
  ArrowRight,
  CalendarDays,
} from "lucide-react";
import GanttScheduleView from "@/features/gantt-schedule";
import { StatusBar } from "@/shared/components/layout/StatusBar";

interface PublicSchedulePortalProps {
  onNavigateUrl: (url: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const PublicSchedulePortal: React.FC<PublicSchedulePortalProps> = ({
  onNavigateUrl,
  onRefresh,
  isRefreshing,
}) => {
  const { currentDate, setDate, currentUser, logout } = useAppStore();

  const getRolePortalUrl = () => {
    if (!currentUser) return "/login";
    switch (currentUser.role) {
      case "admin":
        return "/admin";
      case "technician":
        return "/technician";
      case "material_manager":
        return "/material";
      case "user":
      default:
        return "/operator";
    }
  };

  const getRoleBadge = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case "admin":
        return {
          label: "Quản Lý",
          icon: Shield,
          color: "bg-blue-500/20 text-blue-400 border-blue-500/40",
          portalName: "Quản Lý (/admin)",
        };
      case "technician":
        return {
          label: "Thợ Máy",
          icon: Wrench,
          color: "bg-amber-500/20 text-amber-400 border-amber-500/40",
          portalName: "Thợ Máy (/technician)",
        };
      case "material_manager":
        return {
          label: "Nguyên Liệu",
          icon: Wheat,
          color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
          portalName: "Nguyên Liệu (/material)",
        };
      case "user":
      default:
        return {
          label: "Đứng Máy",
          icon: User,
          color: "bg-purple-500/20 text-purple-400 border-purple-500/40",
          portalName: "Đứng Máy (/operator)",
        };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <div className="min-h-screen flex flex-col bg-factory-bg text-slate-100">
      {/* Public Master Header - Responsive Navbar */}
      <header className="h-auto min-h-16 py-2 sm:py-0 px-3 sm:px-6 flex flex-wrap items-center justify-between border-b border-factory-border/60 bg-factory-card/50 backdrop-blur sticky top-0 z-40 gap-2 sm:gap-4">
        {/* Brand & System Title */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <Cpu className="text-white w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-extrabold text-sm sm:text-base tracking-wider text-white uppercase font-mono">
                APS BRAIN 2.0
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                BẢNG LỊCH XƯỞNG
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400">
              Lập Lịch &amp; Điều Phối Xưởng Ép Nhựa 22 Máy (Trang Chủ)
            </p>
          </div>
        </div>

        {/* Date Selector & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          {/* Date Selector */}
          <div className="flex bg-factory-card border border-factory-border rounded-lg p-0.5 sm:p-1 text-xs font-medium">
            <button
              onClick={() => setDate("2026-11-12")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md transition-all text-[11px] sm:text-xs ${
                currentDate === "2026-11-12"
                  ? "bg-blue-600 text-white shadow font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              11/12 <span className="hidden sm:inline">(T5)</span>
            </button>
            <button
              onClick={() => setDate("2026-11-13")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md transition-all text-[11px] sm:text-xs ${
                currentDate === "2026-11-13"
                  ? "bg-blue-600 text-white shadow font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              11/13 <span className="hidden sm:inline">(T6)</span>
            </button>
            <button
              onClick={() => setDate("optimized")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md flex items-center gap-1 transition-all text-[11px] sm:text-xs ${
                currentDate === "optimized"
                  ? "bg-amber-600 text-white shadow font-semibold"
                  : "text-amber-400 hover:text-amber-300"
              }`}
            >
              <Zap size={12} />
              <span>AI<span className="hidden sm:inline"> Tối Ưu</span></span>
            </button>
          </div>

          {/* Sync DB Button */}
          {onRefresh && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefresh}
              isLoading={isRefreshing}
              className="h-7 sm:h-8 px-2 sm:px-2.5 text-xs"
              title="Đồng bộ cơ sở dữ liệu"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Đồng bộ</span>
            </Button>
          )}

          <div className="hidden sm:block h-5 w-px bg-factory-border/60" />

          {/* Authentication & Role Portal Access */}
          {currentUser && roleInfo ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-factory-panel border border-factory-border">
                <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs uppercase">
                  {currentUser.username.substring(0, 2)}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span className="truncate max-w-[100px]">{currentUser.full_name}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase flex items-center gap-0.5 ${roleInfo.color}`}
                    >
                      <roleInfo.icon size={9} />
                      {roleInfo.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nút vào portal riêng của role hiện tại */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigateUrl(getRolePortalUrl())}
                className="h-7 sm:h-8 px-2.5 sm:px-3 bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 text-xs flex items-center gap-1"
              >
                <span>Vào Cổng</span>
                <ArrowRight size={12} />
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={logout}
                title="Đăng xuất"
                className="h-7 sm:h-8 px-2 text-slate-400 hover:text-red-400 hover:border-red-500/40"
              >
                <LogOut size={13} />
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigateUrl("/login")}
              className="h-7 sm:h-8 px-2.5 sm:px-3.5 bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 flex items-center gap-1.5 text-xs font-semibold"
            >
              <LogIn size={13} />
              <span>Đăng Nhập</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Gantt Schedule Work Area */}
      <main className="flex-1 p-3 sm:p-6 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto space-y-3 sm:space-y-5">
          {/* Public Info Banner */}
          <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-factory-panel to-slate-900 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <CalendarDays size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    LỊCH TRÌNH TOÀN XƯỞNG (22 MÁY ÉP)
                  </h2>
                  <Badge variant="default">TRANG CHỦ</Badge>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                  Tiến độ 24H thực tế cho Bay A (Máy 2-13) &amp; Bay B (Máy 15-25). Hiển thị công khai toàn bộ xưởng.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap text-[10px] sm:text-xs text-slate-400 font-mono">
              <span className="text-amber-400">○ Thay khuôn</span>
              <span>•</span>
              <span className="text-purple-400">△ Đổi màu</span>
              <span>•</span>
              <span className="text-rose-400">□ Dừng máy</span>
            </div>
          </div>

          {/* Core Gantt Schedule Component */}
          <GanttScheduleView />
        </div>
      </main>

      {/* Persistent System Status Bar */}
      <StatusBar />
    </div>
  );
};

export default PublicSchedulePortal;
