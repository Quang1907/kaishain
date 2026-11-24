import React, { useState, useMemo, useEffect } from "react";
import { useAppStore } from "@/app/store/useAppStore";
import { Schedule, Machine } from "@/core/types/factory-common.types";
import { FACTORY_TIMELINE, JOB_TYPE_CONFIGS } from "@/core/config/constants";
import { formatTimeHour } from "@/shared/utils/formatters";
import { useMachinesQuery } from "@/features/machines/api/machinesApi";
import { useProductsQuery } from "@/features/products-bom/api/productsApi";
import { useOperatorsQuery } from "@/features/operators/api/operatorsApi";
import { useUpsertJobMutation } from "../api/scheduleApi";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import {
  GENERATE_TIME_OPTIONS,
  getAvailablePersonnel,
} from "../utils/operatorScheduleUtils";
import { calculateProductionOutput } from "../utils/productionCalculator";
import {
  Filter,
  AlertCircle,
  Loader2,
  PowerOff,
  Wrench,
  Plus,
  Database,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Package,
  Zap,
} from "lucide-react";

interface GanttBoardProps {
  schedule?: Schedule;
  isLoading?: boolean;
}

export const GanttBoard: React.FC<GanttBoardProps> = ({
  schedule,
  isLoading = false,
}) => {
  const { currentHour, bayFilter, setBayFilter, setSelectedJob, currentDate } =
    useAppStore();
  const { data: machinesData, isLoading: loadingMachines } = useMachinesQuery();
  const { data: productsData } = useProductsQuery();
  const { data: operatorsData } = useOperatorsQuery();
  const upsertJobMutation = useUpsertJobMutation();

  const products = productsData || [];
  const operators = operatorsData || [];

  // Create New Job Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState("2号機");
  const [productCode, setProductCode] = useState("W165");
  const [plannedQty, setPlannedQty] = useState(500);
  const [startH, setStartH] = useState(8.0);
  const [endH, setEndH] = useState(17.0);
  const [eventType, setEventType] = useState<string>("PROD");
  const [technicianName, setTechnicianName] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [materialHandlerName, setMaterialHandlerName] = useState("エジソン (Edison)");

  const machines: Machine[] = machinesData || [];

  const timeOptions = useMemo(() => GENERATE_TIME_OPTIONS(), []);

  // Tính toán sản lượng tự động theo Chu kỳ ép (Cycle Time) & Trừ phế phẩm
  const selectedProdInfo = productsData?.find((p) => p.code === productCode);
  const cycleTimeSec = selectedProdInfo?.cycle_time_sec || selectedProdInfo?.cycle_time || 57.0;
  const cavity = selectedProdInfo?.cavity || 1;
  const defectRatePct = selectedProdInfo?.defect_buffer_pct || (selectedProdInfo as any)?.scrap_buffer_pct || 2.5;

  const createCalc = useMemo(() => {
    return calculateProductionOutput(startH, endH, cycleTimeSec, cavity, defectRatePct);
  }, [startH, endH, cycleTimeSec, cavity, defectRatePct]);

  // Phân loại nhân sự rảnh / bận theo khung giờ [startH, endH] và loại việc
  const personnel = useMemo(() => {
    return getAvailablePersonnel(
      operators,
      schedule?.jobs || [],
      eventType,
      selectedMachine,
      productCode,
      startH,
      endH,
    );
  }, [
    operators,
    schedule?.jobs,
    eventType,
    selectedMachine,
    productCode,
    startH,
    endH,
  ]);

  // Tự động gán nhân sự phù hợp nhất khi mở modal hoặc thay đổi thông số
  useEffect(() => {
    if (!isCreateModalOpen) return;
    // Tự động gán thợ máy rảnh nếu chưa có hoặc thợ hiện tại không hợp lệ
    if (!technicianName || !personnel.availableTechnicians.some((t) => t.name === technicianName)) {
      setTechnicianName(personnel.availableTechnicians[0]?.name || "川端 (Kawabata)");
    }
    // Tự động gán người chuẩn bị nguyên liệu
    if (!materialHandlerName) {
      setMaterialHandlerName(personnel.materialHandlers[0]?.name || "エジソン (Edison)");
    }
    // Tự động gán nhân công đứng máy phù hợp (nếu là PROD)
    if (eventType !== "STOP") {
      const preferred =
        personnel.assignedToMachine[0]?.name ||
        personnel.skilledForProduct[0]?.name ||
        personnel.reliefOperators[0]?.name ||
        personnel.otherAvailable[0]?.name ||
        "";
      if (!operatorName || !operators.some((op) => op.name === operatorName)) {
        setOperatorName(preferred);
      }
    }
  }, [
    isCreateModalOpen,
    eventType,
    selectedMachine,
    productCode,
    startH,
    endH,
    personnel,
  ]);

  const filteredMachines = machines.filter((m) => {
    if (bayFilter === "BAY_A")
      return m.bay === "A" || m.bay === ("BAY_A" as any);
    if (bayFilter === "BAY_B")
      return m.bay === "B" || m.bay === ("BAY_B" as any);
    return true;
  });

  // Vạch chỉ báo thời gian trên trục 24h (7:00 đến 31:00)
  const currentIndicatorPct = Math.max(
    0,
    Math.min(100, ((currentHour - 7.0) / 24.0) * 100),
  );

  const handleEventTypeChange = (newType: string) => {
    setEventType(newType);
    if (newType === "STOP") {
      setProductCode("STOP");
      setPlannedQty(0);
    } else if (productCode === "STOP") {
      setProductCode(products[0]?.code || "W165");
      setPlannedQty(500);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const isStop = eventType === "STOP";
    await upsertJobMutation.mutateAsync({
      schedule_id: currentDate,
      job: {
        machine: selectedMachine,
        product: isStop ? "STOP" : productCode.trim() || "W165",
        planned_qty: isStop ? 0 : Number(plannedQty),
        start: Number(startH),
        end: Number(endH),
        event: (isStop ? "STOP" : "PROD") as any,
        op: isStop ? technicianName : (operatorName || technicianName),
        technician_name: technicianName,
        technician: technicianName,
        operator_name: isStop ? null : operatorName,
        operator: isStop ? null : operatorName,
        material_handler: isStop ? null : materialHandlerName,
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
              Toàn Bộ{" "}
              <span className="hidden sm:inline">({machines.length} Máy)</span>
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
            <span>
              <strong className="text-white">
                {schedule?.jobs?.length || 0}
              </strong>{" "}
              khối
            </span>
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
              <span className="text-[10px] text-slate-500 font-normal">
                TẤN
              </span>
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
                    {hour >= 24 && (
                      <span className="text-[9px] text-amber-400 ml-0.5">
                        (+1)
                      </span>
                    )}
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
              style={{
                left: `calc(7rem + (100% - 7rem) * ${currentIndicatorPct / 100})`,
              }}
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
                  (j) =>
                    j.machine === m.id ||
                    j.machine === m.id.replace("号機", ""),
                );

                return (
                  <div
                    key={m.id}
                    className="flex h-12 hover:bg-slate-800/25 transition-colors group"
                  >
                    {/* Machine Column (Sticky On Scroll) */}
                    <div className="w-28 shrink-0 px-3 flex items-center justify-between border-r border-factory-border bg-slate-900/95 sticky left-0 z-20 backdrop-blur-sm shadow-md">
                      <div>
                        <span className="font-mono font-bold text-white text-sm">
                          {m.id}
                        </span>
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
                        style={{
                          gridTemplateColumns: "repeat(24, minmax(0, 1fr))",
                        }}
                      >
                        {Array.from({ length: 24 }).map((_, idx) => (
                          <div
                            key={idx}
                            className="border-r border-slate-800/30 h-full"
                          />
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

                        const config =
                          JOB_TYPE_CONFIGS[job.event] || JOB_TYPE_CONFIGS.PROD;
                        const isStop =
                          job.event === "STOP" || job.product === "STOP";
                        const isMoldChange = job.event === "MOLD_CHANGE";
                        const isColorChange = job.event === "COLOR_CHANGE";
                        const hasWarning =
                          job.prerequisites && !job.prerequisites.all_ready;

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
                              job.end,
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
                                  <Wrench
                                    size={12}
                                    className="text-amber-200"
                                  />
                                  <span>○ {job.product}</span>
                                </div>
                              ) : isColorChange ? (
                                <span className="font-mono font-bold text-[11px]">
                                  △ {job.product}
                                </span>
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
                              <AlertCircle
                                size={12}
                                className="text-amber-300 animate-pulse shrink-0 ml-1"
                              />
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
          {/* Hàng 1: Chọn Máy & Loại Khối Việc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                Loại Khối Việc
              </label>
              <select
                value={eventType}
                onChange={(e) => handleEventTypeChange(e.target.value)}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-medium"
              >
                <option value="PROD">Sản xuất (PROD)</option>
                <option value="STOP">□ Kế hoạch dừng (STOP)</option>
              </select>
            </div>
          </div>

          {/* Hàng 2: Điều kiện hiển thị theo loại việc (Nếu là STOP: không cần chọn mã hàng) */}
          {eventType === "STOP" ? (
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-300 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
                <PowerOff size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>□ Kế Hoạch Dừng Máy (計画停止)</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    NGẮT ĐIỆN TIẾT KIỆM
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Máy sẽ tự động ngắt điện dừng hoạt động khi hết đơn để tiết
                  kiệm điện năng.{" "}
                  <strong>
                    Không cần chọn mã hàng (product code) hay số lượng sản xuất
                  </strong>
                  .
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase">
                    Mã Hàng (Product Code)
                  </label>
                  <span className="text-[10px] text-blue-400">
                    (Chọn từ DB Admin)
                  </span>
                </div>
                <input
                  type="text"
                  list="available-products-list"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  placeholder="Chọn hoặc nhập mã hàng..."
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                  required
                />
                <datalist id="available-products-list">
                  {products.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </datalist>
                <p className="text-[10px] text-slate-500 mt-1">
                  Gợi ý: Quản lý danh mục mã hàng tại{" "}
                  <strong>Cổng Admin → Hàng & BOM</strong>
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase">
                    Số Lượng Sản Xuất (pcs)
                  </label>
                  <button
                    type="button"
                    onClick={() => setPlannedQty(createCalc.netGoodQty)}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-mono underline flex items-center gap-0.5"
                  >
                    <Zap size={10} /> Dùng số tính: {createCalc.netGoodQty.toLocaleString()} pcs
                  </button>
                </div>
                <input
                  type="number"
                  value={plannedQty}
                  onChange={(e) => setPlannedQty(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono font-bold"
                  min={1}
                  required
                />
                <div className="text-[10px] text-slate-400 font-mono mt-1 leading-tight">
                  💡 {createCalc.runHours}h × 3600s ÷ {cycleTimeSec}s × {cavity} cav − {defectRatePct}% lỗi = <strong className="text-emerald-400">{createCalc.netGoodQty.toLocaleString()} pcs</strong>
                </div>
              </div>
            </div>
          )}

          {/* Hàng 3: Thời Gian Bắt Đầu / Kết Thúc (Dạng 08:00, 17:00) */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1 flex items-center justify-between">
                  <span>Giờ Bắt Đầu</span>
                  <span className="text-[10px] text-blue-400 font-mono">
                    VD: 08:00
                  </span>
                </label>
                <select
                  value={startH}
                  onChange={(e) => {
                    const newStart = Number(e.target.value);
                    setStartH(newStart);
                    if (endH <= newStart) {
                      setEndH(Math.min(31, newStart + 1.0));
                    }
                  }}
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                  required
                >
                  {timeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1 flex items-center justify-between">
                  <span>Giờ Kết Thúc</span>
                  <span className="text-[10px] text-blue-400 font-mono">
                    VD: 17:00
                  </span>
                </label>
                <select
                  value={endH}
                  onChange={(e) => setEndH(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                  required
                >
                  {timeOptions
                    .filter((opt) => opt.value > startH)
                    .map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Thanh hiển thị thời lượng & khung giờ trực quan */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-factory-border/50">
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-blue-400" />
                <span>
                  Thời lượng công việc:{" "}
                  <strong className="text-white font-mono">
                    {(endH - startH).toFixed(1)} giờ
                  </strong>
                </span>
              </div>
              <div className="font-mono text-slate-300">
                Khung giờ:{" "}
                <span className="text-blue-400 font-bold">
                  {formatTimeHour(startH)} → {formatTimeHour(endH)}
                </span>
              </div>
            </div>
          </div>

          {/* Hàng 4: Phân Quyền Nhân Sự Theo Loại Việc */}
          {eventType === "STOP" ? (
            /* Kế hoạch dừng: PHẢI CÓ THỢ MÁY PHỤ TRÁCH */
            <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-rose-300 uppercase flex items-center gap-1.5">
                  <Wrench size={14} className="text-rose-400" />
                  <span>Thợ Máy Phụ Trách Dừng Máy (Technician)</span>
                </label>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Có {personnel.availableTechnicians.length} thợ máy rảnh
                </span>
              </div>

              {personnel.availableTechnicians.length > 0 ? (
                <select
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  className="w-full bg-slate-900 border border-rose-500/40 rounded-lg px-3 py-2 text-sm text-white focus:border-rose-400 font-medium"
                  required
                >
                  <option value="">-- Chọn Thợ Máy Phụ Trách Dừng & Ngắt Điện --</option>
                  {personnel.availableTechnicians.map((t) => (
                    <option key={t.id} value={t.name}>
                      🔧 {t.name} ({t.assigned_machine || "Bảo trì khuôn"}) - Đang rảnh
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0 text-rose-400" />
                  <span>
                    ⚠️ Tất cả thợ máy đều đang bận trong khung giờ {formatTimeHour(startH)} → {formatTimeHour(endH)}.
                  </span>
                </div>
              )}

              <p className="text-[10px] text-slate-400 leading-tight">
                * Kế hoạch dừng máy yêu cầu Thợ máy phụ trách ngắt điện, bảo quản khuôn và kiểm tra an toàn thiết bị. Không hiển thị thợ máy đang bận.
              </p>
            </div>
          ) : (
            /* Sản xuất: CÓ THỢ MÁY + NHÂN CÔNG + NGƯỜI CHUẨN BỊ NGUYÊN LIỆU */
            <div className="space-y-3 pt-1">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center justify-between border-b border-factory-border pb-1">
                <span>Bố Trí 3 Vai Trò Cho Lệnh Ép Sản Xuất (JIT Team)</span>
                <span className="text-[10px] text-emerald-400 font-medium">● Đủ 3 vai trò</span>
              </div>

              {/* Vai trò 1: Thợ Máy Kỹ Thuật */}
              <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1.5">
                    <Wrench size={14} className="text-amber-400" />
                    <span>1. Thợ Máy Kỹ Thuật (Setup Technician)</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    ● {personnel.availableTechnicians.length} thợ rảnh
                  </span>
                </div>
                <select
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  className="w-full bg-slate-900 border border-amber-500/40 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-400 font-medium"
                  required
                >
                  <option value="">-- Chọn Thợ Máy Chịu Trách Nhiệm Kỹ Thuật --</option>
                  {personnel.availableTechnicians.map((t) => (
                    <option key={t.id} value={t.name}>
                      🔧 {t.name} ({t.assigned_machine || "Bảo trì khuôn"}) - Đang rảnh
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 leading-tight">
                  * Thợ máy chịu trách nhiệm gá khuôn, căn chỉnh áp suất & nghiệm thu shot đầu tiên.
                </p>
              </div>

              {/* Vai trò 2: Nhân Công Đứng Chuyền */}
              <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-blue-300 uppercase flex items-center gap-1.5">
                    <Users size={14} className="text-blue-400" />
                    <span>2. Nhân Công Đứng Chuyền (Machine / Product Operator)</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    ● {personnel.assignedToMachine.length + personnel.skilledForProduct.length + personnel.reliefOperators.length + personnel.otherAvailable.length} người rảnh
                  </span>
                </div>

                <select
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500"
                  required
                >
                  <option value="">-- Chọn Nhân Công Đứng Chuyền Phù Hợp --</option>

                  {personnel.assignedToMachine.length > 0 && (
                    <optgroup label={`⭐ Đảm Nhiệm Máy ${selectedMachine} (Đang Rảnh)`}>
                      {personnel.assignedToMachine.map((op) => (
                        <option key={op.id} value={op.name}>
                          ⭐ {op.name} (Được đảm nhiệm máy {selectedMachine} - Bậc {op.skill})
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {personnel.skilledForProduct.length > 0 && (
                    <optgroup label={`🔹 Có Skill Chạy Con Hàng ${productCode} (Đang Rảnh)`}>
                      {personnel.skilledForProduct.map((op) => (
                        <option key={op.id} value={op.name}>
                          🔹 {op.name} (Skill con hàng {productCode} - Bậc {op.skill})
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {personnel.reliefOperators.length > 0 && (
                    <optgroup label="🔸 Nhân Sự Chạy Chuyền / Tăng Cường (Đang Rảnh)">
                      {personnel.reliefOperators.map((op) => (
                        <option key={op.id} value={op.name}>
                          🔸 {op.name} ({op.assigned_machine || "Relief Line"})
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {personnel.otherAvailable.length > 0 && (
                    <optgroup label="👤 Nhân Công Đứng Chuyền Khác (Đang Rảnh)">
                      {personnel.otherAvailable.map((op) => (
                        <option key={op.id} value={op.name}>
                          👤 {op.name} (Máy gốc: {op.assigned_machine || "Chung"})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>
                    * Ưu tiên người phụ trách <strong>{selectedMachine}</strong> hoặc có skill chạy <strong>{productCode}</strong>.
                  </span>
                  {personnel.busyPersonnel.length > 0 && (
                    <span className="text-slate-500 italic">
                      (Đã lọc ẩn {personnel.busyPersonnel.length} người đang bận)
                    </span>
                  )}
                </div>
              </div>

              {/* Vai trò 3: Người Chuẩn Bị Nguyên Liệu */}
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-300 uppercase flex items-center gap-1.5">
                    <Package size={14} className="text-emerald-400" />
                    <span>3. Người Chuẩn Bị Nguyên Liệu & Thùng (Material Handler)</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    ● Trạm sấy JIT
                  </span>
                </div>
                <select
                  value={materialHandlerName}
                  onChange={(e) => setMaterialHandlerName(e.target.value)}
                  className="w-full bg-slate-900 border border-emerald-500/40 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 font-medium"
                  required
                >
                  {personnel.materialHandlers.map((mh) => (
                    <option key={mh.id} value={mh.name}>
                      🌾 {mh.name} ({mh.role})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 leading-tight">
                  * Người phụ trách cấp hạt nhựa vào phễu sấy, kiểm soát nhiệt độ/thời gian sấy và xuất thùng KLT.
                </p>
              </div>
            </div>
          )}

          <div className="pt-3 flex justify-end gap-3 border-t border-factory-border">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={upsertJobMutation.isPending}
              className="gap-1.5"
            >
              <Plus size={14} /> Lưu Vào Database
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
