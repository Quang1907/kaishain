import React from "react";
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

export const StatusBar: React.FC<StatusBarProps> = ({
  totalTables = 10,
}) => {
  const { currentHour, currentUser } = useAppStore();
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
    <footer className="h-9 border-t border-factory-border bg-factory-card/60 px-6 flex items-center justify-between text-xs text-slate-400">
      <div className="flex items-center gap-4">
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

        <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
          <ShieldCheck size={13} className="text-blue-400" />
          <span>RBAC: 4 Phân Quyền Xưởng ({totalTables} Tables)</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-slate-400">
          <Activity size={13} className="text-purple-400" />
          <span>AI JIT Brain: Sẵn sàng xuất hàng</span>
        </div>
      </div>

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
          <span>Trực tuyến</span>
        </span>
      </div>
    </footer>
  );
};

export default StatusBar;
