import React from "react";
import { useAppStore } from "@/app/store/useAppStore";
import { Button } from "@/shared/components/ui/Button";
import { Wrench, LogOut, Zap, RefreshCw, CalendarDays, Shield } from "lucide-react";
import TechnicianView from "./TechnicianView";

interface TechnicianPortalProps {
  onNavigateUrl?: (url: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const TechnicianPortalLayout: React.FC<TechnicianPortalProps> = ({
  onNavigateUrl = (url) => window.history.pushState({}, "", url),
  onRefresh,
  isRefreshing,
}) => {
  const { currentDate, setDate, currentUser, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    onNavigateUrl("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-factory-bg text-slate-100">
      {/* Dedicated Technician Header */}
      <header className="h-auto min-h-16 py-2 sm:py-0 px-3 sm:px-6 flex flex-wrap items-center justify-between border-b border-amber-500/30 bg-factory-card/50 backdrop-blur sticky top-0 z-40 gap-2 sm:gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
            <Wrench className="text-white w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-extrabold text-sm sm:text-base tracking-wider text-white uppercase font-mono">
                CỔNG THAY KHUÔN (○ 型替)
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono">
                /technician
              </span>
            </div>
            <p className="hidden md:block text-xs text-slate-400">
              Thợ máy: <strong className="text-amber-300">{currentUser?.full_name || "宮地 (Miyaji)"}</strong> • Nghiệm thu an toàn 4 bước
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          {/* Nút Xem Lịch Xưởng (Trang Chủ) */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigateUrl("/")}
            title="Quay về trang chủ xem Lịch Trình Toàn Xưởng 24H"
            className="h-7 sm:h-8 px-2 sm:px-3 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 flex items-center gap-1.5 text-xs"
          >
            <CalendarDays size={13} />
            <span>Lịch Xưởng</span>
          </Button>

          {currentUser?.role === "admin" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigateUrl("/admin")}
              title="Quay lại Cổng Quản Lý"
              className="h-7 sm:h-8 px-2 sm:px-2.5 text-blue-400 border-blue-500/30 hover:bg-blue-500/10 flex items-center gap-1 text-xs"
            >
              <Shield size={12} />
              <span>Admin</span>
            </Button>
          )}

          {/* Date Switcher */}
          <div className="flex bg-factory-card border border-factory-border rounded-lg p-0.5 sm:p-1 text-xs font-medium">
            <button
              onClick={() => setDate("2026-11-12")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md transition-all text-[11px] sm:text-xs ${
                currentDate === "2026-11-12"
                  ? "bg-amber-600 text-white shadow font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              11/12 <span className="hidden sm:inline">(T5)</span>
            </button>
            <button
              onClick={() => setDate("2026-11-13")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md transition-all text-[11px] sm:text-xs ${
                currentDate === "2026-11-13"
                  ? "bg-amber-600 text-white shadow font-semibold"
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
              <span>AI</span>
            </button>
          </div>

          {onRefresh && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefresh}
              isLoading={isRefreshing}
              className="h-7 sm:h-8 px-2 sm:px-2.5 text-xs"
              title="Đồng bộ DB"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Đồng bộ</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleLogout}
            title="Đăng xuất"
            className="h-7 sm:h-8 px-2 sm:px-2.5 text-slate-400 hover:text-red-400 hover:border-red-500/40 text-xs"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Đăng Xuất</span>
          </Button>
        </div>
      </header>

      {/* Main Work Area - CHỈ HIỂN THỊ THAY KHUÔN & NGHIỆM THU */}
      <main className="flex-1 p-3 sm:p-6 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
          <TechnicianView />
        </div>
      </main>
    </div>
  );
};

export default TechnicianPortalLayout;
