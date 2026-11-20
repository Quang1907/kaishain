import React from "react";
import { Database, ShieldCheck, Activity, User, CheckCircle2 } from "lucide-react";
import { formatTimeHour } from "@/shared/utils/formatters";
import { useAppStore } from "@/app/store/useAppStore";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";

interface StatusBarProps {
  totalTables?: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  totalTables = 14,
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
    <footer className="h-auto min-h-9 py-1 sm:py-0 border-t border-factory-border bg-factory-card/70 backdrop-blur px-3 sm:px-6 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
      {/* Left system indicators */}
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Database size={13} className={isPostgres ? "text-cyan-400" : "text-emerald-400"} />
          <span className="font-mono">
            {isPostgres ? (
              <span className="text-cyan-300 font-semibold">
                <span className="hidden sm:inline">PostgreSQL 18 Enterprise</span>
                <span className="sm:hidden">PG 18</span>
              </span>
            ) : (
              <span className="text-emerald-300 font-semibold">SQLite WAL</span>
            )}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-slate-400">
          <ShieldCheck size={13} className="text-blue-400" />
          <span>RBAC: 4 Vai Trò ({totalTables} Tables)</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
          <Activity size={13} className="text-purple-400" />
          <span>AI JIT Brain: Sẵn sàng xuất hàng</span>
        </div>
      </div>

      {/* Right session and time */}
      <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
        {currentUser ? (
          <div className="flex items-center gap-1 text-slate-300 font-medium">
            <User size={13} className="text-blue-400" />
            <span className="truncate max-w-[120px] sm:max-w-none">
              <strong className="text-white">{currentUser.full_name}</strong>
            </span>
          </div>
        ) : (
          <span className="text-slate-400 italic text-[11px] sm:text-xs">Khách xem lịch</span>
        )}

        <div className="flex items-center gap-1 text-slate-300 font-mono text-[11px] sm:text-xs">
          <span>Giờ: <strong className="text-blue-400">{formatTimeHour(currentHour)}</strong></span>
        </div>

        <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px] sm:text-xs">
          <CheckCircle2 size={13} />
          <span className="hidden sm:inline">Trực tuyến</span>
        </span>
      </div>
    </footer>
  );
};

export default StatusBar;
