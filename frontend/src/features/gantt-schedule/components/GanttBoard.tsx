import React from "react";
import { useAppStore } from "@/app/store/useAppStore";
import { Schedule, JobBlock, Machine } from "@/core/types/factory-common.types";
import { FACTORY_TIMELINE, JOB_TYPE_CONFIGS } from "@/core/config/constants";
import { formatTimeHour } from "@/shared/utils/formatters";
import { useMachinesQuery } from "@/features/machines/api/machinesApi";
import { Filter, AlertCircle, Loader2, PowerOff, Wrench } from "lucide-react";

interface GanttBoardProps {
  schedule?: Schedule;
  isLoading?: boolean;
}

const DEFAULT_MACHINES: Machine[] = [
  ...[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((num) => ({
    id: `${num}号機`,
    tonnage: num <= 3 ? 80 : num <= 7 ? 110 : num <= 9 ? 140 : 180,
    power_kw: 22,
    bay: "A" as const,
    status: "RUNNING",
  })),
  ...[15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].map((num) => ({
    id: `${num}号機`,
    tonnage: num <= 16 ? 180 : num <= 21 ? 220 : num <= 24 ? 280 : 350,
    power_kw: 37,
    bay: "B" as const,
    status: "RUNNING",
  })),
];

export const GanttBoard: React.FC<GanttBoardProps> = ({ schedule, isLoading = false }) => {
  const { currentHour, bayFilter, setBayFilter, setSelectedJob } = useAppStore();
  const { data: machinesData } = useMachinesQuery();

  const machines: Machine[] = machinesData && machinesData.length > 0 ? machinesData : DEFAULT_MACHINES;

  const filteredMachines = machines.filter((m) => {
    if (bayFilter === "BAY_A") return m.bay === "A" || m.bay === ("BAY_A" as any);
    if (bayFilter === "BAY_B") return m.bay === "B" || m.bay === ("BAY_B" as any);
    return true;
  });

  // Calculate real-time red line position (7.0 to 31.0 = 24.0 hours)
  const currentIndicatorPct = Math.max(0, Math.min(100, ((currentHour - 7.0) / 24.0) * 100));

  return (
    <div className="bg-factory-card border border-factory-border rounded-xl shadow-xl overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 bg-factory-bg/75 backdrop-blur-sm z-40 flex items-center justify-center gap-3 text-blue-400 font-semibold text-sm">
          <Loader2 className="animate-spin" size={24} />
          <span>Đang đồng bộ dữ liệu kế hoạch 22 máy ép từ Database SQLite...</span>
        </div>
      )}

      {/* Gantt Filter & Legend Toolbar */}
      <div className="px-6 py-3.5 border-b border-factory-border bg-factory-panel/90 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
            <Filter size={14} className="text-blue-400" /> Phân Vùng Xưởng:
          </span>
          <div className="flex bg-slate-950 border border-factory-border rounded-lg p-1 text-xs">
            <button
              onClick={() => setBayFilter("ALL")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                bayFilter === "ALL"
                  ? "bg-blue-600 text-white shadow font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Toàn Bộ 22 Máy
            </button>
            <button
              onClick={() => setBayFilter("BAY_A")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                bayFilter === "BAY_A"
                  ? "bg-blue-600 text-white shadow font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Bay A (Máy 2-13)
            </button>
            <button
              onClick={() => setBayFilter("BAY_B")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                bayFilter === "BAY_B"
                  ? "bg-blue-600 text-white shadow font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Bay B (Máy 15-25)
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded bg-gradient-to-r from-emerald-600 to-teal-500 border border-emerald-400/50"></span>
            <span className="text-slate-300 font-medium">Sản xuất (PROD)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded bg-gradient-to-r from-amber-600 to-orange-500 border border-amber-400/50"></span>
            <span className="text-slate-300 font-medium">○ Gá khuôn (型替)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded bg-gradient-to-r from-purple-600 to-pink-500 border border-purple-400/50"></span>
            <span className="text-slate-300 font-medium">△ Đổi màu (色替)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded bg-slate-900 border border-rose-900/60"></span>
            <span className="text-slate-400 font-medium">□ Tắt máy tiết kiệm điện</span>
          </div>
        </div>
      </div>

      {/* Main Gantt Grid Scroll Container */}
      <div className="overflow-x-auto relative">
        <div className="min-w-[1200px]">
          {/* Timeline Header (24 Equal Columns Horizontal Grid) */}
          <div className="flex border-b border-factory-border bg-slate-950/95 sticky top-0 z-30 text-xs">
            {/* Machine column header */}
            <div className="w-28 shrink-0 px-3 py-2.5 font-bold border-r border-factory-border text-slate-300 flex items-center justify-between bg-factory-panel">
              <span>号機 (MÁY)</span>
              <span className="text-[10px] text-slate-500 font-normal">TẤN</span>
            </div>

            {/* 24 Hours: 07:00 -> 30:00 (Next day 06:00) */}
            <div
              className="flex-1 grid"
              style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}
            >
              {Array.from({ length: 24 }).map((_, idx) => {
                const hour = FACTORY_TIMELINE.START_HOUR + idx;
                const displayH = hour >= 24 ? hour - 24 : hour;
                const isNight = hour >= 20;
                const isShiftBoundary = hour === 17 || hour === 20;

                return (
                  <div
                    key={hour}
                    className={`py-2 text-center border-r border-slate-800 text-[11px] font-mono select-none ${
                      isNight
                        ? "bg-indigo-950/40 text-indigo-300 font-bold"
                        : "text-slate-300"
                    } ${isShiftBoundary ? "border-r-amber-500/50" : ""}`}
                  >
                    {String(displayH).padStart(2, "0")}:00
                    {hour >= 24 && <span className="text-[9px] text-amber-400 ml-0.5">(+1)</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Machine Rows */}
          <div className="relative divide-y divide-factory-border">
            {/* Real-time Indicator Vertical Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] z-20 pointer-events-none transition-all duration-300"
              style={{ left: `calc(7rem + (100% - 7rem) * ${currentIndicatorPct / 100})` }}
            >
              <div className="absolute -top-1.5 -translate-x-1/2 w-3.5 h-3.5 bg-rose-500 rounded-full shadow-[0_0_8px_#f43f5e] border-2 border-white"></div>
            </div>

            {filteredMachines.map((m) => {
              // Extract jobs matching this machine (supports both "2号機" and 2)
              const rawJobs = (schedule?.jobs || []).filter(
                (j) => j.machine === m.id || j.machine === m.id.replace("号機", "")
              );

              const sortedJobs = [...rawJobs].sort((a, b) => a.start - b.start);

              // Auto-fill stops (□ 計画停止) between jobs, matching Japanese factory operation
              const machineJobs: JobBlock[] = [];
              let cursor = 7.0;

              for (const job of sortedJobs) {
                if (job.start > cursor + 0.05) {
                  machineJobs.push({
                    id: `stop_${m.id}_${cursor}_${job.start}`,
                    machine: m.id,
                    product: "STOP",
                    start: cursor,
                    end: job.start,
                    planned_qty: 0,
                    event: "STOP",
                    op: null,
                    is_auto: true,
                  });
                }
                machineJobs.push(job);
                cursor = Math.max(cursor, job.end);
              }

              if (cursor < 30.95) {
                machineJobs.push({
                  id: `stop_${m.id}_${cursor}_31`,
                  machine: m.id,
                  product: "STOP",
                  start: cursor,
                  end: 31.0,
                  planned_qty: 0,
                  event: "STOP",
                  op: null,
                  is_auto: true,
                });
              }

              return (
                <div key={m.id} className="flex h-12 hover:bg-slate-800/25 transition-colors group">
                  {/* Machine Label Column */}
                  <div className="w-28 shrink-0 px-3 flex items-center justify-between border-r border-factory-border bg-factory-panel/60">
                    <div>
                      <span className="font-mono font-bold text-white text-sm">{m.id}</span>
                      <span className="block text-[10px] text-slate-500 font-semibold">
                        {m.bay === "A" ? "Bay A" : "Bay B"}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {m.tonnage}T
                    </span>
                  </div>

                  {/* 24-Hour Job Canvas */}
                  <div className="flex-1 relative bg-slate-950/20 overflow-hidden">
                    {/* Hour grid guidelines */}
                    <div
                      className="absolute inset-0 grid pointer-events-none"
                      style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}
                    >
                      {Array.from({ length: 24 }).map((_, idx) => (
                        <div key={idx} className="border-r border-slate-800/30 h-full" />
                      ))}
                    </div>

                    {/* Render Job Blocks */}
                    {machineJobs.map((job) => {
                      const leftH = Math.max(7.0, job.start);
                      const rightH = Math.min(31.0, job.end);
                      const duration = rightH - leftH;
                      if (duration <= 0) return null;

                      const leftPercent = ((leftH - 7.0) / 24.0) * 100.0;
                      const widthPercent = (duration / 24.0) * 100.0;

                      const config = JOB_TYPE_CONFIGS[job.event] || JOB_TYPE_CONFIGS.PROD;
                      const isStop = job.event === "STOP" || job.product === "STOP";
                      const isMoldChange = job.event === "MOLD_CHANGE";
                      const isColorChange = job.event === "COLOR_CHANGE";
                      const hasWarning = job.prerequisites && !job.prerequisites.all_ready;

                      return (
                        <div
                          key={job.id}
                          onClick={() => !isStop && setSelectedJob(job)}
                          style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                          }}
                          className={`absolute top-1 bottom-1 rounded-md px-2 flex items-center justify-between text-xs border select-none transition-all ${
                            isStop
                              ? "cursor-default opacity-60 bg-slate-900 border-dashed border-slate-700/60"
                              : "cursor-pointer hover:scale-[1.01] hover:z-20 hover:brightness-110 shadow-md"
                          } ${config.bg} ${config.border}`}
                          title={`${job.product}: ${formatTimeHour(job.start)} - ${formatTimeHour(
                            job.end
                          )} (${duration.toFixed(1)}h)${job.op ? ` | Thợ: ${job.op}` : ""}`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {isStop ? (
                              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                                <PowerOff size={11} />
                                <span className="hidden sm:inline">TẮT MÁY</span>
                              </div>
                            ) : isMoldChange ? (
                              <div className="flex items-center gap-1 text-[11px] font-bold font-mono">
                                <Wrench size={12} className="text-amber-200" />
                                <span>○ {job.product}</span>
                              </div>
                            ) : isColorChange ? (
                              <span className="font-mono font-bold text-[11px]">△ {job.product}</span>
                            ) : (
                              <span className="font-mono font-bold text-white text-[11px] tracking-wide">
                                {job.product}
                              </span>
                            )}

                            {job.op && !isStop && (
                              <span className="hidden md:inline-block text-[9px] bg-black/40 text-slate-200 px-1 py-0.2 rounded font-mono border border-white/20">
                                {job.op.split(" ")[0]}
                              </span>
                            )}
                          </div>

                          {!isStop && hasWarning && (
                            <AlertCircle size={12} className="text-amber-300 animate-pulse shrink-0 ml-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
