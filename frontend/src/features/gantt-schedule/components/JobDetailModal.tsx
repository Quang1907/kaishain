import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { useAppStore } from "@/app/store/useAppStore";
import { formatTimeHour } from "@/shared/utils/formatters";
import { JOB_TYPE_CONFIGS } from "@/core/config/constants";
import { useUpsertJobMutation, useDeleteJobMutation, useScheduleQuery } from "../api/scheduleApi";
import { useOperatorsQuery } from "@/features/operators/api/operatorsApi";
import {
  GENERATE_TIME_OPTIONS,
  getAvailablePersonnel,
} from "../utils/operatorScheduleUtils";
import {
  Package,
  Flame,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Save,
  Layers,
  PowerOff,
  Clock,
  Users,
  Wrench,
} from "lucide-react";

export const JobDetailModal: React.FC = () => {
  const { selectedJob, setSelectedJob, currentDate, currentHour } = useAppStore();
  const upsertMutation = useUpsertJobMutation();
  const deleteMutation = useDeleteJobMutation();
  const { data: schedule } = useScheduleQuery(currentDate, currentHour);
  const { data: operatorsData } = useOperatorsQuery();

  const operators = operatorsData || [];
  const timeOptions = useMemo(() => GENERATE_TIME_OPTIONS(), []);

  const [isEditing, setIsEditing] = useState(false);
  const [plannedQty, setPlannedQty] = useState(0);
  const [technicianName, setTechnicianName] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [materialHandlerName, setMaterialHandlerName] = useState("エジソン (Edison)");
  const [startHour, setStartHour] = useState(7.0);
  const [endHour, setEndHour] = useState(14.5);
  const [eventType, setEventType] = useState<string>("PROD");

  useEffect(() => {
    if (selectedJob) {
      setPlannedQty(selectedJob.planned_qty || 0);
      setStartHour(selectedJob.start);
      setEndHour(selectedJob.end);
      setEventType(selectedJob.event === "STOP" ? "STOP" : "PROD");

      const defaultTech =
        selectedJob.technician_name ||
        selectedJob.technician ||
        (selectedJob.event === "STOP" ? selectedJob.op : "川端 (Kawabata)");
      setTechnicianName(defaultTech || "");

      const defaultOp =
        selectedJob.event === "STOP"
          ? ""
          : (selectedJob.operator_name || selectedJob.operator || selectedJob.op || "");
      setOperatorName(defaultOp);

      const defaultMatH = selectedJob.material_handler || "エジソン (Edison)";
      setMaterialHandlerName(defaultMatH);

      setIsEditing(false);
    }
  }, [selectedJob]);

  // Phân loại nhân sự rảnh / bận theo khung giờ và loại việc (loại trừ khối việc hiện tại khỏi xung đột)
  const personnel = useMemo(() => {
    if (!selectedJob) {
      return {
        assignedToMachine: [],
        skilledForProduct: [],
        reliefOperators: [],
        otherAvailable: [],
        availableTechnicians: [],
        materialHandlers: [],
        busyPersonnel: [],
      };
    }
    return getAvailablePersonnel(
      operators,
      schedule?.jobs || [],
      eventType,
      selectedJob.machine,
      selectedJob.product,
      startHour,
      endHour,
      selectedJob.id
    );
  }, [operators, schedule?.jobs, eventType, selectedJob, startHour, endHour]);

  if (!selectedJob) return null;

  const prereq = selectedJob.prerequisites;
  const config = JOB_TYPE_CONFIGS[selectedJob.event] || JOB_TYPE_CONFIGS.PROD;

  const mat = prereq?.material;
  const box = prereq?.box;
  const op = prereq?.operator;

  const matReady = mat?.status === "READY" || mat?.is_ready;
  const boxReady = box?.status === "READY" || box?.is_ready;
  const opReady = op?.status === "READY" || op?.is_ready;
  const allReady = prereq?.all_ready ?? (matReady && boxReady && opReady);

  const handleSaveToDb = async (e: React.FormEvent) => {
    e.preventDefault();
    const isStop = eventType === "STOP";
    await upsertMutation.mutateAsync({
      schedule_id: currentDate,
      job: {
        ...selectedJob,
        planned_qty: isStop ? 0 : Number(plannedQty),
        product: isStop ? "STOP" : selectedJob.product,
        event: (isStop ? "STOP" : "PROD") as any,
        start: Number(startHour),
        end: Number(endHour),
        op: isStop ? technicianName : (operatorName || technicianName),
        technician_name: technicianName,
        technician: technicianName,
        operator_name: isStop ? null : operatorName,
        operator: isStop ? null : operatorName,
        material_handler: isStop ? null : materialHandlerName,
      },
    });
    setIsEditing(false);
    setSelectedJob(null);
  };

  const handleDeleteFromDb = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn XÓA khối lệnh ${selectedJob.product} trên ${selectedJob.machine} khỏi Database?`)) {
      await deleteMutation.mutateAsync(selectedJob.id);
      setSelectedJob(null);
    }
  };

  return (
    <Modal
      isOpen={!!selectedJob}
      onClose={() => setSelectedJob(null)}
      title={
        selectedJob.event === "STOP"
          ? `Chi Tiết • ${selectedJob.machine} - □ Kế Hoạch Dừng Máy`
          : `Chi Tiết Lệnh Ép • ${selectedJob.machine} - Mã Hàng ${selectedJob.product}`
      }
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Basic Header Info */}
        <div className="flex items-center justify-between p-4 bg-factory-card rounded-xl border border-factory-border">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">
              {selectedJob.event === "STOP" ? "Trạng Thái Hoạt Động" : "Mã Chi Tiết & Con Hàng"}
            </div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {selectedJob.event === "STOP" ? "□ 計画停止 (Dừng máy)" : selectedJob.product}
            </div>
            {selectedJob.event !== "STOP" && prereq?.product_name && (
              <div className="text-xs text-slate-300 mt-0.5">{prereq.product_name}</div>
            )}
            <div className="text-xs text-slate-400 mt-1">
              Thời gian:{" "}
              <span className="font-mono text-blue-400 font-semibold">
                {formatTimeHour(selectedJob.start)} → {formatTimeHour(selectedJob.end)}
              </span>{" "}
              ({(selectedJob.end - selectedJob.start).toFixed(1)}h)
            </div>
          </div>
          <div className="text-right">
            <Badge variant="info" className={config.badge}>
              {config.label}
            </Badge>
            {selectedJob.event !== "STOP" && selectedJob.planned_qty > 0 && (
              <div className="text-xs text-slate-400 mt-2">
                Kế hoạch: <strong className="text-white font-mono">{selectedJob.planned_qty}</strong> pcs
              </div>
            )}
            {selectedJob.event === "STOP" ? (
              <div className="text-xs text-slate-400 mt-1">
                Thợ máy phụ trách dừng:{" "}
                <strong className="text-rose-400">
                  {selectedJob.technician_name || selectedJob.technician || selectedJob.op || "Chưa chọn"}
                </strong>
              </div>
            ) : (
              <div className="text-xs text-slate-400 mt-1 space-y-0.5 text-right">
                <div>
                  🔧 Thợ máy:{" "}
                  <strong className="text-amber-400">
                    {selectedJob.technician_name || selectedJob.technician || "川端 (Kawabata)"}
                  </strong>
                </div>
                <div>
                  👥 Đứng chuyền:{" "}
                  <strong className="text-emerald-400">
                    {selectedJob.operator_name || selectedJob.operator || selectedJob.op || "Chưa phân bổ"}
                  </strong>
                </div>
                <div>
                  🌾 Cấp liệu:{" "}
                  <strong className="text-sky-400">
                    {selectedJob.material_handler || "エジソン (Edison)"}
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form Toggle */}
        {isEditing ? (
          <form onSubmit={handleSaveToDb} className="p-4 bg-slate-900/80 rounded-xl border border-blue-500/40 space-y-3">
            <div className="text-xs font-bold uppercase text-blue-400 flex items-center gap-1.5 mb-2">
              <Layers size={14} /> Chỉnh Sửa Thông Tin & Lưu Trực Tiếp Vào Database
            </div>

            {/* Chọn Loại Công Việc & Số Lượng */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Loại Công Việc
                </label>
                <select
                  value={eventType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEventType(val);
                    if (val === "STOP") {
                      setPlannedQty(0);
                      setOperatorName("");
                    }
                  }}
                  className="w-full bg-slate-950 border border-factory-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-blue-500"
                >
                  <option value="PROD">Sản xuất (PROD)</option>
                  <option value="STOP">□ Kế hoạch dừng (STOP)</option>
                </select>
              </div>

              {eventType !== "STOP" ? (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Số Lượng Kế Hoạch (pcs)
                  </label>
                  <input
                    type="number"
                    value={plannedQty}
                    onChange={(e) => setPlannedQty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-factory-border rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-blue-500"
                    min={1}
                  />
                </div>
              ) : (
                <div className="flex items-center text-xs text-slate-400 italic pt-6">
                  (Dừng máy ngắt điện: Số lượng = 0)
                </div>
              )}
            </div>

            {/* Nếu là STOP: thông báo không cần chọn mã hàng/số lượng */}
            {eventType === "STOP" && (
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-300 flex items-center gap-2.5">
                <PowerOff size={16} className="text-rose-400 shrink-0" />
                <span className="text-xs">
                  Khối việc là <strong>Kế hoạch dừng máy</strong>. Máy tự ngắt điện, không cần mã hàng hay số lượng.
                </span>
              </div>
            )}

            {/* Giờ Bắt Đầu & Giờ Kết Thúc (Dạng 08:00, 17:00) */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 flex items-center justify-between">
                    <span>Giờ Bắt Đầu</span>
                    <span className="text-[10px] text-blue-400 font-mono">VD: 08:00</span>
                  </label>
                  <select
                    value={startHour}
                    onChange={(e) => {
                      const newStart = Number(e.target.value);
                      setStartHour(newStart);
                      if (endHour <= newStart) {
                        setEndHour(Math.min(31, newStart + 1.0));
                      }
                    }}
                    className="w-full bg-slate-950 border border-factory-border rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-blue-500"
                  >
                    {timeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 flex items-center justify-between">
                    <span>Giờ Kết Thúc</span>
                    <span className="text-[10px] text-blue-400 font-mono">VD: 17:00</span>
                  </label>
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-factory-border rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:border-blue-500"
                  >
                    {timeOptions
                      .filter((opt) => opt.value > startHour)
                      .map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-factory-border/40">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-blue-400" />
                  <span>Thời lượng: <strong className="text-white font-mono">{(endHour - startHour).toFixed(1)}h</strong></span>
                </div>
                <div className="font-mono text-slate-300">
                  {formatTimeHour(startHour)} → {formatTimeHour(endHour)}
                </div>
              </div>
            </div>

            {/* Phân Quyền Nhân Sự: STOP (Cần Thợ Máy) vs PROD (Đủ 3 vai trò: Thợ Máy + Đứng Chuyền + Nguyên Liệu) */}
            {eventType === "STOP" ? (
              <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-rose-300 uppercase flex items-center gap-1.5">
                    <Wrench size={14} className="text-rose-400" />
                    <span>Thợ Máy Phụ Trách Dừng Máy (Technician)</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Có {personnel.availableTechnicians.length} thợ rảnh
                  </span>
                </div>

                {personnel.availableTechnicians.length > 0 ? (
                  <select
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full bg-slate-950 border border-rose-500/40 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-rose-400 font-medium"
                    required
                  >
                    <option value="">-- Chọn Thợ Máy Đang Rảnh Phụ Trách Dừng Máy --</option>
                    {personnel.availableTechnicians.map((t) => (
                      <option key={t.id} value={t.name}>
                        🔧 {t.name} ({t.assigned_machine || "Bảo trì khuôn"}) - Đang rảnh
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2 rounded bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5">
                    <AlertTriangle size={14} className="shrink-0 text-rose-400" />
                    <span>⚠️ Tất cả thợ máy đều đang bận trong khung giờ này!</span>
                  </div>
                )}

                <p className="text-[10px] text-slate-400">
                  * Kế hoạch dừng máy yêu cầu Thợ máy phụ trách ngắt điện, bảo quản khuôn và kiểm tra an toàn thiết bị. Không hiển thị thợ máy đang bận.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center justify-between border-b border-factory-border pb-1">
                  <span>Bố Trí 3 Vai Trò Cho Lệnh Ép Sản Xuất (JIT Team)</span>
                  <span className="text-[10px] text-emerald-400 font-medium">● Đủ 3 vai trò</span>
                </div>

                {/* 1. Thợ Máy Kỹ Thuật */}
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
                  {personnel.availableTechnicians.length > 0 ? (
                    <select
                      value={technicianName}
                      onChange={(e) => setTechnicianName(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-400 font-medium"
                      required
                    >
                      <option value="">-- Chọn Thợ Máy Chịu Trách Nhiệm Kỹ Thuật --</option>
                      {personnel.availableTechnicians.map((t) => (
                        <option key={t.id} value={t.name}>
                          🔧 {t.name} ({t.assigned_machine || "Bảo trì khuôn"}) - Sẵn sàng
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2 rounded bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5">
                      <AlertTriangle size={14} className="shrink-0 text-rose-400" />
                      <span>⚠️ Tất cả thợ máy đều đang bận trong khung giờ này!</span>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400">
                    * Thợ máy phụ trách gá khuôn, căn chỉnh thông số và an toàn khuôn dập.
                  </p>
                </div>

                {/* 2. Người Đứng Chuyền */}
                <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-blue-300 uppercase flex items-center gap-1.5">
                      <Users size={14} className="text-blue-400" />
                      <span>2. Người Đứng Chuyền (Machine / Product Operator)</span>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      ● Rảnh: {personnel.assignedToMachine.length + personnel.skilledForProduct.length + personnel.reliefOperators.length + personnel.otherAvailable.length} người
                    </span>
                  </div>

                  <select
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="w-full bg-slate-950 border border-factory-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-blue-500"
                    required
                  >
                    <option value="">-- Chọn Người Đứng Chuyền Phù Hợp --</option>
                    {personnel.assignedToMachine.length > 0 && (
                      <optgroup label={`⭐ Đảm Nhiệm Máy ${selectedJob.machine} (Đang Rảnh)`}>
                        {personnel.assignedToMachine.map((op) => (
                          <option key={op.id} value={op.name}>
                            ⭐ {op.name} (Được đảm nhiệm máy {selectedJob.machine} - Bậc {op.skill})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {personnel.skilledForProduct.length > 0 && (
                      <optgroup label={`🔹 Có Skill Chạy Con Hàng ${selectedJob.product} (Đang Rảnh)`}>
                        {personnel.skilledForProduct.map((op) => (
                          <option key={op.id} value={op.name}>
                            🔹 {op.name} (Skill con hàng {selectedJob.product} - Bậc {op.skill})
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
                      <optgroup label="👤 Nhân Sự Đứng Chuyền Khác (Đang Rảnh)">
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
                      * Ưu tiên người phụ trách <strong>{selectedJob.machine}</strong> hoặc có skill chạy <strong>{selectedJob.product}</strong>.
                    </span>
                    {personnel.busyPersonnel.length > 0 && (
                      <span className="text-slate-500 italic">
                        (Đã lọc ẩn {personnel.busyPersonnel.length} người bận)
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. Người Chuẩn Bị Nguyên Liệu */}
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-emerald-300 uppercase flex items-center gap-1.5">
                      <Package size={14} className="text-emerald-400" />
                      <span>3. Người Chuẩn Bị Nguyên Liệu & Cấp Thùng (Material Handler)</span>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      ● {personnel.materialHandlers.length} nhân sự
                    </span>
                  </div>

                  <select
                    value={materialHandlerName}
                    onChange={(e) => setMaterialHandlerName(e.target.value)}
                    className="w-full bg-slate-950 border border-emerald-500/40 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-emerald-400 font-medium"
                    required
                  >
                    {personnel.materialHandlers.map((m) => (
                      <option key={m.id} value={m.name}>
                        🌾 {m.name} - {m.role}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400">
                    * Chịu trách nhiệm sấy hạt nhựa theo nhiệt độ tiêu chuẩn và chuẩn bị thùng hộp bao bì theo Kanban.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsEditing(false)}>
                Hủy
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={upsertMutation.isPending} className="gap-1.5">
                <Save size={14} /> Lưu Vào DB
              </Button>
            </div>
          </form>
        ) : null}

        {/* 3 Chân Kiềng (Prerequisites Checklist from DB) */}
        {selectedJob.event === "STOP" ? (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/30 text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <PowerOff size={16} />
                <span>□ KẾ HOẠCH DỪNG MÁY (計画停止) • ĐÃ PHÂN BỔ THỢ MÁY</span>
              </div>
              <Badge variant="danger">DỪNG AN TOÀN</Badge>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20 text-xs space-y-1">
              <div className="text-white font-medium flex items-center gap-1.5">
                <Wrench size={14} className="text-rose-400" />
                <span>
                  Thợ máy phụ trách dừng & ngắt điện:{" "}
                  <strong className="text-rose-300 font-mono">
                    {selectedJob.technician_name || selectedJob.technician || selectedJob.op || "Chưa phân bổ thợ"}
                  </strong>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Nhiệm vụ: Ngắt nguồn máy ép, hạ nhiệt xilanh phun, vệ sinh mặt khuôn dập, tra dầu bảo quản và kiểm tra an toàn theo tiêu chuẩn xưởng ép. Không cần người đứng chuyền hay sấy nhựa.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Kiểm Soát 3 Chân Kiềng (JIT Verification)</span>
              {allReady ? (
                <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                  <CheckCircle2 size={14} /> Đủ điều kiện khởi động
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1 text-[11px] font-semibold">
                  <AlertTriangle size={14} /> Chưa đủ điều kiện
                </span>
              )}
            </h4>

            <div className="space-y-3">
              {/* 1. Bao bì / Thùng */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-factory-card border border-factory-border">
                <div
                  className={`p-2 rounded-lg ${
                    boxReady ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  <Package size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-200">
                      1. Quy cách thùng bao bì {box?.box_name ? `(${box.box_name})` : ""}
                    </span>
                    <Badge variant={boxReady ? "success" : "warning"}>
                      {boxReady ? "ĐÃ CẤP THÙNG" : "CHƯA ĐỦ THÙNG"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {box?.note ||
                      (box?.required_boxes
                        ? `Cần ${box.required_boxes} thùng (${box.pcs_per_box} cái/thùng). Chuẩn bị tại khu Staging.`
                        : "Đã chuẩn bị trước 1.5 giờ tại khu Staging theo tiêu chuẩn Kanban.")}
                  </p>
                  <div className="text-[11px] text-sky-400 mt-1 font-medium flex items-center gap-1">
                    <span>🌾 Phụ trách cấp thùng:</span>
                    <strong className="text-white">{selectedJob.material_handler || "エジソン (Edison)"}</strong>
                  </div>
                </div>
              </div>

              {/* 2. Sấy nhựa & Nhiệt độ */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-factory-card border border-factory-border">
                <div
                  className={`p-2 rounded-lg ${
                    matReady ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  <Flame size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-200">
                      2. Sấy hạt nhựa {mat?.resin ? `(${mat.resin})` : ""}
                    </span>
                    <Badge variant={matReady ? "success" : "warning"}>
                      {matReady ? "SẤY ĐẠT NHIỆT" : "ĐANG SẤY NHIỆT"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {mat?.note ||
                      (mat?.dry_temp
                        ? `Nhiệt độ sấy: ${mat.dry_temp}°C trong ${mat.dry_hours}h. ${
                            mat.is_dry_coat ? "Yêu cầu cờ sấy đặc biệt 青○." : "Tiêu chuẩn nòng chống ẩm."
                          }`
                        : "Hopper hoàn thành chu kỳ nhiệt độ, độ ẩm hạt nhựa đạt tiêu chuẩn.")}
                  </p>
                  <div className="text-[11px] text-sky-400 mt-1 font-medium flex items-center gap-1">
                    <span>🌾 Phụ trách sấy & nạp liệu:</span>
                    <strong className="text-white">{selectedJob.material_handler || "エジソン (Edison)"}</strong>
                  </div>
                </div>
              </div>

              {/* 3. Nhân công thợ máy & người đứng chuyền */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-factory-card border border-factory-border">
                <div
                  className={`p-2 rounded-lg ${
                    opReady ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  <UserCheck size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-200">
                      3. Bố trí người đứng máy & thợ máy
                    </span>
                    <Badge variant={opReady ? "success" : "warning"}>
                      {opReady ? "ĐÃ BỐ TRÍ" : "CHƯA PHÂN BỔ"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {op?.note ||
                      `Phân bổ: ${selectedJob.operator_name || selectedJob.operator || selectedJob.op || "Công nhân chính"} theo chế độ ${
                        op?.mode === "BY_PRODUCT" ? "Kiểm tra theo con hàng" : "Trông cụm máy tự động"
                      }.`}
                  </p>
                  <div className="text-[11px] text-slate-300 mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400">🔧 Thợ máy kỹ thuật:</span>
                      <strong className="text-white font-mono">
                        {selectedJob.technician_name || selectedJob.technician || "川端 (Kawabata)"}
                      </strong>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-emerald-400">👥 Người đứng chuyền:</span>
                      <strong className="text-white font-mono">
                        {selectedJob.operator_name || selectedJob.operator || selectedJob.op || "Chưa phân bổ"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons: Edit in DB / Delete from DB */}
        <div className="pt-3 flex items-center justify-between border-t border-factory-border">
          <Button
            variant="danger"
            size="sm"
            onClick={handleDeleteFromDb}
            isLoading={deleteMutation.isPending}
            className="gap-1.5"
          >
            <Trash2 size={14} /> Xóa Khỏi Database
          </Button>

          <div className="flex gap-2">
            {!isEditing && (
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                Chỉnh Sửa Khối Lệnh
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setSelectedJob(null)}>
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
