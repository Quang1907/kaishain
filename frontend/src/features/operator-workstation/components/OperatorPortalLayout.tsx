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
      <header className="h-16 px-6 flex items-center justify-between border-b border-purple-500/30 bg-factory-card/50 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <User className="text-white w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-wider text-white uppercase font-mono">
                BÀN LÀM VIỆC NHÂN VIÊN ĐỨNG MÁY
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/40 font-mono">
                URL: /operator
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Nhân viên: <strong className="text-purple-300">{currentUser?.full_name || "チー (Chí)"}</strong> • Vận hành &amp; báo cáo phế phẩm ca
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Nút Xem Lịch Xưởng (Trang Chủ) */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigateUrl("/")}
            title="Quay về trang chủ xem Lịch Trình Toàn Xưởng 24H"
            className="h-8 px-3 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 flex items-center gap-1.5"
          >
            <CalendarDays size={14} />
            <span className="text-xs font-semibold">Xem Lịch Xưởng (Trang Chủ)</span>
          </Button>

          {currentUser?.role === "admin" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigateUrl("/admin")}
              title="Quay lại Cổng Quản Lý"
              className="h-8 px-2.5 text-blue-400 border-blue-500/30 hover:bg-blue-500/10 flex items-center gap-1"
            >
              <Shield size={13} />
              <span className="text-xs">Về Admin</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleLogout}
            title="Đăng xuất"
            className="h-8 px-2.5 text-slate-400 hover:text-red-400 hover:border-red-500/40"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline text-xs">Đăng Xuất</span>
          </Button>
        </div>
      </header>

      {/* Main Work Area - CHỈ HIỂN THỊ MÁY CỦA TÔI & BÁO CÁO CA */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <OperatorWorkstationView />
        </div>
      </main>
    </div>
  );
};

export default OperatorPortalLayout;
