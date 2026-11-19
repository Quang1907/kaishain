import React from "react";
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
  Calendar,
} from "lucide-react";
import { useAppStore } from "@/app/store/useAppStore";
import { Button } from "@/shared/components/ui/Button";
import { useSchedulesQuery } from "@/features/gantt-schedule/api/scheduleApi";

interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isRefreshing }) => {
  const {
    currentDate,
    setDate,
    currentUser,
    setLoginModalOpen,
    logout,
  } = useAppStore();

  const { data: schedules } = useSchedulesQuery();

  // Tự động chọn ngày đầu tiên từ DB nếu currentDate chưa khớp
  React.useEffect(() => {
    if (schedules && schedules.length > 0) {
      const exists = schedules.some((s) => s.id === currentDate || s.date === currentDate);
      if (!exists) {
        setDate(schedules[0].id || schedules[0].date);
      }
    }
  }, [schedules, currentDate, setDate]);

  const getRoleBadge = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case "admin":
        return {
          label: "Quản Lý Xưởng",
          icon: Shield,
          color: "bg-blue-500/20 text-blue-400 border-blue-500/40",
        };
      case "technician":
        return {
          label: "Thợ Máy Thay Khuôn",
          icon: Wrench,
          color: "bg-amber-500/20 text-amber-400 border-amber-500/40",
        };
      case "material_manager":
        return {
          label: "Quản Lý Nguyên Liệu",
          icon: Wheat,
          color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
        };
      case "user":
        return {
          label: "Nhân Viên Đứng Máy",
          icon: User,
          color: "bg-purple-500/20 text-purple-400 border-purple-500/40",
        };
      default:
        return {
          label: "Nhân Viên",
          icon: User,
          color: "bg-slate-500/20 text-slate-400 border-slate-500/40",
        };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-factory-border/60 bg-factory-card/30 backdrop-blur">
      {/* Brand & Factory Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Cpu className="text-white w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base tracking-wider text-white uppercase font-mono">
              APS BRAIN 2.0
            </h1>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              POSTGRESQL 18 • LIVE DB
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Hệ Thống Lập Lịch & Phân Quyền Xưởng Ép Nhựa 22 Máy (100% Real DB)
          </p>
        </div>
      </div>

      {/* Dynamic Date Switcher from Database & User Profile */}
      <div className="flex items-center gap-3">
        {/* Dynamic Database Date Selector */}
        <div className="flex bg-factory-card border border-factory-border rounded-lg p-1 text-xs font-medium">
          {schedules && schedules.length > 0 ? (
            schedules.map((s) => {
              const sKey = s.id || s.date;
              const isSelected = currentDate === sKey || currentDate === s.date;
              const isOpt = s.is_optimized || s.id === "optimized";

              return (
                <button
                  key={s.id}
                  onClick={() => setDate(sKey)}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? isOpt
                        ? "bg-amber-600 text-white shadow font-semibold"
                        : "bg-blue-600 text-white shadow font-semibold"
                      : isOpt
                      ? "text-amber-400 hover:text-amber-300"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {isOpt ? <Zap size={13} /> : <Calendar size={13} />}
                  <span>{s.day_of_week || s.date}</span>
                </button>
              );
            })
          ) : (
            <span className="px-3 py-1.5 text-slate-500 flex items-center gap-1.5 text-xs">
              <Calendar size={13} /> Đang tải lịch DB...
            </span>
          )}
        </div>

        {/* Sync DB Button */}
        {onRefresh && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            isLoading={isRefreshing}
            className="h-8"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            Đồng bộ DB
          </Button>
        )}

        {/* User Session & Role */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-3 border-l border-factory-border">
            <div className="text-right">
              <div className="text-xs font-bold text-white flex items-center gap-1.5 justify-end">
                <span>{currentUser.full_name}</span>
                {roleInfo && (
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold border ${roleInfo.color}`}
                  >
                    <roleInfo.icon size={11} />
                    {roleInfo.label}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                @{currentUser.username} • {currentUser.assigned_machine_or_task || "Toàn quyền"}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="h-8 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
              title="Đăng xuất"
            >
              <LogOut size={15} />
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setLoginModalOpen(true)}
            className="h-8 gap-1.5"
          >
            <LogIn size={14} />
            <span>Đăng Nhập</span>
          </Button>
        )}
      </div>
    </header>
  );
};
