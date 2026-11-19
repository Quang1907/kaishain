import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { technicianApi, MoldConfirmPayload } from "../api/technicianApi";
import { MoldChangeLog } from "@/core/types/factory-common.types";
import { useAppStore } from "@/app/store/useAppStore";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Modal } from "@/shared/components/ui/Modal";
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Flame,
  Droplets,
  Gauge,
  Sparkles,
} from "lucide-react";

export const TechnicianView: React.FC = () => {
  const { currentDate, currentUser } = useAppStore();
  const queryClient = useQueryClient();

  const [selectedLog, setSelectedLog] = useState<MoldChangeLog | null>(null);
  const [techName, setTechName] = useState(currentUser?.full_name || "宮地 (Miyaji)");
  const [notes, setNotes] = useState("");
  const [checks, setChecks] = useState({
    cooling_water: true,
    clamping_force: true,
    barrel_temp: true,
    first_shot_qc: true,
  });

  const { data: moldLogs = [], isLoading } = useQuery({
    queryKey: ["moldLogs", currentDate],
    queryFn: () => technicianApi.getMoldLogs(currentDate === "optimized" ? undefined : currentDate),
  });

  const confirmMutation = useMutation({
    mutationFn: (payload: MoldConfirmPayload) => technicianApi.confirmMoldChange(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moldLogs"] });
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
      setSelectedLog(null);
    },
  });

  const pendingCount = moldLogs.filter((l) => l.status === "PENDING").length;
  const completedCount = moldLogs.filter((l) => l.status === "COMPLETED").length;

  const handleOpenConfirm = (log: MoldChangeLog) => {
    setSelectedLog(log);
    setTechName(currentUser?.full_name || "宮地 (Miyaji)");
    setNotes(log.notes || "");
    setChecks({
      cooling_water: true,
      clamping_force: true,
      barrel_temp: true,
      first_shot_qc: true,
    });
  };

  const handleConfirmSubmit = () => {
    if (!selectedLog) return;
    confirmMutation.mutate({
      log_id: selectedLog.id,
      technician_name: techName,
      notes,
      checks,
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Profile */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-factory-panel to-slate-900 border border-amber-500/30">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                PHÂN HỆ THỢ MÁY: QUẢN LÝ & NGHIỆM THU THAY KHUÔN (○ 型替)
              </h2>
              <Badge variant="warning">THỢ MÁY</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Người phụ trách: <strong className="text-amber-400">{currentUser?.full_name || "宮地 (Miyaji) - Kỹ thuật trưởng"}</strong> • Kiểm soát an toàn 4 bước trước khi cho máy chạy
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-factory-card border border-factory-border text-center min-w-[100px]">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Chờ nghiệm thu</div>
            <div className="text-xl font-extrabold text-amber-400 font-mono">{pendingCount}</div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-factory-card border border-factory-border text-center min-w-[100px]">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Đã hoàn tất</div>
            <div className="text-xl font-extrabold text-emerald-400 font-mono">{completedCount}</div>
          </div>
        </div>
      </div>

      {/* Safety Protocol Alert */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-amber-200">Quy chuẩn xưởng ép nhựa Nhật Bản (○ 型替 - Mold Changeover):</span> Sau khi gá đặt khuôn lên máy ép, thợ máy <strong>bắt buộc phải nghiệm thu 4 hạng mục an toàn</strong>: (1) Đường nước làm mát thông suốt; (2) Lực kẹp khuôn đạt cài đặt; (3) Nhiệt độ nòng phun & hot runner ổn định; (4) Bắn thử mẫu đầu ca không có ba-via hay cháy lẹm. Chỉ sau khi thợ máy ký nghiệm thu, máy mới được mở khóa chạy hàng loạt!
        </div>
      </div>

      {/* Mold Change List */}
      <Card>
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-factory-border/50">
          <FileCheck className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold text-white">
              Danh Sách Lệnh Thay Khuôn (Lịch trình: {currentDate})
            </h3>
            <p className="text-xs text-slate-400">
              {moldLogs.length} ca thay khuôn được phân bổ tự động bởi APS Brain
            </p>
          </div>
        </div>
        {isLoading ? (
          <div className="py-12 flex justify-center text-slate-400 gap-3">
            <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <span>Đang tải danh sách thay khuôn...</span>
          </div>
        ) : moldLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Không có lệnh thay khuôn nào cần xử lý trong ngày này.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moldLogs.map((log) => {
              const isPending = log.status === "PENDING";
              return (
                <div
                  key={log.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isPending
                      ? "bg-amber-950/20 border-amber-500/40 hover:border-amber-400"
                      : "bg-factory-card/60 border-factory-border/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-white font-mono bg-factory-panel px-2.5 py-1 rounded-lg border border-factory-border">
                        {log.machine_id}
                      </span>
                      <Badge variant={isPending ? "warning" : "success"}>
                        {isPending ? "○ Chờ Nghiệm Thu" : "✓ Đã Nghiệm Thu"}
                      </Badge>
                    </div>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock size={13} />
                      {log.start_hour}:00 - {log.end_hour}:00
                    </span>
                  </div>

                  {/* Transition info */}
                  <div className="mt-3.5 flex items-center gap-3 p-2.5 rounded-lg bg-factory-bg/80 border border-factory-border/50 text-xs">
                    <div className="flex-1">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Khuôn cũ</div>
                      <div className="font-bold text-slate-300 font-mono text-sm">{log.from_product}</div>
                    </div>
                    <ArrowRight size={16} className="text-amber-400 shrink-0" />
                    <div className="flex-1">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Khuôn mới</div>
                      <div className="font-bold text-amber-400 font-mono text-sm">{log.to_product}</div>
                    </div>
                  </div>

                  {/* Checklist summary */}
                  <div className="mt-3 text-[11px] grid grid-cols-2 gap-1.5 text-slate-400">
                    <span className="flex items-center gap-1">
                      <Droplets size={12} className={log.inspection_water ? "text-cyan-400" : "text-slate-400"} />
                      Nước làm mát: {log.inspection_water ? "✓ Thông suốt" : "Chưa kiểm"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Gauge size={12} className={log.inspection_clamping ? "text-blue-400" : "text-slate-400"} />
                      Lực kẹp khuôn: {log.inspection_clamping ? "✓ Đạt chuẩn" : "Chưa kiểm"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame size={12} className={log.inspection_barrel_temp ? "text-amber-400" : "text-slate-400"} />
                      Nhiệt độ nòng: {log.inspection_barrel_temp ? "✓ Ổn định" : "Chưa kiểm"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles size={12} className={log.inspection_first_shot ? "text-emerald-400" : "text-slate-400"} />
                      Mẫu đầu ca: {log.inspection_first_shot ? "✓ Đạt QC" : "Chưa kiểm"}
                    </span>
                  </div>

                  {/* Actions / Sign-off info */}
                  <div className="mt-4 pt-3 border-t border-factory-border/50 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      {isPending ? (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <AlertTriangle size={13} />
                          Yêu cầu kiểm tra & nghiệm thu
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={13} />
                          Ký bởi: <strong>{log.technician_name}</strong> ({log.confirmed_at ? new Date(log.confirmed_at).toLocaleTimeString() : "Đã duyệt"})
                        </span>
                      )}
                    </div>

                    <Button
                      variant={isPending ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => handleOpenConfirm(log)}
                      className={isPending ? "bg-amber-600 hover:bg-amber-500 text-white" : ""}
                    >
                      {isPending ? "Ký Nghiệm Thu" : "Xem Biên Bản"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal Checklist Nghiệm Thu */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={`BIÊN BẢN NGHIỆM THU THAY KHUÔN (○ 型替) - ${selectedLog?.machine_id}`}
        maxWidth="lg"
      >
        {selectedLog && (
          <div className="space-y-5">
            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-200 flex items-center justify-between">
              <div>
                <p className="font-bold">Thay khuôn cho máy: {selectedLog.machine_id}</p>
                <p className="text-slate-400">Từ sản phẩm <strong>{selectedLog.from_product}</strong> ➔ Lắp khuôn <strong>{selectedLog.to_product}</strong></p>
              </div>
              <Badge variant="warning">{selectedLog.start_hour}:00 - {selectedLog.end_hour}:00</Badge>
            </div>

            {/* 4-Point Safety Checklist */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Checklist 4 Tiêu Chuẩn Kỹ Thuật Bắt Buộc:
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-factory-card border border-factory-border hover:border-cyan-500/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={checks.cooling_water}
                  onChange={(e) => setChecks({ ...checks, cooling_water: e.target.checked })}
                  className="mt-0.5 rounded border-slate-600 text-blue-600 focus:ring-0"
                />
                <div className="text-xs">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Droplets size={14} className="text-cyan-400" />
                    1. Hệ thống đường nước làm mát khuôn (Cooling Circuit)
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Đã nối đúng đường In/Out, áp suất nước ổn định, không có hiện tượng rò rỉ tại khớp nối nhanh.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-factory-card border border-factory-border hover:border-blue-500/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={checks.clamping_force}
                  onChange={(e) => setChecks({ ...checks, clamping_force: e.target.checked })}
                  className="mt-0.5 rounded border-slate-600 text-blue-600 focus:ring-0"
                />
                <div className="text-xs">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Gauge size={14} className="text-blue-400" />
                    2. Lực kẹp khuôn & Căn chỉnh tâm máy (Clamping Tonnage)
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Lực kẹp bàn máy cài đặt đúng tiêu chuẩn khuôn, hành trình đóng/mở khuôn êm ái, ty lừa hoạt động trơn tru.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-factory-card border border-factory-border hover:border-amber-500/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={checks.barrel_temp}
                  onChange={(e) => setChecks({ ...checks, barrel_temp: e.target.checked })}
                  className="mt-0.5 rounded border-slate-600 text-blue-600 focus:ring-0"
                />
                <div className="text-xs">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Flame size={14} className="text-amber-400" />
                    3. Nhiệt độ nòng phun & Hot runner (Barrel & Nozzle Temp)
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Nhiệt độ các vùng gia nhiệt nòng nung đạt cài đặt cho hạt nhựa chỉ định, đầu kim phun tiếp xúc kín khít bạc cuống phun.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-factory-card border border-factory-border hover:border-emerald-500/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={checks.first_shot_qc}
                  onChange={(e) => setChecks({ ...checks, first_shot_qc: e.target.checked })}
                  className="mt-0.5 rounded border-slate-600 text-blue-600 focus:ring-0"
                />
                <div className="text-xs">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Sparkles size={14} className="text-emerald-400" />
                    4. Bắn thử mẫu đầu ca & Kiểm tra ngoại quan (First-shot QC)
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Đã ép thử 3 shot đầu, kiểm tra không bị ba-via (burrs), lõm co (sink marks), hay biến dạng kích thước.
                  </p>
                </div>
              </label>
            </div>

            {/* Technician Info & Notes */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Tên Thợ Máy Ký Nghiệm Thu</label>
                <input
                  type="text"
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  className="w-full px-3 py-2 bg-factory-bg border border-factory-border rounded-lg text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Ghi chú hiện trường / Thông số đặc biệt</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Ví dụ: Áp suất kẹp 180 tấn, khuôn chạy ổn định sau 2 shot test..."
                  className="w-full px-3 py-2 bg-factory-bg border border-factory-border rounded-lg text-sm text-white resize-none"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-factory-border">
              <Button variant="secondary" onClick={() => setSelectedLog(null)}>
                Đóng
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmSubmit}
                isLoading={confirmMutation.isPending}
                disabled={!checks.cooling_water || !checks.clamping_force || !checks.barrel_temp || !checks.first_shot_qc}
                className="bg-amber-600 hover:bg-amber-500 text-white"
              >
                Ký Nghiệm Thu & Mở Khóa Máy
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TechnicianView;
