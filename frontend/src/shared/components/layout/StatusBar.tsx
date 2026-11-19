import React from "react";
import { Database, CheckCircle2, ShieldCheck, Activity } from "lucide-react";
import { Database, ShieldCheck, Activity, User, CheckCircle2 } from "lucide-react";
import { formatTimeHour } from "@/shared/utils/formatters";
import { useAppStore } from "@/app/store/useAppStore";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";

interface StatusBarProps {
  walMode?: boolean;
  totalTables?: number;
}
export const StatusBar: React.FC = () => {
  const { currentHour, currentUser } = useAppStore();

export const StatusBar: React.FC<StatusBarProps> = ({
  walMode = true,
  totalTables = 10,
}) => {
  const { currentHour } = useAppStore();
  const { data: health } = useQuery({
    queryKey: ["healthCheck"],
    queryFn: async () => {
      const res = await apiClient.get(API_ENDPOINTS.HEALTH);
      return res.data;
    },
    refetchInterval: 10000,
  });

  const isPostgres = health?.backend === "postgres";

  return (
    <footer className="h-9 border-t border-factory-border bg-factory-card/40 px-6 flex items-center justify-between text-xs text-slate-400">
    <footer className="h-9 border-t border-factory-border bg-factory-card/60 px-6 flex items-center justify-between text-xs text-slate-400">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Database size={13} />
          <span>SQLite WAL Mode: {walMode ? "ACTIVE" : "OFF"}</span>
        <div className="flex items-center gap-1.5">
          <Database size={13} className={isPostgres ? "text-cyan-400" : "text-emerald-400"} />
          <span className="font-mono">
            {isPostgres ? (
              <span className="text-cyan-300 font-semibold">PostgreSQL 18 Enterprise (Pool: Active)</span>
            ) : (
              <span className="text-emerald-300 font-semibold">SQLite WAL (Embedded Fallback)</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">

        <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
          <ShieldCheck size={13} className="text-blue-400" />
          <span>Foreign Keys: ENFORCED ({totalTables} Tables)</span>
          <span>RBAC: 4 Phân Quyền Xưởng (Admin, Thợ máy, Nguyên liệu, Đứng máy)</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">

        <div className="hidden md:flex items-center gap-1.5 text-slate-400">
          <Activity size={13} className="text-purple-400" />
          <span>APS Brain: JIT Optimization Active</span>
          <span>AI JIT Brain: Không thiếu hàng</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-mono text-slate-300">
          Mô phỏng thời gian thực: <strong className="text-blue-400">{formatTimeHour(currentHour)}</strong>
        </span>
        <span className="flex items-center gap-1 text-emerald-400">
      <div className="flex items-center gap-4">
        {currentUser ? (
          <div className="flex items-center gap-1 text-slate-300 font-medium">
            <User size={13} className="text-blue-400" />
            <span>Phiên làm việc: <strong className="text-white">{currentUser.full_name}</strong></span>
          </div>
        ) : (
          <span className="text-slate-400 italic">Chế độ xem chung (Khách)</span>
        )}

        <div className="flex items-center gap-1 text-slate-300 font-mono">
          <span>Giờ mô phỏng: <strong className="text-blue-400">{formatTimeHour(currentHour)}</strong></span>
        </div>

        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
          <CheckCircle2 size={13} />
          <span>Hệ thống sẵn sàng</span>
          <span>Trực tuyến</span>
        </span>
      </div>
    </footer>
  );
};

export default StatusBar;
