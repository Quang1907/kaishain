import React from "react";
import { useAppStore } from "@/app/store/useAppStore";
import { Button } from "@/shared/components/ui/Button";
import { User, LogOut, CalendarDays, Shield } from "lucide-react";
import OperatorWorkstationView from "./OperatorWorkstationView";

interface OperatorPortalProps {
  onNavigateUrl?: (url: string) => void;
}

export const OperatorPortalLayout: React.FC<OperatorPortalProps> = ({
  onNavigateUrl = (url) => window.history.pushState({}, "", url),
}) => {
  const { currentUser, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    onNavigateUrl("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-factory-bg text-slate-100">
      {/* Dedicated Operator Header */}
      <header className="h-auto min-h-16 py-2 sm:py-0 px-3 sm:px-6 flex flex-wrap items-center justify-between border-b border-purple-500/30 bg-factory-card/50 backdrop-blur sticky top-0 z-40 gap-2 sm:gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25 shrink-0">
            <User className="text-white w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-extrabold text-sm sm:text-base tracking-wider text-white uppercase font-mono">
                BÀN LÀM VIỆC ĐỨNG MÁY
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/40 font-mono">
                /operator
              </span>
            </div>
            <p className="hidden md:block text-xs text-slate-400">
              Nhân viên: <strong className="text-purple-300">{currentUser?.full_name || "チー (Chí)"}</strong> • Vận hành &amp; báo cáo phế phẩm ca
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

      {/* Main Work Area - CHỈ HIỂN THỊ MÁY CỦA TÔI & BÁO CÁO CA */}
      <main className="flex-1 p-3 sm:p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <OperatorWorkstationView />
        </div>
      </main>
    </div>
  );
};

export default OperatorPortalLayout;
