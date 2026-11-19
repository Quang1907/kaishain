import React from "react";
import { Cpu, RefreshCw, Zap } from "lucide-react";
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
} from "lucide-react";
import { useAppStore } from "@/app/store/useAppStore";
import { Button } from "@/shared/components/ui/Button";

interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isRefreshing }) => {
  const { currentDate, setDate } = useAppStore();
  const {
    currentDate,
    setDate,
    currentUser,
    setLoginModalOpen,
    logout,
  } = useAppStore();

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
    <header className="h-16 px-6 flex items-center justify-between border-b border-factory-border/60">
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
              VITE • REACT
              POSTGRESQL 18 • RBAC
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Hệ Thống Lập Lịch & Điều Hành Nhà Máy Ép Nhựa Chính Xác
            Hệ Thống Lập Lịch & Phân Quyền Xưởng Ép Nhựa 22 Máy
          </p>
        </div>
      </div>

      {/* Date Switcher & Actions */}
      {/* Date Switcher & User Profile */}
      <div className="flex items-center gap-3">
        {/* Date Selector */}
        <div className="flex bg-factory-card border border-factory-border rounded-lg p-1 text-xs font-medium">
          <button
            onClick={() => setDate("2026-11-12")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              currentDate === "2026-11-12"
                ? "bg-blue-600 text-white shadow font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            11/12 (Thứ 5)
          </button>
          <button
            onClick={() => setDate("2026-11-13")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              currentDate === "2026-11-13"
                ? "bg-blue-600 text-white shadow font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            11/13 (Thứ 6)
          </button>
          <button
            onClick={() => setDate("optimized")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1 transition-all ${
              currentDate === "optimized"
                ? "bg-amber-600 text-white shadow font-semibold"
                : "text-amber-400 hover:text-amber-300"
            }`}
          >
            <Zap size={13} />
            AI Tối Ưu
          </button>
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

        {/* Authentication Widget */}
        <div className="h-6 w-px bg-factory-border/60 mx-1" />

        {currentUser && roleInfo ? (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-factory-panel border border-factory-border">
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs uppercase">
                {currentUser.username.substring(0, 2)}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{currentUser.full_name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase flex items-center gap-0.5 ${roleInfo.color}`}
                  >
                    <roleInfo.icon size={10} />
                    {roleInfo.label}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  @{currentUser.username}
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={logout}
              title="Đăng xuất"
              className="h-8 px-2.5 text-slate-400 hover:text-red-400 hover:border-red-500/40"
            >
              <LogOut size={14} />
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setLoginModalOpen(true)}
            className="h-8 px-3.5 bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
          >
            <LogIn size={14} />
            Đăng Nhập / Phân Quyền
          </Button>
        )}
      </div>
    </header>
  );
};
