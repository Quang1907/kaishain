import React, { useState } from "react";
import { useAppStore } from "@/app/store/useAppStore";
import { Schedule, Machine } from "@/core/types/factory-common.types";
import { FACTORY_TIMELINE, JOB_TYPE_CONFIGS } from "@/core/config/constants";
import { formatTimeHour } from "@/shared/utils/formatters";
import { useMachinesQuery } from "@/features/machines/api/machinesApi";
import { useUpsertJobMutation } from "../api/scheduleApi";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { Filter, AlertCircle, Loader2, PowerOff, Wrench, Plus, Database } from "lucide-react";

interface GanttBoardProps {
  schedule?: Schedule;
  isLoading?: boolean;
}

export const GanttBoard: React.FC<GanttBoardProps> = ({ schedule, isLoading = false }) => {
  const { currentHour, bayFilter, setBayFilter, setSelectedJob, currentDate } = useAppStore();
  const { data: machinesData, isLoading: loadingMachines } = useMachinesQuery();
  const upsertJobMutation = useUpsertJobMutation();

  // Create New Job Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState("2号機");
  const [productCode, setProductCode] = useState("W165");
  const [plannedQty, setPlannedQty] = useState(500);
  const [startH, setStartH] = useState(8.0);
  const [endH, setEndH] = useState(17.0);
  const [eventType, setEventType] = useState<string>("PROD");
  const [operatorName, setOperatorName] = useState("");

  const machines: Machine[] = machinesData || [];

  const filteredMachines = machines.filter((m) => {
    if (bayFilter === "BAY_A") return m.bay === "A" || m.bay === ("BAY_A" as any);
    if (bayFilter === "BAY_B") return m.bay === "B" || m.bay === ("BAY_B" as any);
    return true;
  });

  // Vạch chỉ báo thời gian trên trục 24h (7:00 đến 31:00)
  const currentIndicatorPct = Math.max(0, Math.min(100, ((currentHour - 7.0) / 24.0) * 100));

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertJobMutation.mutateAsync({
      schedule_id: currentDate,
      job: {
        machine: selectedMachine,
        product: productCode,
        planned_qty: Number(plannedQty),
        start: Number(startH),
        end: Number(endH),
        event: eventType as any,
        op: operatorName.trim() || null,
      },
    });
    setIsCreateModalOpen(false);
  };

  return (
    <div className="bg-factory-card border border-factory-border rounded-xl shadow-xl overflow-hidden relative">
      {(isLoading || loadingMachines) && (
        <div className="absolute inset-0 bg-factory-bg/75 backdrop-blur-sm z-40 flex items-center justify-center gap-3 text-blue-400 font-semibold text-sm">
          <Loader2 className="animate-spin" size={24} />
          <span>Đang truy vấn dữ liệu thời gian thực từ Database...</span>
        </div>
      )}

      {/* Gantt Filter & Action Toolbar */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-factory-border bg-factory-panel/90 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
            <Filter size={14} className="text-blue-400" />
            <span className="hidden sm:inline">Phân Vùng:</span>
          </span>
          <div className="flex bg-slate-950 border border-factory-border rounded-lg p-0.5 sm:p-1 text-xs">
            <button
              onClick={() => setBayFilter("ALL")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md font-medium transition-all text-[11px] sm:text-xs ${
                bayFilter === "ALL"
                  ? "bg-blue-600 text-white shadow font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Toàn Bộ <span className="hidden sm:inline">({machines.length} Máy)</span>
            </button>
            <button
              onClick={() => setBayFilter("BAY_A")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md font-medium transition-all text-[11px] sm:text-xs ${
                bayFilter === "BAY_A"
                  ? "bg-blue-600 text-white shadow font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Bay A
            </button>
            <button
              onClick={() => setBayFilter("BAY_B")}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md font-medium transition-all text-[11px] sm:text-xs ${
                bayFilter === "BAY_B"
                  ? "bg-blue-600 text-white shadow font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Bay B
            </button>
          </div>

          <div className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 font-mono">
            <Database size={13} className="text-emerald-400" />
            <span><strong className="text-white">{schedule?.jobs?.length || 0}</strong> khối</span>
          </div>
        </div>

        {/* Legend & Add Job Button */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs flex-wrap">
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-gradient-to-r from-emerald-600 to-teal-500"></span>
              <span className="text-slate-300">PROD</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-gradient-to-r from-amber-600 to-orange-500"></span>
              <span className="text-slate-300">○ Gá khuôn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-gradient-to-r from-purple-600 to-pink-500"></span>
              <span className="text-slate-300">△ Đổi màu</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-900 border border-rose-900/60"></span>
              <span className="text-slate-400">□ Tắt máy</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-1.5 h-7 sm:h-8 px-2.5 sm:px-3 text-xs shadow-sm"
          >
            <Plus size={13} />
            <span>Thêm Lệnh</span>
          </Button>
        </div>
      </div>

      {/* Main Gantt Grid Scroll Container with Touch Support */}
      <div className="overflow-x-auto relative scrollbar-thin">
        <div className="min-w-[1100px] lg:min-w-[1200px]">
          {/* Timeline Header (24 Equal Horizontal Grid Columns) */}
          <div className="flex border-b border-factory-border bg-slate-950/95 sticky top-0 z-30 text-xs">
            <div className="w-28 shrink-0 px-3 py-2.5 font-bold border-r border-factory-border text-slate-300 flex items-center justify-between bg-slate-900 sticky left-0 z-40 shadow-md">
              <span>号機 (MÁY)</span>
              <span className="text-[10px] text-slate-500 font-normal">TẤN</span>
            </div>

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

            {filteredMachines.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                Không tìm thấy máy ép nào trong cơ sở dữ liệu.
              </div>
            ) : (
              filteredMachines.map((m) => {
                // Lấy 100% công việc thực tế từ Database
                const realJobs = (schedule?.jobs || []).filter(
                  (j) => j.machine === m.id || j.machine === m.id.replace("号機", "")
                );

                return (
                  <div key={m.id} className="flex h-12 hover:bg-slate-800/25 transition-colors group">
                    {/* Machine Column (Sticky On Scroll) */}
                    <div className="w-28 shrink-0 px-3 flex items-center justify-between border-r border-factory-border bg-slate-900/95 sticky left-0 z-20 backdrop-blur-sm shadow-md">
                      <div>
                        <span className="font-mono font-bold text-white text-sm">{m.id}</span>
                        <span className="block text-[10px] text-slate-500 font-semibold">
                          {m.bay === "A" ? "Bay A" : "Bay B"}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        {m.tonnage}T
                      </span>
                    </div>

                    {/* 24-Hour Job Canvas */}
                    <div className="flex-1 relative bg-slate-950/20 overflow-hidden">
                      {/* Grid guidelines */}
                      <div
                        className="absolute inset-0 grid pointer-events-none"
                        style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}
                      >
                        {Array.from({ length: 24 }).map((_, idx) => (
                          <div key={idx} className="border-r border-slate-800/30 h-full" />
                        ))}
                      </div>

                      {/* Render REAL Job Blocks from DB */}
                      {realJobs.map((job) => {
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
                            onClick={() => setSelectedJob(job)}
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                            className={`absolute top-1 bottom-1 rounded-md px-2 flex items-center justify-between text-xs border select-none cursor-pointer hover:scale-[1.01] hover:z-20 hover:brightness-110 shadow-md transition-all ${config.bg} ${config.border}`}
                            title={`${job.product}: ${formatTimeHour(job.start)} - ${formatTimeHour(
                              job.end
                            )} (${duration.toFixed(1)}h)${job.op ? ` | Thợ: ${job.op}` : ""}`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              {isStop ? (
                                <div className="flex items-center gap-1 text-[10px] text-rose-300 font-mono font-bold">
                                  <PowerOff size={11} />
                                  <span>□ TẮT MÁY</span>
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
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal "+ Thêm Khối Lệnh Ép Mới Vào DB" */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo Khối Lệnh Ép Mới • Lưu Trực Tiếp Vào Database"
      >
        <form onSubmit={handleCreateJob} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Máy Ép Chỉ Định
              </label>
              <select
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} ({m.tonnage}T - {m.bay === "A" ? "Bay A" : "Bay B"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Mã Hàng (Product Code)
              </label>
              <input
                type="text"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Số Lượng Sản Xuất (pcs)
              </label>
              <input
                type="number"
                value={plannedQty}
                onChange={(e) => setPlannedQty(Number(e.target.value))}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                min={0}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Loại Khối Việc
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500"
              >
                <option value="PROD">Sản xuất (PROD)</option>
                <option value="MOLD_CHANGE">○ Gá khuôn (型替)</option>
                <option value="COLOR_CHANGE">△ Đổi màu (色替)</option>
                <option value="STOP">□ Kế hoạch dừng (STOP)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Giờ Bắt Đầu (7-31)
              </label>
              <input
                type="number"
                step="0.5"
                min="7"
                max="31"
                value={startH}
                onChange={(e) => setStartH(Number(e.target.value))}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Giờ Kết Thúc (7-31)
              </label>
              <input
                type="number"
                step="0.5"
                min="7"
                max="31"
                value={endH}
                onChange={(e) => setEndH(Number(e.target.value))}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Thợ Máy Phụ Trách
              </label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="VD: Thu, Chí..."
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-factory-border">
            <Button variant="secondary" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" isLoading={upsertJobMutation.isPending} className="gap-1.5">
              <Plus size={14} /> Lưu Vào Database
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
